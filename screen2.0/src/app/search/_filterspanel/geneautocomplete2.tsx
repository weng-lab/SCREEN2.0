import React, { useState, useEffect, useCallback, ComponentPropsWithoutRef } from "react"
import Box from "@mui/material/Box"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { GENE_AUTOCOMPLETE_QUERY } from "../../_mainsearch/queries"
import Config from "../../../config.json"
import { AutocompleteOwnerState, AutocompleteRenderOptionState, IconButton, Stack, SvgIconTypeMap } from "@mui/material"
import { Add, Search } from "@mui/icons-material"
import {
  Autocomplete,
  TextField,
  AutocompleteProps,
} from '@mui/material';
import { OverridableComponent } from "@mui/material/OverridableComponent"

type QueryResponse = [number, string[], any, [string, string, string, string, string, string][], string[]]

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
  //Filling in these generic types tells the component what are valid values and if the "multiple" prop is true/false. If supporting multiple values in future change second type argument
  autocompleteProps?: Omit<AutocompleteProps<GeneInfo, false, boolean | undefined,false>,
  'options' | 'renderInput' | 'renderOptions' | 'inputValue' | 'value' | 'noOptionsText' | 'multiple' | 'getOptionLabel' |
  'isOptionEqualToValue' | 'onChange' | 'onKeyDown'
  >
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

export const GeneAutoComplete2 = (
  props: GeneAutoComplete2Props
) => {
  const { 
    assembly, 
    autocompleteProps, 
    endIcon = 'search', 
    CustomEndIcon,
    //  onIconClick, 
     onTextBoxClick, 
     onGeneSelected,
     onGeneSubmitted,
     renderOption,
     colorTheme 
    } = props;

  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState<GeneInfo[]>([])
  const [descriptions, setDescriptions] = useState<{ name: string; desc: string }[]>([])
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)

  //Fetch gene desciptions
  useEffect(() => {
    const fetchData = async () => {
      let descriptions = await Promise.all(
        options.map((gene) =>
          fetch("https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?authenticity_token=&terms=" + gene.name.toUpperCase())
            .then((x) => x && x.json())
            .then((x) => {
              const matches = (x as QueryResponse)[3] && (x as QueryResponse)[3].filter((x) => x[3] === gene.name.toUpperCase())
              return {
                desc: matches && matches.length >= 1 ? matches[0][4] : "(no description available)",
                name: gene.name,
              }
            })
            .catch(() => {
              return { desc: "(no description available)", name: gene.name }
            })
        )
      )
      setDescriptions(descriptions)
    }

    options && fetchData()
  }, [options])

  const onSearchChange = async (value: string, assembly: string) => {
    setOptions([])
    setLoadingOptions(true)
    const response = await fetch(Config.API.GraphqlAPI, {
      method: "POST",
      body: JSON.stringify({
        query: GENE_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: assembly.toLowerCase(),
          name_prefix: value,
          version: assembly.toLowerCase() === "grch38" ? 40 : 25,
          limit: 1000
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
    const genesSuggestion = (await response.json()).data?.gene
    if (genesSuggestion && genesSuggestion.length > 0) {
      const g: GeneInfo[] = genesSuggestion.map((g) => {
        return {
          id: g.id,
          name: g.name,
          coordinates: {
            chromosome: g.coordinates.chromosome,
            start: g.coordinates.start,
            end: g.coordinates.end,
          }
        }
      })
      setOptions(g)
    } else if (genesSuggestion && genesSuggestion.length === 0) {
      setOptions([])
    }
    setLoadingOptions(false)
  }

  const debounceFn = useCallback(debounce(onSearchChange, 500), [])


  // Merge the ListboxProps
  const mergedListboxProps = {
    ...autocompleteProps?.ListboxProps,
    style: {
      ...(autocompleteProps?.ListboxProps?.style || {}),
      maxHeight: '180px',
    },
  };
  
  const attemptSubmit = (inputVal: string) => {
    const gene = options.find(x => x.name === inputVal)
    gene && onGeneSubmitted(gene)
  }

  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
        multiple={false} //How can I easily support this
        ListboxProps={mergedListboxProps}
        options={options} //How do I type this properly?
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          if (newInputValue != "") {
            debounceFn(newInputValue, assembly) // This triggers sending new request for genes
          }
          setInputValue(newInputValue)
        }}
        onChange={(_, value, reason) => reason === 'selectOption' && onGeneSelected && onGeneSelected(value)} //Should I just expose the whole onChange function?
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            attemptSubmit(inputValue)
          }
        }}
        noOptionsText={loadingOptions ? "Loading..." : "No Genes Found"} //Maybe expose?
        renderInput={(params) => (
          <i><TextField
            {...params}
            label="Enter a gene name"
            // InputLabelProps={{ shrink: true, style: props.header ? {color: "white"} : { color: "black" } }}
            placeholder={props.assembly === "mm10" ? "e.g., Scml2, Dbt" : "e.g., SOX4, GAPDH"}
            fullWidth
            onClick={onTextBoxClick}
            sx={{
              //Border at rest
              fieldset: colorTheme === "dark" ? { borderColor: "white" } : { borderColor: "black" },
              '& .MuiOutlinedInput-root': {
                //hover border color
                '&:hover fieldset': colorTheme === "dark" ? { borderColor: "white" } : { borderColor: "black" },
                //focused border color
                '&.Mui-focused fieldset': colorTheme === "dark" ? { borderColor: "white" } : { borderColor: "black" },
              },
              //Text
              '& .MuiOutlinedInput-input': colorTheme === "dark" && { color: "white" },
              //Icon
              '& .MuiSvgIcon-root': colorTheme === "dark" && { fill: "white" }
            }} /></i>
        )}
        getOptionLabel={option => option.name}
        isOptionEqualToValue={(a, b) => a.name === b.name}
        renderOption={(props, option, state, ownerState) => {
          if (renderOption) {
            return renderOption(props, option, descriptions, state, ownerState)
          } else {
            return (
              <li {...props} key={props.id}>
                <Grid2 container alignItems="center">
                  <Grid2 sx={{ width: "100%" }}>
                    <Box component="span" sx={{ fontWeight: "regular" }}>
                      <i>{option.name}</i>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {descriptions.find((g) => g.name === option.name)?.desc}
                    </Typography>
                  </Grid2>
                </Grid2>
              </li>
            )
          }
        }}
        {...autocompleteProps}
        />
      {(endIcon !== 'none' || CustomEndIcon) &&
        <IconButton aria-label="Search" type="submit" onClick={() => attemptSubmit(inputValue)} sx={{ color: `${colorTheme === "dark" ? "white" : "black"}`, maxHeight: "100%" }}>
          {CustomEndIcon ?
            <CustomEndIcon />
            :
            endIcon === "add" ?
              <Add />
              :
              <Search />}
        </IconButton>
      }
    </Stack>
  )
}
