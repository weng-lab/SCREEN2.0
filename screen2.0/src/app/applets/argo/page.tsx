"use client"
import React from "react"
import {useState } from "react"
import { Stack, Typography, Box, TextField, Button, Alert, FormGroup, Checkbox, FormControlLabel } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import BedUpload from "../../_mainsearch/bedupload"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { Z_SCORES_QUERY } from "./queries"
import { useLazyQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { ZScores } from "./types"

export default function Argo(props: {header?: false}) {
    const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [error, setError] = useState([false, ""]) // status, message
    const [scores, setScores] = useState<ZScores[]>([])
    const [getOutput] = useLazyQuery(Z_SCORES_QUERY)
    const scoreNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac" ]
    
    addEventListener("storage", () => {
        let accessions = sessionStorage.getItem('bed intersect').split(" ")
        let userIDs = sessionStorage.getItem('user ids').split(" ")
        getOutput({
            variables: {
              assembly: assembly,
              accessions: accessions
            },
            client: client,
            fetchPolicy: 'cache-and-network',
            onCompleted(d) {       
                let data: ZScores[] = d['cCRESCREENSearch'].map((r) => {
                    return {
                        accession: r.info.accession,
                        user_id: userIDs[accessions.indexOf(r.info.accession)],
                        dnase: r.dnase_zscore,
                        h3k4me3: r.promoter_zscore,
                        h3k27ac: r.enhancer_zscore,
                        ctcf: r.ctcf_zscore,
                        atac: r.atac_zscore
                    }
                })
                
                setScores(evaluateRankings(data))
            },
            onError(error) {
                console.error(error.message)
                setError([true, error.message])
            },
        })
    })

    const handleSearchChange = (event: SelectChangeEvent) => {
        setSelectedSearch(event.target.value)
    }

    const handleAssemblyChange = (event: SelectChangeEvent) => {
        ((event.target.value === "GRCh38") || (event.target.value === "mm10")) && setAssembly(event.target.value)
    }

    function evaluateRankings(data) { 
        scoreNames.forEach((scoreName) => {
            let score_column = data.map((r, i) => [i, r[scoreName]])
            score_column.sort((a,b) => b[1] - a[1])
            score_column.forEach((row, i) => {
                data[row[0]][`${scoreName}_rank`] = i + 1
            })
        })
        return calculateAggregateRank(data, scoreNames)
    }

    function handleCheckBoxChange(e) {
        let scoresToInclude = Array.from(document.getElementsByName("scoresToInclude"))
        scoresToInclude = scoresToInclude.filter((e) => e.checked).map((e) => e.value)
        console.log(scoresToInclude);
        
        setScores(calculateAggregateRank([...scores], scoresToInclude))
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

    return (
    <Box maxWidth="95%" margin="auto" marginTop={3}>
        <Typography
        alignSelf={"flex-end"}
        variant="h4">
            <b>A</b>ggregate <b>R</b>ank <b>G</b>enerat<b>o</b>r
        </Typography>
        <Stack direction={props.header ? "row" : "column"} spacing={3} mt="10px">
            <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
                {!props.header && <Typography variant={"h5"} mr={1} alignSelf="center">Upload Through</Typography>}
                <Stack direction={"row"} alignItems={"center"} flexWrap={props.header ? "nowrap" : "wrap"}>
                    <FormControl variant="standard" size="medium" sx={
                        props.header ?
                        {
                            '& .MuiInputBase-root': { color: "white" },
                            '& .MuiInputBase-root::before': { borderColor: "white" },
                            '&:hover .MuiInputBase-root::before': { borderColor: "white" },
                            '& .MuiInputBase-root::after': { borderColor: "white" },
                            '& .MuiSvgIcon-root': { fill: "white" }
                        }
                        :
                        { '& .MuiInputBase-root': { fontSize: '1.5rem' } }}>
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
                    <FormControl variant="standard" size="medium" sx={
                        props.header ?
                        {
                            '& .MuiInputBase-root': { color: "white" },
                            '& .MuiInputBase-root::before': { borderColor: "white" },
                            '&:hover .MuiInputBase-root::before': { borderColor: "white" },
                            '& .MuiInputBase-root::after': { borderColor: "white" },
                            '& .MuiSvgIcon-root': { fill: "white" }
                        }
                        :
                        { '& .MuiInputBase-root': { fontSize: '1.5rem' } }}>
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
                            header={props.header}
                            applet={true}
                        />
                ):
                <FormControl fullWidth>
                    <TextField
                    multiline
                    fullWidth
                    rows={5}
                    placeholder="Copy and paste your data from Excel here"
                    ></TextField>
                    <Button type="submit" size="medium" variant="outlined"
                    >Submit</Button>
                </FormControl>
                }   
            </Box>  
    {error[0] && <Alert variant="filled" severity="error">{error[1]}</Alert>}
    {scores.length > 0 && 
    <Box mt="20px">
        <Stack direction="row" maxHeight={"50px"}>
            <FormGroup onChange={handleCheckBoxChange}>
                <Typography variant="h6" lineHeight={"50px"}>
                    Include in scores: 
                </Typography>
                <FormControlLabel label="DNase" control={<Checkbox  defaultChecked name="scoresToInclude" value="dnase"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="H3K4me3" control={<Checkbox  defaultChecked name="scoresToInclude" value="h3k4me3"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="H3K27ac" control={<Checkbox  defaultChecked name="scoresToInclude" value="h3k27ac"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="CTCF" control={<Checkbox  defaultChecked name="scoresToInclude" value="ctcf"></Checkbox>}></FormControlLabel>
                <FormControlLabel label="ATAC" control={<Checkbox  defaultChecked name="scoresToInclude" value="atac"></Checkbox>}></FormControlLabel>
            </FormGroup>
        </Stack>
        
        <DataTable
        columns={[
            { header: "Accessions", value: (row) => row.accession },
            { header: "Chr Start End", value: (row) => row.user_id },
            { header: "Aggregate Rank", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) },
            { header: "DNase", value: (row) => row.dnase, render: (row) => row.dnase.toFixed(2) },
            { header: "DNase Rank", value: (row) => row.dnase_rank },
            { header: "H3K4me3", value: (row) => row.h3k4me3, render: (row) => row.h3k4me3.toFixed(2) },
            { header: "H3K4me3 Rank", value: (row) => row.h3k4me3_rank },
            { header: "H3K27ac", value: (row) => row.h3k27ac, render: (row) => row.h3k27ac.toFixed(2) },
            { header: "H3K27ac Rank", value: (row) => row.h3k27ac_rank },
            { header: "CTCF", value: (row) => row.ctcf, render: (row) => row.ctcf.toFixed(2) },
            { header: "CTCF Rank", value: (row) => row.ctcf_rank },
            { header: "ATAC", value: (row) => row.atac, render: (row) => row.atac.toFixed(2) },
            { header: "ATAC Rank", value: (row) => row.atac_rank },
        ]}
        rows={scores}
        sortColumn={2}
        sortDescending
        itemsPerPage={100}
        >
    </DataTable>
    
    </Box>
    }

    </Box>
    )
}