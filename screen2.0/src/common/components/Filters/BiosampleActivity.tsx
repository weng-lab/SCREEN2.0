import {
    AccordionSummary,
    Typography,
    AccordionDetails,
    TextField,
    Accordion,
    Tooltip,
    FormGroup,
    FormControlLabel,
    Checkbox
} from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"


/**
 * 
 * @param props byCellType, bycelltype.json from https://downloads.wenglab.org/bycelltype.json
 * @returns the Biosample Activity Filter
 */
const BiosampleActivity = (props: { byCellType: any }) => {
    // console.log(props.byCellType.byCellType.LNCAP_ENCDO000ACX[0])
    /**
     * Want: A sorted collection of elements grouped by "tissue" type.
     * Every element in each collection should have "value", "name" and "biosample type", and an "assay" array of assay types available
     * 
     * For each top-level element:
     * check element[0].tissue for tissue type
     * For each sub-item:
     * Add assay to assays array
     * Add name to summaryName
     * Add biosample_summary to verboseName
     * 
     * Each element:
     * assays: ["",""] - contains available assay types
     * summaryName: "" - contains element[0].name
     * verboseName: "" - contains element[0].biosample_summary
     * queryValue: "" - contains element[0].value
     * biosampleType: "" - contains element[0].biosample_type
     * 
     * Are all possible tissue types static?
     * 
     * I would like to parse a JSON with the structure as seen below into an object with the following structure:
     * 
     * {}
     * 
     */

    //How do I properly type this?
    /**
     * 
     * @param byCellType JSON of byCellType
     * @returns an object of sorted biosample types, grouped by tissue type
     */
    // function parseByCellType(byCellType: any) {
    //     const sortedBiosamples = {}
    //     // make big json into array consisting of entries of the form ["LNCAP_ENCDO000ACX", [{"assay": "CTCF", "cellTypeDesc": "LNCAP", ...}, {...}]] and iterate over each entry
    //     Object.entries(byCellType.byCellType).forEach(entry => {
    //         Object.defineProperty(sortedBiosamples, entry[0])
    //     })
    // }

    return (
        <Grid2 container spacing={2}>
            <Grid2 xs={6}>
                <Typography>
                    Tissue/Organ
                </Typography>
            </Grid2>
            <Grid2 xs={6}>
                <TextField size="small" label="Filter Tissues" />
            </Grid2>
            <Grid2 xs={12}>
                <Accordion>
                    <AccordionSummary expandIcon={<KeyboardArrowRightIcon />}
                        sx={{
                            flexDirection: "row-reverse",
                            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                transform: 'rotate(90deg)',
                            }
                        }}>
                        <Typography>Tisue/Organ</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ display: 'flex' }}>
                        <Tooltip title="Full tissue name here" arrow placement="right">
                            <FormGroup>
                                <FormControlLabel onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => null} control={<Checkbox defaultChecked />} label="Sub Tissue" />
                            </FormGroup>
                        </Tooltip>
                    </AccordionDetails>
                </Accordion>
            </Grid2>
            <Grid2 xs={12}>
                <Typography>
                    Biosample Type
                </Typography>
                <FormGroup>
                    <FormControlLabel onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => null} control={<Checkbox defaultChecked />} label="Sub Tissue" />
                </FormGroup>
            </Grid2>
        </Grid2>
    )
}

export default BiosampleActivity