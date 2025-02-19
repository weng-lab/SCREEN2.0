import { MutableRefObject } from "react";

/*
    All information given to a point on the plot, including its coordinates(x and y), its radius, color, and opacity, and its metadata information
    which can be any amount of strings used to display in the tooltip
*/
export type Point<T> = {
    x: number;
    y: number;
    r?: number;
    color: string;
    opacity?: number;
    metaData?: T;
};

/*
    Properties given to the minimap including if its visible or not (shown) and its positioon in relation to its reference (both optional)
    If not position or reference is given, it will default to the bottom right corner of the screen if shown
*/
export type MiniMapProps = {
    show: boolean;
    position?: { right: number; bottom: number };
    ref?: MutableRefObject<HTMLDivElement | null>;
};

/*
    Basic chart properties
*/
export type ChartProps<T> = {
    width: number;
    height: number;
    pointData: Point<T>[];
    loading: boolean;
    //returns an array of selected points inside a lasso (optional)
    onSelectionChange?: (selectedPoints: Point<T>[]) => void;
    //returns a point when clicked on (optional)
    onPointClicked?: (point: Point<T>) => void;
    //custom tooltip formating (optional)
    tooltipBody?: (point: Point<T>) => JSX.Element;
    miniMap: MiniMapProps;
    leftAxisLable: string;
    bottomAxisLabel: string;
};

export type Line = { x: number; y: number }[];
export type Lines = Line[];

export type MapProps<T> = {
    miniMap: MiniMapProps;
    width: number;
    height: number;
    pointData: Point<T>[];
    xScale;
    yScale;
    zoom;
}

export type TooltipProps<T> = {
    tooltipBody?: (point: Point<T>) => JSX.Element;
    tooltipData: Point<T>;
}

export type ControlButtonsProps = {
    handleSelectionModeChange;
    selectMode;
    zoomIn;
    zoomOut;
    zoomReset;
}