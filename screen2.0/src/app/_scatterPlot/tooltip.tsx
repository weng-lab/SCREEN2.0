import React from "react";
import { TooltipProps } from "./types";

const ScatterTooltip = <T,>({
    tooltipBody,
    tooltipData
}: TooltipProps<T>) => {
    return (
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
    );
}

export default ScatterTooltip;