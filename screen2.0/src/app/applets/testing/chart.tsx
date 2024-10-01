import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Circle } from '@visx/shape'
import { min } from 'd3-array'

interface Props {
    width: number;
    height: number;
    data: {
        x: number;
        y: number
    }[];
}

function Umap({ width: parentWidth, height: parentHeight, data: umapData }: Props) {
    if (!umapData || umapData.length === 0) {
        // Handle the case where data is not yet available or empty
        return <svg width={parentWidth} height={parentHeight} />;
      }
      
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const boundedWidth = min([parentWidth * 0.9, parentHeight * 0.9]) as number - margin.left
    const boundedHeight = boundedWidth

    // const data = [
    //     { x: -5, y: 10 },
    //     { x: -0.83, y: 7 },
    //     { x: 10, y: 5 },
    //     { x: 5, y: -5 },
    // ]; // Example data points

    const roundDownToMultipleOf5 = (value: number) => Math.floor(value / 5) * 5;
    const roundUpToMultipleOf5 = (value: number) => Math.ceil(value / 5) * 5;

    // define scales
    const xScale = useMemo(() => scaleLinear({
        domain: [
            roundDownToMultipleOf5(Math.min(...umapData.map(d => d.x)) - 1),
            roundUpToMultipleOf5(Math.max(...umapData.map(d => d.x))) + 1,
        ],
        range: [0, boundedWidth],
        nice: true,
    }), [umapData, boundedWidth]);

    const yScale = useMemo(() => scaleLinear({
        domain: [
            roundDownToMultipleOf5(Math.min(...umapData.map(d => d.y)) - 1),
            roundUpToMultipleOf5(Math.max(...umapData.map(d => d.y)) + 1),
        ],
        range: [boundedHeight, 0], // Y-axis is inverted
        nice: true,
    }), [umapData, boundedHeight]);

    const axisLeftLabel = (
        <Text
            textAnchor="middle"
            verticalAnchor="end"
            angle={-90}
            fontSize={12}
            y={boundedHeight / 2}
            x={0}
            dx={-50} // Push the label outside of the chart
        >
            UMAP-2
        </Text>
    );
  
    const axisBottomLabel = (
        <Text
            textAnchor="middle"
            verticalAnchor="start"
            fontSize={12}
            y={boundedHeight}
            x={boundedWidth / 2}
            dy={50} // Push the label below the chart
        >
            UMAP-1
        </Text>
    );

    //map data points to circles
    const circles = umapData.map((point, index) => (
        <Circle
            key={index}
            cx={xScale(point.x)}
            cy={yScale(point.y)}
            r={3} 
            fill="#1c1917"
        />
    ));
  
    return (
        <svg width={parentWidth} height={parentHeight}>
            <Group top={margin.top} left={margin.left}>
                <AxisLeft
                    numTicks={4}
                    scale={yScale}
                    tickLabelProps={() => ({
                        fill: '#1c1917',
                        fontSize: 10,
                        textAnchor: 'end',
                        verticalAnchor: 'middle',
                        x: -10,
                    })}
                />
                {axisLeftLabel}
                <AxisBottom
                    numTicks={4}
                    top={boundedHeight}
                    scale={xScale}
                    tickLabelProps={() => ({
                        fill: '#1c1917',
                        fontSize: 11,
                        textAnchor: 'middle',
                    })}
                />
                {axisBottomLabel}
                {circles}
            </Group>
        </svg>
    );
}

export { Umap };
