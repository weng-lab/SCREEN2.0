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
import { Zoom } from '@visx/zoom';

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
    selectionType: "select" | "pan";
}

type TooltipData = Point;
type Line = { x: number; y: number }[];
type Lines = Line[];

const initialTransformMatrix={
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
}

function Umap({ width: parentWidth, height: parentHeight, pointData: umapData, loading, selectionType }: UmapProps) {
    const [tooltipData, setTooltipData] = React.useState<TooltipData | null>(null);
    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const [lines, setLines] = useState<Lines>([]);
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const boundedWidth = Math.min(parentWidth * 0.9, parentHeight * 0.9) - margin.left;
    const boundedHeight = boundedWidth;
    const [zoomTransform, setZoomTransform] = useState(initialTransformMatrix);

    //rescale x and y scales when zooming
    //converts to pixel values before applying transformations
    const rescaleX = (scale, zoom) => {
        const newXDomain = scale
          .range()
          .map((r) =>
            scale.invert(
              (r - zoom.transformMatrix.translateX) / zoom.transformMatrix.scaleX
            )
          );
        return scale.copy().domain(newXDomain);
      };
      
      const rescaleY = (scale, zoom) => {
        const newXDomain = scale
          .range()
          .map((r) =>
            scale.invert(
              (r - zoom.transformMatrix.translateY) / zoom.transformMatrix.scaleY
            )
          );
        return scale.copy().domain(newXDomain);
      };

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
    const isPointInLasso = (point: { x: number; y: number }, lasso: Line): boolean => {
        let inside = false;
        //itterate through lasso, j starting at last point (closing the polygon) and taking the value of the previous point on subsequent calls
        for (let i = 0, j = lasso.length - 1; i < lasso.length; j = i++) {
          const xi = lasso[i].x, yi = lasso[i].y; //current vertex
          const xj = lasso[j].x, yj = lasso[j].y; //previous vertex
      
          //ray tracing using imaginary horizontal ray coming from the point extending to the right
          const intersect = ((yi > point.y) !== (yj > point.y)) && //does the ray intersect the line segment from the current to the previous vertex?
                            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi); //is the point to the left of the segment?
          if (intersect) inside = !inside; //toggles everytime the ray intersects the lasso, if twice it will go back to false since it crossed the lasso twice
          //if the ray crosses the lasso an even amount of times -> outside, odd -> inside
        }
        return inside;
      };
      
      const onDragEnd = useCallback(
        (zoom) => {
          if (lines.length === 0) return;
      
          const lasso = lines[lines.length - 1];
          const xScaleTransformed = rescaleX(xScale, zoom);
          const yScaleTransformed = rescaleY(yScale, zoom);
      
          const pointsInsideLasso = umapData.filter((point) => {
            const scaledPoint = {
              x: xScaleTransformed(point.x),
              y: yScaleTransformed(point.y),
            };
            return isPointInLasso(scaledPoint, lasso);
          });
      
          console.log(
            "Points inside lasso:",
            pointsInsideLasso.map((p) => p.name)
          );
          setLines([]);
        },
        [lines, umapData, xScale, yScale, setLines]
      );
      

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
        resetOnStart: true,
    });

    //find the closest point to cursor to show the tooltip
    const handleMouseMove = useCallback(
        (event: React.MouseEvent<SVGElement>, zoom) => {
            if (isDragging) {
                setTooltipOpen(false);
                setTooltipData(null);
                return;
            }
    
            const point = localPoint(event.currentTarget, event);
            if (!point) return;
            const adjustedX = point.x - margin.left;
            const adjustedY = point.y - margin.top;
    
            // Rescale the x and y coordinates with the current zoom state
            const xScaleTransformed = rescaleX(xScale, zoom);
            const yScaleTransformed = rescaleY(yScale, zoom);
    
            // Find the closest point using the transformed scales
            const closestPoint = umapData.reduce((prev, curr) => {
                const prevDistance = Math.sqrt(
                    Math.pow(adjustedX - xScaleTransformed(prev.x), 2) +
                    Math.pow(adjustedY - yScaleTransformed(prev.y), 2)
                );
                const currDistance = Math.sqrt(
                    Math.pow(adjustedX - xScaleTransformed(curr.x), 2) +
                    Math.pow(adjustedY - yScaleTransformed(curr.y), 2)
                );
                return currDistance < prevDistance ? curr : prev;
            });
    
            setTooltipData(closestPoint);
            setTooltipOpen(true);
        },
        [umapData, xScale, yScale, margin.left, margin.top, isDragging]
    );
    

    const handleMouseLeave = useCallback(() => {
        setTooltipOpen(false);
        setTooltipData(null);
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
            <Zoom width={parentWidth} height={parentHeight} scaleXMin={1} scaleXMax={8} scaleYMin={1} scaleYMax={8} initialTransformMatrix={initialTransformMatrix}>
                {(zoom) => {
                    const xScaleTransformed = rescaleX(xScale, zoom);
                    const yScaleTransformed = rescaleY(yScale, zoom);
                    return (
                        <>   
                            <svg width={parentWidth} height={parentHeight} onMouseMove={(e) => handleMouseMove(e, zoom)} onMouseLeave={handleMouseLeave} style={{ cursor: isDragging ? 'none' : 'default', userSelect: 'none' }}>
                                {/* Zoomable Group for Points */}
                                <Group top={margin.top} left={margin.left}>
                                    {umapData.map((point, index) => {
                                        const isHovered = hoveredPoint && hoveredPoint.x === point.x && hoveredPoint.y === point.y;
                                        return (
                                            !isHovered && (
                                                <Circle
                                                    key={index}
                                                    cx={xScaleTransformed(point.x)}
                                                    cy={yScaleTransformed(point.y)}
                                                    r={3}
                                                    fill={point.color}
                                                    opacity={point.opacity !== undefined ? point.opacity : 1}
                                                />
                                            )
                                        );
                                    })}

                                    {/* Render hovered point last to bring it to foreground */}
                                    {hoveredPoint && (
                                        <Circle
                                            cx={xScaleTransformed(hoveredPoint.x)}
                                            cy={yScaleTransformed(hoveredPoint.y)}
                                            r={5}
                                            fill={hoveredPoint.color}
                                            stroke="black"
                                            strokeWidth={1}
                                            opacity={1}
                                        />
                                    )}

                                    {/* Render lasso */}
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

                                    {isDragging && (
                                        <g>
                                            {/* Crosshair styling */}
                                            <line
                                                x1={x - margin.left + dx - 6}
                                                y1={y - margin.top + dy}
                                                x2={x - margin.left + dx + 6}
                                                y2={y - margin.top + dy}
                                                stroke="black"
                                                strokeWidth={1}
                                            />
                                            <line
                                                x1={x - margin.left + dx}
                                                y1={y - margin.top + dy - 6}
                                                x2={x - margin.left + dx}
                                                y2={y - margin.top + dy + 6}
                                                stroke="black"
                                                strokeWidth={1}
                                            />
                                            <circle cx={x - margin.left} cy={y - margin.top} r={4} fill="transparent" stroke="black" pointerEvents="none" />
                                        </g>
                                    )}
                                </Group>
                                {/* Static Axes Group */}
                                <Group top={margin.top} left={margin.left}>
                                    <AxisLeft
                                        numTicks={4}
                                        scale={yScaleTransformed}
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
                                        scale={xScaleTransformed}
                                        tickLabelProps={() => ({
                                            fill: '#1c1917',
                                            fontSize: 11,
                                            textAnchor: 'middle',
                                        })}
                                    />
                                    {axisLeftLabel}
                                    {axisBottomLabel}
                                </Group>
                                <rect
                                    fill="transparent"
                                    width={parentWidth}
                                    height={parentHeight}
                                    onMouseDown={dragStart}
                                    onMouseUp={(event) => {
                                        dragEnd(event);
                                        onDragEnd(zoom);
                                        }}
                                    onMouseMove={isDragging ? dragMove : undefined}
                                    onTouchStart={dragStart}
                                    onTouchEnd={isDragging ? dragEnd : undefined}
                                    onTouchMove={isDragging ? dragMove : undefined}
                                    onWheel={(event) => {
                                        const point = localPoint(event) || { x: 0, y: 0 };
                                        const zoomDirection = event.deltaY < 0 ? 1.1 : 0.9;
                                        zoom.scale({ scaleX: zoomDirection, scaleY: zoomDirection, point });
                                        setZoomTransform(zoom.transformMatrix);
                                    }}
                                />
                            </svg>
                            {tooltipOpen && tooltipData && (
                                <Tooltip left={xScaleTransformed(tooltipData.x) + 50} top={yScaleTransformed(tooltipData.y) + 50}>
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
                    )
                }}
            </Zoom>
        </>
    );
}

export { Umap };
