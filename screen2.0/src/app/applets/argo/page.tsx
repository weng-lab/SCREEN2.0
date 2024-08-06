"use client"
import React, { startTransition, useCallback, useEffect, JSX } from "react"
import {useState } from "react"
import { Stack, Typography, Box, TextField, Button, Alert, FormGroup, Checkbox, FormControlLabel, CircularProgress, Paper, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import ClearIcon from '@mui/icons-material/Clear'
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import BedUpload from "../../_mainsearch/bedupload"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { GENE_EXP_QUERY, LINKED_GENES, Z_SCORES_QUERY } from "./queries"
import { ApolloQueryResult, useQuery, useLazyQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { ZScores, LinkedGenes } from "./types"
import BiosampleTables from "../../search/biosampletables"
import { BIOSAMPLE_Data, biosampleQuery } from "../../../common/lib/queries"
import { RegistryBiosample } from "../../search/types"
import { HUMAN_GENE_EXP, MOUSE_GENE_EXP } from "../gene-expression/const"
import FilterListIcon from '@mui/icons-material/FilterList';


export default function Argo(props: {header?: false, optionalFunction?: Function}) {
    const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [dataAPI, setDataAPI] = useState<[]>([])
    const [scores, setScores] = useState<ZScores[]>([])
    const [key, setKey] = useState<string>()
    const [columns, setColumns] = useState([])
    const [textUploaded, setTextUploaded] = useState<File[]>([])
    const [biosampleData, setBiosampleData] = useState<ApolloQueryResult<BIOSAMPLE_Data>>(null)
    const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample[]>([])
    const [availableScores, setAvailableScores] = useState({"dnase": true, "h3k4me3": true, "h3k27ac": true, "ctcf": true, "atac": true, "vertebrates": true, "mammals": true, "primates": true})
    const scoreNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac", "vertebrates", "mammals", "primates"]
    
    const {loading: loading_scores, error: error_scores, data: data_scores} = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: assembly,
            accessions: scores.length > 0 ? scores.map((s) => s.accession): dataAPI.map((r) => r[4]) ,
            cellType: selectedBiosample.length > 0 ? selectedBiosample[0].name: null
        },
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(d) {   
            let data = d['cCRESCREENSearch']
            let result = null
            if (selectedBiosample.length > 0) {
                result = scores.map((obj) => {
                    let o = {...obj}
                    let matchingObj = data.find((e) => o.accession == e.info.accession)
                    o.dnase = matchingObj.ctspecific.dnase_zscore
                    o.h3k4me3 = matchingObj.ctspecific.h3k4me3_zscore
                    o.h3k27ac = matchingObj.ctspecific.h3k27ac_zscore
                    o.ctcf = matchingObj.ctspecific.ctcf_zscore
                    o.atac = matchingObj.ctspecific.atac_zscore
                    return o
                }
                )
            }
            else {
                let mapFunc = (obj) => {
                    let o = {...obj}
                    let matchingObj = data.find((e) => o.accession == e.info.accession)
                    o.dnase = matchingObj.dnase_zscore
                    o.h3k4me3 = matchingObj.promoter_zscore
                    o.h3k27ac = matchingObj.enhancer_zscore
                    o.ctcf = matchingObj.ctcf_zscore
                    o.atac = matchingObj.atac_zscore
                    o.vertebrates = matchingObj.vertebrates
                    o.mammals = matchingObj.mammals
                    o.primates = matchingObj.primates
                    return o
                }
                if (scores.length > 0) {
                    result = scores.map(mapFunc)
                }
                else {
                    result = dataAPI
                        .map((e) => {
                            return {
                                accession: e[4],
                                user_id: `${e[6]}_${e[7]}_${e[8]}${ (e[9] && e[10]) ? '_'+e[9]: ''}`,
                                linked_genes: []
                            }
                        })
                        .map(mapFunc)
                }          
            }        
            
            let scoresToInclude = selectedBiosample.length > 0 ? scoreNames.filter((s) => selectedBiosample[0][s]): scoreNames
            let availableScoresCopy = {...availableScores}

            scoreNames.forEach( (s) => {
                if (scoresToInclude.indexOf(s) == -1) {
                    availableScoresCopy[s] = false
                }
                else {
                    availableScoresCopy[s] = true
                }
                
            })
            setAvailableScores(availableScoresCopy)
            setScores(evaluateRankings(result, availableScoresCopy))
            let random_string = Math.random().toString(36).slice(2, 10)
            setColumns(allColumns.filter(
                (e) => scoresToInclude.indexOf(e.header.toLowerCase().split(' ')[0]) !== -1
            ))
            setKey(random_string)
        }
    })

    const {loading: loading_genes, error: error_genes, data: data_genes} = useQuery(LINKED_GENES, {
        variables: {
            assembly: assembly.toLowerCase(),
            accessions: scores.length > 0 ? scores.map((s) => s.accession): [],
        },
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(data) {
            setScores(scores.map((obj) => {
                let objCopy = {...obj}
                let matchingObjs = data.linkedGenes.filter((e) => e.accession == obj.accession)
                let linkedGenes: LinkedGenes[] = matchingObjs.map((e) => {
                    return {gene_id: e.geneid, method: e.method, tpm: 0}
                })
                objCopy.linked_genes = linkedGenes
                return objCopy
            }))  
        },
    })

    const {loading: loading_quantifications, error: error_quantifications, data: data_quantifications} = useQuery(GENE_EXP_QUERY, {
        variables: {
            assembly: assembly,
            accessions: assembly === "GRCh38" ? HUMAN_GENE_EXP : MOUSE_GENE_EXP,
            gene_id: Array.from(scores.reduce((acc, e) => acc.union(new Set(e.linked_genes.map((e) => e.gene_id))), new Set([])))
        },
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(data) {
            let listGenes = []
            data.gene_dataset.forEach((e) => {
                e.gene_quantification_files.forEach((el) => {
                    listGenes = listGenes.concat(el.quantifications)
                }
            )
            })
            console.log(listGenes);
            
            setScores(scores.map((obj) => {
                let objCopy = {...obj}
                objCopy.linked_genes.map((gene) => {
                    let geneCopy = {...gene}
                    let matchingGene = listGenes.find((o) => o.gene.id.split(".")[0] == gene.gene_id)
                    geneCopy.tpm = matchingGene ? matchingGene.tpm: 0
                    return geneCopy
                })
                return objCopy
            })) 
        },
    })
    
    const allColumns = [{ header: "DNase", value: (row) => row.dnase, render: (row) => row.dnase.toFixed(2) },
    // { header: "DNase Rank", value: (row) => row.dnase_rank },
    { header: "H3K4me3", value: (row) => row.h3k4me3, render: (row) => row.h3k4me3.toFixed(2) },
    // { header: "H3K4me3 Rank", value: (row) => row.h3k4me3_rank },
    { header: "H3K27ac", value: (row) => row.h3k27ac, render: (row) => row.h3k27ac.toFixed(2) },
    // { header: "H3K27ac Rank", value: (row) => row.h3k27ac_rank },
    { header: "CTCF", value: (row) => row.ctcf, render: (row) => row.ctcf.toFixed(2) },
    // { header: "CTCF Rank", value: (row) => row.ctcf_rank },
    { header: "ATAC", value: (row) => row.atac, render: (row) => row.atac.toFixed(2) },
    // { header: "ATAC Rank", value: (row) => row.atac_rank },
    { header: "Vertebrates", value: (row) => row.vertebrates, render: (row) => row.vertebrates.toFixed(2) },
    // { header: "Vertebrates Rank", value: (row) => row.vertebrates_rank },
    { header: "Mammals", value: (row) => row.mammals, render: (row) => row.mammals.toFixed(2) },
    // { header: "Mammals Rank", value: (row) => row.mammals_rank },
    { header: "Primates", value: (row) => row.primates, render: (row) => row.primates.toFixed(2) },
    // { header: "Primates Rank", value: (row) => row.primates_rank }
    ]

    useEffect(() => {
        startTransition(async () => {
          const biosamples = await biosampleQuery()
          setBiosampleData(biosamples)
        })
      }, [])

    const handleSearchChange = (event: SelectChangeEvent) => {
        setSelectedSearch(event.target.value)
    }

    const handleAssemblyChange = (event: SelectChangeEvent) => {
        ((event.target.value === "GRCh38") || (event.target.value === "mm10")) && setAssembly(event.target.value)
    }

    function evaluateRankings(data, available) { 
        let scoresToInclude = scoreNames.filter((s) => available[s])
        scoresToInclude.forEach((scoreName) => {
            let score_column = data.map((r, i) => [i, r[scoreName]])
            score_column.sort((a,b) => b[1] - a[1])
            score_column.forEach((row, i) => {
                data[row[0]][`${scoreName}_rank`] = i + 1
            })
        })
        return calculateAggregateRank(data, scoresToInclude)
    }

    function calculateAggregateRank(data, scoresToInclude) {
        data.forEach( (row) => {
            let count = 0;
            let sum = 0;
            scoresToInclude.forEach((score) => {
                sum += row[`${score}_rank`]
                count += 1
            })
            row.aggRank = sum / count
        })
        return data
    }

    function handleCheckBoxChange(e) {
        let scoresToInclude = Array.from(document.getElementsByName("scoresToInclude"))
        scoresToInclude = scoresToInclude.filter((e) => !e.disabled && e.checked).map((e) => e.value)
        setScores(calculateAggregateRank([...scores], scoresToInclude))
        setColumns(allColumns.filter(
            (e) => scoresToInclude.indexOf(e.header.toLowerCase().split(' ')[0]) !== -1
        ))
        setKey(scoresToInclude.join(' '))
    }

    function handleTextUpload(event) {
        let uploadedData = event.get("textUploadFile")
        let random_string = Math.random().toString(36).slice(2, 10)
        let temp_file = new File([uploadedData], `${random_string}.bed`)
        setKey(random_string)
        setTextUploaded([...[temp_file]])
    }

    function appletCallBack(data) {
        setSelectedBiosample([])
        setDataAPI(data)
        setScores([])
    }

    return (
    <Box maxWidth="95%" margin="auto" marginTop={3}>
        <Typography
        alignSelf={"flex-end"}
        variant="h4">
            <b>A</b>ggregate <b>R</b>ank <b>G</b>enerat<b>o</b>r
        </Typography>
        {error_scores && <Alert variant="filled" severity="error">{error_scores.message}</Alert>}
        {error_genes && <Alert variant="filled" severity="error">{error_genes.message}</Alert>}
        {error_quantifications && <Alert variant="filled" severity="error">{error_quantifications.message}</Alert>}
        { scores.length == 0 &&
        <Box>
        <Stack direction={props.header ? "row" : "column"} spacing={3} mt="10px">
            <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
                {!props.header && <Typography variant={"h5"} mr={1} alignSelf="center">Upload Through</Typography>}
                <Stack direction={"row"} alignItems={"center"} flexWrap={props.header ? "nowrap" : "wrap"}>
                    <FormControl variant="standard" size="medium" sx={{ '& .MuiInputBase-root': { fontSize: '1.5rem' } }}>
                        <Select
                        fullWidth
                        id="select-search"
                        value={selectedSearch}
                        onChange={handleSearchChange}
                        //Manually aligning like this isn't ideal
                        SelectDisplayProps={{ style: { paddingBottom: '0px', paddingTop: '1px' } }}
                        >
                        <MenuItem value={"BED File"}>BED File</MenuItem>
                        <MenuItem value={"Text Box"}>Text Box</MenuItem>
                        </Select>
                    </FormControl>
                    <Typography variant={props.header ? "body1" : "h5"} ml={1} mr={1} alignSelf="center">in</Typography>
                    <FormControl variant="standard" size="medium" sx={{ '& .MuiInputBase-root': { fontSize: '1.5rem' } }}>
                        <Select
                        fullWidth
                        id="select-search"
                        value={assembly}
                        onChange={handleAssemblyChange}
                        SelectDisplayProps={{ style: { paddingBottom: '0px', paddingTop: '1px' } }}
                        >
                        <MenuItem value={"GRCh38"}>GRCh38</MenuItem>
                        <MenuItem value={"mm10"}>mm10</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>
        </Stack>
            <Box mt="20px" maxWidth="40vw">
                {selectedSearch === "BED File" ? (
                        <BedUpload
                            assembly = {assembly}
                            appletCallback={appletCallBack}
                        />
                ):
                <FormControl fullWidth>
                    <form action={handleTextUpload}>
                        <TextField name="textUploadFile" multiline fullWidth rows={5} 
                        placeholder="Copy and paste your data from Excel here"
                        ></TextField>
                        <Button type="submit" size="medium" variant="outlined">Submit</Button>
                    </form>
                    <Box id="hidden_bed_upload">
                    { textUploaded.length > 0 && 
                        <BedUpload
                            key={key}
                            assembly = {assembly}
                            appletFiles={textUploaded}
                            appletCallback={appletCallBack}
                        />
                    }
                    </Box>
                </FormControl>
                
                }   
            </Box>
        </Box>
    }
    {scores.length > 0 && 
    <Box mt="20px">

        <Accordion style={{"border": "1px solid", "marginBottom": "15px"}}>
            <AccordionSummary expandIcon={<FilterListIcon />}>Filters</AccordionSummary>
            <AccordionDetails>
                <Stack direction="row" spacing="3%" height="40vh">
                    <Box width="30%" overflow="scroll">
                        <Typography lineHeight={"50px"} mr={"10px"}>Select Biosample</Typography>
                        {selectedBiosample.length > 0 &&
                            <Paper elevation={0}>
                                <IconButton size="small" sx={{ p: 0 }} onClick={(event) => { setSelectedBiosample([]); event.stopPropagation() }}>
                                    <Tooltip placement="top" title={"Clear Biosample"}>
                                        <ClearIcon />
                                    </Tooltip>
                                    <Typography>{selectedBiosample[0].ontology.charAt(0).toUpperCase() + selectedBiosample[0].ontology.slice(1) + " - " + selectedBiosample[0].displayname}</Typography>
                                </IconButton>
                            </Paper>
                        }
                        <BiosampleTables
                            biosampleData={biosampleData}
                            selectedBiosamples={selectedBiosample}
                            setSelectedBiosamples={setSelectedBiosample} 
                            biosampleSelectMode="replace"
                            showRNAseq={false}
                            showDownloads={false}
                            assembly={assembly}
                        />
                    </Box>
                        <Stack direction="column">
                            <Typography lineHeight={"40px"}>Assays</Typography>
                            <FormGroup onChange={handleCheckBoxChange}>
                                <FormControlLabel label="DNase" control={<Checkbox disabled={!availableScores.dnase} defaultChecked name="scoresToInclude" value="dnase"></Checkbox>}></FormControlLabel>
                                <FormControlLabel label="H3K4me3" control={<Checkbox disabled={!availableScores.h3k4me3} defaultChecked name="scoresToInclude" value="h3k4me3"></Checkbox>}></FormControlLabel>
                                <FormControlLabel label="H3K27ac" control={<Checkbox disabled={!availableScores.h3k27ac} defaultChecked name="scoresToInclude" value="h3k27ac"></Checkbox>}></FormControlLabel>
                                <FormControlLabel label="CTCF" control={<Checkbox disabled={!availableScores.ctcf} defaultChecked name="scoresToInclude" value="ctcf"></Checkbox>}></FormControlLabel>
                                <FormControlLabel label="ATAC" control={<Checkbox disabled={!availableScores.atac} defaultChecked name="scoresToInclude" value="atac"></Checkbox>}></FormControlLabel>
                            </FormGroup>

                            <Typography lineHeight={"40px"}>Conservation</Typography>
                            <FormGroup onChange={handleCheckBoxChange}>
                                <FormControlLabel label="Vertebrates" control={<Checkbox disabled={!availableScores.vertebrates} defaultChecked name="scoresToInclude" value="vertebrates"></Checkbox>}></FormControlLabel>
                                <FormControlLabel label="Mammals" control={<Checkbox disabled={!availableScores.mammals} defaultChecked name="scoresToInclude" value="mammals"></Checkbox>}></FormControlLabel>
                                <FormControlLabel label="Primates" control={<Checkbox disabled={!availableScores.primates} defaultChecked name="scoresToInclude" value="primates"></Checkbox>}></FormControlLabel>
                            </FormGroup>
                            
                    </Stack>
                </Stack>
            </AccordionDetails>
        </Accordion>

        {(loading_scores || loading_genes || loading_quantifications) ? <CircularProgress/>:
        <DataTable
        key={key}
        columns={[{ header: "Accession", value: (row) => row.accession },
            { header: "User ID", value: (row) => row.user_id },
            { header: "Aggregate Rank", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) },
            { header: "TPM Max", value: (row) => row.linked_genes.reduce((acc, e) => acc + e.tpm, 0)}]
            .concat(columns)}
        rows={scores}
        sortColumn={2}
        sortDescending
        itemsPerPage={10}
        >
        </DataTable>
        } 
    </Box>
        
    }

    </Box>
    )
}