"use client"
import React, { useMemo, useState } from "react"
import { LoadingMessage } from "../../../common/lib/utility"
import { PlotGeneExpression } from "../../applets/gene-expression/geneexpressionplot"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { Button, Typography, Stack, MenuItem, FormControl, SelectChangeEvent, Checkbox, InputLabel, ListItemText, OutlinedInput, Select, ToggleButton, ToggleButtonGroup, FormLabel, Box } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Image from "next/image"
import { HUMAN_GENE_EXP, MOUSE_GENE_EXP } from "../../applets/gene-expression/const"
import { GENE_EXP_QUERY, GENE_QUERY, GET_ORTHOLOG, GET_ORTHOLOG_DATA, GET_ORTHOLOG_VARS } from "../../applets/gene-expression/queries"
import GenomeSwitch from "./genomeswitch"
import { ReadonlyURLSearchParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import ConfigureGBModal from "./configuregbmodal"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../../common/lib/queries"
import { GeneAutoComplete2, GeneInfo } from "../_filterspanel/geneautocomplete2"
import { SyncAlt } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"

/**
 * @todo
 * Download
 * Tooltip with correct info
 * 
 */

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 8.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
};

const biosampleTypes = ["cell line", "in vitro differentiated cells", "primary cell", "tissue"];

type Assembly = "GRCh38" | "mm10"

export function GeneExpression(props: {
  assembly: Assembly
  genes?: { name: string, linkedBy?: string[] }[]
  applet?: boolean
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
}) {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const urlAssembly = searchParams.get("assembly")
  const urlGene = searchParams.get("gene")
  const router = useRouter()
  const pathname = usePathname()

  //If genes passed as prop, use those. This is case in cCRE Details. Else use url gene if passed, default to APOE
  const [gene, setGene] = useState<string>(props.genes ? props?.genes[0]?.name : (urlGene ?? "APOE"))
  const [dataAssembly, setDataAssembly] = useState<Assembly>(((urlAssembly === "GRCh38") || (urlAssembly === "mm10")) ? urlAssembly : props.assembly)
  const [searchAssembly, setSearchAssembly] = useState<Assembly>(((urlAssembly === "GRCh38") || (urlAssembly === "mm10")) ? urlAssembly : props.assembly)

  const [biosamples, setBiosamples] = useState<string[]>(["cell line", "in vitro differentiated cells", "primary cell", "tissue"])
  const [group, setGroup] = useState<"byTissueMaxTPM" | "byExperimentTPM" | "byTissueTPM">("byExperimentTPM")
  const [RNAtype, setRNAType] = useState<"all" | "polyA plus RNA-seq" | "total RNA-seq">("total RNA-seq")
  const [scale, setScale] = useState<"linearTPM" | "logTPM">("linearTPM")
  const [replicates, setReplicates] = useState<"mean" | "all">("mean")
  const [configGBopen, setConfigGBOpen] = useState(false);

  const handleOpenConfigGB = () => {
    // (assembly === "GRCh38" ? dataHumanGene?.gene[0] : dataMouseGene?.gene[0]) && setConfigGBOpen(true)
    //Why was the first return data being checked before allowing it to be opened? I get checking to see if the gene state var is set...
    gene && setConfigGBOpen(true)
  }

  //Fetch Gene info to get ID
  //This query seems like it shouldn't be necessary, but ID needed in second query
  //and component isn't setup to take in ID as prop so leaving as-is. -Jonathan 7/25/24
  //Gene autocomplete exposes ID, which makes this avoidable aside from initial load.
  const {
    data: dataGeneID,
    loading: loadingGeneID
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: dataAssembly.toLowerCase(),
      name: [gene],
      version: dataAssembly === "GRCh38" ? 40 : 25
    },
    skip: !gene,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  //Fetch Gene Exp data
  const {
    data: dataExperiments,
    loading: loadingExperiments
  } = useQuery(GENE_EXP_QUERY, {
    variables: {
      assembly: dataAssembly,
      gene_id: dataGeneID && dataGeneID.gene.length > 0 && dataGeneID.gene[0].id.split(".")[0],
      accessions: dataAssembly === "GRCh38" ? HUMAN_GENE_EXP : MOUSE_GENE_EXP
    },
    skip: !gene || !dataGeneID || (dataGeneID && dataGeneID.gene.length === 0),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  const { data: dataOrtholog, loading: loadingOrtholog, error: errorOrtholog } = useQuery<GET_ORTHOLOG_DATA, GET_ORTHOLOG_VARS>(GET_ORTHOLOG, {
    variables: {
      name: [gene],
      assembly: dataAssembly.toLowerCase() as "mm10" | "grch38"
    },
    skip: !gene
  })

  //Generate gene expression data for chart
  //Filter it based on biosample types and RNA types selections
  const plotGeneExpData = useMemo(() => {
    if (dataExperiments && dataExperiments.gene_dataset.length > 0) {
      return RNAtype === "all" ?
        dataExperiments.gene_dataset
          .filter(d => biosamples.includes(d.biosample_type))
        :
        dataExperiments.gene_dataset
          .filter(d => biosamples.includes(d.biosample_type))
          .filter(r => r.assay_term_name === RNAtype)
    } else return []
  }, [RNAtype, biosamples, dataExperiments])

  //Handle assembly switch for search
  const handleSetDataAssembly = (newAssembly: Assembly) => {
    if (props.applet) {
      setDataAssembly(newAssembly)
      //Switch back RNA type if going from mouse to human, as all data there is total
      if (dataAssembly === "GRCh38") {
        setRNAType("total RNA-seq")
      }
    }
  }

  const handleGroupChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: string | null,
  ) => {
    if ((newView !== null) && ((newView === "byTissueMaxTPM") || (newView === "byExperimentTPM") || (newView === "byTissueTPM"))) {
      setGroup(newView)
    }
  };

  const handleRNATypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newRNA: string | null,
  ) => {
    if ((newRNA !== null) && ((newRNA === "all") || (newRNA === "polyA plus RNA-seq") || (newRNA === "total RNA-seq"))) {
      setRNAType(newRNA)
    }
  };

  const handleScaleChange = (
    event: React.MouseEvent<HTMLElement>,
    newScale: string | null,
  ) => {
    if ((newScale !== null) && ((newScale === "linearTPM") || (newScale === "logTPM"))) {
      setScale(newScale)
    }
  };

  const handleReplicatesChange = (
    event: React.MouseEvent<HTMLElement>,
    newReplicates: string | null,
  ) => {
    if ((newReplicates !== null) && ((newReplicates === "mean") || (newReplicates === "all"))) {
      setReplicates(newReplicates)
    }
  };

  const handleBiosampleChange = (event: SelectChangeEvent<typeof biosampleTypes>) => {
    const {
      target: { value },
    } = event;
    setBiosamples(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent={"space-between"}>
        <Typography
          alignSelf={"flex-end"}
          variant={props.applet ? "h4" : "h5"}>
          Gene Expression Profiles by RNA-seq
        </Typography>
        <Stack direction="row" spacing={3}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
            onClick={handleOpenConfigGB}
          >
            <Image style={{ objectFit: "contain" }} src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" fill alt="ucsc-button" />
          </Button>
          <Button
            variant="contained"
            href={gene ? "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + gene : undefined}
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
          >
            <Image style={{ objectFit: "contain" }} src="https://geneanalytics.genecards.org/media/81632/gc.png" fill alt="gene-card-button" />
          </Button>
        </Stack>
      </Stack>
      {props.applet ?
        <Stack direction="row" gap={2} flexWrap={"wrap"}>
          <Select
            value={searchAssembly}
            variant="outlined"
            onChange={(event) => setSearchAssembly(event.target.value as "GRCh38" | "mm10")}
          >
            <MenuItem value={"GRCh38"}>GRCh38</MenuItem>
            <MenuItem value={"mm10"}>mm10</MenuItem>
          </Select>
          <GeneAutoComplete2
            assembly={searchAssembly}
            autocompleteProps={{
              fullWidth: true,
              size: "medium",
              sx: { minWidth: '200px' },
              defaultValue: {
                name: gene, //only gene needed to set default
                id: "",
                coordinates: {
                  chromosome: "",
                  start: 0,
                  end: 0
                }
              }
            }}
            endIcon="none"
            colorTheme={"light"}
            onGeneSelected={(gene: GeneInfo) => {
              setGene(gene ? gene.name : null)
              setDataAssembly(searchAssembly)
              router.push(`${pathname}?assembly=${searchAssembly}&gene=${gene ? gene.name : ''}`)
            }}
            onGeneSubmitted={(gene: GeneInfo) => {
              setGene(gene ? gene.name : null)
              setDataAssembly(searchAssembly)
              router.push(`${pathname}?assembly=${searchAssembly}&gene=${gene ? gene.name : ''}`)
            }}
          />
          <LoadingButton
            sx={{ textTransform: 'none' }}
            loading={loadingOrtholog}
            disabled={!dataOrtholog || !!errorOrtholog || dataOrtholog?.geneOrthologQuery?.length === 0}
            variant="outlined"
            endIcon={<SyncAlt />}
            onClick={() => {
              const newGene = dataOrtholog.geneOrthologQuery[0][dataAssembly === "GRCh38" ? 'mouseGene' : 'humanGene']
              const newAssembly = dataAssembly === "GRCh38" ? "mm10" : "GRCh38"
              setGene(newGene)
              setDataAssembly(newAssembly)
              router.push(`${pathname}?assembly=${newAssembly}&gene=${newGene}`)
            }}
          >
            {dataOrtholog?.geneOrthologQuery.length > 0 ?
              <>
              {`Go to ${dataAssembly === "GRCh38" ? "mm10" : "GRCh38"} ortholog:`}&thinsp;<i>{dataOrtholog?.geneOrthologQuery[0][dataAssembly === "GRCh38" ? 'mouseGene' : 'humanGene']}</i>
              </>
              :
              `No ortholog found in ${dataAssembly === "GRCh38" ? "mm10" : "GRCh38"}`
            }
          </LoadingButton>
        </Stack>
        :
        <Grid2>
          <InputLabel>Gene</InputLabel>
          <Select
            value={gene}
            size="small"
            MenuProps={{ sx: { maxHeight: '600px' } }}
          >
            {props.genes.map((gene) => {
              return (
                <MenuItem
                  key={gene.name}
                  sx={{ display: "block" }}
                  value={gene.name}
                  onClick={() => setGene(gene.name)}
                >
                  <Typography><i>{gene.name}</i></Typography>
                  {gene?.linkedBy && <Typography variant="body2" color={"text.secondary"}>Linked By: {gene.linkedBy.join(', ')}</Typography>}
                </MenuItem>
              )
            })}
          </Select>
        </Grid2>
      }
      <Stack direction="row" gap={2} flexWrap={"wrap"}>
        <FormControl sx={{ width: 300 }}>
          <FormLabel>Biosample Types</FormLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            size="small"
            value={biosamples}
            onChange={handleBiosampleChange}
            input={<OutlinedInput size="medium" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {biosampleTypes.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={biosamples.indexOf(name) > -1} />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* RNA Type, hide for human as all data is total RNA-seq */}
        {dataAssembly === "mm10" && <FormControl>
          <FormLabel>RNA Type</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={RNAtype}
            exclusive
            onChange={handleRNATypeChange}
            aria-label="RNA Type"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="total RNA-seq">Total RNA-seq</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="polyA plus RNA-seq">PolyA plus RNA-seq</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>}
        <FormControl>
          <FormLabel>Scale</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={scale}
            exclusive
            onChange={handleScaleChange}
            aria-label="Scale"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="linearTPM">Linear TPM</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="logTPM">Log<sub>10</sub>(TPM + 1)</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>View By</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={group}
            exclusive
            onChange={handleGroupChange}
            aria-label="View By"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="byExperimentTPM">Experiment</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="byTissueTPM">Tissue</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="byTissueMaxTPM">Tissue Max</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Replicates</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={replicates}
            exclusive
            onChange={handleReplicatesChange}
            aria-label="Scale"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="mean">Average Replicates</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="all">Individual Replicates</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel></FormLabel>

        </FormControl>
      </Stack>
      {
        loadingGeneID || loadingExperiments ?
          <Grid2 xs={12} md={12} lg={12}>
            <LoadingMessage />
          </Grid2>
          :
          dataExperiments ?
            <Grid2 xs={12}>
              <Box maxWidth={{ xl: '75%', xs: '100%' }}>
                <Typography variant="h5" mb={1}>Gene Expression of <i>{gene}</i> in {dataAssembly}:</Typography>
                <PlotGeneExpression
                  data={plotGeneExpData}
                  range={{
                    x: { start: 0, end: 4 },
                    y: { start: 0, end: 0 },
                  }}
                  dimensions={{
                    x: { start: 0, end: 650 },
                    y: { start: 250, end: 0 },
                  }}
                  group={group}
                  scale={scale}
                  replicates={replicates}
                />
              </Box>
            </Grid2>
            :
            <Typography variant="h5">
              Please Select a Gene
            </Typography>
      }
      {/* Configure Trackhub */}
      <ConfigureGBModal
        biosampleData={props.biosampleData}
        coordinates={{
          assembly: props.assembly,
          chromosome: dataGeneID?.gene[0]?.coordinates.chromosome,
          start: dataGeneID?.gene[0]?.coordinates.start,
          end: dataGeneID?.gene[0]?.coordinates.end,
        }}
        accession={gene} //This is hacky, need to change configGBModal to change this prop -Jonathan 7/25/24
        open={configGBopen}
        setOpen={setConfigGBOpen}
      />
    </Stack>
  )
}
