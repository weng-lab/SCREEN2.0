"use client"
import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import { Autocomplete, TextField, Box, Button, debounce, Typography, Stack, IconButton } from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { gene } from "./types"
import { QueryResponse } from "../../../../types/types"
import { Dispatch, SetStateAction } from "react"
import Config from "../../../config.json"
import { Search } from "@mui/icons-material"
const GENE_AUTOCOMPLETE_QUERY = `
  query ($assembly: String!, $name_prefix: [String!], $limit: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit) {
      name
      id
      coordinates {
        start
        chromosome
        end
      }
    }
  }  
`

export default function GeneAutoComplete(props: {
  assembly: "mm10" | "GRCh38"
  gene: string
  setGene: Dispatch<SetStateAction<any>>
}) {
  const router = useRouter()

  const [options, setOptions] = useState<string[]>([])
  const [geneDesc, setgeneDesc] = useState<{ name: string; desc: string }[]>()
  const [geneList, setGeneList] = useState<gene[]>([])
  const [geneID, setGeneID] = useState<string>(props.gene ?  props.gene : "OR52K1")

  // gene descriptions
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

  // gene list
  const onSearchChange = async (value: string, assembly: string) => {
    setOptions([])
    const response = await fetch(Config.API.GraphqlAPI, {
      method: "POST",
      body: JSON.stringify({
        query: GENE_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: assembly,
          name_prefix: value,
          limit: 100,
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
      setGeneList(g)
    } else if (genesSuggestion && genesSuggestion.length === 0) {
      setOptions([])
      setGeneList([])
    }
  }

  // delay fetch
  const debounceFn = useCallback(debounce(onSearchChange, 500), [])

  return (
    <Stack direction="row" alignItems="center">
      <Autocomplete
        disablePortal
        freeSolo={false}
        id="gene-ids"
        noOptionsText="e.g. Gm25142"
        options={options}
        size="medium"
        sx={{ width: 200 }}
        ListboxProps={{
          style: {
            maxHeight: "120px",
          },
        }}
        onChange={(_, value: string| null) => {
          if (value && value != "") debounceFn(value, props.assembly)
          value && setGeneID(value)
        }}
        onInputChange={(_, value: string) => {
          if (value != "") debounceFn(value, props.assembly)
          setGeneID(value)
        }}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            for (let g of geneList) {
              if (g.name === geneID && g.end - g.start > 0) {
                props.setGene(g.name)
                // replace url if ge applet
                // if (props.pathname.includes("gene-expression")) router.replace(props.pathname + "?gene=" + g.name)
                // if (props.pathname.includes("differential-gene-expression")) router.push(props.pathname + "?gene=" + g.name)
                break
              }
            }
          }
        }}
        renderInput={(tprops) => <TextField {...tprops} label={"Gene"} />}
        renderOption={(props, opt) => {
          return (
            <li {...props} key={props.id}>
              <Grid2 container alignItems="center">
                <Grid2 sx={{ width: "calc(100% - 44px)" }}>
                  <Box component="span" sx={{ fontWeight: "regular" }}>
                    {opt}
                  </Box>
                  {geneDesc && geneDesc.find((g) => g.name === opt) && (
                    <Typography variant="body2" color="text.secondary">
                      {geneDesc.find((g) => g.name === opt)?.desc}
                    </Typography>
                  )}
                </Grid2>
              </Grid2>
            </li>
          )
        }}
      />
      <IconButton
        onClick={() => {
          for (let g of geneList) {
            if (g.name === geneID && g.end - g.start > 0) {
              props.setGene(g.name)
              // replace url if ge applet
              // if (props.pathname.split("/").includes("gene-expression")) router.replace(props.pathname + "?gene=" + g.name)
              // if (props.pathname.split("/").includes("differential-gene-expression")) router.replace(props.pathname + "?gene=" + g.name)
              break
            }
          }
        }}
        color="primary"
      >
        <Search />
      </IconButton>
    </Stack>
  )
}
