import React, { useMemo, useCallback, useState } from 'react';
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
    const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const boundedWidth = Math.min(parentWidth * 0.9, parentHeight * 0.9) - margin.left;
    const boundedHeight = boundedWidth;
    const hoveredPoint = tooltipData ? umapData.find(point => point.x === tooltipData.x && point.y === tooltipData.y) : null;

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
            if (selectionType === "select") {
                // add the new line with the starting point
                const adjustedX = (currDrag.x - margin.left);
                const adjustedY = (currDrag.y - margin.top);
                setLines((currLines) => [...currLines, [{ x: adjustedX, y: adjustedY }]]);
            }
        },
        [setLines],
      );

    const onDragMove = useCallback(
        (currDrag) => {
            if (selectionType === "select") {
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
            }
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
            if (selectionType === "select") {
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
            } else {
                setLines([]);
            }
        },
        [lines, umapData, xScale, yScale, setLines]
    );
      
    //visx draggable variables (canot declare before functions)
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

    //find the closest point to cursor within threshold to show the tooltip
    const handleMouseMove = useCallback(
        (event: React.MouseEvent<SVGElement>, zoom) => {
            if (isDragging || zoom.isDragging) {
                setTooltipOpen(false);
                setTooltipData(null);
                return;
            }
    
            const point = localPoint(event.currentTarget, event);
            if (!point) return;
            const adjustedX = point.x - margin.left;
            const adjustedY = point.y - margin.top;
    
            //rescale the x and y coordinates with the current zoom state
            const xScaleTransformed = rescaleX(xScale, zoom);
            const yScaleTransformed = rescaleY(yScale, zoom);

            const threshhold = 5;

            //find the exact point being hovered over within the threshhold
            const hoveredPoint = umapData.find((curr) => {
                const transformedX = xScaleTransformed(curr.x);
                const transformedY = yScaleTransformed(curr.y);
                return (
                    Math.abs(adjustedX - transformedX) < threshhold &&
                    Math.abs(adjustedY - transformedY) < threshhold
                );
            });

            if (hoveredPoint) {
                setTooltipData(hoveredPoint);
                setTooltipOpen(true);
            } else {
                setTooltipData(null);
                setTooltipOpen(false);
            }
        }, [umapData, xScale, yScale, margin.left, margin.top, isDragging]
    );
    

    const handleMouseLeave = useCallback(() => {
        setTooltipOpen(false);
        setTooltipData(null);
    }, []);

    //Axis styling
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
            <Zoom width={parentWidth} height={parentHeight} scaleXMin={1} scaleXMax={8} scaleYMin={1} scaleYMax={8} initialTransformMatrix={initialTransformMatrix}>
                {(zoom) => {
                    // rescale as we zoom and pan
                    const xScaleTransformed = rescaleX(xScale, zoom);
                    const yScaleTransformed = rescaleY(yScale, zoom);
                    const isHoveredPointWithinBounds = hoveredPoint && 
                        xScaleTransformed(hoveredPoint.x) >= 0 && 
                        xScaleTransformed(hoveredPoint.x) <= boundedWidth && 
                        yScaleTransformed(hoveredPoint.y) >= 0 && 
                        yScaleTransformed(hoveredPoint.y) <= boundedHeight;
                    return (
                        <>   
                            <svg width={parentWidth} height={parentHeight} onMouseMove={(e) => handleMouseMove(e, zoom)} onMouseLeave={handleMouseLeave} style={{ cursor: selectionType === "select" ? (isDragging ? 'none' : 'default') : (zoom.isDragging ? 'grabbing' : 'grab'), userSelect: 'none' }}>
                                {/* Zoomable Group for Points */}
                                <Group top={margin.top} left={margin.left}>
                                    {umapData.map((point, index) => {
                                        const isHovered = hoveredPoint && hoveredPoint.x === point.x && hoveredPoint.y === point.y;
                                        const transformedX = xScaleTransformed(point.x);
                                        const transformedY = yScaleTransformed(point.y);
                                        const isWithinXBounds = transformedX >= 0 && transformedX <= boundedWidth;
                                        const isWithinYBounds = transformedY >= 0 && transformedY <= boundedHeight;
                                        return (
                                            isWithinXBounds && isWithinYBounds && !isHovered && (
                                                <Circle
                                                    key={index}
                                                    cx={transformedX}
                                                    cy={transformedY}
                                                    r={3}
                                                    fill={point.color}
                                                    opacity={point.opacity !== undefined ? point.opacity : 1}
                                                />
                                            )
                                        );
                                    })}

                                    {/* Render hovered point last to bring it to foreground */}
                                    {isHoveredPointWithinBounds && hoveredPoint && (
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

                                    {selectionType === "select" && (
                                        <>
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
                                        </>
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
                                {/* Interactable surface */}
                                <rect
                                    fill="transparent"
                                    width={parentWidth}
                                    height={parentHeight}
                                    onMouseDown={selectionType === "select" ?  dragStart : zoom.dragStart}
                                    onMouseUp={ selectionType === "select" ? (event) => {
                                        dragEnd(event);
                                        onDragEnd(zoom);
                                    } : zoom.dragEnd}
                                    onMouseMove={ selectionType === "select" ? (isDragging ? dragMove : undefined) : zoom.dragMove}
                                    onTouchStart={selectionType === "select" ?  dragStart : zoom.dragStart}
                                    onTouchEnd={ selectionType === "select" ? (event) => {
                                        dragEnd(event);
                                        onDragEnd(zoom);
                                    } : zoom.dragEnd}
                                    onTouchMove={selectionType === "select" ? (isDragging ? dragMove : undefined) : zoom.dragMove}
                                    onWheel={(event) => {
                                        const point = localPoint(event) || { x: 0, y: 0 };
                                        const zoomDirection = event.deltaY < 0 ? 1.1 : 0.9;
                                        zoom.scale({ scaleX: zoomDirection, scaleY: zoomDirection, point });
                                    }}
                                />
                                {/* {showMiniMap && (
                                    <g
                                    clipPath="url(#zoom-clip)"
                                    transform={`
                                        scale(0.25)
                                        translate(${parentWidth * 4 - parentWidth - 60}, ${parentHeight * 4 - parentHeight - 60})
                                    `}
                                    >
                                    <rect width={parentWidth} height={parentHeight} fill="#1a1a1a" />
                                    {umapData.map((point, i) => (
                                        <React.Fragment key={`dot-sm-${i}`}>
                                        <circle
                                            cx={xScale(point.x)}
                                            cy={yScale(point.y)}
                                            r={3}
                                            fill={point.color}
                                        />
                                        </React.Fragment>
                                    ))}
                                    <rect
                                        width={parentWidth}
                                        height={parentHeight}
                                        fill="white"
                                        fillOpacity={0.2}
                                        stroke="white"
                                        strokeWidth={4}
                                        transform={zoom.toStringInvert()}
                                    />
                                    </g>
                                )} */}
                            </svg>
                            {/* tooltip */}
                            {tooltipOpen && tooltipData && isHoveredPointWithinBounds &&(
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
