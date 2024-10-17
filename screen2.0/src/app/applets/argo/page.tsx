"use client"
import React, { startTransition, useEffect } from "react"
import {useState } from "react"
import { Stack, Typography, Box, TextField, Button, Alert, FormGroup, Checkbox, FormControlLabel, CircularProgress, Paper, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, RadioGroup, Radio, InputLabel, FormLabel, Drawer } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import ClearIcon from '@mui/icons-material/Clear'
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import BedUpload, { getIntersect, parseDataInput } from "../../_mainsearch/bedupload"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { GENE_EXP_QUERY, LINKED_GENES, Z_SCORES_QUERY } from "./queries"
import { ApolloQueryResult, useLazyQuery, useQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { ZScores, LinkedGenes } from "./types"
import { BIOSAMPLE_Data, biosampleQuery } from "../../../common/lib/queries"
import { RegistryBiosample } from "../../search/types"
import FilterListIcon from '@mui/icons-material/FilterList';
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import BiosampleTables from "../../_biosampleTables/BiosampleTables"
import Grid from "@mui/material/Grid2"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

export default function Argo(props: {header?: false, optionalFunction?: Function}) {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const scoreNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]
    const conservationNames = ["vertebrates", "mammals", "primates"]
    const linkedGenesMethods = ["Intact-HiC", "CTCF-ChIAPET", "RNAPII-ChIAPET", "CRISPRi-FlowFISH", "eQTLs"]
    const allScoreNames = scoreNames.concat(conservationNames).concat(linkedGenesMethods)
    const allScoresObj = {"dnase": false, "h3k4me3": false, "h3k27ac": false, "ctcf": false, "atac": false, "conservation": true, "TFMotifs": false, "cCREs": true, "CA": true, "CA_CTCF": true, "CA_H3K4me3": true, "CA_TF": true, "dELS": true, "pELS": true, "PLS": true, "TF": true, "vertebrates": false, "mammals": false, "primates": false, "Intact-HiC": false, "CTCF-ChIAPET": false, "RNAPII-ChIAPET": false, "CRISPRi-FlowFISH" : false, "eQTLs": false}
    const allFiltersObj = {
        headerFilters: {"conservation": true, "TFMotifs": false, "cCREs": true,},
        conservationFilters: {"240_mam_phyloP": true, "240_mam_phastCons": false, "43_prim_phyloP": false, "43_prim_phastCons": false, "100_vert_phyloP": false, "100_vert_phastCons": false},
        classFilters: { "CA": true, "CA_CTCF": true, "CA_H3K4me3": true, "CA_TF": true, "dELS": true, "pELS": true, "PLS": true, "TF": true },
        assayFilters: { "dnase": false, "h3k4me3": false, "h3k27ac": false, "ctcf": false, "atac": false},
        linkedGeneFilters: {"Intact-HiC": false, "CTCF-ChIAPET": false, "RNAPII-ChIAPET": false, "CRISPRi-FlowFISH": false, "eQTLs": false },
    };

    const allColumns = [
        { header: "DNase", value: (row) => row.dnase, render: (row) => row.dnase.toFixed(2) },
        { header: "H3K4me3", value: (row) => row.h3k4me3, render: (row) => row.h3k4me3.toFixed(2) },
        { header: "H3K27ac", value: (row) => row.h3k27ac, render: (row) => row.h3k27ac.toFixed(2) },
        { header: "CTCF", value: (row) => row.ctcf, render: (row) => row.ctcf.toFixed(2) },
        { header: "ATAC", value: (row) => row.atac, render: (row) => row.atac.toFixed(2) },
        { header: "Vertebrates", value: (row) => row.vertebrates, render: (row) => row.vertebrates.toFixed(2) },
        { header: "Mammals", value: (row) => row.mammals, render: (row) => row.mammals.toFixed(2) },
        { header: "Primates", value: (row) => row.primates, render: (row) => row.primates.toFixed(2) },
        { header: "Intact-HiC", value: (row) => row["Intact-HiC"], render: (row) => row["Intact-HiC"].toFixed(2) },
        { header: "CTCF-ChIAPET", value: (row) => row["CTCF-ChIAPET"], render: (row) => row["CTCF-ChIAPET"].toFixed(2) },
        { header: "RNAPII-ChIAPET", value: (row) => row["RNAPII-ChIAPET"], render: (row) => row["RNAPII-ChIAPET"].toFixed(2) },
        { header: "CRISPRi-FlowFISH", value: (row) => row["CRISPRi-FlowFISH"], render: (row) => row["CRISPRi-FlowFISH"].toFixed(2) },
        { header: "eQTLs", value: (row) => row.eQTLs, render: (row) => row.eQTLs.toFixed(2) },
    ]

    const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [dataAPI, setDataAPI] = useState<[]>([]) // The intersection data returned from BedUpload component
    const [rows, setRows] = useState<ZScores[]>([]) // The main data displayed on the table
    const [key, setKey] = useState<string>()
    const [columns, setColumns] = useState([]) // State variable used to display the columns in the DataTable
    const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample>(null)
    const [availableScores, setAvailableScores] = useState(allFiltersObj) // This is all the scores available according to the query, all false scores are disabled checkboxes below
    const [checkedScores, setCheckedScores] = useState(allFiltersObj) // This is the scores the user has selected, used for checkbox control
    const allChecked = Object.values(checkedScores).every(Boolean);
    const someChecked = Object.values(checkedScores).some(Boolean);
    
    const [getOutput] = useLazyQuery(BED_INTERSECT_QUERY)
    
    const {loading: loading_scores, error: error_scores} = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: assembly,
            accessions: rows.length > 0 ? rows.map((s) => s.accession): dataAPI.map((r) => r[4]) ,
            cellType: selectedBiosample ? selectedBiosample.name: null
        },
        skip: rows.length == 0 && dataAPI.length == 0,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(d) {
            let data = d['cCRESCREENSearch']
            let result = null
            if (selectedBiosample) {
                // This makes a copy of the existing row and just updates the scores to ctspecific
                result = rows.map((obj) => {
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
                // The else is only for when the query runs the first time
                // This is done so that if a biosample is deselected, the linked genes data is not lost
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
                if (rows.length > 0) {
                    result = rows.map(mapFunc)
                }
                else {
                    result = dataAPI
                        .map((e) => {
                            return {
                                // This is annoying because currently an array of objects is not being returned
                                // The order of the array is the same as the order of the ccre file
                                // Index 4 is accessions, 6 is chr, 7 is start, 8 is stop 
                                // chr, start, stop should be of user uploaded file and not of our files hence not index 0,1,2

                                accession: e[4],
                                user_id: `${e[6]}_${e[7]}_${e[8]}${ (e[9] && e[10]) ? '_'+e[9]: ''}`,
                                linked_genes: []
                            }
                        })
                        .map(mapFunc)
                }          
            }        
            
            let scoresToInclude = selectedBiosample ? scoreNames.filter((s) => selectedBiosample[s]): scoreNames
            let availableScoresCopy = {...availableScores}
            
            if (assembly != "mm10") {
                // Including conservation scores if assembly is not mouse
                scoresToInclude = scoresToInclude.concat(conservationNames)
            }

            // Linked genes is by default unavailable and disabled, it is made available inside the query below
            allScoreNames.forEach( (s) => {
                if (scoresToInclude.indexOf(s) !== -1) {
                    availableScoresCopy.assayFilters[s] = true
                }
                else {
                    availableScoresCopy.assayFilters[s] = false
                }
            })
            setAvailableScores(availableScoresCopy)
            setCheckedScores(availableScoresCopy)
            setRows(evaluateRankings(result, availableScoresCopy))
        }
    })
    

    const {loading: loading_genes, error: error_genes} = useQuery(LINKED_GENES, {
        variables: {
            assembly: assembly.toLowerCase(),
            accessions: (rows.length > 0 && selectedBiosample) ? rows.map((s) => s.accession): [],
        },
        skip: rows.length == 0 || !!selectedBiosample,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(data) {
            if (data.linkedGenes.length > 0) {
                setRows(rows.map((obj) => {
                    let objCopy = {...obj}
                    let matchingObjs = data.linkedGenes.filter((e) => e.accession == obj.accession)
                    let linkedGenes: LinkedGenes[] = matchingObjs.map((e) => {
                        // The Chromatin part is because Chromatin has sub-methods which is present in the assay field
                        return {gene_id: e.geneid, method: e.method == "Chromatin" ? e.assay: e.method, tpm: 0}
                    })
                    objCopy.linked_genes = linkedGenes
                    return objCopy
                }))
            } 
        },
    })

    const {loading: loading_quantifications, error: error_quantifications} = useQuery(GENE_EXP_QUERY, {
        variables: {
            assembly: assembly,
            biosample_value: selectedBiosample ? selectedBiosample.name: "",
            gene_id: Array.from(rows.reduce((acc, e) => { e.linked_genes.map((e) => e.gene_id).forEach((el) => acc.add(el)); return acc }, new Set([]))) // Using Set to avoid duplicates
        },
        skip: !!selectedBiosample || rows.length == 0,
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
            if (listGenes.length > 0) {
                let availableScoresCopy = {...availableScores}
                linkedGenesMethods.forEach((m) => availableScoresCopy.linkedGeneFilters[m] = false)
                let newScores = rows.map((obj) => {
                    let objCopy = {...obj}
                    objCopy.linked_genes = objCopy.linked_genes.map((gene) => {
                        let geneCopy = {...gene}
                        let matchingGenes = listGenes.filter((o) => o.gene.id.split(".")[0] == gene.gene_id)
                        
                        let max_tpm = 0
                        matchingGenes.forEach((matchingGene) => {
                            // If a matching gene is found for any method, the method is made available to select
                            availableScoresCopy.linkedGeneFilters[`${gene.method}`] = true
                            
                            if (matchingGene.tpm > max_tpm) {
                                max_tpm = matchingGene.tpm
                            }
                        })
                        geneCopy.tpm = max_tpm
                        return geneCopy
                    })
                    objCopy = evaluateMaxTPM(objCopy)
                    return objCopy
                })
                setAvailableScores(availableScoresCopy)
                setCheckedScores(availableScoresCopy)
                setRows(evaluateRankings(newScores, availableScoresCopy))
            }
        },
    })

    const handleSearchChange = (event: SelectChangeEvent) => {
        setDataAPI([])
        setAvailableScores(allFiltersObj)
        setCheckedScores(allFiltersObj)
        setSelectedBiosample(null)
        setRows([])
        setColumns([])
        setSelectedSearch(event.target.value)
    }

    const handleAssemblyChange = (event: SelectChangeEvent) => {
        setDataAPI([])
        setAvailableScores(allFiltersObj)
        setCheckedScores(allFiltersObj)
        setSelectedBiosample(null)
        setRows([])
        setColumns([])
        if ((event.target.value === "GRCh38") || (event.target.value === "mm10")) {
            setAssembly(event.target.value)
        }  
    }

    function appletCallBack(data) {
        setSelectedBiosample(null)
        setDataAPI(data)
        setRows([])
    }

    function handleTextUpload(event) {
        let uploadedData = event.get("textUploadFile").toString()
        getIntersect(getOutput, parseDataInput(uploadedData), assembly, appletCallBack, console.error)
    }

    function evaluateRankings(data, available) { 
        // This below code is inspired from this link to create a ranking column for each score for every row
        // https://stackoverflow.com/questions/60989105/ranking-numbers-in-an-array-using-javascript
        let scoresToInclude = allScoreNames.filter((s) => available.assayFilters[s])
        scoresToInclude.forEach((scoreName) => {
            let score_column = data.map((r, i) => [i, r[scoreName]])
            score_column.sort((a,b) => b[1] - a[1])
            score_column.forEach((row, i) => {
                data[row[0]][`${scoreName}_rank`] = i + 1
            })
        })
        setColumns(allColumns.filter(
            (e) => available.assayFilters[e.header.toLowerCase()] || available.assayFilters[e.header]
        ))
        let random_string = Math.random().toString(36).slice(2, 10)
        setKey(random_string) // Setting a key to force update the DataTable component to refresh with the new columns
        return calculateAggregateRank(data, scoresToInclude)
    }

    function evaluateMaxTPM(score: ZScores) {
        // This finds the Max TPM for each method in a given row
        let scoreCopy = {...score}
        linkedGenesMethods.forEach((method) => {
            let maxTPM = 0
            let method_genes = scoreCopy.linked_genes.filter( (gene) => gene.method == method)
            method_genes.forEach((e) => maxTPM = e.tpm > maxTPM ? e.tpm: maxTPM)
            scoreCopy[method] = maxTPM
        })
        return scoreCopy
    }

    function calculateAggregateRank(data, scoresToInclude) {
        // This finds the Aggregate Rank depending on which scores are checked by the user
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

    function handleCheckBoxChange(event, groupName) {
        let checkedCopy = JSON.parse(JSON.stringify(checkedScores));
        checkedCopy[groupName][event.target.value] = event.target.checked;
        setCheckedScores(checkedCopy);
    
        let scoresToInclude = Object.keys(checkedCopy[groupName]).filter((e) => checkedCopy[groupName][e]);
        setRows(calculateAggregateRank([...rows], scoresToInclude));
        setColumns(allColumns.filter(
            (e) => checkedCopy[groupName][e.header.toLowerCase().split(' ')[0]] || checkedCopy[groupName][e.header]
        ));
        setKey(scoresToInclude.join(' '));
    }

    const handleSelectAll = (event, groupName, keys) => {
        const isChecked = event.target.checked;
        let updatedScores = { ...checkedScores };
      
        // Update only the specific group
        keys.forEach((key) => {
            updatedScores[groupName][key] = isChecked;
        });
      
        setCheckedScores(updatedScores);
      
        // let scoresToInclude = Object.keys(updatedScores[groupName]).filter((e) => updatedScores[groupName][e]);
        // setRows(calculateAggregateRank([...rows], scoresToInclude));
        // setColumns(allColumns.filter(
        //   (e) => updatedScores[groupName][e.header.toLowerCase().split(' ')[0]] || updatedScores[e.header]
        // ));
        // setKey(scoresToInclude.join(' '));
      };

      const areAllChecked = (groupName, keys) => {
        return keys.every((key) => checkedScores[groupName][key]);
      };
      
      const isIndeterminate = (groupName, keys) => {
        const totalChecked = keys.filter((key) => checkedScores[groupName][key]).length;
        return totalChecked > 0 && totalChecked < keys.length;
      };
      
    return (
        <Box display="flex" height="100vh">
            {!drawerOpen && (
                <IconButton
                    onClick={toggleDrawer}
                    color="primary"
                >
                    <FilterListIcon />
                </IconButton>
            )}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                variant="persistent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '40vh',
                        top: theme => `${theme.mixins.toolbar.minHeight}px`,
                        zIndex: theme => theme.zIndex.appBar - 1,
                    }
                }}
            >
                <Box
                    height="100vh"
                    overflow="auto"
                >
                    <Stack direction={"row"} justifyContent={"space-between"} padding={1}>
                        <Typography alignContent={"center"}>Filters</Typography>
                        <IconButton
                            color="primary"
                            onClick={toggleDrawer}
                        >
                            <FilterListIcon />
                        </IconButton>
                    </Stack>
                    <Accordion defaultExpanded square disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Sequence
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormGroup>
                                <FormControlLabel value="conservation" control={<Checkbox onChange={(event) => handleCheckBoxChange(event, "headerFilters")} checked={checkedScores.headerFilters.conservation} />} label="Conservation" />
                                <FormControl fullWidth>
                                    <Select size="small" defaultValue={"240-mam-phyloP"} disabled={!checkedScores.headerFilters.conservation}>
                                        <MenuItem value={"240-mam-phyloP"}>240-Mammal(phyloP)</MenuItem>
                                        <MenuItem value={"240-mam-phastCons"}>240-Mammal(phastCons)</MenuItem>
                                        <MenuItem value={"43-prim-phyloP"}>43-Primate(phyloP)</MenuItem>
                                        <MenuItem value={"43-prim-phastCons"}>43-Primate(phastCons)</MenuItem>
                                        <MenuItem value={"100-vert-phyloP"}>100-Vertebrate(phyloP)</MenuItem>
                                        <MenuItem value={"100-vert-phastCons"}>100-Vertebrate(phastCons)</MenuItem>
                                    </Select>
                                </FormControl>
                            </FormGroup>
                            <FormControl sx={{ width: "50%" }}>
                                <FormLabel>Rank By</FormLabel>
                                <Select size="small" defaultValue={"max"} disabled={!checkedScores.headerFilters.conservation}>
                                    <MenuItem value={"min"}>Min</MenuItem>
                                    <MenuItem value={"max"}>Max</MenuItem>
                                    <MenuItem value={"avg"}>Average</MenuItem>
                                </Select>
                            </FormControl>
                            <FormGroup>
                                <FormControlLabel value="TFMotifs" control={<Checkbox onChange={(event) => handleCheckBoxChange(event, "headerFilters")} checked={checkedScores.headerFilters.TFMotifs} />} label="TF Motifs" />
                                <RadioGroup>
                                    <FormControlLabel value="factorbook" control={<Radio />} label="Factorbook" disabled={!checkedScores.headerFilters.TFMotifs} />
                                    <FormControlLabel value="factorbookTF" control={<Radio />} label="Factorbook + TF Motif" disabled={!checkedScores.headerFilters.TFMotifs} />
                                    <FormControlLabel value="hocomoco" control={<Radio />} label="HOCOMOCO" disabled={!checkedScores.headerFilters.TFMotifs} />
                                    <FormControlLabel value="zMotif" control={<Radio />} label="ZMotif" disabled={!checkedScores.headerFilters.TFMotifs} />
                                </RadioGroup>
                            </FormGroup>
                            <FormGroup>
                                <Typography lineHeight={"40px"}>Rank By</Typography>
                                <FormControlLabel value="numMotifs" control={<Checkbox />} label="Number of Motifs" disabled={!checkedScores.headerFilters.TFMotifs} />
                                <FormControlLabel value="motifScoreDelta" control={<Checkbox />} label="Motif Score Delta" disabled={!checkedScores.headerFilters.TFMotifs} />
                                <FormControlLabel value="TFPeakStrength" control={<Checkbox />} label="TF Peak Strength" disabled={!checkedScores.headerFilters.TFMotifs} />
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion square disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Element
                        </AccordionSummary>
                        <AccordionDetails>

                            <FormControlLabel value="cCREs" control={<Checkbox onChange={(event) => handleCheckBoxChange(event, "headerFilters")} checked={checkedScores.headerFilters.cCREs} />} label="cCREs" />
                            <Accordion square disableGutters disabled={!checkedScores.headerFilters.cCREs}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    Within a Biosample
                                </AccordionSummary>
                                <AccordionDetails>
                                    {selectedBiosample && (
                                        <Paper elevation={0}>
                                            <IconButton
                                                size="small"
                                                sx={{ p: 0 }}
                                                onClick={(event) => {
                                                    setSelectedBiosample(null);
                                                    event.stopPropagation();
                                                }}
                                            >
                                                <Tooltip
                                                    placement="top"
                                                    title={"Clear Biosample"}
                                                >
                                                    <ClearIcon />
                                                </Tooltip>
                                                <Typography>
                                                    {selectedBiosample.ontology.charAt(0).toUpperCase() +
                                                        selectedBiosample.ontology.slice(1) +
                                                        " - " +
                                                        selectedBiosample.displayname}
                                                </Typography>
                                            </IconButton>
                                        </Paper>
                                    )}
                                    <BiosampleTables
                                        selected={selectedBiosample?.name}
                                        onBiosampleClicked={setSelectedBiosample}
                                        assembly={assembly}
                                    />
                                </AccordionDetails>
                            </Accordion>
                            <FormGroup>
                                <Typography>Include Classes</Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={areAllChecked("classFilters", ["CA", "CA_CTCF", "CA_H3K4me3", "CA_TF", "dELS", "pELS", "PLS", "TF"])}
                                            indeterminate={isIndeterminate("classFilters", ["CA", "CA_CTCF", "CA_H3K4me3", "CA_TF", "dELS", "pELS", "PLS", "TF"])}
                                            onChange={(event) => handleSelectAll(event, "classFilters", ["CA", "CA_CTCF", "CA_H3K4me3", "CA_TF", "dELS", "pELS", "PLS", "TF"])}
                                        />
                                    }
                                    label="Select All"
                                    disabled={!checkedScores.headerFilters.cCREs}
                                />
                                <Grid container spacing={0} ml={2}>
                                    <Grid size={6}>
                                        <FormGroup>
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.CA}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="CA"
                                                value="CA"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.CA_CTCF}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="CA-CTCF"
                                                value="CA_CTCF"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.CA_H3K4me3}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="CA-H3K4me3"
                                                value="CA_H3K4me3"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.CA_TF}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="CA-TF"
                                                value="CA_TF"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                        </FormGroup>
                                    </Grid>
                                    <Grid size={6}>
                                        <FormGroup>
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.dELS}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="dELS"
                                                value="dELS"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.pELS}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="pELS"
                                                value="pELS"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.PLS}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="PLS"
                                                value="PLS"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                            <FormControlLabel
                                                checked={checkedScores.classFilters.TF}
                                                onChange={(event) => handleCheckBoxChange(event, "classFilters")}
                                                control={<Checkbox />}
                                                label="TF"
                                                value="TF"
                                                disabled={!checkedScores.headerFilters.cCREs}
                                            />
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                            </FormGroup>
                            <FormGroup>
                                <Typography>Include Assay Z-Scores</Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={areAllChecked("assayFilters", ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"])}
                                            indeterminate={isIndeterminate("assayFilters", ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"])}
                                            onChange={(event) => handleSelectAll(event, "assayFilters", ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"])}
                                        />
                                    }
                                    label="Select All"
                                    disabled={!checkedScores.headerFilters.cCREs}
                                />
                                <Grid container spacing={0} ml={2}>
                                    <Grid size={6}>
                                        <FormControlLabel
                                            label="DNase"
                                            control={
                                                <Checkbox
                                                    onChange={(event) => handleCheckBoxChange(event, "assayFilters")}
                                                    disabled={!availableScores.assayFilters.dnase || !checkedScores.headerFilters.cCREs}
                                                    checked={checkedScores.assayFilters.dnase}
                                                    value="dnase"
                                                />
                                            }
                                        />
                                        <FormControlLabel
                                            label="H3K4me3"
                                            control={
                                                <Checkbox
                                                    onChange={(event) => handleCheckBoxChange(event, "assayFilters")}
                                                    disabled={!availableScores.assayFilters.h3k4me3 || !checkedScores.headerFilters.cCREs}
                                                    checked={checkedScores.assayFilters.h3k4me3}
                                                    value="h3k4me3"
                                                />
                                            }
                                        />
                                        <FormControlLabel
                                            label="H3K27ac"
                                            control={
                                                <Checkbox
                                                    onChange={(event) => handleCheckBoxChange(event, "assayFilters")}
                                                    disabled={!availableScores.assayFilters.h3k27ac || !checkedScores.headerFilters.cCREs}
                                                    checked={checkedScores.assayFilters.h3k27ac}
                                                    value="h3k27ac"
                                                />
                                            }
                                        />
                                    </Grid>
                                    <Grid size={6}>
                                        <FormControlLabel
                                            label="CTCF"
                                            control={
                                                <Checkbox
                                                    onChange={(event) => handleCheckBoxChange(event, "assayFilters")}
                                                    disabled={!availableScores.assayFilters.ctcf || !checkedScores.headerFilters.cCREs}
                                                    checked={checkedScores.assayFilters.ctcf}
                                                    value="ctcf"
                                                />
                                            }
                                        />
                                        <FormControlLabel
                                            label="ATAC"
                                            control={
                                                <Checkbox
                                                    onChange={(event) => handleCheckBoxChange(event, "assayFilters")}
                                                    disabled={!availableScores.assayFilters.atac || !checkedScores.headerFilters.cCREs}
                                                    checked={checkedScores.assayFilters.atac}
                                                    value="atac"
                                                />
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion square disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Gene
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack>
                                <Typography lineHeight={"40px"}>Linked Genes</Typography>
                                <FormGroup>
                                    <FormControlLabel label="Intact Hi-C Loops" control={<Checkbox onChange={handleCheckBoxChange} disabled={!!selectedBiosample || !availableScores["Intact-HiC"]} checked={checkedScores["Intact-HiC"]} value="Intact-HiC"></Checkbox>}></FormControlLabel>
                                    <FormControlLabel label="CTCF ChIA-PET Interaction" control={<Checkbox onChange={handleCheckBoxChange} disabled={!!selectedBiosample || !availableScores["CTCF-ChIAPET"]} checked={checkedScores["CTCF-ChIAPET"]} value="CTCF-ChIAPET"></Checkbox>}></FormControlLabel>
                                    <FormControlLabel label="RNAPII ChIA-PET Interaction" control={<Checkbox onChange={handleCheckBoxChange} disabled={!!selectedBiosample || !availableScores["RNAPII-ChIAPET"]} checked={checkedScores["RNAPII-ChIAPET"]} value="RNAPII-ChIAPET"></Checkbox>}></FormControlLabel>
                                    <FormControlLabel label="CRISPRi-FlowFISH" control={<Checkbox onChange={handleCheckBoxChange} disabled={!!selectedBiosample || !availableScores["CRISPRi-FlowFISH"]} checked={checkedScores["CRISPRi-FlowFISH"]} value="CRISPRi-FlowFISH"></Checkbox>}></FormControlLabel>
                                    <FormControlLabel label="eQTLs" control={<Checkbox onChange={handleCheckBoxChange} disabled={!!selectedBiosample || !availableScores["eQTLs"]} checked={checkedScores["eQTLs"]} value="eQTLs"></Checkbox>}></FormControlLabel>
                                </FormGroup>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Drawer>
            <Box
                ml="25vw"
                padding={3}
                flexGrow={1}
            >
                <Typography variant="h4" mb={3}>
                    <b>A</b>ggregate <b>R</b>ank <b>G</b>enerat<b>o</b>r
                </Typography>

                {error_scores && (
                    <Alert variant="filled" severity="error">
                        {error_scores.message}
                    </Alert>
                )}
                {error_genes && (
                    <Alert variant="filled" severity="error">
                        {error_genes.message}
                    </Alert>
                )}
                {error_quantifications && (
                    <Alert variant="filled" severity="error">
                        {error_quantifications.message}
                    </Alert>
                )}
                <Box>
                    <Stack direction={props.header ? "row" : "column"} spacing={3} mt="10px">
                        <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
                            {!props.header && (
                                <Typography variant={"h5"} mr={1} alignSelf="center">
                                    Upload Through
                                </Typography>
                            )}
                            <Stack
                                direction={"row"}
                                alignItems={"center"}
                                flexWrap={props.header ? "nowrap" : "wrap"}
                            >
                                <FormControl
                                    variant="standard"
                                    size="medium"
                                    sx={{ '& .MuiInputBase-root': { fontSize: '1.5rem' } }}
                                >
                                    <Select
                                        fullWidth
                                        id="select-search"
                                        value={selectedSearch}
                                        onChange={handleSearchChange}
                                        SelectDisplayProps={{
                                            style: { paddingBottom: '0px', paddingTop: '1px' },
                                        }}
                                    >
                                        <MenuItem value={"BED File"}>BED File</MenuItem>
                                        <MenuItem value={"Text Box"}>Text Box</MenuItem>
                                    </Select>
                                </FormControl>
                                <Typography variant={props.header ? "body1" : "h5"} ml={1} mr={1} alignSelf="center">
                                    in
                                </Typography>
                                <FormControl
                                    variant="standard"
                                    size="medium"
                                    sx={{ '& .MuiInputBase-root': { fontSize: '1.5rem' } }}
                                >
                                    <Select
                                        fullWidth
                                        id="select-search"
                                        value={assembly}
                                        onChange={handleAssemblyChange}
                                        SelectDisplayProps={{
                                            style: { paddingBottom: '0px', paddingTop: '1px' },
                                        }}
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
                                assembly={assembly}
                                appletCallback={appletCallBack}
                            />
                        ) :
                            <FormControl fullWidth>
                                <form action={handleTextUpload}>
                                    <TextField name="textUploadFile" multiline fullWidth rows={5}
                                        placeholder="Copy and paste your data from Excel here"
                                    ></TextField>
                                    <Button type="submit" size="medium" variant="outlined">Submit</Button>
                                </form>
                            </FormControl>

                        }
                    </Box>
                </Box>
                {rows.length > 0 &&
                    <Box mt="20px">
                        {(loading_scores || loading_genes || loading_quantifications) ? <CircularProgress /> :
                            <DataTable
                                key={key}
                                columns={[{ header: "Accession", value: (row) => row.accession },
                                { header: "User ID", value: (row) => row.user_id },
                                { header: "Aggregate Rank", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) }]
                                    .concat(columns)}
                                rows={rows}
                                sortColumn={2}
                                sortDescending
                                itemsPerPage={10}
                                searchable
                                tableTitle="User Uploaded cCREs Ranked By Scores"
                            >
                            </DataTable>
                        }
                    </Box>
                }
            </Box>
        </Box>
    )
}