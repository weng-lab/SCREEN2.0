"use client"
import { DataTable, DataTableProps, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import React, { useState, useMemo } from "react"
import { Box, Typography, Stack, Button, Accordion, AccordionSummary, AccordionDetails, Tooltip, CircularProgress, List } from "@mui/material"
import { MainResultTableRow, ConservationData } from "./types"
import { LazyQueryResultTuple } from "@apollo/client"
import ConfigureGBModal from "./_ccredetails/configuregbmodal"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LinkedGeneInfo } from "./_ccredetails/ccredetails"
import { InfoOutlined } from "@mui/icons-material"
import { CreateLink } from "../../common/lib/utility"
import { LinkedGenes, LinkedGenesVariables } from "./page"
import GeneLink from "../_utility/GeneLink"


interface MainResultsTableProps extends Partial<DataTableProps<any>> {
  assembly: "GRCh38" | "mm10"
  useLinkedGenes: LazyQueryResultTuple<LinkedGenes, LinkedGenesVariables> //Is this a proper usage of a custom hook?
}

export function MainResultsTable(props: MainResultsTableProps) {

  const [getLinkedGenes, { loading: loadingLinkedGenes, data: dataLinkedGenes, error: errorLinkedGenes }] = props.useLinkedGenes

  const columns = useMemo(() => {
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
      render: (row) =>(
        <Box onClick={(event) => event.stopPropagation()}>
          <GeneLink geneName={row.nearestGenes[0].gene} assembly={props.assembly} typographyProps={{display: 'inline'}} />
          {' -'} {row.nearestGenes[0].distance.toLocaleString()}&nbsp;bp
        </Box>)
    })
    props.assembly === "GRCh38" && cols.push({
      header: "Linked Genes",
      HeaderRender: () => <strong><p>Linked&nbsp;Genes</p></strong>,
      value: (row) => [...new Set(row.linkedGenes?.map(x => x.gene))].length,
      render: (row) => {
        const extractUniqueGenes = (list: LinkedGeneInfo[]): { geneName: string, samples: LinkedGeneInfo[] }[] => {
          const genesToDisplay: { geneName: string, samples: LinkedGeneInfo[] }[] = []
          for (const biosample of list) {
            const entry = genesToDisplay.find(x => x.geneName === biosample.gene.split(' ')[0])
            if (entry) {
              entry.samples.push(biosample)
            } else {
              genesToDisplay.push({ geneName: biosample.gene.split(' ')[0], samples: [biosample] })
            }
          }
          return genesToDisplay
        }

        const IntactHiC = row.linkedGenes ? extractUniqueGenes(row.linkedGenes.filter(gene => gene.assay === "Intact-HiC")) : []
        const ChIAPET = row.linkedGenes ? extractUniqueGenes(row.linkedGenes.filter(gene => gene.assay === "CTCF-ChIAPET" || gene.assay === "RNAPII-ChIAPET")) : []
        const CRISPR = row.linkedGenes ? extractUniqueGenes(row.linkedGenes.filter(gene => gene.method === "CRISPR")) : []
        const eQTLs = row.linkedGenes ? extractUniqueGenes(row.linkedGenes.filter(gene => gene.method === "eQTLs")) : []

        const getNumtissues = (samples: LinkedGeneInfo[]) => {
          return [...new Set(samples.map(x => x.tissue))].length
        }

        const eQTLssamplesByTissues = (samples: LinkedGeneInfo[]): ({ tissue: string, variants: LinkedGeneInfo[] }[]) => {
          const samplesByTissue: { [key: string]: LinkedGeneInfo[] } = {};

          samples.forEach(sample => {
            if (!samplesByTissue[sample.tissue]) {
              samplesByTissue[sample.tissue] = [];
            }
            samplesByTissue[sample.tissue].push(sample);
          });

          return Object.keys(samplesByTissue).map(tissue => ({
            tissue,
            variants: samplesByTissue[tissue]
          }));
        }

        const LinkedGeneList: React.FC<{ genes: { geneName: string, samples: LinkedGeneInfo[] }[], type: "Intact-HiC" | "ChIAPET" | "CRISPR" | "eQTLs", assembly: "GRCh38" | "mm10" }> = (props) => {
          return (
            <Stack spacing={1}>
              {props.genes.map((gene, i) =>
                props.type === "eQTLs" ?
                  //eQTL Linked Gene
                  <Box key={i}>
                    <Typography display="inline" variant="inherit" mr={0.5}>
                      <GeneLink assembly={props.assembly} geneName={gene.geneName} typographyProps={{display: 'inline'}} /> 
                      {' '}({getNumtissues(gene.samples)} tissue{getNumtissues(gene.samples) > 1 && 's'}, {gene.samples.length} variant{gene.samples.length > 1 && 's'})
                    </Typography>
                    <Tooltip
                      sx={{ display: "inline" }}
                      title={
                        <div>
                          <Typography variant="body2">
                            <i>{gene.geneName}</i>
                          </Typography>
                          <Typography variant="body2">
                            Gene Type: {gene.samples[0].genetype === 'lncRNA' ? gene.samples[0].genetype : gene.samples[0].genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Typography>
                          <Typography variant="body2">
                            cCRE overlaps {gene.samples.length} eQTL{gene.samples.length > 1 && 's'} in {getNumtissues(gene.samples)} tissue{getNumtissues(gene.samples) > 1 && 's'}:
                          </Typography>
                          <List sx={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {eQTLssamplesByTissues(gene.samples).map((x) =>
                              <Typography component={'li'} variant="body2" key={x.tissue}>
                                {x.tissue}
                                {x.variants.map(variant => <Typography variant="body2" key={variant.variantid}>{variant.variantid}</Typography>)}
                              </Typography>
                            )}
                          </List>
                        </div>
                      }
                    >
                      <InfoOutlined fontSize="small" />
                    </Tooltip>
                  </Box>
                  :
                  //All other
                  <Box key={i}>
                    <Typography display="inline" variant="inherit" mr={0.5}>
                      <GeneLink assembly={props.assembly} geneName={gene.geneName} typographyProps={{display: 'inline'}} />
                      {' '}({gene.samples.length} biosample{gene.samples.length > 1 && 's'})
                    </Typography>
                    <Tooltip
                      sx={{ display: 'inline' }}
                      title={
                        <div>
                          <Typography variant="body2"><i>{gene.geneName}</i></Typography>
                          <Typography variant="body2">Gene Type: {gene.samples[0].genetype === 'lncRNA' ? gene.samples[0].genetype : gene.samples[0].genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>
                          <Typography variant="body2">Linked in {gene.samples.length} biosample{gene.samples.length > 1 && 's'}:</Typography>
                          <List sx={{ listStyleType: 'disc', listStylePosition: 'inside' }}>
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
                                : {x.displayname + ((x.assay === "RNAPII-ChIAPET" || x.assay === "CTCF-ChIAPET") ? ` (${x.assay})` : '')}
                              </Typography>
                            )}
                          </List>
                        </div>
                      }
                    >
                      <InfoOutlined fontSize="small" />
                    </Tooltip>
                  </Box>
              )}
            </Stack>
          )
        }

        return (
          //If linked genes data hasn't been fetched, fetch
          (<Box onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { event.stopPropagation(); !row.linkedGenes && getLinkedGenes() }} key={row.accession}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                {row.linkedGenes ? "Linked Genes (" + [...new Set(row.linkedGenes.map(x => x.gene))].length + " unique)" : 'Find Linked Genes'}
              </AccordionSummary>
              {!row.linkedGenes ?
                <AccordionDetails>
                  <CircularProgress />
                </AccordionDetails>
                :
                <AccordionDetails>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      Intact Hi-C Loops ({IntactHiC.length})
                    </AccordionSummary>
                    <AccordionDetails>
                      {IntactHiC.length > 0 ?
                        <LinkedGeneList genes={IntactHiC} type="Intact-HiC" assembly={props.assembly} />
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
                        <LinkedGeneList genes={ChIAPET} type="ChIAPET" assembly={props.assembly} />
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
                        <LinkedGeneList genes={CRISPR} type="CRISPR" assembly={props.assembly} />
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
                        <LinkedGeneList genes={eQTLs} type="eQTLs" assembly={props.assembly} />
                        :
                        "This cCRE does not overlap a variant associated with significant changes in gene expression"
                      }
                    </AccordionDetails>
                  </Accordion>
                </AccordionDetails>
              }
            </Accordion>
          </Box>)
        );
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
          (<Box onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { event.stopPropagation() }}>
            <Button variant="outlined" onClick={() => setOpen(true)}>
              UCSC
            </Button>
            <ConfigureGBModal
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
          </Box>)
        );
      }
    })
    props.assembly === "GRCh38" && cols.push({
      header: "Conservation",
      value: (row: { conservationData: ConservationData }) => `Primates:\u00A0${row.conservationData.primates?.toFixed(2) ?? "unavailable"} Mammals:\u00A0${row.conservationData.mammals?.toFixed(2) ?? "unavailable"} Vertebrates:\u00A0${row.conservationData.vertebrates?.toFixed(2) ?? "unavailable"}`,
      HeaderRender: () => <strong><p>Conservation</p></strong>
    })
    return cols
  }, [props.assembly, props.rows, getLinkedGenes])

  return (
    <DataTable
      key={props.rows[0] && props.rows[0].dnase + props.rows[0].ctcf + props.rows[0].h3k27ac + props.rows[0].h3k4me3 + props.rows[0].atac + columns.toString()}
      rows={props.rows}
      columns={columns}
      itemsPerPage={props.itemsPerPage}
      searchable
      onRowClick={props.onRowClick}
      tableTitle={props.tableTitle}
      sortColumn={5}
      showMoreColumns={props.assembly === "GRCh38"}
      noOfDefaultColumns={props.assembly === "GRCh38" ? columns.length - 1 : columns.length}
      titleHoverInfo={props.titleHoverInfo}
    />
  )
}
