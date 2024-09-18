import React, { useState, useEffect, useCallback, useMemo } from "react"
import Box from "@mui/material/Box"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { GENE_AUTOCOMPLETE_QUERY } from "../../_mainsearch/queries"
import Config from "../../../config.json"
import { IconButton, IconButtonProps, Stack, TextFieldProps, Autocomplete, TextField } from "@mui/material"
import { Add, Search } from "@mui/icons-material"
import { GeneAutoComplete2Props, GeneInfo, QueryResponse } from "./types"

/**
 * @todo manually overriding the colors like this component does is definitely bad practice.
 * The colors should be overridden by specifying a dark theme.
 * For example, the header in SCREEN should wrap all child components in a dark theme,
 * which MUI should automatically detect and switch colors to use correct colors
 * Should be able to remove the "colorTheme" prop entirely.
 */
export const GeneAutocomplete = (
  props: GeneAutoComplete2Props
) => {
  const { 
    assembly, 
    slotProps, 
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

  const debounceFn = useMemo(() => debounce(onSearchChange, 500), [])


  // Merge the ListboxProps
  const mergedListboxProps = {
    ...slotProps?.autocompleteProps?.ListboxProps,
    style: {
      ...(slotProps?.autocompleteProps?.ListboxProps?.style || {}),
      maxHeight: '250px',
    },
  };

  // Merge icon props since sx being used here
  const mergedIconProps: IconButtonProps = {
    ...slotProps?.iconButtonProps,
    sx: {
      color: `${colorTheme === "dark" ? "white" : "black"}`,
      maxHeight: "100%",
      ...slotProps?.iconButtonProps?.sx,
    }
  }

  const mergedTextFieldProps: TextFieldProps = {
    label: "Enter a gene name",
    placeholder: props.assembly === "mm10" ? "e.g., Scml2, Dbt" : "e.g., SOX4, GAPDH",
    ...slotProps?.inputTextFieldProps,
    InputLabelProps: { style: {color: colorTheme === "dark" && "white" }, ...slotProps?.inputTextFieldProps?.InputLabelProps },
    sx: {
      //Border at rest
      fieldset: colorTheme === "dark" && { borderColor: "white" },
      '& .MuiOutlinedInput-root': {
        //hover border color
        '&:hover fieldset': colorTheme === "dark" && { borderColor: "white" },
        //focused border color
        '&.Mui-focused fieldset': colorTheme === "dark" && { borderColor: "white" },
      },
      //Text
      '& .MuiOutlinedInput-input': colorTheme === "dark" && { color: "white" },
      //Icon
      '& .MuiSvgIcon-root': colorTheme === "dark" && { fill: "white" },
      ...slotProps?.inputTextFieldProps?.sx
    }
  }
  
  const attemptSubmit = (inputVal: string) => {
    const gene = options.find(x => x.name.toLowerCase() === inputVal.toLowerCase())
    gene && onGeneSubmitted && onGeneSubmitted(gene)
    gene && setInputValue(gene.name)
    // gene && setValue(gene)
  }

  return (
    <Stack direction="row" spacing={2} {...slotProps?.stackProps}>
      <Autocomplete
        multiple={false} //How can I easily support this
        ListboxProps={mergedListboxProps}
        options={options.sort((a, b) => a.name.localeCompare(b.name))} //How do I type this properly?
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          if (newInputValue != "") {
            debounceFn(newInputValue, assembly) // This triggers sending new request for genes
          }
          setInputValue(newInputValue)
        }}
        onChange={(_, value) => onGeneSelected && onGeneSelected(value)} //Should I just expose the whole onChange function?
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            attemptSubmit(inputValue)
          }
        }}
        noOptionsText={loadingOptions ? "Loading..." : "No Genes Found"} //Maybe expose?
        renderInput={(params) => (
          <i>
            <TextField
              onClick={onTextBoxClick}
              {...params}
              {...mergedTextFieldProps}
            />
          </i>
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
        {...slotProps?.autocompleteProps}
        />
      {(endIcon !== 'none' || CustomEndIcon) &&
        <IconButton
          aria-label="Search"
          type="submit"
          onClick={() => attemptSubmit(inputValue)}
          {...mergedIconProps}
        >
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
