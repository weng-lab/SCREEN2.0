import React from "react";
import { CcreClass, cCRERow } from "./inspecificbiosample";
import { BarStack, BarStackHorizontal } from "@visx/shape";
import { GROUP_COLOR_MAP } from "../utils";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip, defaultStyles, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TooltipProps,
  Typography,
} from "@mui/material";
import { TooltipInPortalProps } from "@visx/tooltip/lib/hooks/useTooltipInPortal";

export type ClassProportionBarProps = {
  rows: cCRERow[];
  width: number;
  height: number;
  orientation: "vertical" | "horizontal";
  tooltipTitle: string;
  onlyUseChromatinAccessibility?: boolean;
};

type ChromatinAccessibilityCategory = "highDNase" | "lowDNase";

const ClassProportionsBar: React.FC<ClassProportionBarProps> = ({
  rows,
  width,
  height,
  orientation,
  tooltipTitle,
  onlyUseChromatinAccessibility = false,
}) => {
  type Data =
    | { [key in CcreClass]: number }
    | { [key in ChromatinAccessibilityCategory]: number };

  const data: Data = onlyUseChromatinAccessibility
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
        CA: rows.filter((x) => x.class === "CA").length,
        "CA-TF": rows.filter((x) => x.class === "CA-TF").length,
        TF: rows.filter((x) => x.class === "TF").length,
        InActive: rows.filter((x) => x.class === "InActive").length,
        noclass: rows.filter((x) => x.class === "noclass").length,
      };

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    {
      scroll: true,
      detectBounds: true,
    }
  );

  //Fix weird type error on build
  //Type error: 'TooltipInPortal' cannot be used as a JSX component.
  const TooltipComponent = TooltipInPortal as unknown as React.FC<TooltipInPortalProps>;

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<Data>();

  const getColor = (key: CcreClass | ChromatinAccessibilityCategory) => {
    if (onlyUseChromatinAccessibility) {
      return key === "highDNase" ? "#06DA93" : "#e1e1e1";
    } else return GROUP_COLOR_MAP.get(key).split(":")[1];
  };

  const getFormattedCategory = (
    category: CcreClass | ChromatinAccessibilityCategory
  ) => {
    if (onlyUseChromatinAccessibility) {
      return category === "highDNase"
        ? "High Chromatin Accessibility (DNase ≥ 1.64)"
        : "Low Chromatin Accessibility (DNase < 1.64)";
    } else return GROUP_COLOR_MAP.get(category).split(":")[0];
  };

  const barLengthScale = scaleLinear<number>({
    domain: [0, rows.length],
    range: orientation === "vertical" ? [height, 0] : [0, width],
  });

  //Not actually using since this is only a single bar
  const uselessScale = scaleBand<string>({
    domain: [""],
    range: [0, 0],
  });

  const handleMouseOver = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    datum
  ) => {
    const coords = localPoint(event, event);
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: datum,
    });
  };

  const sharedProps = {
    data: [data],
    keys: Object.keys(data),
    color: getColor,
  };

  const hitboxPadding = 10;

  return (
    <div
      style={{ position: "relative", zIndex: 1000, width, height }}
      ref={containerRef}
    >
      <svg width={width} height={height} style={{ display: "block" }}>
        {orientation === "vertical" ? (
          <BarStack
            {...sharedProps}
            xScale={uselessScale}
            yScale={barLengthScale}
            x={() => ""}
            width={width}
          />
        ) : (
          <BarStackHorizontal
            {...sharedProps}
            xScale={barLengthScale}
            yScale={uselessScale}
            y={() => ""}
            height={height}
          />
        )}
      </svg>
      {/* Expand mouse over area since the bar is small */}
      <div
        style={{
          position: "absolute",
          left: -hitboxPadding,
          top: -hitboxPadding,
          width: width + hitboxPadding * 2,
          height: height + hitboxPadding * 2,
          zIndex: 2,
          background: "transparent",
        }}
        onMouseMove={(e) => handleMouseOver(e, data)}
        onMouseLeave={hideTooltip}
      />
      {tooltipOpen && tooltipData && (
        <TooltipComponent
          top={tooltipTop}
          left={tooltipLeft}
          style={{ zIndex: 1000, ...defaultStyles }}
        >
          <Typography>{tooltipTitle}</Typography>
          <Table size="small">
            <TableBody>
              {Object.keys(data).map((key) => {
                const value = data[key] as number;
                const formattedKey = getFormattedCategory(
                  key as CcreClass | ChromatinAccessibilityCategory
                );
                const color = getColor(
                  key as CcreClass | ChromatinAccessibilityCategory
                );
                return (
                  <TableRow>
                    <TableCell>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          marginRight: 6,
                          borderRadius: "50%",
                          backgroundColor: color,
                        }}
                      />
                      {formattedKey}
                    </TableCell>
                    <TableCell align="right">{value}</TableCell>
                    <TableCell align="right">
                      {((value / rows.length) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TooltipComponent>
      )}
    </div>
  );
};

export default ClassProportionsBar;
