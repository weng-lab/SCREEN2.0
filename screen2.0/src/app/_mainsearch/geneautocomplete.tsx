import React, { useState, useEffect, useCallback, useMemo } from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { GENE_AUTOCOMPLETE_QUERY } from "./queries"
import Config from "../../config.json"
import { IconButton, Stack } from "@mui/material"
import { Search } from "@mui/icons-material"

type QueryResponse = [number, string[], any, [string, string, string, string, string, string][], string[]]

export const GeneAutoComplete: React.FC<{ assembly: string, header?: boolean }> = (props) => {
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [geneids, setGeneIds] = useState<{ chrom: string; start: number; end: number; id: string; name: string }[]>([])
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false)

  const [geneDesc, setgeneDesc] = useState<{ name: string; desc: string }[]>()

  useEffect(() => {
    const fetchData = async () => {
      let f = await Promise.all(
        options.map((gene) =>
          fetch("https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?authenticity_token=&terms=" + gene.toUpperCase())
            .then((x) => x && x.json())
            .then((x) => {
              const matches = (x as QueryResponse)[3] && (x as QueryResponse)[3].filter((x) => x[3] === gene.toUpperCase())
              return {
                desc: matches && matches.length >= 1 ? matches[0][4] : "(no description available)",
                name: gene,
              }
            })
            .catch(() => {
              return { desc: "(no description available)", name: gene }
            })
        )
      )
      setgeneDesc(f)
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
          version: assembly.toLowerCase()==="grch38" ? 40 : 25,
          limit: 1000
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
    const genesSuggestion = (await response.json()).data?.gene
    if (genesSuggestion && genesSuggestion.length > 0) {
      const r = genesSuggestion.map((g) => g.name)
      const g = genesSuggestion.map((g) => {
        return {
          chrom: g.coordinates.chromosome,
          start: g.coordinates.start,
          end: g.coordinates.end,
          id: g.id,
          name: g.name,
        }
      })
      setOptions(r)
      setGeneIds(g)
    } else if (genesSuggestion && genesSuggestion.length === 0) {
      setOptions([])
      setGeneIds([])
    }
    setLoadingOptions(false)
  }

  const onSubmit = () => {
    const inputStr = inputValue.toLowerCase()
    const submittedGene = geneids.find((g) => g.name.toLowerCase() === inputStr)
    if (submittedGene) {
      let chrom = submittedGene.chrom
      let start = submittedGene.start
      let end = submittedGene.end
      let name = submittedGene.name
      return (`/search?assembly=${props.assembly}&chromosome=${chrom}&start=${start}&end=${end}&gene=${name}&tssDistance=0`)
    }
  }

  const debounceFn = useMemo(() => debounce(onSearchChange, 500), [])  

  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
        size={props.header ? "small" : "medium"}
        id="gene-autocomplete"
        sx={{ width: 300 }}
        options={options}
        ListboxProps={{
          style: {
            maxHeight: "180px",
          },
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.defaultPrevented = true
            window.open(onSubmit(), "_self")
          }
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          if (newInputValue != "") {
            debounceFn(newInputValue, props.assembly)
          }

          setInputValue(newInputValue)
        }}
        noOptionsText={loadingOptions ? "Loading..." : "No Genes Found"}            
        renderInput={(params) => (
          <i><TextField
            {...params}
            label="Enter a gene name"
            InputLabelProps={{ shrink: true, style: props.header ? {color: "white"} : { color: "black" } }}
            placeholder={props.assembly === "mm10" ? "e.g., Scml2, Dbt" :  "e.g., SOX4, GAPDH"}            
            fullWidth
            sx={{
              //Border at rest
              fieldset: props.header ? { borderColor: "white" } : { borderColor: "black" },
              '& .MuiOutlinedInput-root': {
                //hover border color
                '&:hover fieldset': props.header ? { borderColor: "white" } : { borderColor: "black" },
                //focused border color
                '&.Mui-focused fieldset': props.header ? { borderColor: "white" } : { borderColor: "black" },
              },
              //Text
              '& .MuiOutlinedInput-input': props.header && { color: "white" },
              //Icon
              '& .MuiSvgIcon-root': props.header && { fill: "white"}
            }}
          /></i>
        )}
        renderOption={(props, option) => {
          return (
            <li {...props} key={props.id}>
              <Grid2 container alignItems="center">
                <Grid2 sx={{ width: "100%" }}>
                  <Box component="span" sx={{ fontWeight: "regular" }}>
                    <i>{option}</i>
                  </Box>
                  {geneDesc && geneDesc.find((g) => g.name === option) && (
                    <Typography variant="body2" color="text.secondary">
                      {geneDesc.find((g) => g.name === option)?.desc}
                    </Typography>
                  )}
                </Grid2>
              </Grid2>
            </li>
          )
        }}
      />
      <IconButton aria-label="Search" type="submit" href={onSubmit()} sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}>
        <Search />
      </IconButton>
    </Stack>
  )
}
