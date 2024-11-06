import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete, { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box, Divider, FormControlLabel, Paper } from '@mui/material';
import { capitalizeWords } from '../../search/_ccredetails/utils';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export type MultiSelectOnChange = (event: React.SyntheticEvent, value: string[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<string | string[]>) => void

export interface MultiSelectProps {
  onChange?: MultiSelectOnChange,
  options: string[],
  placeholder: string
  limitTags?: number
  //todo add width here
}

const MultiSelect = ({
  onChange,
  options,
  placeholder,
  limitTags
}: MultiSelectProps) => {
  const [value, setValue] = React.useState<string[] | null>(options);
  const scrollRef = React.useRef<number>(0) //needed to preserve the scroll position of the ListBox. Overriding PaperComponent changes the way that the Listbox renders and resets scroll on interaction

  //reset value when options changes
  React.useEffect(() => {
    setValue(options)
  }, [options])

  const handleChange: MultiSelectOnChange = React.useCallback((event, value, reason, details?) => {
    setValue(value)
    if (onChange) onChange(event, value, reason, details)
  }, [onChange])

  const handleToggleSelectAll = React.useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>, checked: boolean) => {
    const checkedOptions = options.filter(x => value.includes(x))
    const uncheckedOptions = options.filter(x => !value.includes(x))
    if (checked) {
      handleChange(event, options, "selectOption", { option: uncheckedOptions })
    } else {
      handleChange(event, [], "removeOption", { option: checkedOptions })
    }
  }, [handleChange, options, value])

  // A warning forced usage of React.forwardRef here, even though the ref is not used
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

  return (
    <Autocomplete
      multiple
      limitTags={limitTags}
      size='small'
      value={value}
      onChange={handleChange}
      id="checkboxes-tags-demo"
      options={options}
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
            onClick={(event) => handleToggleSelectAll(event, value.length === options.length ? false : true)}
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
                  checked={value.length === options.length}
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
      renderOption={(props, option: string, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              id={'checkbox-' + option}
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {capitalizeWords(option)}
          </li>
        );
      }}
    />
  );
}

export default MultiSelect