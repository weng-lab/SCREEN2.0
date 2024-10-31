import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete, { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box, Divider, FormControlLabel, Paper } from '@mui/material';

function capitalizeWords(input: string): string {
  return input.replace(/\b\w/g, char => char.toUpperCase());
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export type TissueMultiSelectOnChange = (event: React.SyntheticEvent, value: string[], reason: AutocompleteChangeReason | 'selectAll', details?: AutocompleteChangeDetails<string>) => void

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
  const [allSelected, setAllSelected] = React.useState<boolean>(true);
  const scrollRef = React.useRef<number>(0) //needed to preserve the scroll position of the ListBox. Overriding PaperComponent changes the way that the Listbox renders and resets scroll on interaction

  const handleChange: TissueMultiSelectOnChange = (event, value, reason, details?) => {
    if (reason === "clear" || reason === "removeOption") setAllSelected(false);
    if (reason === "selectOption" && value.length === options.length) setAllSelected(true);
    setValue(value)
    console.log(event)
    if (onChange) onChange(event, value, reason, details)
  }

  const handleToggleSelectAll = React.useCallback(() => {
    setAllSelected((prev) => {
      const newValue = !prev ? [...options] : [];
      setValue(newValue);
      if (onChange) {
        if (newValue.length > 0) {
          onChange(null, newValue, 'selectAll', null)
        } else {
          onChange(null, newValue, 'clear', null)
        }
      }
      return !prev;
    });
  }, [onChange, options]);

  // A warning forced usage of React.forwardRef here, even though the ref is not used
  const ListboxComponent = React.forwardRef(function ListboxComponent(
    listboxProps: React.HTMLAttributes<HTMLElement>,
    ref: React.ForwardedRef<HTMLUListElement>
  ){
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
          <Box onMouseDown={(e) => e.preventDefault()} pl={1.5} py={0.5}>
            <FormControlLabel
              sx={{ zIndex: 10 }}
              onClick={(e) => {
                handleToggleSelectAll();
                console.log(e)
              }}
              label="All Tissues"
              control={
                <Checkbox
                size="small"
                id="select-all-checkbox"
                checked={allSelected}
                indeterminate={!allSelected && value.length > 0}
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
  
  const humanTissues = [
    "adipose",
  "adrenal gland",
  "blood",
  "blood vessel",
  "bone",
  "brain",
  "breast",
  "connective tissue",
  "embryo",
  "epithelium",
  "esophagus",
  "gallbladder",
  "heart",
  "kidney",
  "large intestine",
  "liver",
  "lung",
  "muscle",
  "nerve",
  "ovary",
  "pancreas",
  "penis",
  "placenta",
  "prostate",
  "skin",
  "small intestine",
  "spleen",
  "stomach",
  "testis",
  "thyroid",
  "uterus",
  "vagina"
]

const mouseTissues = [
  "adrenal gland",
  "blood",
  "brain",
  "embryo",
  "epithelium",
  "heart",
  "intestine",
  "kidney",
  "limb",
  "liver",
  "lung",
  "muscle",
  "stomach",
  "thymus"
]

export default TissueMultiSelect