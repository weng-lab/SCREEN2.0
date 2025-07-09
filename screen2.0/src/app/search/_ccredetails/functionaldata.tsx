"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { FUNCTIONAL_DATA_QUERY, CCRE_RDHS_QUERY, MPRA_FUNCTIONAL_DATA_QUERY, CAPRA_SOLO_FUNCTIONAL_DATA_QUERY, CAPRA_DOUBLE_FUNCTIONAL_DATA_QUERY, CRISPR_FUNCTIONAL_DATA_QUERY } from "./queries"
import Grid from "@mui/material/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, ErrorMessage, CreateLink } from "../../../common/lib/utility"
import { Link } from "@mui/material"

type CAPRA_ExperimentInfo = {
  lab: string;
  cellType: string;
};

type CRISPR_ExperimentInfo = {
  lab: string;
  cellType: string;
  design: string;
};

// Define the map where experiment is the key
const capra_experimentMap: Record<string, CAPRA_ExperimentInfo> = {
  "ENCSR064KUD": { lab: "Kevin White, UChicago", cellType: "HCT116" },
  "ENCSR135NXN": { lab: "Kevin White, UChicago", cellType: "HepG2" },
  "ENCSR547SBZ": { lab: "Kevin White, UChicago", cellType: "MCF-7" },
  "ENCSR661FOW": { lab: "Tim Reddy, Duke", cellType: "K562" },
  "ENCSR858MPS": { lab: "Kevin White, UChicago", cellType: "K562" },
  "ENCSR895FDL": { lab: "Kevin White, UChicago",  cellType: "A549" },
  "ENCSR983SZZ": { lab: "Kevin White, UChicago", cellType: "SH-SY5Y" }
};

const crispr_experimentMap: Record<string, CRISPR_ExperimentInfo> = {
  "ENCSR179FSH": { design: "proliferation CRISPRi screen (dCas9-KRAB)", lab: "Tim Reddy, Duke", cellType: "OCI-AML2" },
  "ENCSR274OEB": { design: "proliferation CRISPRi screen (dCas9-KRAB)", lab: "Tim Reddy, Duke", cellType: "K562" },
  "ENCSR295VER": { design: "roliferation CRISPRi screen (dCas9-KRAB-WSR7EEE)", lab: "Will Greenleaf, Stanford", cellType: "K562" },
  "ENCSR369UFO": { design: "proliferation CRISPRi screen (dCas9-RYBP)", lab: "Will Greenleaf, Stanford", cellType: "K562" },
  "ENCSR372CKT": { design: "proliferation CRISPRi screen (dCas9-ZNF705-KRAB)", lab: "Will Greenleaf, Stanford", cellType: "K562" },
  "ENCSR381RDB": { design: "proliferation CRISPRi screen (dCas9-RYBP)", lab: "Will Greenleaf, Stanford",  cellType: "K562" },
  "ENCSR386FFV": { design: "proliferation CRISPRi screen (dCas9-KRAB-WSR7EEE)", lab: "Will Greenleaf, Stanford", cellType: "K562" },
  "ENCSR427OCU": { design: "proliferation CRISPRi screen (dCas9-KRAB-MGA1-MGA2)", lab: "Will Greenleaf, Stanford", cellType: "K562" },
  "ENCSR446RYW": { design: "proliferation CRISPRi screen (dCas9-KRAB)", lab: "Will Greenleaf, Stanford", cellType: "K562" },
  "ENCSR690DTG": { design: "proliferation CRISPRi screen (dCas9-KRAB)", lab: "Tim Reddy, Duke", cellType: "K562" },
  "ENCSR997ZOY": { design: "proliferation CRISPRi screen (dCas)", lab: "Will Greenleaf, Stanford", cellType: "K562" }
};

export const FunctionData = ({ coordinates , assembly, accession }) => {
  const { loading, error, data } = useQuery(FUNCTIONAL_DATA_QUERY, {
    variables: {
      assembly: assembly === "GRCh38" ? "grch38" : "mm10",
      coordinates,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const { loading: mpra_loading, error: mpra_error, data: mpra_data } = useQuery(MPRA_FUNCTIONAL_DATA_QUERY, {
    variables: {
      coordinates,
    },
    skip: assembly === "mm10",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const { loading: crispr_loading, error: crispr_error, data: crispr_data } = useQuery(CRISPR_FUNCTIONAL_DATA_QUERY, {
    variables: {
      accession: [accession],
    },
    skip: assembly === "mm10",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const { loading: capra_loading, error: capra_error, data: capra_data } = useQuery(CAPRA_SOLO_FUNCTIONAL_DATA_QUERY, {
    variables: {
      accession: [accession],
    },
    skip: assembly === "mm10",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  
  const { loading: capra_double_loading, error: capra_double_error, data: capra_double_data } = useQuery(CAPRA_DOUBLE_FUNCTIONAL_DATA_QUERY, {
    variables: {
      accession: [accession],
    },
    skip: assembly === "mm10",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  
  //CCRE_RDHS_QUERY
  const { loading: capra_double_rdhs_loading, error: capra_double_rdhs_error, data: capra_double_rdhs_data } = useQuery(CCRE_RDHS_QUERY, {
    variables: {
      assembly: "GRCh38",
      rDHS: [capra_double_data && capra_double_data.capraFccDoubleQuery.length>0 && capra_double_data.capraFccDoubleQuery[0].rdhs_p1,capra_double_data && capra_double_data.capraFccDoubleQuery.length>0  && capra_double_data.capraFccDoubleQuery[0].rdhs_p2],
    },    
    skip:  capra_double_data===undefined || !capra_double_data || (capra_double_data && capra_double_data.capraFccDoubleQuery.length===0) ,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  return loading || mpra_loading || crispr_loading || capra_loading || capra_double_loading || capra_double_rdhs_loading? (
    <LoadingMessage />
  ) : error ? (
    <ErrorMessage error={error} />
  ) :  (
    <Grid container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
      <Grid
        size={{
          xs: 12,
          md: 12,
          lg: 12
        }}>
        <DataTable
          tableTitle={`Mouse transgenic enhancer assays`}
          columns={[
            {
              header: "Chromosome",
              value: (row) => row.chromosome,
            },
            {
              header: "Start",
              value: (row) => row.start,
            },
            {
              header: "Stop",
              value: (row) => row.stop,
            },
            {
              header: "Element Id",
              value: (row) => row.element_id,
              render: (row)=> {
                return (
                  <Link
                    href={`https://enhancer.lbl.gov/vista/element?vistaId=${row.element_id}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {row.element_id}
                  </Link>
                );
              }
            },
            {
              header: "Assay Result",
              value: (row) => row.assay_result,
            },
            {
                header: "Tissues [number of embryos positive/number of embryos negative]",
                value: (row) => row.tissues,
            }
          ]}
          rows={data.functionalCharacterizationQuery || []}
          sortColumn={3}
          itemsPerPage={5}
        />
      </Grid>
      { mpra_error ? (
    <ErrorMessage error={mpra_error} />
  ) : <>
  {assembly!=="mm10" &&<Grid
    size={{
      xs: 12,
      md: 12,
      lg: 12
    }}>
        <DataTable
          tableTitle={`MPRA (region centric)`}
          columns={[
            {
              header: "Chromosome",
              value: (row) => row.chromosome,
            },
            {
              header: "Start",
              value: (row) => row.start,
            },
            {
              header: "Stop",
              value: (row) => row.stop,
            },
            {
              header: "Strand",
              value: (row) => row.strand,
            },
            {
              header: "Log2 FC",
              value: (row) => row.log2fc.toFixed(2),
              HeaderRender: () => <>Log<sub>2</sub>(Fold Change)</>
            },
            {
                header: "Experiment",
                value: (row) => row.experiment,
            },
            {
              header: "Cell Type",
              value: (row) => row.celltype,
            },
            {
              header: "Assay Type",
              value: (row) => row.assay_type,
            },
            {
              header: "Series",
              value: (row) => row.series,
            },
            {
              header: "Location of element",
              value: (row) => row.element_location,
            },
            {
              header: "Location of barcode",
              value: (row) => row.barcode_location,
            }
          ]}
          rows={mpra_data.mpraFccQuery || []}
          sortColumn={4}
          itemsPerPage={5}
        />
      </Grid>}</>}
      { capra_error ? (
    <ErrorMessage error={capra_error} />
  ) : <>
  {assembly!=="mm10"  &&<Grid
    size={{
      xs: 12,
      md: 12,
      lg: 12
    }}>
        <DataTable
          tableTitle={`STARR-seq (CAPRA quantification) Solo Fragments`}
          columns={[
            {
              header: "Experiment",
              value: (row) => row.experiment,
              render: (row) => <CreateLink
              linkPrefix="https://www.encodeproject.org/experiments/"
              linkArg={row.experiment}
              label={row.experiment}
              showExternalIcon
              underline="always"
            />
            },
            {
              header: "Celltype",
              value: (row) => capra_experimentMap[row.experiment].cellType,
            },
            {
              header: "Lab",
              value: (row) => capra_experimentMap[row.experiment].lab,
            },
            {
              header: "DNA Rep1",
              value: (row) => row.dna_rep1,
            },
            {
              header: "RNA Rep1",
              value: (row) => row.rna_rep1,
            },
            {
              header: "RNA Rep2",
              value: (row) => row.rna_rep2,
            },
            {
              header: "RNA Rep3",
              value: (row) => row.rna_rep3,
            },
            {
              header: "Log2FC",
              HeaderRender: () => <>Log<sub>2</sub>(Fold Change)</>,
              value: (row) => row.log2fc.toFixed(2),
            },
            {
              header: "P",
              value: (row) => !row.pvalue ? "n/a" : row.pvalue.toFixed(2),
              HeaderRender: () => <i>P</i>
            },
            {
              header: "FDR",
              value: (row) => !row.fdr ? "n/a" : row.fdr.toFixed(2),
            }
          ]}
          rows={capra_data.capraFccSoloQuery || []}
          sortColumn={7}
          itemsPerPage={5}
        />
      </Grid>}</>}
  { capra_double_error ? (
    <ErrorMessage error={capra_double_error} />
  ) : <>
  {assembly!=="mm10" && <Grid
    size={{
      xs: 12,
      md: 12,
      lg: 12
    }}>
        <DataTable
          tableTitle={`STARR-seq (CAPRA quantification) Double Fragments`}
          columns={[
            {
              header: "cCRE Pair",
              value: (row) => row.ccrep1+"-"+row.ccrep2,
            },
            {
              header: "Experiment",
              value: (row) => row.experiment,
              render: (row) => <CreateLink
                                  linkPrefix="https://www.encodeproject.org/experiments/"
                                  linkArg={row.experiment}
                                  label={row.experiment}
                                  showExternalIcon
                                  underline="always"
                                />
            },            
            {
              header: "Celltype",
              value: (row) => capra_experimentMap[row.experiment].cellType,
            },
            {
              header: "Lab",
              value: (row) => capra_experimentMap[row.experiment].lab,
            },
            {
              header: "DNA Rep1",
              value: (row) => row.dna_rep1,
            },
            {
              header: "RNA Rep1",
              value: (row) => row.rna_rep1,
            },
            {
              header: "RNA Rep2",
              value: (row) => row.rna_rep2,
            },
            {
              header: "RNA Rep3",
              value: (row) => row.rna_rep3,
            },
            {
              header: "Log2(Fold Change)",
              HeaderRender: () => <>Log<sub>2</sub>(Fold Change)</>,
              value: (row) => row.log2fc.toFixed(2),
            },
            {
              header: "P",
              value: (row) => !row.pvalue ? "n/a" : row.pvalue.toFixed(2),
              HeaderRender: () => <i>P</i>,
            },
            {
              header: "FDR",
              value: (row) => !row.fdr ? "n/a" : row.fdr.toFixed(2),
            }
          ]}
          rows={capra_double_data && 
            capra_double_data.capraFccDoubleQuery.map(c=>{  return {...c, ccrep1: capra_double_rdhs_data && capra_double_rdhs_data.cCREQuery.length>0 && capra_double_rdhs_data.cCREQuery[0].accession, ccrep2: capra_double_rdhs_data && capra_double_rdhs_data.cCREQuery.length>0 && capra_double_rdhs_data.cCREQuery[1].accession } }) 
            || []}
          sortColumn={8}
          itemsPerPage={5}
        />
      </Grid>}</>}

      { crispr_error ? (
    <ErrorMessage error={crispr_error} />
  ) : <>
  {assembly!=="mm10" && <Grid
    size={{
      xs: 12,
      md: 12,
      lg: 12
    }}>
        <DataTable
          tableTitle={`CRISPR perturbation data`}
          columns={[
            {
              header: "Experiment",
              value: (row) => row.experiment,
              render: (row) => <CreateLink
                                  linkPrefix="https://www.encodeproject.org/experiments/"
                                  linkArg={row.experiment}
                                  label={row.experiment}
                                  showExternalIcon
                                  underline="always"
                                />
            },  
            {
              header: "Design",
              value: (row) => crispr_experimentMap[row.experiment].design,
            },          
            {
              header: "Celltype",
              value: (row) => crispr_experimentMap[row.experiment].cellType,
            },
            {
              header: "Lab",
              value: (row) => crispr_experimentMap[row.experiment].lab,
            },
            {
              header: "Log2(Fold Change)",
              HeaderRender: () => <>Log<sub>2</sub>(Fold Change)</>,
              value: (row) => row.log2fc.toFixed(2),
            },
            {
              header: "P",
              value: (row) => !row.pvalue ? "n/a" : row.pvalue.toFixed(2),
              HeaderRender: () => <i>P</i>,
            },
            {
              header: "FDR",
              value: (row) => !row.fdr ? "n/a" : row.fdr.toFixed(2),
            }
          ]}
          rows={crispr_data.crisprFccQuery || []}
          sortColumn={4}
          itemsPerPage={5}
        />
      </Grid>}</>}
    </Grid>
  );
}
