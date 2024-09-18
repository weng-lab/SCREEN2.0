import { AutocompleteOwnerState, AutocompleteProps, AutocompleteRenderOptionState, IconButtonProps, StackProps, SvgIconTypeMap, TextFieldProps } from "@mui/material"
import { OverridableComponent } from "@mui/material/OverridableComponent"

export type QueryResponse = [number, string[], any, [string, string, string, string, string, string][], string[]]

export interface GeneInfo {
  name: string
  id: string
  coordinates: {
    chromosome: string
    start: number
    end: number
  }
  description?: string
}

export interface GeneAutoComplete2Props {
  /**
   * Props spread into each slot inside, helpful for changing things such as width and height
  */
  slotProps?: {
    /**
     * Main autocomplete component
    */
    //Filling in these generic types tells the component what are valid values and if the "multiple" prop is true/false. If supporting multiple values in future change second type argument
    autocompleteProps?: Omit<AutocompleteProps<GeneInfo, false, boolean | undefined, false>,
      'options' | 'renderInput' | 'renderOptions' | 'inputValue' | 'value' | 'noOptionsText' | 'multiple' | 'getOptionLabel' |
      'isOptionEqualToValue' | 'onChange' | 'onKeyDown'
    >
    /**
     * Parent element which wraps autocomplete and icon
    */
    stackProps?: StackProps
    /**
     * Icon which appears to the right of the component
    */
    iconButtonProps?: IconButtonProps
    /**
     * 
     */
    inputTextFieldProps?: TextFieldProps
  }
assembly: "GRCh38" | "mm10"
/**
 * The icon to display to the left of the Autocomplete. Overriden if CustomEndIcon specified.
 * @default "search"
*/
endIcon?: 'search' | 'add' | 'none'
CustomEndIcon?: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
  muiName: string;
}
// onIconClick?: React.MouseEventHandler<HTMLButtonElement>
onTextBoxClick?: React.MouseEventHandler<HTMLDivElement>
/**
 * 
 * Callback fired when a gene is selected from the dropdown options. Not fired on submission (enter, clicking endIcon)
 * @param gene The gene selected
*/
onGeneSelected?: (gene: GeneInfo) => void
/**
 * Callback fired when a valid gene is submitted by pressing either the enter key or clicking the endIcon.
 * @param gene The gene submitted
 *  
*/
onGeneSubmitted?: (gene: GeneInfo) => void
colorTheme: "light" | "dark"

renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: GeneInfo, descriptions: { name: string, desc: string }[], state: AutocompleteRenderOptionState, ownerState: AutocompleteOwnerState<GeneInfo, false, boolean | undefined,false>) => React.ReactNode
}