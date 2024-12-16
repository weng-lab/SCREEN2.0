import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete, { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box, Chip, Divider, FormControlLabel, Paper } from '@mui/material';
import { capitalizeWords } from '../../search/_ccredetails/utils';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export type MultiSelectOnChange<T> = (event: React.SyntheticEvent, value: T[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<T | T[]>) => void

export interface MultiSelectProps<T extends (string | {label: string; [key:string]: unknown})> {
  /**
   * Callback fired whenever component state changes.
   * Currently does NOT switch component to being controlled.
   */
  onChange?: MultiSelectOnChange<T>,
  /**
   * options must be 
   * ```
   * string[]
   * ``` 
   * or 
   * ```
   * {label: string, ...anything}[]
   * ```
   */
  options: T[],
  /**
   * Override internal state of component
   */
  value?: T[],
  getOptionDisabled?: (option: T) => boolean
  placeholder: string
  limitTags?: number
  size?: "small" | "medium"
  //todo add width here
}

const MultiSelect = <T extends (string | {label: string; [key:string]: unknown})>({
  onChange,
  options,
  getOptionDisabled,
  placeholder,
  value,
  limitTags,
  size = "small"
}: MultiSelectProps<T>) => {
  const [internalValue, setInternalValue] = React.useState<T[] | null>(options);
  const scrollRef = React.useRef<number>(0) //needed to preserve the scroll position of the ListBox. Overriding PaperComponent changes the way that the Listbox renders and resets scroll on interaction

  //reset value when options changes
  React.useEffect(() => {
    setInternalValue(options)
  }, [options])

  //sync internal value when external value changes
  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  const handleChange: MultiSelectOnChange<T> = React.useCallback((event, value, reason, details?) => {
    setInternalValue(value)
    if (onChange){
       onChange(event, value, reason, details)
    } 
  }, [onChange])

  const handleToggleSelectAll = React.useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>, checked: boolean) => {
    const checkedOptions = options.filter(x => internalValue.includes(x))
    const uncheckedOptions = options.filter(x => !internalValue.includes(x))
    if (checked) {
      handleChange(event, options, "selectOption", { option: uncheckedOptions })
    } else {
      handleChange(event, [], "removeOption", { option: checkedOptions })
    }
  }, [handleChange, options, internalValue])

  // A warning forced usage of React.forwardRef here, even though the ref is not used. Not sure why
  const ListboxComponent = React.forwardRef(function ListboxComponent(
    listboxProps: React.HTMLAttributes<HTMLElement>,
    ref: React.ForwardedRef<HTMLUListElement>
  ) {
    const { children, ...props } = listboxProps;
    const listboxScrollRef = React.useRef<HTMLUListElement>(null)

    //use saved scroll value on initial load. For some reason overriding PaperComponent broke the scroll behavior
    React.useEffect(() => {
      const current = listboxScrollRef.current;
      if (current) {
        current.scrollTop = scrollRef.current
      }
    }, []);

    const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
      scrollRef.current = event.currentTarget.scrollTop
    }

    // Merged ref function to set both refs
    const setRefs = (element: HTMLUListElement | null) => {
      if (typeof ref === 'function') {
        ref(element);  // Set the forwarded ref as a function
      } else if (ref) {
        ref.current = element; // Set the forwarded ref if it's an object
      }
      listboxScrollRef.current = element; // Set the internal scroll ref
    };

    return (
      <ul role='listbox' {...props} ref={setRefs} onScroll={handleScroll}>
        {children}
      </ul>
    )
  })

  //type guard
  function isLabeledObject(value: unknown): value is { label: string; [key: string]: unknown } {
    return (
      value !== null &&
      typeof value === 'object' &&
      'label' in value &&
      typeof value.label === 'string'
    );
  }

  return (
    <Autocomplete<T, true> //Type of option was being incorrectly inferred to be T | T[] (maybe due to overriding MultiSelectOnChange? idk)
      multiple
      limitTags={limitTags}
      size={size}
      value={internalValue}
      onChange={handleChange}
      id="checkboxes-tags-demo"
      options={options}
      getOptionDisabled={getOptionDisabled}
      disableCloseOnSelect
      disablePortal
      slotProps={{ popper: { sx: { zIndex: 1 } } }} //used to make options appear under header
      style={{ width: 400 }}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} />
      )}
      //Immediate child of popper
      PaperComponent={(paperProps) => (
        <Paper {...paperProps}>
          <Box
            onMouseDown={(e) => e.preventDefault()} //prevents closing popper
            onClick={(event) => handleToggleSelectAll(event, internalValue.length === options.length ? false : true)}
            pl={1.5}
            py={0.5}
          >
            <FormControlLabel
              sx={{ zIndex: 10 }}
              label="Select All"
              control={
                <Checkbox
                  size="small"
                  id="select-all-checkbox"
                  checked={internalValue.length === options.length}
                />
              }
            />
          </Box>
          <Divider />
          {paperProps.children}
        </Paper>
      )}
      //Parent element of options contained within above {paperProps.children}
      ListboxComponent={ListboxComponent}
      //Each option
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              id={'checkbox-' + (isLabeledObject(option) ? option.label : option)}
              icon={icon}
              size='small'
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
              indeterminate={selected && (getOptionDisabled && getOptionDisabled(option))}
            />
            {capitalizeWords(isLabeledObject(option) ? option.label : option)}
          </li>
        );
      }}
      //each tag
      renderTags={(tagValue, getTagProps) =>
        tagValue
        .map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          const chipHidden = getOptionDisabled && getOptionDisabled(option)
          return (
            <Chip
              sx={chipHidden && {opacity: 0.5}}
              size='small'
              key={key}
              label={isLabeledObject(option) ? option.label : option}
              {...tagProps}
            />
          );
        })
      }
    />
  );
}

export default MultiSelect