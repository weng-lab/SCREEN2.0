import React from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  FormGroup,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"

import { ThemeProvider } from "@mui/material/styles"
import { CheckBox, ExpandMore } from "@mui/icons-material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

// remove or add list of checked items
const toggleList = (checkList: string[], option: string) => {
  if (checkList === undefined || checkList.length === 0) return [option]
  if (checkList.includes(option)) {
    const index = checkList.indexOf(option, 0)
    if (index > -1) {
      checkList.splice(index, 1)
    }
  } else {
    checkList.push(option)
  }
  let toggleList: string[] = []
  Object.values(checkList).map((x: string) => toggleList.push(x))

  return toggleList
}

export const OptionsBiosampleTypes = (props: { biosamples: string[]; setBiosamples: React.Dispatch<React.SetStateAction<string[]>> }) => {
  let labels: string[] = ["cell line", "in vitro differentiated cells", "primary cell", "tissue"]
  return (
    <Accordion disableGutters={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Biosample Types</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {Object.values(labels).map((biosample: string) => (
            <FormControlLabel
              key={biosample}
              label={biosample}
              control={
                <Checkbox
                  checked={props.biosamples.includes(biosample)}
                  onClick={() => props.setBiosamples(toggleList(props.biosamples, biosample))}
                />
              }
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

export const OptionsCellularComponents = (props: {
  cell_components: string[]
  setCellComponents: React.Dispatch<React.SetStateAction<string[]>>
}) => {
  let labels: string[] = ["cell", "chromatin", "cytosol", "membrane", "nucleoplus", "nucleoplasm", "nucleus"]
  return (
    <Accordion disableGutters={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Cellular Compartments</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {Object.values(labels).map((comp: string) => (
            <FormControlLabel
              key={comp}
              label={comp}
              control={
                <Checkbox
                  checked={props.cell_components.includes(comp)}
                  onClick={() => props.setCellComponents(toggleList(props.cell_components, comp))}
                />
              }
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}

export const OptionsGroupBy = (props: { group: string; setGroup: React.Dispatch<React.SetStateAction<string>> }) => {
  return (
    <Accordion disableGutters={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Group By</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ToggleButtonGroup
          color="primary"
          value={props.group}
          exclusive
          onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
            if (value !== props.group) props.setGroup(value)
          }}
          aria-label="Platform"
        >
          <ToggleButton value="byExpressionFPKM">Experiment</ToggleButton>
          <ToggleButton value="byTissueFPKM">Tissue</ToggleButton>
          <ToggleButton value="byTissueMaxFPKM">Tissue Max</ToggleButton>
        </ToggleButtonGroup>
      </AccordionDetails>
    </Accordion>
  )
}

export const OptionsRNAType = (props: { RNAtype: string; setRNAType: React.Dispatch<React.SetStateAction<string>> }) => {
  return (
    <Accordion disableGutters={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>RNA Type</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ToggleButtonGroup
          color="primary"
          value={props.RNAtype}
          exclusive
          onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
            if (value !== props.RNAtype) props.setRNAType(value)
          }}
          aria-label="Platform"
        >
          <ToggleButton value="total RNA-seq">Total RNA-seq</ToggleButton>
          <ToggleButton value="polyA RNA-seq">PolyA RNA-seq</ToggleButton>
          <ToggleButton value="all">Any</ToggleButton>
        </ToggleButtonGroup>
      </AccordionDetails>
    </Accordion>
  )
}

export const OptionsScale = (props: { scale: string; setScale: React.Dispatch<React.SetStateAction<string>> }) => {
  return (
    <Accordion disableGutters={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Scale</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ToggleButtonGroup
          color="primary"
          value={props.scale}
          exclusive
          onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
            if (value !== props.scale) props.setScale(value)
          }}
          aria-label="Platform"
        >
          <ToggleButton value="rawFPKM">Linear</ToggleButton>
          <ToggleButton value="logFPKM">Log2</ToggleButton>
        </ToggleButtonGroup>
      </AccordionDetails>
    </Accordion>
  )
}

export const OptionsReplicates = (props: { replicates: string; setReplicates: React.Dispatch<React.SetStateAction<string>> }) => {
  return (
    <Accordion disableGutters={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Replicates</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ToggleButtonGroup
          color="primary"
          value={props.replicates}
          exclusive
          onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
            if (value !== props.replicates) props.setReplicates(value)
          }}
          aria-label="Platform"
        >
          <ToggleButton value="mean">Average</ToggleButton>
          <ToggleButton value="single">Individual</ToggleButton>
        </ToggleButtonGroup>
      </AccordionDetails>
    </Accordion>
  )
}
