import React from "react";
import { CcreClass, cCRERow } from "./inspecificbiosample";
import { BarStackHorizontal } from "@visx/shape";
import { GROUP_COLOR_MAP } from "../utils";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Tooltip as VisxTooltip, useTooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { TooltipProps } from "@visx/tooltip/lib/tooltips/Tooltip";

const Tooltip = VisxTooltip as unknown as React.FC<TooltipProps>;

export type ClassProportionBarProps = {
  rows: cCRERow[];
  width: number;
  height: number;
  onlyUseChromatinAccessibility?: boolean;
};

type ChromatinAccessibilityCategory = "highDNase" | "lowDNase"

const ClassProportionsBar: React.FC<ClassProportionBarProps> = ({
  rows,
  width,
  height,
  onlyUseChromatinAccessibility = false,
}) => {

  type Data =
    | { [key in CcreClass]: number }
    | { [key in ChromatinAccessibilityCategory]: number };
  
  const data: Data  =
  onlyUseChromatinAccessibility
  ? {
    highDNase: rows.filter((x) => x.dnase >= 1.64).length,
    lowDNase: rows.filter((x) => x.dnase < 1.64).length,
  }
  : {
    PLS: rows.filter((x) => x.class === "PLS").length,
    pELS: rows.filter((x) => x.class === "pELS").length,
    dELS: rows.filter((x) => x.class === "dELS").length,
    "CA-H3K4me3": rows.filter((x) => x.class === "CA-H3K4me3").length,
    "CA-CTCF": rows.filter((x) => x.class === "CA-CTCF").length,
    "CA-TF": rows.filter((x) => x.class === "CA-TF").length,
    CA: rows.filter((x) => x.class === "CA").length,
    TF: rows.filter((x) => x.class === "TF").length,
    InActive: rows.filter((x) => x.class === "InActive").length,
    noclass: rows.filter((x) => x.class === "noclass").length,
  };
  
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<Data>();

  const getColor = (key: CcreClass | ChromatinAccessibilityCategory) => {
    if (onlyUseChromatinAccessibility){
      return key === "highDNase" ? "#06DA93" : "#8c8c8c"
    } else return GROUP_COLOR_MAP.get(key).split(":")[1];
  }

  const getFormattedCategory = (
    category: CcreClass | ChromatinAccessibilityCategory
  ) => {
    if (onlyUseChromatinAccessibility) {
      return category === "highDNase"
        ? "High Chromatin Accessibility (DNase >= 1.64)"
        : "Low Chromatin Accessibility (DNase < 1.64)";
    } else return GROUP_COLOR_MAP.get(category).split(":")[0];
  };


  const xScale = scaleLinear<number>({
    domain: [0, rows.length],
    range: [0, width],
  });

  //Not actually using, but BarStackHorizontal needs it
  const yScale = scaleBand<string>({
    domain: [""],
    range: [0, 0],
  });

  // Sort keys by descending value
  const sortedKeys = (
    onlyUseChromatinAccessibility
      ? Object.keys(data)
      : Object.keys(data).sort(
          (a, b) => (data[b] as number) - (data[a] as number)
        )
  ) as (CcreClass | ChromatinAccessibilityCategory)[];

    const handleMouseOver = (event, datum) => {
      const coords = localPoint(event.target.ownerSVGElement, event);
      showTooltip({
        tooltipLeft: coords.x,
        tooltipTop: coords.y,
        tooltipData: datum,
      });
    };

  return (
    <div style={{position: 'relative', zIndex: 1000}}>
      <svg width={width} height={height}>
        <BarStackHorizontal
          data={[data]}
          keys={sortedKeys}
          color={getColor}
          xScale={xScale}
          yScale={yScale}
          y={() => ""}
          height={height}
          onMouseMove={(e) => handleMouseOver(e, data)}
          onMouseLeave={() => hideTooltip()}
        />
      </svg>
      {tooltipOpen && tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={defaultStyles}>
          {sortedKeys.map((key) => {
            const value = data[key] as number
            const formattedKey = getFormattedCategory(key)
            if (!value) return
            return <p>{formattedKey}: {(value/rows.length * 100).toFixed(2)}% ({value})</p>
          })}
        </Tooltip>
      )}
    </div>
  );
};

export default ClassProportionsBar;
