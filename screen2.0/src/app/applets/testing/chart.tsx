import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Circle } from '@visx/shape'

interface Props {
    width: number;
    height: number;
}

function Umap({ width: parentWidth, height: parentHeight }: Props) {
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const boundedWidth = parentWidth - margin.left - margin.right;
    const boundedHeight = parentHeight - margin.top - margin.bottom;

    const data = [
        { x: 0, y: 50 },
        { x: 100, y: 80 },
        { x: 50, y: 65 },
        { x: 80, y: 90 },
    ]; // Example data points

    // Define scales based on data and chart dimensions
    const xScale = scaleLinear({
        domain: [0, Math.max(...data.map(d => d.x))], // Input data range
        range: [0, boundedWidth], // Output range (SVG width)
        nice: true, // Rounds domain to nice round numbers
    });
    
    const yScale = scaleLinear({
        domain: [0, Math.max(...data.map(d => d.y)) + 10], // Added 10 for better visibility
        range: [boundedHeight, 0], // Output range (SVG height, inverted for y-axis)
        nice: true, // Rounds domain to nice round numbers
    });

    const axisLeftLabel = (
        <Text
            textAnchor="middle"
            verticalAnchor="end"
            angle={-90}
            fontSize={12}
            y={boundedHeight / 2}
            x={-margin.left / 2}
            dx={-10} // Push the label outside of the chart
        >
            UMAP-2
        </Text>
    );
  
    const axisBottomLabel = (
        <Text
            textAnchor="middle"
            verticalAnchor="start"
            fontSize={12}
            y={boundedHeight + margin.bottom - 40}
            x={boundedWidth / 2}
            dy={10} // Push the label below the chart
        >
            UMAP-1
        </Text>
    );

    //map data points
    const circles = data.map((point, index) => (
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
