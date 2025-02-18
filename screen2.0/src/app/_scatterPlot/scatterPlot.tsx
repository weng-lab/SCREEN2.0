import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Zoom as VisxZoom } from '@visx/zoom'
import { ZoomProps } from '@visx/zoom/lib/Zoom'
import { ChartProps, Line, Lines, Point } from './types';
import { Tooltip as VisxTooltip } from '@visx/tooltip';
import { TooltipProps } from '@visx/tooltip/lib/tooltips/Tooltip';
import { createPortal } from 'react-dom';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Circle, LinePath } from '@visx/shape';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';
import { useDrag } from '@visx/drag';
import { curveBasis } from '@visx/curve';

const initialTransformMatrix = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
}

export const Chart = <T,>({
    width,
    height,
    pointData,
    loading, 
    selectionType,
    onSelectionChange,
    onPointClicked,
    tooltipBody,
    zoomScale,
    miniMap,
    leftAxisLable,
    bottomAxisLabel
}: ChartProps<T>) => {
    /**
 * Hacky workaround for complex type compatability issues. Hopefully this will fix itself when ugrading to React 19 - Jonathan 12/11/24
 * @todo remove this when possible
 */
    const Zoom = VisxZoom as unknown as React.FC<ZoomProps<React.ReactElement>>;
    const Tooltip = VisxTooltip as unknown as React.FC<TooltipProps>;
    const [tooltipData, setTooltipData] = React.useState<Point<T> | null>(null);
    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const [lines, setLines] = useState<Lines>([]);
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const boundedWidth = Math.min(width * 0.9, height * 0.9) - margin.left;
    const boundedHeight = boundedWidth;
    const hoveredPoint = tooltipData ? pointData.find(point => point.x === tooltipData.x && point.y === tooltipData.y) : null;
    const canvasRef = useRef(null);

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
        if (!pointData || pointData.length === 0) return scaleLinear({ domain: [0, 1], range: [0, boundedWidth] });
        return scaleLinear({
            domain: [
                Math.min(...pointData.map(d => d.x)) - 1,
                Math.max(...pointData.map(d => d.x)) + 1,
            ],
            range: [0, boundedWidth],
            nice: true,
        });
    }, [pointData, boundedWidth]);

    const yScale = useMemo(() => {
        if (!pointData || pointData.length === 0) return scaleLinear({ domain: [0, 1], range: [boundedHeight, 0] });
        return scaleLinear({
            domain: [
                Math.min(...pointData.map(d => d.y)) - 1,
                Math.max(...pointData.map(d => d.y)) + 1,
            ],
            range: [boundedHeight, 0], // Y-axis is inverted
            nice: true,
        });
    }, [pointData, boundedHeight]);

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
        [selectionType, margin.left, margin.top],
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
        [selectionType, margin.left, margin.top],
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

                const pointsInsideLasso = pointData.filter((point) => {
                    const scaledPoint = {
                        x: xScaleTransformed(point.x),
                        y: yScaleTransformed(point.y),
                    };
                    return isPointInLasso(scaledPoint, lasso);
                });

                if (onSelectionChange) {
                    onSelectionChange(pointsInsideLasso);
                }
                setLines([]);
            } else {
                setLines([]);
            }
        },
        [lines, pointData, xScale, yScale, setLines, onSelectionChange, selectionType]
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
            const hoveredPoint = pointData.find((curr) => {
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
        }, [pointData, xScale, yScale, margin.left, margin.top, isDragging]
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
            {leftAxisLable}
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
            {bottomAxisLabel}
        </Text>
    );

    if (loading || !pointData) {
        return <CircularProgress />;
    }

    return (
        <>
            <Zoom width={width} height={height} scaleXMin={1 / 2} scaleXMax={10} scaleYMin={1 / 2} scaleYMax={10} initialTransformMatrix={initialTransformMatrix}>
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
                            {/* Zoomable Group for Points */}
                            <div style={{ position: 'relative' }}>
                                <canvas
                                    ref={canvasRef}
                                    width={width * 2}
                                    height={height * 2}
                                    style={{
                                        cursor: selectionType === "select" ? (isDragging ? 'none' : 'default') : (zoom.isDragging ? 'grabbing' : 'grab'),
                                        userSelect: 'none',
                                        position: "absolute",
                                        top: margin.top,
                                        left: margin.left,
                                        width: width,
                                        height: height,
                                    }}
                                />
                                <svg width={width} height={height} style={{ position: "absolute", cursor: selectionType === "select" ? (isDragging ? 'none' : 'default') : (zoom.isDragging ? 'grabbing' : 'grab'), userSelect: 'none' }} onMouseMove={(e) => handleMouseMove(e, zoom)} onMouseLeave={handleMouseLeave} >
                                    <Group top={margin.top} left={margin.left}>
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

                                        {/* Render hovered point last to bring it to foreground */}
                                        {isHoveredPointWithinBounds && hoveredPoint && (
                                            <Circle
                                                cx={xScaleTransformed(hoveredPoint.x)}
                                                cy={yScaleTransformed(hoveredPoint.y)}
                                                r={hoveredPoint.r + 2}
                                                fill={hoveredPoint.color}
                                                stroke="black"
                                                strokeWidth={1}
                                                opacity={1}
                                                onClick={() => onPointClicked && onPointClicked(hoveredPoint)}
                                            />
                                        )}

                                        {/* Interactable surface */}
                                        <rect
                                            fill="transparent"
                                            width={width}
                                            height={height}
                                            onMouseDown={selectionType === "select" ? dragStart : zoom.dragStart}
                                            onMouseUp={selectionType === "select" ? (event) => {
                                                dragEnd(event);
                                                onDragEnd(zoom);
                                            } : zoom.dragEnd}
                                            onMouseMove={selectionType === "select" ? (isDragging ? dragMove : undefined) : zoom.dragMove}
                                            onTouchStart={selectionType === "select" ? dragStart : zoom.dragStart}
                                            onTouchEnd={selectionType === "select" ? (event) => {
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
                                </svg >
                            </div>
                            {
                                miniMap.show && createPortal(
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: miniMap.position ? miniMap.position.bottom : 10,
                                            right: miniMap.position ? miniMap.position.right : 10,
                                        }}
                                    >
                                        {/* Canvas for rendering points on minimap */}
                                        <canvas
                                            width={(width - 100) / 4}
                                            height={(height - 100) / 4}
                                            ref={(canvas) => {
                                                if (canvas) {
                                                    const context = canvas.getContext('2d');
                                                    const scaleFactor = 0.25;
                                                    const scaledWidth = (width - 100) * scaleFactor;
                                                    const scaledHeight = (height - 100) * scaleFactor;

                                                    // Clear canvas
                                                    context.clearRect(0, 0, canvas.width, canvas.height);

                                                    // Draw background and outline
                                                    context.fillStyle = 'white';
                                                    context.fillRect(0, 0, scaledWidth, scaledHeight);
                                                    context.strokeStyle = 'grey';
                                                    context.lineWidth = 4;
                                                    context.strokeRect(0, 0, scaledWidth, scaledHeight);

                                                    // Draw points
                                                    pointData.forEach(point => {
                                                        const transformedX = xScale(point.x) * scaleFactor;
                                                        const transformedY = yScale(point.y) * scaleFactor;
                                                        context.beginPath();
                                                        context.arc(transformedX, transformedY, 3 * scaleFactor, 0, Math.PI * 2);
                                                        context.fillStyle = point.color;
                                                        context.fill();
                                                    });
                                                }
                                            }}
                                            style={{ display: 'block' }}
                                        />

                                        {/* SVG for rendering the zoom window */}
                                        <svg
                                            width={(width - 100) / 4}
                                            height={(height - 100) / 4}
                                            style={{ position: 'absolute', top: 0, left: 0 }}
                                        >
                                            <g
                                                transform={`
                                                    scale(0.25)
                                                `}
                                            >
                                                <rect
                                                    width={width - 100}
                                                    height={height - 100}
                                                    fill="#0d0f98"
                                                    fillOpacity={0.2}
                                                    stroke="#0d0f98"
                                                    strokeWidth={4}
                                                    rx={8}
                                                    transform={zoom.toStringInvert()}
                                                />
                                            </g>
                                        </svg>
                                    </div>,
                                    miniMap.ref ? miniMap.ref.current : document.body
                                )
                            }
                            {
                                useEffect(() => {
                                    const canvas = canvasRef.current;
                                    if (canvas) {
                                        const context = canvas.getContext('2d');
                                        context.setTransform(2, 0, 0, 2, 0, 0);

                                        // Clear the canvas before rendering
                                        context.clearRect(0, 0, width, height);
                                        // Render points on the canvas
                                        pointData.forEach(point => {
                                            const isHovered = hoveredPoint && hoveredPoint.x === point.x && hoveredPoint.y === point.y;
                                            const transformedX = xScaleTransformed(point.x);
                                            const transformedY = yScaleTransformed(point.y);;
                                            const isPointWithinBounds =
                                                xScaleTransformed(point.x) >= 0 &&
                                                xScaleTransformed(point.x) <= boundedWidth &&
                                                yScaleTransformed(point.y) >= 0 &&
                                                yScaleTransformed(point.y) <= boundedHeight;

                                            if (isPointWithinBounds && !isHovered) {
                                                context.beginPath();
                                                context.arc(transformedX, transformedY, point.r || 3, 0, Math.PI * 2);
                                                context.fillStyle = point.color;
                                                context.globalAlpha = (point.opacity !== undefined ? point.opacity : 1);
                                                context.fill();
                                            }
                                        });
                                    }
                                }, [pointData, width, height, hoveredPoint, zoom, xScaleTransformed, yScaleTransformed, boundedWidth, boundedHeight])
                            }
                            {
                                useEffect(() => {
                                    if (zoomScale.scaleX === 1) {
                                        zoom.reset();
                                    } else {
                                        zoom.scale({ scaleX: zoomScale.scaleX, scaleY: zoomScale.scaleY });
                                    }
                                }, [zoomScale])
                            }

                            {/* tooltip */}
                            {
                                tooltipOpen && tooltipData && isHoveredPointWithinBounds && (
                                    <Tooltip left={xScaleTransformed(tooltipData.x) + 50} top={yScaleTransformed(tooltipData.y) + 50}>
                                        <div>
                                            {tooltipBody ? tooltipBody(tooltipData) : (
                                                <div>
                                                    {tooltipData.metaData && Object.entries(tooltipData.metaData).map(([key, value]) => (
                                                        <div key={key}>
                                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}: </strong>
                                                            {typeof value === 'string'
                                                                ? (value.length > 45
                                                                    ? `${value.replace(/_/g, " ").slice(0, 45)}...`
                                                                    : value.replace(/_/g, " "))
                                                                : String(value)}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Tooltip>
                                )
                            }
                        </>
                    )
                }}
            </Zoom >
        </>
    );
}
