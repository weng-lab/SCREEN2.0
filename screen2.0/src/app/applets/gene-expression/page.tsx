"use client"
import React, { useState, useEffect, cache, Fragment, useCallback } from "react"

import { fetchServer, LoadingMessage, ErrorMessage, createLink } from "../../../common/lib/utility"

import { DataTable } from "@weng-lab/ts-ztable"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import {
  Autocomplete,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  debounce,
  ButtonBase,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { CheckBox, ExpandMore } from "@mui/icons-material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { PlotGeneExpression, ToggleButtonMean } from "./utils"
import { BiosampleList, CellComponents, GeneExpression } from "./types"
import { Range2D } from "jubilant-carnival"
import { QueryResponse } from "../differential-gene-expression/types"

export const GENE_AUTOCOMPLETE_QUERY = `
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

export type gene = {
  chrom: string
  start: number
  end: number
  id: string
  name: string
}

export default function GeneExpression() {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<GeneExpression>()
  const [options, setOptions] = useState<string[]>([])

  const [assembly, setAssembly] = useState<string>("GRCh38")
  const [current_gene, setCurrentGene] = useState<string>("OR51AB1P")
  const [geneID, setGeneID] = useState<string>("OR51AB1P")
  const [gene, setGene] = useState<gene>()
  const [geneDesc, setgeneDesc] = useState<{ name: string; desc: string }[]>()
  const [geneList, setGeneList] = useState<gene[]>([])

  const [group, setGroup] = useState<string>("byTissueMaxFPKM") // experiment, tissue, tissue max
  const [RNAtype, setRNAType] = useState<string>("all") // any, polyA RNA-seq, total RNA-seq
  const [scale, setScale] = useState<string>("rawFPKM") // linear or log2
  const [replicates, setReplicates] = useState<string>("mean") // single or mean

  const [biosamples_list, setBiosamplesList] = useState<string[]>(["cell line", "in vitro differentiated cells", "primary cell", "tissue"])
  const [biosamples, setBiosamples] = useState<BiosampleList>({
    cell_line: true,
    in_vitro: true,
    primary_cell: true,
    tissue: true,
  })

  const [cell_components_list, setCellComponentsList] = useState<string[]>(["cell"])
  const [cell_components, setCellComponents] = useState<CellComponents>({
    cell: true,
    chromatin: false,
    cytosol: false,
    membrane: false,
    nucleolus: false,
    nucleoplasm: false,
    nucleus: false,
  })

  const [range, setRange] = useState<Range2D>({
    x: { start: 0, end: 4 },
    y: { start: 0, end: 0 },
  })

  const [dimensions, setDimensions] = useState<Range2D>({
    x: { start: 125, end: 650 },
    y: { start: 4900, end: 100 },
  })

  // fetch gene expression data
  useEffect(() => {
    fetch("https://screen-beta-api.wenglab.org/gews/search", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        assembly: assembly,
        biosample_types_selected: biosamples_list,
        compartments_selected: cell_components_list,
        gene: current_gene,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          setError(true)
          return ErrorMessage(new Error(response.statusText))
        }
        return response.json()
      })
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((error: Error) => {
        return ErrorMessage(error)
      })
    setLoading(true)
  }, [assembly, current_gene, biosamples_list, cell_components_list, biosamples, cell_components])

  // remove or add list of checked items
  const toggleList = (checkList: string[], option: string) => {
    if (checkList.includes(option)) {
      const index = checkList.indexOf(option, 0)
      if (index > -1) {
        checkList.splice(index, 1)
      }
    } else {
      checkList.push(option)
    }

    return checkList
  }

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
  const onSearchChange = async (value: string) => {
    setOptions([])
    const response = await fetch("https://ga.staging.wenglab.org/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: GENE_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: "GRCh38",
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
    <main>
      <Grid2 container mt="2rem">
        <Grid2 xs={7}>
          <Box mt={4}>
            <Typography variant="h5">{current_gene} Gene Expression Profiles by RNA-seq</Typography>
          </Box>
        </Grid2>
        <Grid2 xs={2}>
          <Box mt={3} ml={3}>
            <Autocomplete
              disablePortal
              freeSolo={true}
              id="gene-ids"
              noOptionsText="e.g. Gm25142"
              options={options}
              sx={{ width: 200 }}
              ListboxProps={{
                style: {
                  maxHeight: "180px",
                },
              }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                if (value != "") debounceFn(value)
                setGeneID(value)
              }}
              onInputChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                if (value != "") debounceFn(value)
                setGeneID(value)
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  for (let g of geneList) {
                    if (g.name === geneID && g.end - g.start > 0) {
                      setGene(g)
                      setCurrentGene(g.name)
                      break
                    }
                  }
                }
              }}
              renderInput={(props) => <TextField {...props} label={geneID} />}
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
            <Button
              variant="text"
              onClick={() => {
                for (let g of geneList) {
                  if (g.name === geneID && g.end - g.start > 0) {
                    setGene(g)
                    setCurrentGene(g.name)
                    break
                  }
                }
              }}
            >
              Search
            </Button>
          </Box>
        </Grid2>
        <Grid2 xs={1.2} mt={3}>
          <Box mt={0} sx={{ height: 100, width: 150 }}>
            <Link href={"https://genome.ucsc.edu/"}>
              <Button variant="contained">
                <img src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150} />
              </Button>
            </Link>
          </Box>
        </Grid2>
        <Grid2 xs={1.5} ml={0} mt={3}>
          <Box mt={0} sx={{ height: 100, width: 165 }}>
            <Link href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + current_gene}>
              <Button variant="contained">
                <img src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} />
              </Button>
            </Link>
          </Box>
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>
        <Grid2 xs={3}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Group By</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ToggleButtonGroup
                color="primary"
                value={group}
                exclusive
                onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                  if (value !== group) setGroup(value)
                }}
                aria-label="Platform"
              >
                <ToggleButton value="byExpressionFPKM">Experiment</ToggleButton>
                <ToggleButton value="byTissueFPKM">Tissue</ToggleButton>
                <ToggleButton value="byTissueMaxFPKM">Tissue Max</ToggleButton>
              </ToggleButtonGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>RNA Type</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ToggleButtonGroup
                color="primary"
                value={RNAtype}
                exclusive
                onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                  if (value !== RNAtype) setRNAType(value)
                }}
                aria-label="Platform"
              >
                <ToggleButton value="total RNA-seq">Total RNA-seq</ToggleButton>
                <ToggleButton value="polyA RNA-seq">PolyA RNA-seq</ToggleButton>
                <ToggleButton value="all">Any</ToggleButton>
              </ToggleButtonGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Biosample Types</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                <FormControlLabel
                  label="cell line"
                  control={
                    <Checkbox
                      checked={biosamples["cell_line"]}
                      onClick={() => {
                        setBiosamplesList(toggleList(biosamples_list, "cell line"))
                        setBiosamples({
                          cell_line: biosamples.cell_line ? false : true,
                          in_vitro: biosamples.in_vitro,
                          primary_cell: biosamples.primary_cell,
                          tissue: biosamples.tissue,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="in vitro differentiated cells"
                  control={
                    <Checkbox
                      checked={biosamples["in_vitro"]}
                      onClick={() => {
                        setBiosamplesList(toggleList(biosamples_list, "in vitro differentiated cells"))
                        setBiosamples({
                          cell_line: biosamples.cell_line,
                          in_vitro: biosamples.in_vitro ? false : true,
                          primary_cell: biosamples.primary_cell,
                          tissue: biosamples.tissue,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="primary cell"
                  control={
                    <Checkbox
                      checked={biosamples["primary_cell"]}
                      onClick={() => {
                        setBiosamplesList(toggleList(biosamples_list, "primary cell"))
                        setBiosamples({
                          cell_line: biosamples.cell_line,
                          in_vitro: biosamples.in_vitro,
                          primary_cell: biosamples.primary_cell ? false : true,
                          tissue: biosamples.tissue,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="tissue"
                  control={
                    <Checkbox
                      checked={biosamples["tissue"]}
                      onClick={() => {
                        setBiosamplesList(toggleList(biosamples_list, "tissue"))
                        setBiosamples({
                          cell_line: biosamples.cell_line,
                          in_vitro: biosamples.in_vitro,
                          primary_cell: biosamples.primary_cell,
                          tissue: biosamples.tissue ? false : true,
                        })
                      }}
                    />
                  }
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Cellular Compartments</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                <FormControlLabel
                  label="cell"
                  control={
                    <Checkbox
                      checked={cell_components["cell"]}
                      onClick={() => {
                        setCellComponentsList(toggleList(cell_components_list, "cell"))
                        setCellComponents({
                          cell: cell_components.cell ? false : true,
                          chromatin: cell_components.chromatin,
                          cytosol: cell_components.cytosol,
                          membrane: cell_components.membrane,
                          nucleolus: cell_components.nucleolus,
                          nucleoplasm: cell_components.nucleoplasm,
                          nucleus: cell_components.nucleus,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="chromatin"
                  control={
                    <Checkbox
                      checked={cell_components["chromatin"]}
                      onClick={() => {
                        setCellComponentsList(toggleList(cell_components_list, "chromatin"))
                        setCellComponents({
                          cell: cell_components.cell,
                          chromatin: cell_components.chromatin ? false : true,
                          cytosol: cell_components.cytosol,
                          membrane: cell_components.membrane,
                          nucleolus: cell_components.nucleolus,
                          nucleoplasm: cell_components.nucleoplasm,
                          nucleus: cell_components.nucleus,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="cytosol"
                  control={
                    <Checkbox
                      checked={cell_components["cytosol"]}
                      onClick={() => {
                        setCellComponentsList(toggleList(cell_components_list, "cytosol"))
                        setCellComponents({
                          cell: cell_components.cell,
                          chromatin: cell_components.chromatin,
                          cytosol: cell_components.cytosol ? false : true,
                          membrane: cell_components.membrane,
                          nucleolus: cell_components.nucleolus,
                          nucleoplasm: cell_components.nucleoplasm,
                          nucleus: cell_components.nucleus,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="membrane"
                  control={
                    <Checkbox
                      checked={cell_components["membrane"]}
                      onClick={() => {
                        setCellComponentsList(toggleList(cell_components_list, "membrane"))
                        setCellComponents({
                          cell: cell_components.cell,
                          chromatin: cell_components.chromatin,
                          cytosol: cell_components.cytosol,
                          membrane: cell_components.membrane ? false : true,
                          nucleolus: cell_components.nucleolus,
                          nucleoplasm: cell_components.nucleoplasm,
                          nucleus: cell_components.nucleus,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="nucleolus"
                  control={
                    <Checkbox
                      checked={cell_components["nucleoplus"]}
                      onClick={() => {
                        setCellComponentsList(toggleList(cell_components_list, "nucleoplus"))
                        setCellComponents({
                          cell: cell_components.cell,
                          chromatin: cell_components.chromatin,
                          cytosol: cell_components.cytosol,
                          membrane: cell_components.membrane,
                          nucleolus: cell_components.nucleolus ? false : true,
                          nucleoplasm: cell_components.nucleoplasm,
                          nucleus: cell_components.nucleus,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="nucleoplasm"
                  control={
                    <Checkbox
                      checked={cell_components["nucleoplasm"]}
                      onClick={() => {
                        setCellComponentsList(toggleList(cell_components_list, "nucleoplasm"))
                        setCellComponents({
                          cell: cell_components.cell,
                          chromatin: cell_components.chromatin,
                          cytosol: cell_components.cytosol,
                          membrane: cell_components.membrane,
                          nucleolus: cell_components.nucleolus,
                          nucleoplasm: cell_components.nucleoplasm ? false : true,
                          nucleus: cell_components.nucleus,
                        })
                      }}
                    />
                  }
                />
                <FormControlLabel
                  label="nucleus"
                  control={
                    <Checkbox
                      checked={cell_components["nucleus"]}
                      onClick={() => {
                        setCellComponentsList(toggleList(cell_components_list, "nucleus"))
                        setCellComponents({
                          cell: true,
                          chromatin: false,
                          cytosol: false,
                          membrane: false,
                          nucleolus: false,
                          nucleoplasm: false,
                          nucleus: cell_components.nucleus ? false : true,
                        })
                      }}
                    />
                  }
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Scale</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ToggleButtonGroup
                color="primary"
                value={scale === "logFPKM" ? "log2" : "linear"}
                exclusive
                onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                  if (value === "linear") setScale("rawFPKM")
                  else setScale("logFPKM")
                }}
                aria-label="Platform"
              >
                <ToggleButton value="linear">Linear</ToggleButton>
                <ToggleButton value="log2">Log2</ToggleButton>
              </ToggleButtonGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Replicates</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* <ToggleButton color="secondary" selected={replicates === "mean"} value="linear" onClick={() => {
                                    if (replicates === "mean") setReplicates("single")
                                    else setReplicates("mean")
                                }}>
                                    Mean
                                </ToggleButton> */}
              <ToggleButtonMean
                color="primary"
                selected={replicates === "mean"}
                value="linear"
                onClick={() => {
                  if (replicates === "mean") setReplicates("single")
                  else setReplicates("mean")
                }}
              >
                mean
              </ToggleButtonMean>
            </AccordionDetails>
          </Accordion>
        </Grid2>
        <Grid2 xs={9}>
          {error
            ? ErrorMessage(new Error("Error loading data"))
            : loading
            ? LoadingMessage()
            : data &&
              data["all"] &&
              data["polyA RNA-seq"] &&
              data["total RNA-seq"] && (
                <Box>
                  <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1200 24000">
                    <g className="x-grid grid" id="xGrid">
                      <line x1="100" x2="1100" y1="4900" y2="5900"></line>
                    </g>
                    <g className="y-grid grid" id="yGrid">
                      <line x1="900" x2="1100" y1="100" y2="4900"></line>
                    </g>
                    <g className="data" data-setname="gene expression plot">
                      {PlotGeneExpression(
                        data,
                        range,
                        dimensions,
                        RNAtype,
                        group,
                        scale,
                        replicates,
                        biosamples_list,
                        cell_components_list
                      )}
                    </g>
                  </svg>
                </Box>
              )}
        </Grid2>
      </Grid2>
    </main>
  )
}
