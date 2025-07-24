"use client";
import React from "react";
import { useQuery } from "@apollo/client";
import { TOP_TISSUES, GET_CCRE_CT_TF } from "../queries";
import { DataTable } from "psychscreen-legacy-components";
import { z_score, z_score_render, GROUP_COLOR_MAP } from "../utils";
import Grid from "@mui/material/Grid";
import { LoadingMessage } from "../../../../common/lib/utility";
import { DataTableColumn } from "psychscreen-legacy-components";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import ClassProportionsBar from "./ClassProportionsBar";
import { Stack, Typography } from "@mui/material";

export type CcreClass =
  | "PLS"
  | "pELS"
  | "dELS"
  | "CA-H3K4me3"
  | "CA-CTCF"
  | "CA-TF"
  | "CA"
  | "TF"
  | "InActive"
  | "noclass";

export type cCRERow = {
  ct?: string;
  celltypename: string;
  dnase: number;
  h3k4me3: number;
  h3k27ac: number;
  ctcf: number;
  atac: number;
  class: CcreClass;
  tf?: string;
};

type InSpecificBiosamplesProps = {
  accession: string;
  assembly: "GRCh38" | "mm10";
  distanceToTSS: number;
};

const tableCols = (typeC = false) => {
  const cols = typeC
    ? [
        {
          header: "Cell Type",
          value: (row: cCRERow) => row.celltypename,
        },
        {
          header: "ATAC Z-score",
          value: (row: cCRERow) => z_score(row.atac),
          render: (row: cCRERow) => z_score_render(row.atac),
          sort: (a: cCRERow, b: cCRERow) => a.atac - b.atac,
        },
        {
          header: "H3K4me3 Z-score",
          value: (row: cCRERow) => z_score(row.h3k4me3),
          render: (row: cCRERow) => z_score_render(row.h3k4me3),
          sort: (a: cCRERow, b: cCRERow) => a.h3k4me3 - b.h3k4me3,
        },
        {
          header: "H3K27ac Z-score",
          value: (row: cCRERow) => z_score(row.h3k27ac),
          render: (row: cCRERow) => z_score_render(row.h3k27ac),
          sort: (a: cCRERow, b: cCRERow) => a.h3k27ac - b.h3k27ac,
        },
        {
          header: "CTCF Z-score",
          value: (row: cCRERow) => z_score(row.ctcf),
          render: (row: cCRERow) => z_score_render(row.ctcf),
          sort: (a: cCRERow, b: cCRERow) => a.ctcf - b.ctcf,
        },
        {
          header: "TF",
          value: (row: cCRERow) =>
            row.tf === undefined ? "--" : row.tf === "1" ? "Yes" : "No",
        },
      ]
    : [
        {
          header: "Cell Type",
          value: (row: cCRERow) => row.celltypename,
        },
        {
          header: "DNase Z-score",
          value: (row: cCRERow) => z_score(row.dnase),
          render: (row: cCRERow) => z_score_render(row.dnase),
          sort: (a: cCRERow, b: cCRERow) => a.dnase - b.dnase,
        },
        {
          header: "ATAC Z-score",
          value: (row: cCRERow) => z_score(row.atac),
          render: (row: cCRERow) => z_score_render(row.atac),
          sort: (a: cCRERow, b: cCRERow) => a.atac - b.atac,
        },
        {
          header: "H3K4me3 Z-score",
          value: (row: cCRERow) => z_score(row.h3k4me3),
          render: (row: cCRERow) => z_score_render(row.h3k4me3),
          sort: (a: cCRERow, b: cCRERow) => a.h3k4me3 - b.h3k4me3,
        },
        {
          header: "H3K27ac Z-score",
          value: (row: cCRERow) => z_score(row.h3k27ac),
          render: (row: cCRERow) => z_score_render(row.h3k27ac),
          sort: (a: cCRERow, b: cCRERow) => a.h3k27ac - b.h3k27ac,
        },
        {
          header: "CTCF Z-score",
          value: (row: cCRERow) => z_score(row.ctcf),
          render: (row: cCRERow) => z_score_render(row.ctcf),
          sort: (a: cCRERow, b: cCRERow) => a.ctcf - b.ctcf,
        },
        {
          header: "TF",
          value: (row: cCRERow) =>
            row.tf === undefined ? "--" : row.tf === "1" ? "Yes" : "No",
        },
        {
          header: "Classification",
          value: (row: cCRERow) =>
            GROUP_COLOR_MAP.get(row.class)
              ? GROUP_COLOR_MAP.get(row.class).split(":")[0]
              : "DNase only",
          render: (row: cCRERow) => {
            const group = row.class;
            const colormap = GROUP_COLOR_MAP.get(group);
            const color = colormap
              ? row.class === "InActive"
                ? "gray"
                : colormap.split(":")[1]
              : "#06da93";
            const classification = colormap
              ? colormap.split(":")[0]
              : "DNase only";
            return (
              <span style={{ color }}>
                <strong>{classification}</strong>
              </span>
            );
          },
        },
      ];
  return cols;
};

const ctAgnosticColumns: () => DataTableColumn<{
  __typename?: "CCRE";
  accession: string;
  group: string;
  dnase?: number | null;
  h3k4me3?: number | null;
  h3k27ac?: number | null;
  ctcf?: number | null;
  atac?: number | null;
}>[] = () => [
  { header: "Cell Type", value: () => "cell type agnostic" },
  {
    header: "DNase max-Z",
    value: (row) => z_score(row.dnase),
    render: (row) => z_score_render(row.dnase),
  },
  {
    header: "ATAC max-Z",
    value: (row) => z_score(row.atac),
    render: (row) => z_score_render(row.atac),
  },
  {
    header: "H3K4me3 max-Z",
    value: (row) => z_score(row.h3k4me3),
    render: (row) => z_score_render(row.h3k4me3),
  },
  {
    header: "H3K27ac max-Z",
    value: (row) => z_score(row.h3k27ac),
    render: (row) => z_score_render(row.h3k27ac),
  },
  {
    header: "CTCF max-Z",
    value: (row) => z_score(row.ctcf),
    render: (row) => z_score_render(row.ctcf),
  },
  {
    header: "Classification",
    value: (row) =>
      GROUP_COLOR_MAP.get(row.group)
        ? GROUP_COLOR_MAP.get(row.group).split(":")[0]
        : "DNase only",
    render: (row) => {
      const group = row.group;
      const colormap = GROUP_COLOR_MAP.get(group);
      const color = colormap
        ? row.group === "InActive"
          ? "gray"
          : colormap.split(":")[1]
        : "#06da93";
      const classification = colormap ? colormap.split(":")[0] : "DNase only";
      return (
        <span style={{ color }}>
          <strong>{classification}</strong>
        </span>
      );
    },
  },
];

//Cache is not working as expected when switching between open cCREs
export const InSpecificBiosamples: React.FC<InSpecificBiosamplesProps> = ({
  accession,
  assembly,
  distanceToTSS,
}) => {
  const {
    data: data_toptissues,
    loading: loading_toptissues,
    error: error_toptissues,
  } = useQuery(TOP_TISSUES, {
    variables: {
      assembly: assembly.toLowerCase() as "mm10" | "grch38",
      accession: [accession],
    },
    fetchPolicy: "cache-first",
  });

  const {
    data: data_ccre_tf,
    loading: loading_ccre_tf,
    error: error_ccre_tf,
  } = useQuery(GET_CCRE_CT_TF, {
    variables: {
      assembly: assembly.toLowerCase() === "mm10" ? "mm10" : "GRCh38",
      accession: accession,
    },
    fetchPolicy: "cache-first",
  });

  const distance = distanceToTSS;

  let partialDataCollection: cCRERow[],
    coreCollection: cCRERow[],
    ancillaryCollection: cCRERow[];
  if (data_toptissues) {
    const r = data_toptissues.ccREBiosampleQuery.biosamples;
    const ctcfdata = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "ctcf")
        .map((c) => {
          return {
            score: c.score,
            ct: rs.name,
            tissue: rs.ontology,
            celltypename: rs.displayname,
          };
        });
    });

    const d = ctcfdata.filter((s) => s.length > 0).flat();

    const c = {};
    d.forEach((g) => {
      c[g.ct] = { ctcf: g.score, tissue: g.tissue };
    });

    const dnasedata = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "dnase")
        .map((c) => {
          return {
            score: c.score,
            ct: rs.name,
            tissue: rs.ontology,
            celltypename: rs.displayname,
          };
        });
    });

    const dnase = dnasedata.filter((s) => s.length > 0).flat();

    const dn = {};
    dnase.forEach((g) => {
      dn[g.ct] = { dnase: g.score, tissue: g.tissue };
    });

    const h3k4me3data = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "h3k4me3")
        .map((c) => {
          return {
            score: c.score,
            ct: rs.name,
            tissue: rs.ontology,
            celltypename: rs.displayname,
          };
        });
    });

    const h3k4me3 = h3k4me3data.filter((s) => s.length > 0).flat();

    const h3 = {};
    h3k4me3.forEach((g) => {
      h3[g.ct] = { h3k4me3: g.score, tissue: g.tissue };
    });

    const h3k27acdata = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "h3k27ac")
        .map((c) => {
          return {
            score: c.score,
            ct: rs.name,
            tissue: rs.ontology,
            celltypename: rs.displayname,
          };
        });
    });

    const h3k27ac = h3k27acdata.filter((s) => s.length > 0).flat();

    const h3k = {};
    h3k27ac.forEach((g) => {
      h3k[g.ct] = { h3k27ac: g.score, tissue: g.tissue };
    });

    const typedata = r.map((d) => {
      return {
        ct: d.name,
        tf:
          data_ccre_tf && data_ccre_tf.getcCRETFQuery.length > 0
            ? data_ccre_tf.getcCRETFQuery
                .find((a) => d.name === a.celltype)
                ?.tf.toString()
            : undefined,
        celltypename: d.displayname,
        tissue: d.ontology,
        dnase: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "dnase")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "dnase").score
          : -11.0,
        ctcf: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "ctcf")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "ctcf").score
          : -11.0,
        h3k4me3: d.cCREZScores.find(
          (cz) => cz.assay.toLowerCase() === "h3k4me3"
        )
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "h3k4me3")
              .score
          : -11.0,
        h3k27ac: d.cCREZScores.find(
          (cz) => cz.assay.toLowerCase() === "h3k27ac"
        )
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "h3k27ac")
              .score
          : -11.0,
        atac: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "atac")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "atac").score
          : -11.0,
      };
    });

    const ccreCts = typedata.map((t) => {
      let ccreClass: CcreClass;
      const tf =
        data_ccre_tf && data_ccre_tf.getcCRETFQuery.length > 0
          ? data_ccre_tf.getcCRETFQuery
              .find((a) => t.ct === a.celltype)
              ?.tf.toString()
          : undefined;

      if (t.dnase != -11.0) {
        if (t.dnase >= 1.64) {
          if (t.h3k4me3 >= 1.64) {
            if (distance <= 200) {
              ccreClass = "PLS"; //Promoter-like signatures (promoter) must fall within 200 bp of a TSS and have high chromatin accessibility and H3K4me3 signals.
            } else if (t.h3k27ac < 1.64 && distance > 200) {
              ccreClass = "CA-H3K4me3"; //Chromatin accessibility + H3K4me3 (CA-H3K4me3) have high chromatin accessibility and H3K4me3 signals but low H3K27ac signals and do not fall within 200 bp of a TSS.
            } else if (distance <= 2000 && t.h3k27ac >= 1.64) {
              ccreClass = "pELS"; //Enhancer-like signatures (enhancer) have high chromatin accessibility and H3K27ac signals. Enhancers are further divided into TSS-proximal or distal with a 2 kb distance cutoff.
            } else if (distance > 2000 && t.h3k27ac >= 1.64) {
              ccreClass = "dELS"; //Enhancer-like signatures (enhancer) have high chromatin accessibility and H3K27ac signals. Enhancers are further divided into TSS-proximal or distal with a 2 kb distance cutoff.
            }
          } else if (t.h3k27ac >= 1.64) {
            if (distance <= 2000) {
              ccreClass = "pELS"; //Enhancer-like signatures (enhancer) have high chromatin accessibility and H3K27ac signals. Enhancers are further divided into TSS-proximal or distal with a 2 kb distance cutoff.
            } else if (distance > 2000) {
              ccreClass = "dELS"; //Enhancer-like signatures (enhancer) have high chromatin accessibility and H3K27ac signals. Enhancers are further divided into TSS-proximal or distal with a 2 kb distance cutoff.
            }
          } else if (t.ctcf >= 1.64) {
            ccreClass = "CA-CTCF"; //Chromatin accessibility + CTCF (CA-CTCF) have high chromatin accessibility and CTCF signals but low H3K4me3 and H3K27ac signals.
          } else if (tf === "1") {
            ccreClass = "CA-TF"; //Chromatin accessibility + transcription factor (CA-TF) have high chromatin accessibility, low H3K4me3, H3K27ac, and CTCF signals and are bound by a transcription factor.
          } else {
            ccreClass = "CA"; //Chromatin accessibility (CA) have high chromatin accessibility, and low H3K4me3, H3K27ac, and CTCF signals.
          }
        } else {
          if (tf === "1") {
            ccreClass = "TF"; //Transcription factor (TF) have low chromatin accessibility, low H3K4me3, H3K27ac, and CTCF signals and are bound by a transcription factor.
          } else {
            ccreClass = "InActive"; //low chromatin accessibility, low H3K4me3, H3K27ac, and CTCF signals and are NOT bound by a transcription factor.
          }
        }
      } else {
        ccreClass = "noclass"; //If not active in DNase, No class assigned
      }

      let type: "core" | "partial" | "ancillary";

      type = "ancillary";
      if (t.dnase !== -11.0) {
        type = "partial";
        if (t.ctcf !== -11.0 && t.h3k27ac !== -11.0 && t.h3k4me3 !== -11.0) {
          type = "core";
        }
      }
      return { ...t, type, class: ccreClass };
    });

    coreCollection = ccreCts.filter((c) => c.type === "core");
    partialDataCollection = ccreCts.filter((c) => c.type === "partial");
    ancillaryCollection = ccreCts.filter((c) => c.type === "ancillary");
  }

  return loading_toptissues || error_toptissues ? (
    <Grid container spacing={3} sx={{ mt: "0rem", mb: "0rem" }}>
      <Grid
        size={{
          xs: 12,
          md: 12,
          lg: 12,
        }}
      >
        <LoadingMessage />
      </Grid>
    </Grid>
  ) : (
    <Grid container spacing={3} sx={{ mt: "0rem", mb: "0rem" }}>
      <Grid size={12}>
        {data_toptissues && (
          <DataTable
            rows={[{ ...data_toptissues.cCREQuery[0] }]}
            tableTitle="Cell type agnostic classification"
            columns={ctAgnosticColumns()}
            sortColumn={1}
            itemsPerPage={1}
            searchable
            downloadFileName={`${assembly} ${accession} - Cell type agnostic classification.tsv`}
          />
        )}
      </Grid>
      <Grid size={12}>
        {/* Core Collection */}
        {coreCollection ? (
          <ParentSize>
            {({ width }) => (
              <Stack>
                <Typography variant="caption">
                  Classification Proportions, Core Collection:
                </Typography>
                <ClassProportionsBar
                  rows={coreCollection}
                  height={4}
                  width={width}
                  orientation="horizontal"
                  tooltipTitle="Classification Proportions, Core Collection"
                  style={{ marginBottom: "12px" }}
                />
                <DataTable
                  columns={tableCols()}
                  tableTitle={"Core Collection"}
                  rows={coreCollection}
                  sortColumn={1}
                  searchable
                  downloadFileName={`${assembly} ${accession} - Core Collection.tsv`}
                />
              </Stack>
            )}
          </ParentSize>
        ) : (
          <LoadingMessage />
        )}
      </Grid>
      <Grid size={12} id="grid-element">
        {/* Type B & D */}
        {partialDataCollection ? (
          <ParentSize>
            {({ width }) => (
              <Stack>
                <Typography variant="caption">
                  Chromatin Accessibility, Partial Data Collection:
                </Typography>
                <ClassProportionsBar
                  rows={partialDataCollection}
                  orientation="horizontal"
                  height={4}
                  width={width}
                  tooltipTitle="Chromatin Accessibility, Partial Data Collection"
                  onlyUseChromatinAccessibility
                  style={{ marginBottom: "12px" }}
                />
                <DataTable
                  columns={tableCols()}
                  sortColumn={1}
                  tableTitle="Partial Data Collection"
                  rows={partialDataCollection}
                  searchable
                  downloadFileName={`${assembly} ${accession} - Partial Data Collection.tsv`}
                />
              </Stack>
            )}
          </ParentSize>
        ) : (
          <LoadingMessage />
        )}
      </Grid>
      <Grid size={12}>
        {/* Type C */}
        {ancillaryCollection ? (
          <DataTable
            columns={tableCols(true)}
            tableTitle="Ancillary Collection"
            rows={ancillaryCollection}
            sortColumn={1}
            searchable
            downloadFileName={`${assembly} ${accession} - Ancillary Collection.tsv`}
          />
        ) : (
          <LoadingMessage />
        )}
      </Grid>
    </Grid>
  );
};
