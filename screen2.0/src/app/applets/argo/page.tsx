"use client"
import React, { startTransition, useCallback, useEffect, JSX } from "react"
import {useState } from "react"
import { Stack, Typography, Box, TextField, Button, Alert, FormGroup, Checkbox, FormControlLabel, CircularProgress, Paper, IconButton, Tooltip } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import ClearIcon from '@mui/icons-material/Clear';
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import BedUpload from "../../_mainsearch/bedupload"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { Z_SCORES_QUERY } from "./queries"
import { ApolloQueryResult, useQuery, useLazyQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { ZScores } from "./types"
import BiosampleTables from "../../search/biosampletables"
import { BIOSAMPLE_Data, biosampleQuery } from "../../../common/lib/queries"
import { RegistryBiosample } from "../../search/types"


export default function Argo(props: {header?: false, optionalFunction?: Function}) {
    const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [error, setError] = useState<[boolean, string]>([false, ""]) // status, message
    const [dataAPI, setDataAPI] = useState<[]>([])
    const [scores, setScores] = useState<ZScores[]>([])
    const [key, setKey] = useState<string>()
    const [columns, setColumns] = useState([])
    const [textUploaded, setTextUploaded] = useState<File[]>([])
    const [biosampleData, setBiosampleData] = useState<ApolloQueryResult<BIOSAMPLE_Data>>(null)
    const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample[]>([])
    const [availableScores, setAvailableScores] = useState({"dnase": true, "h3k4me3": true, "h3k27ac": true, "ctcf": true, "atac": true})
    const scoreNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac" ]
    
    const {loading: loading_scores, error: error_scores, data: data_scores} = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: assembly,
            accessions: scores.length > 0 ? scores.map((s) => s.accession): dataAPI.map((r) => r[4]) ,
            cellType: selectedBiosample.length > 0 ? selectedBiosample[0].name: null
          },
          client: client,
          fetchPolicy: 'cache-and-network',
          onCompleted(d) {            
            let mapFunc = null
            if (selectedBiosample.length > 0) { 
                mapFunc = (r) => {
                    return {
                        accession: r.info.accession,
                        user_id: scores.find((e) => e.accession == r.info.accession).user_id,
                        dnase: r.ctspecific.dnase_zscore,
                        h3k4me3: r.ctspecific.h3k4me3_zscore,
                        h3k27ac: r.ctspecific.h3k27ac_zscore,
                        ctcf: r.ctspecific.ctcf_zscore,
                        atac: r.ctspecific.atac_zscore
                    }
                } 
            }
            else {
                // The else statement is the first time the query is run so scores is null
                let userIDMap = (e) => `${e[6]}_${e[7]}_${e[8]}${ (e[9] && e[10]) ? '_'+e[9]: ''}`
                mapFunc = (r) => {
                    return {
                        accession: r.info.accession,
                        user_id: dataAPI.filter((e) => e[4] == r.info.accession).map(userIDMap).join(', '),
                        dnase: r.dnase_zscore,
                        h3k4me3: r.promoter_zscore,
                        h3k27ac: r.enhancer_zscore,
                        ctcf: r.ctcf_zscore,
                        atac: r.atac_zscore
                    }
                }
            }
            let data: ZScores[] = d['cCRESCREENSearch'].map(mapFunc)
            
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
            setScores(evaluateRankings(data, availableScoresCopy))
            let random_string = Math.random().toString(36).slice(2, 10)
            setColumns(allColumns.filter(
                (e) => scoresToInclude.indexOf(e.header.toLowerCase().split(' ')[0]) !== -1
            ))
            setKey(random_string)
          },
          onError(error) {
              console.error(error.message)
              setError([true, error.message])
          }
        }
    )
    
    const allColumns = [{ header: "DNase", value: (row) => row.dnase, render: (row) => row.dnase.toFixed(2) },
    { header: "DNase Rank", value: (row) => row.dnase_rank },
    { header: "H3K4me3", value: (row) => row.h3k4me3, render: (row) => row.h3k4me3.toFixed(2) },
    { header: "H3K4me3 Rank", value: (row) => row.h3k4me3_rank },
    { header: "H3K27ac", value: (row) => row.h3k27ac, render: (row) => row.h3k27ac.toFixed(2) },
    { header: "H3K27ac Rank", value: (row) => row.h3k27ac_rank },
    { header: "CTCF", value: (row) => row.ctcf, render: (row) => row.ctcf.toFixed(2) },
    { header: "CTCF Rank", value: (row) => row.ctcf_rank },
    { header: "ATAC", value: (row) => row.atac, render: (row) => row.atac.toFixed(2) },
    { header: "ATAC Rank", value: (row) => row.atac_rank }]

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
        {error[0] && <Alert variant="filled" severity="error">{error[1]}</Alert>}
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
    {scores.length > 0 && 
    <Box mt="20px">
        <Stack direction="row" maxHeight={"50px"}>
            <FormGroup onChange={handleCheckBoxChange}>
                <Typography variant="h6" lineHeight={"50px"} mr={"10px"}>
                    Include in scores: 
                </Typography>
                <FormControlLabel label="DNase" control={<Checkbox disabled={!availableScores.dnase} defaultChecked name="scoresToInclude" value="dnase"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="H3K4me3" control={<Checkbox disabled={!availableScores.h3k4me3} defaultChecked name="scoresToInclude" value="h3k4me3"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="H3K27ac" control={<Checkbox disabled={!availableScores.h3k27ac} defaultChecked name="scoresToInclude" value="h3k27ac"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="CTCF" control={<Checkbox disabled={!availableScores.ctcf} defaultChecked name="scoresToInclude" value="ctcf"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="ATAC" control={<Checkbox disabled={!availableScores.atac} defaultChecked name="scoresToInclude" value="atac"></Checkbox>}></FormControlLabel>

            </FormGroup>
        </Stack>
        <Stack direction={"row"} spacing={1}>
            <Box width={"30%"}>
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
            <Box width={"70%"}>
                {loading_scores ? <CircularProgress/>:
                <DataTable
                key={key}
                columns={[{ header: "Accessions", value: (row) => row.accession },
                    { header: "User ID", value: (row) => row.user_id },
                    { header: "Aggregate Rank", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) }].concat(columns)}
                rows={scores}
                sortColumn={2}
                sortDescending
                itemsPerPage={7}
                >
                </DataTable>
                } 
            </Box>
            
        </Stack>
    
    </Box>
    }

    </Box>
    )
}