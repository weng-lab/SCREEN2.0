import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisTop } from '@visx/axis';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { useParentSize } from '@visx/responsive';
import { defaultStyles as defaultTooltipStyles, useTooltip, TooltipWithBounds, Portal } from '@visx/tooltip';

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
  data = [],
  SVGref,
  topAxisLabel,
  onBarClicked,
  TooltipContents
}: BarPlotProps<T>) => {
  const [spaceForLabel, setSpaceForLabel] = useState(0)
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip<BarData<T>>({});
  const { parentRef, width: ParentWidth } = useParentSize({ debounceTime: 150 });
  const containerRef = useRef(null)
  const requestRef = useRef<number | null>(null);
  const tooltipDataRef = useRef<{ top: number; left: number; data: BarData<T> } | null>(null);

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

  const width = useMemo(() => Math.max(500, ParentWidth), [ParentWidth])
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

  const fontFamily = "Roboto,Helvetica,Arial,sans-serif"

  //This feels really dumb but I couldn't figure out a better was to have the labels not overflow sometimes - JF 11/7/24
  useEffect(() => {
    if (!containerRef?.current){ return }

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    let overflowDetected = false;
    let maxOverflow = 0

    data.forEach((d, i) => {
      const textElement = document.getElementById(`label-${i}`) as unknown as SVGTextElement;
      if (textElement) {
        const textWidth = textElement.getBBox().width;
        const barWidth = xScale(d.value);

        const totalWidth = spaceForCategory + 10 + barWidth + gapBetweenTextAndBar + textWidth
        
        // Check if bar + label overflows container
        if (totalWidth > containerWidth) {
          overflowDetected = true;
          maxOverflow = Math.max(maxOverflow, totalWidth - containerWidth)
        }
      }
    });

    // If overflow is detected, increment
    if (overflowDetected) {
      setSpaceForLabel(spaceForLabel + maxOverflow);
    }
  }, [data, xScale, spaceForLabel]);

  return (
    <div ref={parentRef}>
      {data.length === 0 ?
        <p>No Data To Display</p>
        :
        <svg ref={containerRef} width={width} height={totalHeight}>
          <svg width={width} height={totalHeight} ref={SVGref}>
          <Group left={spaceForCategory} top={spaceForTopAxis}>
            {/* Top Axis with Label */}
            <AxisTop scale={xScale} top={0} label={topAxisLabel} labelProps={{ dy: -5, fontSize: 16, fontFamily: fontFamily }} numTicks={width < 600 ? 4 : undefined} />
            {data.map((d, i) => {
              const barHeight = yScale.bandwidth();
              const barWidth = xScale(d.value) ?? 0;
              const barY = yScale(d.label);
              const barX = 0;
              return (
                <Group
                  key={d.label}
                  onClick={() => onBarClicked && onBarClicked(d)}
                  style={onBarClicked && { cursor: 'pointer' }}
                  onMouseMove={(event) => handleMouseMove(event, d)}
                  onMouseLeave={() => hideTooltip()}
                >
                  {/* Category label to the left of each bar */}
                  <Text
                    x={-gapBetweenTextAndBar}  // Positioning slightly to the left of the bar
                    y={(barY ?? 0) + barHeight / 2}
                    dy=".35em"
                    textAnchor="end"
                    fill="black"
                    fontSize={12}
                    fontFamily={fontFamily}
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
                      id={`label-${i}`}
                      x={barX + barWidth + gapBetweenTextAndBar}  // Position label slightly after the end of the bar
                      y={(barY ?? 0) + barHeight / 2}
                      dy=".35em"  // Vertically align to the middle of the bar
                      fill="black"
                      fontSize={12}
                      fontFamily={fontFamily}
                    >
                      {d.label}
                    </Text>
                  </Group>
                </Group>
              );
            })}
          </Group>
          </svg>
        </svg>

      }
      {/* Maybe should provide a default tooltip */}
      {TooltipContents && tooltipOpen && (
        <Portal>
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={{ ...defaultTooltipStyles, backgroundColor: '#283238', color: 'white', zIndex: 1000 }}
          >
            <TooltipContents {...tooltipData} />
          </TooltipWithBounds>
        </Portal>
      )}
    </div>
  );
};

export default VerticalBarPlot;
