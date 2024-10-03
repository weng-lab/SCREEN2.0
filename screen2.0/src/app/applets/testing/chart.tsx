import React, { useMemo, useRef, useCallback, useState } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Circle, LinePath } from '@visx/shape';
import { localPoint } from '@visx/event';
import { Tooltip } from '@visx/tooltip';
import { Text } from '@visx/text';
import { useDrag } from '@visx/drag';
import CircularProgress from '@mui/material/CircularProgress';
import { curveBasis } from '@visx/curve';

interface Point {
    x: number;
    y: number;
    color: string;
    opacity?: number;
    name: string;
    accession: string;
}

interface UmapProps {
    width: number;
    height: number;
    pointData: Point[];
    loading: boolean;
}

type TooltipData = Point;
type Line = { x: number; y: number }[];
type Lines = Line[];

function Umap({ width: parentWidth, height: parentHeight, pointData: umapData, loading }: UmapProps) {
    const [tooltipData, setTooltipData] = React.useState<TooltipData | null>(null);
    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const tooltipTimeoutRef = useRef<number | null>(null);

    // const [isDragging, setIsDragging] = React.useState(false);
    const [lines, setLines] = useState<Lines>([]);

    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const boundedWidth = Math.min(parentWidth * 0.9, parentHeight * 0.9) - margin.left;
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

    // Setup dragging for lasso drawing
    const onDragStart = useCallback(
        (currDrag) => {
          // add the new line with the starting point
          const adjustedX = (currDrag.x - margin.left);
          const adjustedY = (currDrag.y - margin.top);
          setLines((currLines) => [...currLines, [{ x: adjustedX, y: adjustedY }]]);
        },
        [setLines],
      );

    const onDragMove = useCallback(
        (currDrag) => {
            // add the new point to the current line
            const adjustedX = (currDrag.x - margin.left);
            const adjustedY = (currDrag.y - margin.top);
            setLines((currLines) => {
            const nextLines = [...currLines];
            const newPoint = { x: adjustedX + currDrag.dx, y: adjustedY + currDrag.dy };
            const lastIndex = nextLines.length - 1;
            nextLines[lastIndex] = [...(nextLines[lastIndex] || []), newPoint];
            return nextLines;
            });
        },
        [setLines],
    );

    //find all points within the drawn lasso for selection purposes
    const isPointInLasso = (point: { x: number; y: number }, polygon: Line): boolean => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i].x, yi = polygon[i].y;
          const xj = polygon[j].x, yj = polygon[j].y;
      
          const intersect = ((yi > point.y) !== (yj > point.y)) &&
                            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      };
      
      const onDragEnd = useCallback(() => {
          if (lines.length === 0) return;
      
          const lastLine = lines[lines.length - 1];
      
          const pointsInsideLasso = umapData.filter((point) => {
              const scaledPoint = {
                  x: xScale(point.x),
                  y: yScale(point.y)
              };
              return isPointInLasso(scaledPoint, lastLine);
          });
      
          console.log("Points inside lasso:", pointsInsideLasso.map(p => p.name));
          setLines([]);
      }, [lines, umapData, xScale, yScale, setLines]);

    const {
        x = 0,
        y = 0,
        dx,
        dy,
        isDragging,
        dragStart,
        dragEnd,
        dragMove,
        } = useDrag({
        onDragStart,
        onDragMove,
        onDragEnd,
        resetOnStart: true,
    });

    //find the closest point to cursor to show the tooltip
    const handleMouseMove = useCallback(
        (event: React.MouseEvent<SVGElement>) => {
            // Don't show tooltip if dragging
            if (isDragging) {
                setTooltipOpen(false);
                setTooltipData(null);
                return;
            }
    
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
        [umapData, xScale, yScale, margin.left, margin.top, isDragging],
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

    const hoveredPoint = tooltipData ? umapData.find(point => point.x === tooltipData.x && point.y === tooltipData.y) : null;

    return (
        <>
            <svg width={parentWidth} height={parentHeight} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ cursor: isDragging ? 'none' : 'default',  userSelect: 'none' }}>
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
                    {umapData.map((point, index) => {
                    const isHovered = hoveredPoint && hoveredPoint.x === point.x && hoveredPoint.y === point.y;

                    return (
                        !isHovered && (
                            <Circle
                                key={index}
                                cx={xScale(point.x)}
                                cy={yScale(point.y)}
                                r={3}
                                fill={point.color}
                                opacity={ point.opacity !== undefined ? point.opacity : 1 }
                            />
                        )
                    );
                })}

                {/* render hovered point last to bring it to foreground */}
                {hoveredPoint && (
                    <Circle
                        cx={xScale(hoveredPoint.x)}
                        cy={yScale(hoveredPoint.y)}
                        r={5}
                        fill={hoveredPoint.color}
                        stroke="black"
                        strokeWidth={1}
                        opacity={1}
                    />
                )}
                
                    {/* render lasso */}
                    {lines.map((line, i) => (
                        <LinePath
                        key={`line-${i}`}
                        fill="transparent"
                        stroke="black"
                        strokeWidth={3}
                        data={line}
                        curve={curveBasis}
                        x={(d) => d.x}
                        y={(d) => d.y}
                        />
                    ))}

                    {axisLeftLabel}
                    {axisBottomLabel}
                </Group>

                {/* Create the drawing area */}
                <g>
          {isDragging && (
            /* capture mouse events (note: <Drag /> does this for you) */
            <rect
              width={parentWidth}
              height={parentHeight}
              onMouseMove={dragMove}
              onMouseUp={dragEnd}
              fill="transparent"
            />
          )}
          {/* decorate the currently drawing line */}
          {isDragging && (
            <g>
            {/* crosshair styling */}
              <line 
                    x1={x + dx - 6} 
                    y1={y + dy} 
                    x2={x + dx + 6} 
                    y2={y + dy} 
                    stroke="black" 
                    strokeWidth={1} 
                />
                <line 
                    x1={x + dx} 
                    y1={y + dy - 6} 
                    x2={x + dx} 
                    y2={y + dy + 6} 
                    stroke="black" 
                    strokeWidth={1} 
                />
              <circle cx={x} cy={y} r={4} fill="transparent" stroke="black" pointerEvents="none" />
            </g>
          )}
          {/* create the drawing area */}
          <rect
            fill="transparent"
            width={parentWidth}
            height={parentHeight}
            onMouseDown={dragStart}
            onMouseUp={isDragging ? dragEnd : undefined}
            onMouseMove={isDragging ? dragMove : undefined}
            onTouchStart={dragStart}
            onTouchEnd={isDragging ? dragEnd : undefined}
            onTouchMove={isDragging ? dragMove : undefined}
          />
        </g>
            </svg>

            {tooltipOpen && tooltipData && (
                <Tooltip left={xScale(tooltipData.x) + 50} top={yScale(tooltipData.y) + 50}>
                    <div>
                        <strong>Name: </strong> 
                        {tooltipData.name.replace(/_/g, " ").slice(0, 45)}
                        {tooltipData.name.length > 45 ? "..." : ""}
                    </div>
                    <div>
                        <strong>Accession:</strong> {tooltipData.accession}
                    </div>
                </Tooltip>
            )}
        </>
        
    );
}

export { Umap };
