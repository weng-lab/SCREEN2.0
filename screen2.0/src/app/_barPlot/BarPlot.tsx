import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisTop } from '@visx/axis';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { useParentSize } from '@visx/responsive';
import { defaultStyles as defaultTooltipStyles, useTooltip, TooltipWithBounds as VisxTooltipWithBounds, Portal as VisxPortal } from '@visx/tooltip';
import { PortalProps } from '@visx/tooltip/lib/Portal';
import { TooltipWithBoundsProps } from '@visx/tooltip/lib/tooltips/TooltipWithBounds';
import { CircularProgress } from '@mui/material';

const fontFamily = "Roboto,Helvetica,Arial,sans-serif"

export interface BarData<T> {
  category: string;
  label: string;
  value: number;
  color?: string;
  metadata?: T;
}

export interface BarPlotProps<T> {
  data: BarData<T>[];
  SVGref?: React.MutableRefObject<SVGSVGElement>
  topAxisLabel?: string;
  onBarClicked?: (bar: BarData<T>) => void;
  TooltipContents?: (bar: BarData<T>) => React.ReactNode
}

const VerticalBarPlot = <T,>({
  data,
  SVGref,
  topAxisLabel,
  onBarClicked,
  TooltipContents
}: BarPlotProps<T>) => {
  const [spaceForLabel, setSpaceForLabel] = useState(200)
  const [labelSpaceDecided, setLabelSpaceDecided] = useState(false)
  // Unique ID needed to not mix up getElementByID calls if multiple charts are in DOM
  const [uniqueID] = useState(topAxisLabel + String(Math.random()))
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip<BarData<T>>({});
  const requestRef = useRef<number | null>(null);
  const tooltipDataRef = useRef<{ top: number; left: number; data: BarData<T> } | null>(null);

  /**
   * Hacky workaround for complex type compatability issues. Hopefully this will fix itself when ugrading to React 19 - Jonathan 12/11/24
   * @todo remove this when possible
   */
  const Portal = VisxPortal as unknown as React.FC<PortalProps>;
  const TooltipWithBounds = VisxTooltipWithBounds as unknown as React.FC<TooltipWithBoundsProps>;

  const outerSvgRef = useRef<SVGSVGElement>(null)

  const handleMouseMove = useCallback((event: React.MouseEvent, barData: BarData<T>) => {
    tooltipDataRef.current = {
      top: event.pageY,
      left: event.pageX,
      data: barData,
    };
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        if (tooltipDataRef.current) {
          showTooltip({
            tooltipTop: tooltipDataRef.current.top,
            tooltipLeft: tooltipDataRef.current.left,
            tooltipData: tooltipDataRef.current.data,
          });
        }
        requestRef.current = null;
      });
    }
  }, [showTooltip]);

  const { parentRef, width: ParentWidth } = useParentSize({ debounceTime: 150 });
  const width = useMemo(() => Math.max(750, ParentWidth), [ParentWidth])
  const spaceForTopAxis = 50
  const spaceOnBottom = 20
  const spaceForCategory = 120
  const gapBetweenTextAndBar = 10
  const dataHeight = data.length * 20
  const totalHeight = dataHeight + spaceForTopAxis + spaceOnBottom

  // Scales
  const yScale = useMemo(() =>
    scaleBand<string>({
      domain: data.map((d) => d.label),
      range: [0, dataHeight],
      padding: 0.2,
    }), [data, dataHeight])

  const xScale = useMemo(() =>
    scaleLinear<number>({
      domain: [0, Math.max(...data.map((d) => d.value))],
      range: [0, Math.max(width - spaceForCategory - spaceForLabel, 0)],
    }), [data, spaceForLabel, width])

  
    //use prop ref or fallback if ref not passed
  const containerWidth = SVGref ? SVGref.current?.clientWidth : outerSvgRef.current?.clientWidth

  //This feels really dumb but I couldn't figure out a better way to have the labels not overflow sometimes - JF 11/8/24
  //Whenever xScale is adjusted, it checks to see if any of the labels overflow the container, and if so
  //it sets the spaceForLabel to be the amount overflowed.
  useEffect(() => {
    if (!containerWidth) { return }

    let maxOverflow = 0
    let minUnderflow: number = null

    data.forEach((d, i) => {
      const textElement = document.getElementById(`label-${i}-${uniqueID}`) as unknown as SVGSVGElement;

      if (textElement) {
        const textWidth = textElement.getBBox().width;
        const barWidth = xScale(d.value);

        const totalWidth = spaceForCategory + barWidth + gapBetweenTextAndBar + textWidth
        const overflow = totalWidth - containerWidth

        maxOverflow = Math.max(overflow, maxOverflow)
        if (overflow < 0) {
          if (minUnderflow === null) {
            minUnderflow = Math.abs(overflow)
          } else {
            minUnderflow = Math.min(Math.abs(overflow), minUnderflow)
          }
        }
      }
    });

    if (maxOverflow > 0) { //ensure nothing is cut off
      setLabelSpaceDecided(false)
      setSpaceForLabel((prev) => {
        return prev + 25
      })
    } else if (minUnderflow > 30) { //ensure not too much space is left empty
      setLabelSpaceDecided(false)
      setSpaceForLabel((prev) => {
        return prev - 25
      })
    } else { //If there is no overflow or underflow to handle
      setLabelSpaceDecided(true)
    }

  }, [data, xScale, spaceForLabel, labelSpaceDecided, SVGref, containerWidth, topAxisLabel, uniqueID]);

  return (
    <div ref={parentRef} style={{position: "relative"}}>
      {data.length === 0 ?
        <p>No Data To Display</p>
        :
        <svg
          //define fallback ref if not passed through props
          ref={(node) => {
            if (SVGref) {
              SVGref.current = node;
            }
            outerSvgRef.current = node;
          }}
          width={width}
          height={totalHeight}
          opacity={(labelSpaceDecided && ParentWidth > 0) ? 1 : 0.3}
        >
          <Group left={spaceForCategory} top={spaceForTopAxis} >
            {/* Top Axis with Label */}
            <AxisTop scale={xScale} top={0} label={topAxisLabel} labelProps={{ dy: -5, fontSize: 16, fontFamily: fontFamily }} numTicks={width < 600 ? 4 : undefined} />
            {data.map((d, i) => {
              const barHeight = yScale.bandwidth();
              const barWidth = xScale(d.value) ?? 0;
              const barY = yScale(d.label);
              const barX = 0;
              return (
                <Group
                  key={i}
                  onClick={() => onBarClicked && onBarClicked(d)}
                  style={onBarClicked && { cursor: 'pointer' }}
                  onMouseMove={(event) => handleMouseMove(event, d)}
                  onMouseLeave={() => hideTooltip()}
                  fontFamily={fontFamily}
                >
                  {/* Category label to the left of each bar */}
                  <Text
                    x={-gapBetweenTextAndBar}  // Positioning slightly to the left of the bar
                    y={(barY ?? 0) + barHeight / 2}
                    dy=".35em"
                    textAnchor="end"
                    fill="black"
                    fontSize={12}
                  >
                    {d.category}
                  </Text>
                  <Group>
                    <Bar
                      key={`bar-${d.label}`}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={d.color || "black"}
                      rx={2}
                    />
                    {/* Value label next to the bar */}
                    <Text
                      id={`label-${i}-${uniqueID}`}
                      x={barX + barWidth + gapBetweenTextAndBar}  // Position label slightly after the end of the bar
                      y={(barY ?? 0) + barHeight / 2}
                      dy=".35em"  // Vertically align to the middle of the bar
                      fill="black"
                      fontSize={12}
                    >
                      {d.label}
                    </Text>
                  </Group>
                </Group>
              );
            })}
          </Group>
        </svg>
      }
      {/* Loading Wheel for resizing */}
      {!labelSpaceDecided &&
        <div style={{display: "flex", position: "absolute", inset: 0, justifyContent: "center"}}>
          <CircularProgress sx={{mt: 10}}/>
        </div>
      }
      {/* Maybe should provide a default tooltip */}
      {TooltipContents && tooltipOpen && (
        <Portal>
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={{ ...defaultTooltipStyles, backgroundColor: '#283238', color: 'white', zIndex: 2000 }}
          >
            <TooltipContents {...tooltipData} />
          </TooltipWithBounds>
        </Portal>
      )}
    </div>
  );
};

export default VerticalBarPlot;
