import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete, { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box, Divider, FormControlLabel, Paper } from '@mui/material';
import { humanTissues, mouseTissues } from './const';

function capitalizeWords(input: string): string {
  return input.replace(/\b\w/g, char => char.toUpperCase());
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export type TissueMultiSelectOnChange = (event: React.SyntheticEvent, value: string[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<string | string[]>) => void

export interface TissueMultiSelectProps {
  assembly: "GRCh38" | "mm10"
  onChange?: TissueMultiSelectOnChange
  //Todo add disabled options with getOptionDisabled
}

const TissueMultiSelect = ({
  assembly,
  onChange
}: TissueMultiSelectProps) => {
  const options = (assembly === "GRCh38" ? humanTissues : mouseTissues)
  const [value, setValue] = React.useState<string[] | null>(options);
  const scrollRef = React.useRef<number>(0) //needed to preserve the scroll position of the ListBox. Overriding PaperComponent changes the way that the Listbox renders and resets scroll on interaction

  //reset value when assembly changes
  React.useEffect(() => {
    setValue(options)
  }, [assembly, options])

  const handleChange: TissueMultiSelectOnChange = React.useCallback((event, value, reason, details?) => {
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
    /**
     * Manually specify type arguments, since when overriding AutocompleteChangeDetails in TissueMultiSelectOnChange to be
     * AutocompleteChangeDetails<string | string[]> (for select all compatibility), the type of option in renderOption was inferred to be string | string[]
     * for some reason. Couldn't figure out why -JF 10/31/24
     */
    <Autocomplete<string, true, false, false, undefined>
      multiple
      limitTags={3}
      size='small'
      value={value}
      onChange={handleChange}
      id="checkboxes-tags-demo"
      options={options}
      disableCloseOnSelect
      disablePortal
      slotProps={{ popper: { sx: { zIndex: 1 } } }} //used to make options appear under header
      style={{ width: 500 }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Select Tissues" />
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
              label="All Tissues"
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
      renderOption={(props, option, { selected }) => {
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

export default TissueMultiSelect