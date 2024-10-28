import React, { useCallback, useMemo, useRef } from 'react';
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
  const { parentRef, width: ParentWidth } = useParentSize({ debounceTime: 150 });
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip<BarData<T>>({});
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

  /**
   * @todo it'd be nice to somehow extract these from what is passed to the component. This is hardcoded to fit the gene expression data
   */
  const spaceForTopAxis = 50
  const spaceOnBottom = 20
  const spaceForCategory = 120
  const spaceForLabel = 280

  const height = data.length * 20 + spaceForTopAxis + spaceOnBottom

  // Dimensions
  const xMax = width - spaceForCategory - spaceForLabel;
  const yMax = height - spaceForTopAxis - spaceOnBottom;

  // Scales
  const yScale = useMemo(() =>
    scaleBand<string>({
      domain: data.map((d) => d.label),
      range: [0, yMax],
      padding: 0.2,
    }), [data, yMax]) 

  const xScale = useMemo(() =>
    scaleLinear<number>({
      domain: [0, Math.max(...data.map((d) => d.value))],
      range: [0, Math.max(xMax, 0)],
    }), [data, xMax])

  return (
    <div ref={parentRef}>
      {data.length === 0 ?
        <p>No Data To Display</p>
      :
        <svg width={width} height={height} ref={SVGref}>
          <Group left={spaceForCategory} top={spaceForTopAxis}>
            {/* Top Axis with Label */}
            <AxisTop scale={xScale} top={0} label={topAxisLabel} labelProps={{dy: -5, fontSize: 16}} numTicks={width < 600 ? 4 : undefined} />
            {data.map((d) => {
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
                    x={-10}  // Positioning slightly to the left of the bar
                    y={(barY ?? 0) + barHeight / 2}
                    dy=".35em"
                    fontSize={12}
                    textAnchor="end"
                    fill="black"
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
                      x={barX + barWidth + 5}  // Position label slightly after the end of the bar
                      y={(barY ?? 0) + barHeight / 2}
                      dy=".35em"  // Vertically align to the middle of the bar
                      fontSize={12}
                      fill="black"
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
      {TooltipContents && tooltipOpen && (
        <Portal>
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={{ ...defaultTooltipStyles, backgroundColor: '#283238', color: 'white' }}
          >
            <TooltipContents {...tooltipData} />
          </TooltipWithBounds>
        </Portal>
      )}
    </div>
  );
};

export default VerticalBarPlot;
