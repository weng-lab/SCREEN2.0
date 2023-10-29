import React from "react"
import { useRouter } from "next/navigation"
import { Stack } from "@mui/material"
import { Range2D, Point2D, linearTransform2D } from "jubilant-carnival"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { tissueColors } from "../../../common/lib/colors"
import { stringToColour } from "../../search/ccredetails/utils"

type QuantificationData = {
  accession: string,
  assay_term_name: string,
  biosample: string,
  biosample_type: string,
  color: string,
  file_accession: string,
  tpm: number,
  value: number
}[]

/**
 * @todo Need to type everything in this file and clean it up. It's very confusing
 */

export function PlotGeneExpression(props: {
  data: {
    accession: string,
    assay_term_name: string,
    biosample: string,
    biosample_type: string,
    cell_compartment: string,
    gene_quantification_files: { accession: string, quantifications: { file_accession: string, tpm: number }[] }[],
    tissue: string
  }[]
  range: Range2D
  dimensions: Range2D
  // RNAtype: string
  group: "byTissueMaxTPM" | "byExperimentTPM" | "byTissueTPM"
  scale: "linearTPM" | "logTPM"
  replicates: "mean" | "all"
}) {
  const router = useRouter()

  let byTissue: {
    [id: string]: {
      values: QuantificationData
    }
  } = {}
  let byTissueMean: { [id: string]: { values: QuantificationData } } = {}
  let byValueTissues: { [id: string]: { values: QuantificationData } } = {}
  let byTissueMaxTissues: { [id: string]: { values: QuantificationData } } = {}
  let p1: Point2D = { x: 0, y: 0 }
  //Holds the max value in the chart
  let max: number = 0

  //Filter Data to [...]
  props.data.filter(s => s["tissue"]).map((biosample) => {

    //
    if (!byTissue[biosample["tissue"]]) {
      byTissue[biosample["tissue"]] = { values: [] }
    }

    biosample["gene_quantification_files"].forEach(d => {
      if (d.quantifications.length > 0) {
        d.quantifications.forEach(q => {
          let val = props.scale === "logTPM" ? Math.log10(q.tpm + 1) : q.tpm
          if (val > max) {
            max = val
          }
          if (q.tpm > 0) {
            byTissue[biosample["tissue"]].values.push({
              biosample: biosample.biosample,
              biosample_type: biosample.biosample_type,
              assay_term_name: biosample.assay_term_name,
              accession: biosample.accession,
              value: val, tpm: q.tpm, file_accession: q.file_accession,
              color: tissueColors[biosample["tissue"]] ? tissueColors[biosample["tissue"]] :
                stringToColour(biosample["tissue"])
            })
          }
        })
      }
    })

    byTissue[biosample["tissue"]].values.sort((a, b) => b.value - a.value);
  })

  if (props.replicates === "mean") {
    Object.keys(byTissue).forEach(k => {
      if (!byTissueMean[k]) byTissueMean[k] = { values: [] }
      let datasetAccessions = [...new Set(byTissue[k].values.map(v => v.accession))];

      datasetAccessions.forEach(da => {
        let r = byTissue[k].values.filter(v => v.accession == da)
        let sum = r.map(v => v.value).reduce((partialSum, a) => partialSum + a, 0);
        byTissueMean[k].values.push(
          {
            biosample: r[0].biosample,
            biosample_type: r[0].biosample_type,
            assay_term_name: r[0].assay_term_name,
            accession: r[0].accession,
            value: sum / r.length, tpm: r[0].tpm, file_accession: r[0].file_accession,
            color: tissueColors[k] ? tissueColors[k] :
              stringToColour(k)
          }
        )
      })

    })
    byTissue = byTissueMean
  }

  Object.keys(byTissue).forEach(k => {
    if (byTissue[k].values.length === 0) {
      delete byTissue[k];
    }
  })
  props.range.x.end = max

  // returns bar plot for a tissue
  const plotGeneExp = (entry, _, y) => {

    let info = entry[1]

    //Value here will be p1.x
    //So entry[1].values[x].value = width?
    return info.values.map((item: { color: string, biosample: string, file_accession: string, accession: string, value: number }, i: number) => {
      //Shouldn't this just be LinearTransform? Why 2D?
      p1 = linearTransform2D(props.range, props.dimensions)({ x: item.value, y: 0 })
      return (
        <g key={i}>
          {/* The color bar */}
          <a href={"https://encodeproject.org/experiments/" + item.accession}>
            <rect
              x={165}
              y={y + i * 20}
              width={p1.x + 0}
              height={18}
              fill={item.color}
            >
              <title>{item.biosample + "\n" + item.accession + "-" + item.file_accession}</title>
            </rect>
          </a>
          {/* The ccore and exp/biosample ID */}
          <text x={p1.x + 0 + 170} y={y + i * 20 + 12.5} style={{ fontSize: 12 }}>
            {Number(item.value.toFixed(3)) + " "}
            <a href={"https://www.encodeproject.org/experiments/" + item.accession}>{item.accession}</a>
            {" " + item.file_accession + " " + item.biosample}
          </text>
          {/* The biosample category */}
          {(props.group === 'byTissueMaxTPM' || props.group === 'byExperimentTPM') &&
            <text
              text-anchor="end"
              x={160}
              y={y + (i * 20 + 15)}
            >
              {entry[0].split("-")[0]}
            </text>
          }
          {props.group === 'byTissueTPM' && i === Math.floor(Object.values(info.values).length / 2) &&
            <text
              text-anchor="end"
              x={160}
              // If the tissue has an even number of values, bump up a little
              y={y + (i * 20 + 15) - (((Object.values(info.values).length % 2) !== 0) ? 0 : 12)}
            >
              {entry[0].split("-")[0]}
            </text>
          }
          <line x1={165} x2={165} y1={y + i * 20} y2={y + (i * 20 + 18)} stroke="black" />
        </g>
      )
    })
  }

  let byValuesTissues = Object.entries(byTissue).map((entry) => {
    let info = entry[1]
    return info.values.map(r => {
      return {
        ...r,
        tissue: entry[0]
      }
    })
  }).flat()
  let byValTissues = (byValuesTissues.sort((a, b) => b.value - a.value))

  byValTissues.forEach((b, i) => {
    byValueTissues[b.tissue + "-b" + i] = { values: [b] }
  })


  Object.keys(byTissue).forEach((k) => {
    byTissueMaxTissues[k] = {
      values: [byTissue[k].values[0]]
    }
  })
  let tissues: { [id: string]: { values: QuantificationData } } = props.group === "byExperimentTPM" ? byValueTissues : props.group === "byTissueMaxTPM" ? byTissueMaxTissues : byTissue // dict of ftissues
  
  return (
    <>
      <Grid2 xs={12} md={12} lg={12} mt={1} ml={2} mr={2}>
        {Object.keys(tissues).length === 0 ? <span>{'No Data Available'}</span> : <Stack>
        
            {Object.entries(tissues).map((entry, index: number) => {
          
            let info = entry[1]
          

            let view: string = "0 0 1200 " + (info.values.length * (props.group === 'byTissueTPM' ? 20 : 3) + 20)
            
            return (
              <svg className="graph" aria-labelledby="title desc" role="img" viewBox={view} key={index}>
                <g className="data" data-setname="gene expression plot">
                  {/* Why 5? */}
                  {plotGeneExp(entry, index, 5)}
                </g>
              </svg>
            )
          })}
          
        </Stack>}
      </Grid2>
    </>
  )
}
