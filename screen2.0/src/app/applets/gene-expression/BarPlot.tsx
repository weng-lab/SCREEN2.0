import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisTop } from '@visx/axis';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { useParentSize } from '@visx/responsive';

export interface BarData<T> {
  category: string;
  label: string;
  value: number;
  color?: string;
  metadata?: T;  // Optional generic metadata property
}

export interface BarPlotProps<T> {
  data: BarData<T>[];
  // width: number;
  // height: number;
  SVGref?: React.MutableRefObject<SVGSVGElement>
  topAxisLabel?: string;  // Label for the top axis
  onBarClicked?: (bar: BarData<T>) => void;  // Callback when a bar is clicked
}

const VerticalBarPlot = <T,>({
  data = [],
  // width,
  // height,
  SVGref,
  topAxisLabel,  // Label passed to the top axis
  onBarClicked,
}: BarPlotProps<T>) => {
  const { parentRef, width } = useParentSize({ debounceTime: 150 });

  const margin = { top: 50, right: 280, bottom: 20, left: 100 }
  const spaceForTopAxis = 50
  const spaceOnBottom = 20
  const spaceForCategory = 100
  const spaceForLabel = 280

  const height = data.length * 20 + 50

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
      <svg width={width} height={height} ref={SVGref}>
        <Group left={margin.left} top={margin.top}>
          {/* Top Axis with Label */}
          <AxisTop scale={xScale} top={0} label={topAxisLabel} />
          {data.map((d) => {
            const barHeight = yScale.bandwidth();
            const barWidth = xScale(d.value) ?? 0;
            const barY = yScale(d.label);
            const barX = 0;
            return (
              <Group key={`bar-group-${d.label}`} >
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
                <Group onClick={() => onBarClicked && onBarClicked(d)} style={{ cursor: 'pointer' }}>
                  <Bar
                    key={`bar-${d.label}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={d.color || "black"}
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
    </div>
  );
};

export default VerticalBarPlot;
