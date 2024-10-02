import React, { useMemo, useRef, useCallback } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Circle } from '@visx/shape';
import { min } from 'd3-array';
import { localPoint } from '@visx/event';
import { Tooltip } from '@visx/tooltip';
import { Text } from '@visx/text';
import CircularProgress from '@mui/material/CircularProgress';

interface Point {
    x: number;
    y: number;
    color: string;
    opacity?: number;
}

interface UmapProps {
    width: number;
    height: number;
    pointData: Point[];
    loading: boolean;
}

type TooltipData = Point;

function Umap({ width: parentWidth, height: parentHeight, pointData: umapData, loading }: UmapProps) {
    const [tooltipData, setTooltipData] = React.useState<TooltipData | null>(null);
    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const tooltipTimeoutRef = useRef<number | null>(null);

    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const boundedWidth = min([parentWidth * 0.9, parentHeight * 0.9]) as number - margin.left;
    const boundedHeight = boundedWidth;

    //scales for the x and y axes
    const xScale = useMemo(() => {
        if (!umapData || umapData.length === 0) return scaleLinear({ domain: [0, 1], range: [0, boundedWidth] });
        return scaleLinear({
            domain: [
                Math.min(...umapData.map(d => d.x)) - 1,
                Math.max(...umapData.map(d => d.x)) + 1,
            ],
            range: [0, boundedWidth],
            nice: true,
        });
    }, [umapData, boundedWidth]);

    const yScale = useMemo(() => {
        if (!umapData || umapData.length === 0) return scaleLinear({ domain: [0, 1], range: [boundedHeight, 0] });
        return scaleLinear({
            domain: [
                Math.min(...umapData.map(d => d.y)) - 1,
                Math.max(...umapData.map(d => d.y)) + 1,
            ],
            range: [boundedHeight, 0], // Y-axis is inverted
            nice: true,
        });
    }, [umapData, boundedHeight]);

    //find the closest point to cursor to show the tooltip
    const handleMouseMove = useCallback(
        (event: React.MouseEvent<SVGElement>) => {
            const point = localPoint(event.currentTarget, event);
            if (!point) return;

            const adjustedX = point.x - margin.left;
            const adjustedY = point.y - margin.top;

            const closestPoint = umapData.reduce((prev, curr) => {
                const prevDistance = Math.sqrt(
                    Math.pow(adjustedX - xScale(prev.x), 2) +
                    Math.pow(adjustedY - yScale(prev.y), 2)
                );
                const currDistance = Math.sqrt(
                    Math.pow(adjustedX - xScale(curr.x), 2) +
                    Math.pow(adjustedY - yScale(curr.y), 2)
                );
                return currDistance < prevDistance ? curr : prev;
            });
            setTooltipData(closestPoint);
            setTooltipOpen(true);
        },
        [umapData, xScale, yScale, margin.left, margin.top],
    );

    const handleMouseLeave = useCallback(() => {
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }
        tooltipTimeoutRef.current = window.setTimeout(() => {
            setTooltipOpen(false);
            setTooltipData(null);
        }, 300);
    }, []);

    const axisLeftLabel = (
        <Text
            textAnchor="middle"
            verticalAnchor="end"
            angle={-90}
            fontSize={15}
            y={boundedHeight / 2}
            x={0}
            dx={-50} //adjust to move outside of chart area
        >
            UMAP-2
        </Text>
    );

    const axisBottomLabel = (
        <Text
            textAnchor="middle"
            verticalAnchor="start"
            fontSize={15}
            y={boundedHeight}
            x={boundedWidth / 2}
            dy={50}
        >
            UMAP-1
        </Text>
    );

    if (loading || !umapData) {
        return <CircularProgress />;
    }

    return (
        <>
            <svg width={parentWidth} height={parentHeight} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
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
                    {umapData.map((point, index) => (
                        <Circle
                            key={index}
                            cx={xScale(point.x)}
                            cy={yScale(point.y)}
                            r={tooltipData && tooltipData.x === point.x && tooltipData.y === point.y ? 5 : 3}
                            fill={tooltipData && tooltipData.x === point.x && tooltipData.y === point.y ? 'red' : point.color}
                            opacity={point.opacity !== undefined ? point.opacity : 1}
                        />
                    ))}
                    {axisLeftLabel}
                    {axisBottomLabel}
                </Group>
            </svg>
            {tooltipOpen && tooltipData && (
                <Tooltip left={xScale(tooltipData.x) + 50} top={yScale(tooltipData.y) + 50}>
                    <div>
                        <strong>x:</strong> {tooltipData.x}
                    </div>
                    <div>
                        <strong>y:</strong> {tooltipData.y}
                    </div>
                    <div>
                        <strong>color:</strong> {tooltipData.color}
                    </div>
                </Tooltip>
            )}
        </>
    );
}

export { Umap };
