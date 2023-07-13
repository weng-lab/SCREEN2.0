"use client"
import React, { useState, useEffect, cache, Fragment, useCallback } from "react"

import { fetchServer, LoadingMessage, ErrorMessage, createLink } from "../../../common/lib/utility"

import { DataTable } from "@weng-lab/ts-ztable"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, ButtonBase, Checkbox, FormControlLabel, FormGroup, Link, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { styled } from '@mui/material/styles'
import { CheckBox, ExpandMore } from "@mui/icons-material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ToggleButtonMean } from "./utils"

export type biosamplelist = {
    cell_line: boolean,
    in_vitro: boolean,
    primary_cell: boolean,
    tissue: boolean
}

export type cellcomponents = {
    cell: boolean,
    chromatin: boolean,
    cytosol: boolean,
    membrane: boolean,
    nucleolus: boolean,
    nucleoplasm: boolean,
    nucleus: boolean
}

export default function GeneExpression(){
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ error, setError ] = useState<boolean>(false)
    const [ data, setData ] = useState()

    const [ assembly, setAssembly ] = useState<string>("GRCh38")
    const [ current_gene, setGene ] = useState<string>("OR51AB1P")

    const [ group, setGroup ] = useState<string>("tissue")              // experiment, tissue, tissue max
    const [ RNAtype, setRNAType ] = useState<string>("any")             // any, polyA RNA-seq, total RNA-seq
    const [ scale, setScale ] = useState<string>("linear")              // linear or log2
    const [ replicates, setReplicates ] = useState<string>("single")    // single or mean

    const [ biosamples_list, setBiosamplesList ] = useState<string[]>([ "cell line", "in vitro differentiated cells", "primary cell", "tissue" ])
    const [ biosamples, setBiosamples ] = useState<biosamplelist>({
        cell_line: true,
        in_vitro: true,
        primary_cell: true,
        tissue: true
    })

    const [ cell_components_list, setCellComponentsList ] = useState<string[]>([ "cell" ])
    const [ cell_components, setCellComponents ] = useState<cellcomponents>({
        cell: true,
        chromatin: false,
        cytosol: false,
        membrane: false,
        nucleolus: false,
        nucleoplasm: false,
        nucleus: false
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
            })
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
    }, [assembly, current_gene, biosamples_list, cell_components_list, biosamples, cell_components ])

    const toggleList = (checkList: string[], option: string) => {
        // console.log(checkList)
        if (checkList.includes(option)){
            const index = checkList.indexOf(option, 0);
            if (index > -1) {
                checkList.splice(index, 1);
            }
        } 
        else {
            checkList.push(option)
        }
        // console.log(checkList)

        return checkList
    }

    function getToggleList(b: biosamplelist, c: cellcomponents){
        let list: string[] = []
        if (b)
            Object.keys(b).map((label: string) => {if (b[label]) list.push(label)})
        else
            Object.keys(c).map((label: string) => {if (c[label]) list.push(label)})
        
        return list
    } 

    return (
        <main>
            <Grid2 container mt="2rem">
            <Grid2 xs={9}>
                <Box mt={1}>
                    <Typography variant="h5">{current_gene} Gene Expression Profiles by RNA-seq</Typography>
                </Box>
            </Grid2>
            <Grid2 xs={1}>
                <Box mt={0} sx={{ height: 100, width: 150, border: '1px dashed grey' }}>
                    <Link href={"https://genome.ucsc.edu/"}>
                        <Button variant="contained">
                            <img src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150}/>
                        </Button>
                    </Link>
                </Box>
            </Grid2>
            <Grid2 xs={1.5} ml={1}>
                <Box mt={0} sx={{ height: 100, width: 170, border: '1px dashed grey' }}>
                    <Link href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + current_gene}>
                        <Button variant="contained">
                            <img src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150}/>
                        </Button>
                    </Link>
                </Box>
            </Grid2>
            </Grid2>
            <Grid2 container spacing={3} mt="2rem">
                <Grid2 xs={3}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>Group By</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ToggleButtonGroup
                                    color="primary"
                                    value={group}
                                    exclusive
                                    onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                                        setGroup(value)
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
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>RNA Type</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ToggleButtonGroup
                                    color="primary"
                                    value={RNAtype}
                                    exclusive
                                    onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                                        setRNAType(value)
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
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
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
                                                    in_vitro: true,
                                                    primary_cell: true,
                                                    tissue: true
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
                                                    cell_line: true,
                                                    in_vitro: biosamples.in_vitro ? false : true,
                                                    primary_cell: true,
                                                    tissue: true
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
                                                    cell_line: true,
                                                    in_vitro: true,
                                                    primary_cell: biosamples.primary_cell ? false : true,
                                                    tissue: true
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
                                                    cell_line: true,
                                                    in_vitro: true,
                                                    primary_cell: true,
                                                    tissue: biosamples.tissue ? false : true
                                                })
                                            }}
                                        />
                                    } 
                                /> 
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
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
                                                    nucleus: cell_components.nucleus
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
                                                    nucleus: cell_components.nucleus
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
                                                    nucleus: cell_components.nucleus
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
                                                    nucleus: cell_components.nucleus
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
                                                    nucleus: cell_components.nucleus
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
                                                    nucleus: cell_components.nucleus
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
                                                    nucleus: cell_components.nucleus ? false : true
                                                })
                                            }}
                                        />
                                    }
                                /> 
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>Scale</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ToggleButtonGroup
                                color="primary"
                                value={scale}
                                exclusive
                                onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                                    setScale(value)
                                }}
                                aria-label="Platform"
                            >
                                <ToggleButton value="linear">Linear</ToggleButton>
                                <ToggleButton value="log2">Log2</ToggleButton>
                            </ToggleButtonGroup>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>Replicates</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                                {/* <ToggleButton color="secondary" selected={replicates === "mean"} value="linear" onClick={() => {
                                    if (replicates === "mean") setReplicates("single")
                                    else setReplicates("mean")
                                }}>
                                    Mean
                                </ToggleButton> */}
                                <ToggleButtonMean color="primary" selected={replicates === "mean"} value="linear" onClick={() => {
                                    if (replicates === "mean") setReplicates("single")
                                    else setReplicates("mean")
                                }}>
                                    mean
                                </ToggleButtonMean>
                        </AccordionDetails>
                    </Accordion>
                </Grid2>
                <Grid2 xs={9}>

                </Grid2>
            </Grid2>
        </main>
    )
}

