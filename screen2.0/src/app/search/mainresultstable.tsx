"use client"
import { DataTable, DataTableProps, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import React, { useState, Dispatch, SetStateAction, useMemo, useCallback } from "react"
import { Box, Typography, Stack, Button, Accordion, AccordionSummary, AccordionDetails, Tooltip } from "@mui/material"
import { MainResultTableRow, ConservationData } from "./types"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../common/lib/queries"
import ConfigureGBModal from "./_ccredetails/configuregbmodal"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LinkedGeneInfo } from "./_ccredetails/ccredetails"
import { InfoOutlined } from "@mui/icons-material"
import { CreateLink, createLink } from "../../common/lib/utility"


interface MainResultsTableProps extends Partial<DataTableProps<any>> {
  assembly: "GRCh38" | "mm10"
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
}

export function MainResultsTable(props: MainResultsTableProps) {
  const [distance, setDistance] = useState<boolean>(true)
  const [CTCF_ChIAPET, setCTCF_ChIAPET] = useState<boolean>(false)
  const [RNAPII_ChIAPET, setRNAPII_ChIAPET] = useState<boolean>(false)

  const columns = useCallback((
    funcSetDistance: Dispatch<SetStateAction<boolean>>,
    funcSetCTCF_ChIAPET: Dispatch<SetStateAction<boolean>>,
    funcSetRNAPII_ChIAPET: Dispatch<SetStateAction<boolean>>
  ) => {
    let cols: DataTableColumn<MainResultTableRow>[] = [
      {
        header: "Accession",
        value: (row: { accession: string }) => row.accession,
        HeaderRender: () => <strong><p>Accession</p></strong>
      },
      {
        header: "Class",
        value: (row: { class: string }) => row.class === "PLS" ? "Promoter" : row.class === "pELS" ? "Proximal Enhancer" : row.class === "dELS" ? "Distal Enhancer" : row.class,
        HeaderRender: () => <strong><p>Class</p></strong>
      },
      {
        header: "Chr",
        value: (row: { chromosome: string }) => row.chromosome,
        HeaderRender: () => <strong><p>Chr</p></strong>
      },
      {
        header: "Start",
        value: (row: { start: number }) => row.start,
        render: (row: { start: number }) => row.start.toLocaleString("en-US"),
        HeaderRender: () => <strong><p>Start</p></strong>
      },
      {
        header: "End",
        value: (row: { end: number }) => row.end,
        render: (row: { end: number }) => row.end.toLocaleString("en-US"),
        HeaderRender: () => <strong><p>End</p></strong>
      }
    ]

    if (props.rows[0] && props.rows[0].dnase !== null) {
      cols.push({
        header: "DNase",
        value: (row) => (row.dnase && row.dnase.toFixed(2)) || 0,
        HeaderRender: () => <strong><p>DNase</p></strong>
      })
    }
    if (props.rows[0] && props.rows[0].atac !== null) {
      cols.push({
        header: "ATAC",
        value: (row) => (row.atac && row.atac.toFixed(2)) || 0,
        HeaderRender: () => <strong><p>ATAC</p></strong>
      })
    }
    if (props.rows[0] && props.rows[0].ctcf !== null) {
      cols.push({
        header: "CTCF",
        value: (row) => (row.ctcf && row.ctcf.toFixed(2)) || 0,
        HeaderRender: () => <strong><p>CTCF</p></strong>
      })
    }
    if (props.rows[0] && props.rows[0].h3k27ac != null) {
      cols.push({
        header: "H3K27ac",
        value: (row) => (row.h3k27ac && row.h3k27ac.toFixed(2)) || 0,
        HeaderRender: () => <strong><p>H3K27ac</p></strong>
      })
    }
    if (props.rows[0] && props.rows[0].h3k4me3 != null) {
      cols.push({
        header: "H3K4me3",
        value: (row) => (row.h3k4me3 && row.h3k4me3.toFixed(2)) || 0,
        HeaderRender: () => <strong><p>H3K4me3</p></strong>
      })
    }
    cols.push({
      header: "Nearest Gene",
      tooltip: "Defined by distance to nearest TSS",
      HeaderRender: () => <strong><p>Nearest&nbsp;Gene</p></strong>,
      value: (row) => row.nearestGenes[0].distance,
      render: (row) => <Typography variant="body2"><i>{row.nearestGenes[0].gene}</i> - {row.nearestGenes[0].distance}bp</Typography>
    })
    cols.push({
      header: "Linked Genes",
      HeaderRender: () => <strong><p>Linked&nbsp;Genes</p></strong>,
      value: (row) => 0,
      unsortable: true,
      render: (row) => {
        const extractUniqueGenes = (list: LinkedGeneInfo[]): {name: string, samples: LinkedGeneInfo[]}[] => {
          const genesToDisplay : {name: string, samples: LinkedGeneInfo[]}[] = []
          for (const biosample of list) {
            const entry = genesToDisplay.find(x => x.name === biosample.gene.split(' ')[0])
            if (entry) {
              entry.samples.push(biosample)
            } else {
              genesToDisplay.push({name: biosample.gene.split(' ')[0], samples: [biosample]})
            }
          }
          return genesToDisplay
        }

        const IntactHiC = extractUniqueGenes(row.linkedGenes.filter(gene => gene.assay === "Intact-HiC"))
        const ChIAPET = extractUniqueGenes(row.linkedGenes.filter(gene => gene.assay === "CTCF-ChIAPET" || gene.assay === "RNAPII-ChIAPET"))
        const CRISPR = extractUniqueGenes(row.linkedGenes.filter(gene => gene.method === "CRISPR"))
        const eQTLs = extractUniqueGenes(row.linkedGenes.filter(gene => gene.method === "eQTLs"))

        const LinkedGeneList: React.FC<{ genes: { name: string, samples: LinkedGeneInfo[] }[], type: "Intact-HiC" | "ChIAPET" | "CRISPR" | "eQTLs"}> = (props) => {
          console.log(props.genes[0].samples)
          return (
            <Stack spacing={1}>
              {props.genes.map((gene, i) =>
                props.type === "eQTLs" ?
                  <Stack direction="row" key={i}>
                    <Typography variant="inherit"><i>{gene.name}</i> ({gene.samples.length} variant{gene.samples.length > 1 && 's'})</Typography>
                    <Tooltip
                      title={
                        <div>
                          <Typography variant="body2"><i>{gene.name}</i></Typography>
                          <Typography variant="body2">Gene Type: {gene.samples[0].genetype === 'lncRNA' ? gene.samples[0].genetype : gene.samples[0].genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>
                          <Typography variant="body2">cCRE overlaps {gene.samples.length} eQTL{gene.samples.length > 1 && 's'}:</Typography>
                          <ul style={{ listStylePosition: 'inside' }}>
                            {gene.samples.map((x) =>
                              <Typography component={'li'} variant="body2" key={x.displayname}>
                                {x.tissue} - {x.variantid}
                              </Typography>
                            )}
                          </ul>
                        </div>
                      }
                    >
                      <InfoOutlined fontSize="small" />
                    </Tooltip>
                  </Stack>
                  :
                  <Stack direction="row" key={i}>
                    <Typography variant="inherit"><i>{gene.name}</i> ({gene.samples.length} biosample{gene.samples.length > 1 && 's'})</Typography>
                    <Tooltip
                      title={
                        <div>
                          <Typography variant="body2"><i>{gene.name}</i></Typography>
                          <Typography variant="body2">Gene Type: {gene.samples[0].genetype === 'lncRNA' ? gene.samples[0].genetype : gene.samples[0].genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>
                          <Typography variant="body2">Linked in {gene.samples.length} biosample{gene.samples.length > 1 && 's'}:</Typography>
                          <ul style={{ listStylePosition: 'inside' }}>
                            {gene.samples.map((x) =>
                              <Typography component={"li"} variant="body2" key={x.displayname}>
                                <CreateLink
                                  linkPrefix="https://www.encodeproject.org/experiments/"
                                  linkArg={x.experiment_accession}
                                  label={x.experiment_accession}
                                  showExternalIcon
                                  textColor="#FFFFFF"
                                  underline="always"
                                />
                                : {x.displayname}
                              </Typography>
                            )}
                          </ul>
                        </div>
                      }
                    >
                      <InfoOutlined fontSize="small" />
                    </Tooltip>
                  </Stack>
              )}
            </Stack>
          )
        }

        return (
          <Box onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { event.stopPropagation() }} key={row.accession}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                Linked Genes
              </AccordionSummary>
              <AccordionDetails>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    Intact Hi-C Loops ({IntactHiC.length})
                  </AccordionSummary>
                  <AccordionDetails>
                    {IntactHiC.length > 0 ?
                      <LinkedGeneList genes={IntactHiC} type="Intact-HiC" />
                      :
                      "No intact Hi-C loops overlap this cCRE and the promoter of a gene"
                    }
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    ChIA-PET Interactions ({ChIAPET.length})
                  </AccordionSummary>
                  <AccordionDetails>
                    {ChIAPET.length > 0 ?
                      <LinkedGeneList genes={ChIAPET} type="ChIAPET" />
                      :
                      "No ChIA-PET interactions overlap this cCRE and the promoter of a gene"
                    }
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    CRISPRi-FlowFISH ({CRISPR.length})
                  </AccordionSummary>
                  <AccordionDetails>
                    {CRISPR.length > 0 ?
                      <LinkedGeneList genes={CRISPR} type="CRISPR" />
                      :
                      "This cCRE was not targeted in a CRISPRi-FlowFISH experiment"
                    }
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    eQTLs ({eQTLs.length})
                  </AccordionSummary>
                  <AccordionDetails>
                    {eQTLs.length > 0 ?
                      <LinkedGeneList genes={eQTLs} type="eQTLs" />
                      :
                      "This cCRE does not overlap a variant associated with significant changes in gene expression"
                    }
                  </AccordionDetails>
                </Accordion>
              </AccordionDetails>
            </Accordion>
          </Box>

        )
      }
    })
    cols.push({
      header: "Configure UCSC",
      value: () => "",
      unsearchable: true,
      unsortable: true,
      HeaderRender: () => <strong><p>Track&nbsp;Hub</p></strong>,
      FunctionalRender: (row: MainResultTableRow) => {
        const [open, setOpen] = useState(false);

        return (
          //Box's onClick prevents onRowClick from running when interacting with modal
          <Box onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { event.stopPropagation() }}>
            <Button variant="outlined" onClick={() => setOpen(true)}>
              UCSC
            </Button>
            <ConfigureGBModal
              biosampleData={props.biosampleData}
              coordinates={{
                assembly: props.assembly,
                chromosome: row.chromosome,
                start: row.start,
                end: row.end,
              }}
              accession={row.accession}
              open={open}
              setOpen={setOpen}
            />
          </Box>
        )
      }
    })
    props.assembly === "GRCh38" && cols.push({
      header: "Conservation",
      value: (row: { conservationData: ConservationData }) => `Primates:\u00A0${row.conservationData.primates?.toFixed(2) ?? "unavailable"} Mammals:\u00A0${row.conservationData.mammals?.toFixed(2) ?? "unavailable"} Vertebrates:\u00A0${row.conservationData.vertebrates?.toFixed(2) ?? "unavailable"}`,
      HeaderRender: () => <strong><p>Conservation</p></strong>
    })
    return cols
  }, [CTCF_ChIAPET, RNAPII_ChIAPET, distance, props.assembly, props.biosampleData, props.rows])

  const cols = useMemo(() => {
    return columns(setDistance, setCTCF_ChIAPET, setRNAPII_ChIAPET)
  }, [setDistance, setCTCF_ChIAPET, setRNAPII_ChIAPET, columns])

  return (
    <DataTable
      key={props.rows[0] && props.rows[0].dnase + props.rows[0].ctcf + props.rows[0].h3k27ac + props.rows[0].h3k4me3 + props.rows[0].atac + columns.toString() + distance + CTCF_ChIAPET + RNAPII_ChIAPET}
      rows={props.rows}
      columns={cols}
      itemsPerPage={props.itemsPerPage}
      searchable
      onRowClick={props.onRowClick}
      tableTitle={props.tableTitle}
      sortColumn={5}
      showMoreColumns={props.assembly === "GRCh38"}
      noOfDefaultColumns={props.assembly === "GRCh38" ? cols.length - 1 : cols.length}
      titleHoverInfo={props.titleHoverInfo}
    />
  )
}
