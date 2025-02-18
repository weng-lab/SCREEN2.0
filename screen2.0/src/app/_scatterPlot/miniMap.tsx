import React from "react";
import { MapProps } from "./types";
import { createPortal } from 'react-dom';

const MiniMap = <T,>({
    miniMap,
    width,
    height,
    pointData,
    xScale,
    yScale,
    zoom
}: MapProps<T>) => {
    return (
        createPortal(
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
    );
};

export default MiniMap;