import { useState, useMemo } from "react"
import { Tooltip, Stack, Typography } from "@mui/material"
import { Launch } from "@mui/icons-material"
import { assayColors, assayHoverInfo } from "./helpers"
import { assay, BiosampleData } from "./types"

export type AssayWheelProps<T extends boolean> = {
  row: BiosampleData<T>
}

/**
 * 
 * @prop row 
 * @returns the assay wheel for the row
 */
export const AssayWheel = <T extends boolean>({ row }: AssayWheelProps<T>) => {
  const [hoveredAssay, setHoveredAssay] = useState<assay>(null)

  //Constants used for sizing svg elements
  const svgHeight = 50
  const svgWidth = 50
  const radius = 10
  const radiusHovered = 12.5 //If assay is hovered, bump up the radius to create the "poking out" effect
  const fifth = (2 * Math.PI * radius) / 5
  const fifthHovered = (2 * Math.PI * radiusHovered) / 5

  const assays: { id: assay, expID: string, color: string, dashArray: string, radius: number }[] = useMemo(() => {
    return [
      {
        id: "DNase",
        expID: row.dnase, //Used to provide link to ENCODE for that experiment
        color: row.dnase ? assayColors.DNase : "transparent", //Only color slice if the biosample has data in that assay
        dashArray: hoveredAssay === "DNase" ? `${fifthHovered} ${fifthHovered * 4}` : `${fifth} ${fifth * 4}`, //Use dasharray to create a single slice of 1/5th of the circle. 
        radius: hoveredAssay === "DNase" ? radiusHovered : radius
      },
      {
        id: "H3K27ac",
        expID: row.h3k27ac,
        color: row.h3k27ac ? assayColors.H3K27ac : "transparent",
        dashArray: hoveredAssay === "H3K27ac" ? `0 ${fifthHovered} ${fifthHovered} ${fifthHovered * 3}` : `0 ${fifth} ${fifth} ${fifth * 3}`,
        radius: hoveredAssay === "H3K27ac" ? radiusHovered : radius
      },
      {
        id: "H3K4me3",
        expID: row.h3k4me3,
        color: row.h3k4me3 ? assayColors.H3K4me3 : "transparent",
        dashArray: hoveredAssay === "H3K4me3" ? `0 ${fifthHovered * 2} ${fifthHovered} ${fifthHovered * 2}` : `0 ${fifth * 2} ${fifth} ${fifth * 2}`,
        radius: hoveredAssay === "H3K4me3" ? radiusHovered : radius
      },
      {
        id: "CTCF",
        expID: row.ctcf,
        color: row.ctcf ? assayColors.CTCF : "transparent",
        dashArray: hoveredAssay === "CTCF" ? `0 ${fifthHovered * 3} ${fifthHovered} ${fifthHovered * 1}` : `0 ${fifth * 3} ${fifth} ${fifth * 1}`,
        radius: hoveredAssay === "CTCF" ? radiusHovered : radius
      },
      {
        id: "ATAC",
        expID: row.atac,
        color: row.atac ? assayColors.ATAC : "transparent",
        dashArray: hoveredAssay === "ATAC" ? `0 ${fifthHovered * 4} ${fifthHovered}` : `0 ${fifth * 4} ${fifth}`,
        radius: hoveredAssay === "ATAC" ? radiusHovered : radius
      },
    ];
  }, [row.dnase, row.h3k27ac, row.h3k4me3, row.ctcf, row.atac, hoveredAssay, fifthHovered, fifth])

  return (
    <Tooltip
      title={
        <Stack spacing={1}>
          <Typography variant="body2">
            {assayHoverInfo({
              dnase: !!row.dnase,
              atac: !!row.atac,
              ctcf: !!row.ctcf,
              h3k27ac: !!row.h3k27ac,
              h3k4me3: !!row.h3k4me3
            })}
          </Typography>
          {hoveredAssay && <>
            <Typography variant="body2">Click to view {hoveredAssay} experiment:</Typography>
            <Stack direction="row" alignItems={"baseline"}>
              <Typography variant="body2">{row[hoveredAssay.toLowerCase()]}</Typography>
              <Launch fontSize="inherit" sx={{ ml: 0.5 }} />
            </Stack>
          </>}
        </Stack>
      }
      arrow
      placement="right"
    >
      <svg height={svgHeight} width={svgWidth} viewBox={`0 0 ${svgWidth} ${svgHeight}`}  >
        {/* Provides outline */}
        <circle r={2 * radius + 0.125} cx={svgWidth / 2} cy={svgHeight / 2} fill="#EEEEEE" stroke="black" strokeWidth={0.25} />
        {assays.map((assay) => (
          assay.expID &&
          <a
            key={assay.id}
            href={`https://www.encodeproject.org/experiments/${assay.expID}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ pointerEvents: 'none' }} // Prevents anchor from interfering with mouse events
          >
            <circle
              cursor={"pointer"}
              pointerEvents={"auto"}
              r={assay.radius}
              cx={svgWidth / 2}
              cy={svgHeight / 2}
              fill="transparent"
              stroke={assay.color}
              strokeWidth={hoveredAssay === assay.id ? 2 * radiusHovered : 2 * radius}
              strokeDasharray={assay.dashArray}
              onMouseEnter={() => setHoveredAssay(assay.id)}
              onMouseLeave={() => setHoveredAssay(null)}
              onClick={(event) => event.stopPropagation()}
            />
          </a>
        ))}
        {/* Provides dead zone in middle to prevent ATAC wheel from capturing mouse events in center due to it being topmost element */}
        <circle r={radius} cx={svgWidth / 2} cy={svgHeight / 2} fill="white" stroke="black" strokeWidth={0.25} />
      </svg>
    </Tooltip>
  )
}