"use client"
import React from "react"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { TOP_TISSUES } from "./queries"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { z_score, GROUP_COLOR_MAP } from "./utils"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { LoadingMessage } from "../../../common/lib/utility"

type cCRERow = {
  ct?: string
  dnase: number
  h3k4me3: number
  h3k27ac: number
  ctcf: number
  atac: number
  group: string
}


const tableCols = (globals, typeC = false) => {
  let cols = typeC ? [
    {
      header: "Cell Type",
      value: (row: cCRERow) =>
        globals.byCellType[row.ct] && globals.byCellType[row.ct][0] ? globals.byCellType[row.ct][0]["biosample_summary"] : "",
    },
    {
      header: "ATAC Z-score",
      value: (row: cCRERow) => row.atac,
      render: (row: cCRERow) => z_score(row.atac),
    },
    {
      header: "H3K4me3 Z-score",
      value: (row: cCRERow) => row.h3k4me3,
      render: (row: cCRERow) => z_score(row.h3k4me3),
    },
    {
      header: "H3K27ac Z-score",
      value: (row: cCRERow) => row.h3k27ac,
      render: (row: cCRERow) => z_score(row.h3k27ac),
    },
    {
      header: "CTCF Z-score",
      value: (row: cCRERow) => row.ctcf,
      render: (row: cCRERow) => z_score(row.ctcf),
    }
  ] : [
    {
      header: "Cell Type",
      value: (row: cCRERow) =>
        globals.byCellType[row.ct] && globals.byCellType[row.ct][0] ? globals.byCellType[row.ct][0]["biosample_summary"] : "",
    },
    {
      header: "DNase Z-score",
      value: (row: cCRERow) => z_score(row.dnase),
      render: (row: cCRERow) => z_score(row.dnase),
    },
    {
      header: "H3K4me3 Z-score",
      value: (row: cCRERow) => z_score(row.h3k4me3),
      render: (row: cCRERow) => z_score(row.h3k4me3),
    },
    {
      header: "H3K27ac Z-score",
      value: (row: cCRERow) => z_score(row.h3k27ac),
      render: (row: cCRERow) => z_score(row.h3k27ac),
    },
    {
      header: "CTCF Z-score",
      value: (row: cCRERow) => z_score(row.ctcf),
      render: (row: cCRERow) => z_score(row.ctcf),
    },
    {
      header: "ATAC Z-score",
      value: (row: cCRERow) => z_score(row.atac),
      render: (row: cCRERow) => z_score(row.atac),
    },
    {
      header: "Group",
      value: (row: cCRERow) =>  GROUP_COLOR_MAP[row.group] ? GROUP_COLOR_MAP[row.group] : "DNase only",
      render: (row: cCRERow) => {
        let group = row.group.split(",")[0]
        let colormap = GROUP_COLOR_MAP.get(group)
        return colormap ?
          <span style={{ color: colormap.split(":")[1] }}>
            <strong>{colormap.split(":")[0]}</strong>
          </span>
          :
          <span style={{ color: "#06da93" }}>
            <strong>DNase only</strong>
          </span>
      },
    }
  ]
  return cols
}

const ctAgnosticColumns = () => [
  { header: "Cell Type", value: () => "cell type agnostic" },
  {
    header: "DNase max-Z",
    value: (row: cCRERow) => row.dnase,
    render: (row: cCRERow) => z_score(row.dnase),
  },  
  {
    header: "H3K4me3 max-Z",
    value: (row: cCRERow) => row.h3k4me3,
    render: (row: cCRERow) => z_score(row.h3k4me3),
  },
  {
    header: "H3K27ac max-Z",
    value: (row: cCRERow) => row.h3k27ac,
    render: (row: cCRERow) => z_score(row.h3k27ac),
  },
  {
    header: "CTCF max-Z",
    value: (row: cCRERow) => row.ctcf,
    render: (row: cCRERow) => z_score(row.ctcf),
  },
  {
    header: "ATAC max-Z",
    value: (row: cCRERow) => row.atac,
    render: (row: cCRERow) => z_score(row.atac),
  },
  {
    header: "Group",
    value: (row: cCRERow) =>  GROUP_COLOR_MAP[row.group] ? GROUP_COLOR_MAP[row.group] : "DNase only",
    render: (row: cCRERow) => {
      let group =  row.group.split(",")[0]
      
      let colormap = GROUP_COLOR_MAP.get(group)
      return colormap ? 
      <span style={{ color: colormap.split(":")[1] }}>
        <strong>{ colormap.split(":")[0]}</strong>
      </span>: 
      <span style={{ color: "#06da93" }}>
        <strong>DNase only</strong>
      </span>
    },
  },
]

//Cache is not working as expected when switching between open cCREs
export const InSpecificBiosamples = ({ accession, globals, assembly }) => {

  const { data: data_toptissues, loading: loading_toptissues, error: error_toptissues } = useQuery(TOP_TISSUES,
    {
      variables: {
        assembly: assembly.toLowerCase(),
        accession: [accession],
      },
      fetchPolicy: "cache-first"
    }
  )

  let withdnase, typea, typec;
  if (data_toptissues) {
    let r = data_toptissues.ccREBiosampleQuery.biosamples
    let ctcfdata = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "ctcf")
        .map((c) => {
          return { score: c.score, ct: rs.name, tissue: rs.ontology }
        })
    })

    let d = ctcfdata.filter((s) => s.length > 0).flat()

    let c = {}
    d.forEach((g) => {
      c[g.ct] = { ctcf: g.score, tissue: g.tissue }
    })

    let dnasedata = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "dnase")
        .map((c) => {
          return { score: c.score, ct: rs.name, tissue: rs.ontology }
        })
    })

    let dnase = dnasedata.filter((s) => s.length > 0).flat()

    let dn = {}
    dnase.forEach((g) => {
      dn[g.ct] = { dnase: g.score, tissue: g.tissue }
    })

    let h3k4me3data = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "h3k4me3")
        .map((c) => {
          return { score: c.score, ct: rs.name, tissue: rs.ontology }
        })
    })

    let h3k4me3 = h3k4me3data.filter((s) => s.length > 0).flat()

    let h3 = {}
    h3k4me3.forEach((g) => {
      h3[g.ct] = { h3k4me3: g.score, tissue: g.tissue }
    })

    let h3k27acdata = r.map((rs) => {
      return rs.cCREZScores
        .filter((d) => d.assay.toLowerCase() === "h3k27ac")
        .map((c) => {
          return { score: c.score, ct: rs.name, tissue: rs.ontology }
        })
    })

    let h3k27ac = h3k27acdata.filter((s) => s.length > 0).flat()

    let h3k = {}
    h3k27ac.forEach((g) => {
      h3k[g.ct] = { h3k27ac: g.score, tissue: g.tissue }
    })

    let typedata = r.map((d) => {
      return {
        ct: d.name,
        tissue: d.ontology,
        dnase: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "dnase")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "dnase").score
          : -11.0,
        ctcf: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "ctcf")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "ctcf").score
          : -11.0,
        h3k4me3: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "h3k4me3")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "h3k4me3").score
          : -11.0,
        h3k27ac: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "h3k27ac")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "h3k27ac").score
          : -11.0,
        atac: d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "atac")
          ? d.cCREZScores.find((cz) => cz.assay.toLowerCase() === "atac").score
          : -11.0,
      }
    })

    let igroup = data_toptissues.cCREQuery[0].group
    let ccreCts = typedata.map((t) => {
      let group = igroup
      if (t.dnase <= 1.64 && t.dnase != -11.0) group = "ylowdnase"
      if (igroup == "PLS") {
        if (t.h3k4me3 > 1.64) group = "PLS"
        if (t.h3k27ac > 1.64) group = "pELS"
      } else {
        if (t.h3k27ac > 1.64) {
          if (igroup === "pELS") {
            group = "pELS"
          } else {
            group = "dELS"
          }
        }
        if (t.h3k4me3 > 1.64) group = "CA-H3K4me3"
      }
      if (t.ctcf > 1.64) group = "ctcf"
      if (-11.0 === t.dnase) group = "zunclassified"
      if (t.dnase > 1.64) {
        group = "dnase"
      } else {
        group = "ylowdnase"
      }

      let type = ""
      if (t.dnase !== -11.0) {
        type = "withdnase"
      } else {
        type = "typec"
      }
      if (t.dnase !== -11.0 && t.ctcf !== -11.0 && t.h3k27ac !== -11.0 && t.h3k4me3 !== -11.0 && t.atac !== -11.0) {
        type = "typea"
      }
      return { ...t, type, group }
    })

    withdnase = ccreCts.filter((c) => c.type === "withdnase")
    typea = ccreCts.filter((c) => c.type === "typea")
    typec = ccreCts.filter((c) => c.type === "typec")

  }
  return (
    loading_toptissues || error_toptissues ? (
      <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "0rem" }}>
        <Grid2 xs={12} md={12} lg={12}>
          <LoadingMessage />
        </Grid2>
      </Grid2>
    ) : (
      <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "0rem" }}>
        <Grid2 xs={12}>
          {data_toptissues && (
            <DataTable
              rows={[{ ...data_toptissues.cCREQuery[0] }]}
              tableTitle="Cell type agnostic classification"
              columns={ctAgnosticColumns()}
              sortColumn={1}
            />
          )}
        </Grid2>
        <Grid2 xs={12}>
          {/* Type A */}
          {typea && (
            <DataTable
              columns={tableCols(globals)}
              tableTitle="Core Collection"
              rows={typea}
              sortColumn={1}
              itemsPerPage={5}
            />
          )}
        </Grid2>
        <Grid2 xs={12}>
          {/* Type B & D */}
          {withdnase && (
            <DataTable
              columns={tableCols(globals)}
              sortColumn={1}
              tableTitle="Partial Data Collection"
              rows={withdnase}
              itemsPerPage={5}
            />
          )}
        </Grid2>
        <Grid2 xs={12}>
          {/* Type C */}
          {typec && (
            <DataTable
              columns={tableCols(globals, true)}
              tableTitle="Ancillary Collection"
              rows={typec}
              sortColumn={1}
              itemsPerPage={5}
            />
          )}
        </Grid2>
      </Grid2>
    )
  )
}
