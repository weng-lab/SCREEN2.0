import { Point2D, Range2D, linearTransform2D } from "jubilant-carnival"
import { Fragment } from "react"

export const z_score = (d: any) => (d === -11.0 || d === "--" || d === undefined ? "--" : d.toFixed(2))

export const ctgroup = (group: string) => {
  group = group.split(",")[0]
  if (group === "CA-CTCF")
    return (
      <span style={{ color: "#00B0F0" }}>
        <strong>chromatin accessible with ctcf</strong>
      </span>
    )
  if (group === "CA-TF")
    return (
      <span style={{ color: "#be28e5" }}>
        <strong>chromatin accessible with tf</strong>
      </span>
    )
  if (group === "CA-H3K4me3")
    return (
      <span style={{ color: "#ffaaaa" }}>
        <strong>chromatin accessible with H3K4me3</strong>
      </span>
    )
  if (group === "TF")
    return (
      <span style={{ color: "#d876ec" }}>
        <strong>tf only</strong>
      </span>
    )
  if (group === "CA")
    return (
      <span style={{ color: "#06DA93" }}>
        <strong>chromatin accessible only</strong>
      </span>
    )
  if (group === "pELS")
    return (
      <span style={{ color: "#ffcd00" }}>
        <strong>proximal enhancer-like signature</strong>
      </span>
    )
  if (group === "dELS")
    return (
      <span style={{ color: "#ffcd00" }}>
        <strong>distal enhancer-like signature</strong>
      </span>
    )
  if (group === "PLS")
    return (
      <span style={{ color: "#ff0000" }}>
        <strong>promoter-like signature</strong>
      </span>
    )
  if (group === "DNase-H3K4me3")
    return (
      <span style={{ color: "#ffaaaa" }}>
        <strong>DNase-H3K4me3</strong>
      </span>
    )
  if (group === "ctcf")
    return (
      <span style={{ color: "#00b0f0" }}>
        <strong>CTCF bound</strong>
      </span>
    )
  if (group === "ylowdnase")
    return (
      <span style={{ color: "#8c8c8c" }}>
        <strong>low DNase</strong>
      </span>
    )
  if (group === "zunclassified")
    return (
      <span style={{ color: "#8c8c8c" }}>
        <strong>zunclassified</strong>
      </span>
    )
  return (
    <span style={{ color: "#06da93" }}>
      <strong>DNase only</strong>
    </span>
  )
}

export function PlotActivityProfiles(data: any, sort: string, zeros: boolean, range: Range2D, dimensions: Range2D){
  let transcripts: string[] = data["sortedTranscripts"]
  let itemsRID: any = data["tsss"][transcripts[0]]["itemsByID"]
  let tissues: any = {} // dict of tissues
  let max: number = 0
  let p1: Point2D = { x: 0, y: 0 }

  Object.values(data["tsss"][transcripts[0]]["itemsGrouped"][sort]).map((biosample) => {
    Object.values(biosample["items"]).map((id: string) => {
      if (!zeros && itemsRID[id]["counts"] === 0) return
      if (!tissues[biosample["tissue"]]) tissues[biosample["tissue"]] = {sum: 0, values: []}
      tissues[biosample["tissue"]].sum += itemsRID[id]["counts"]
      tissues[biosample["tissue"]].values.push({
        value: itemsRID[id]["counts"],
        biosample_term: itemsRID[id]["biosample_term_name"],
        expID: itemsRID[id]["expid"],
        tissue: biosample["tissue"],
        strand: itemsRID[id]["strand"],
        color: biosample["color"]
      })
      
      if (tissues[biosample["tissue"]].sum > max) max = tissues[biosample["tissue"]].sum
    })
  })

  range.x.end = max

  // returns bar plot for a tissue
  function plotGeneExp(entry: any, index: number, y: number){
    let tissue: string = entry[0]
    let info: any = entry[1]

    return Object.values(info.values).map((item: any, i: number) => {
      p1 = linearTransform2D(range, dimensions)({ x: item.value, y: 0 })
      return (
        <Fragment key={i}>
        <rect x={125} width={p1.x + 125} y={(y)+(i*20+20)} height={18} fill={item["color"]}>
          <title>{item.value}</title>
        </rect>
        <text x={p1.x + 125 + 150} y={(y+(i*20)+32.5)} style={{ fontSize: 12 }}>
          {item.value + " "}
        <a href={"https://www.encodeproject.org/experiments/" + item.expID}>{item.expID}</a>
          {" " + item.biosample_term}
          {" (" + item.strand + ")"}
        </text>
        <line x1={125} x2={125} y1={(y)+(i*20+20)} y2={(y)+(i*20+38)} stroke="black"/>
        </Fragment>
      )
    })
  }

  let y: number = 0
  return (
    Object.entries(tissues).map((entry, index: number) => {
      let info: any = entry[1]
      y += info.values.length*20+20+25
      return (
        <Fragment key={index}>
              <text x={10} y={y - info.values.length*20+20} style={{ fontSize: 20, fontWeight: "bolder" }}>{entry[0]}</text>
              <line x1={0} x2={900} y1={y - info.values.length*20+20+10} y2={y - info.values.length*20+20+5} stroke="black"/>
              {plotGeneExp(entry, index, y - info.values.length*20+20)}
        </Fragment>
      )
    })
  )

}
