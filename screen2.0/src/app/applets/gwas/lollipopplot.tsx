"use client"
import React, { useMemo } from 'react';
import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis'
import { Text } from '@visx/text'
import { defaultStyles as defaultTooltipStyles, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { Paper, Typography } from '@mui/material';
import { KeyboardDoubleArrowUp } from '@mui/icons-material';
import {
  LegendSize,
  LegendItem,
  LegendLabel,
} from '@visx/legend';

export type EnrichmentLollipopPlot = {
  /**
   * Data used to populate the plot
   */
  data: EnrichmentData[],
  /**
   * Total width of bounding paper element
   */
  width: number
  /**
   * Total height of bounding paper element
   */
  height: number
  /**
   * Fired on the click of text or bar of a sample
   */
  onSuggestionClicked?: (selected: EnrichmentData) => void
}

/**
 * Need to add tissue category to this data
 */
export type EnrichmentData = {
  celltype: string
  ontology: string
  displayname: string
  neglog10fdr: number
  pval: number
  log2foldenrichment: number
  study: string
  color: string
}

/**
 * 
 * @todo
 * - Tissue Categories? How to handle with various sorting modes? -> see figure Jill sent in #screen-iscreen
 * - Responsive sizing: https://airbnb.io/visx/docs/responsive -> useParentSize().
 *    - Want plot to be able to fill it's parent container
 *    - Not sure if we want it to always fill it's parent container or if it's helpful to have some way to manually set size too
 * - CSS is a mess here, between my inline CSS and the example code for the Legend. Need to clean up
 * - Support negative values in fold enrichment. Can't just adjust min value of domain for xScale. Bar coordinates need to be reworked to support this.
 * - If possible, would be nice to rework tooltip placement to support placing plot in an MUI Accordion. Breaks for some reason.
 */

export const EnrichmentLollipopPlot = (props: EnrichmentLollipopPlot) => {

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip, updateTooltip } = useTooltip<EnrichmentData>();

  const paddingRightOfMaxVal = props.width * 0.10
  const spaceForCellNames = 200
  const spaceForBottomAxis = 60
  const innerPaddingY = 10
  const innerPaddingX = 10

  const xMin = spaceForCellNames
  const xMax = props.width - spaceForCellNames - paddingRightOfMaxVal - (2 * innerPaddingX) //If adding tissue categories, need to add a space for it here
  const yMax = props.data.length * 27



  // xScale used for the width (value) of bars
  const xScale = useMemo(() =>
    scaleLinear<number>({
      domain: [Math.min(0, Math.min(...props.data.map(x => x.log2foldenrichment))), Math.max(0, Math.max(...props.data.map(x => x.log2foldenrichment)))], //Accounts for values not crossing zero, always include zero as anchor for scores
      range: [0, xMax],
      round: true,
    }),
    [xMax, props.data]
  )

  // yScale used for the vertical placement and height (thickness) of the bars
  const yScale = useMemo(() =>
    scaleBand<string>({
      domain: props.data.map(x => x.celltype),
      range: [0, yMax],
      round: true,
      paddingInner: 0.85
    }),
    [yMax, props.data]
  )

  // rScale used for the radius of the circle
  const rScale = useMemo(() =>
    scaleLinear<number>({
      domain: [Math.min(...props.data.map(x => x.neglog10fdr)), Math.max(...props.data.map(x => x.neglog10fdr))], // Min/Max of fdr values in data
      range: [10, 3],
      round: true,
    }),
    [props.data]
  )

  function updateShading() {
    const container = document.getElementById('scroll-container');
    const shadeTop = document.getElementById('shade-top');
    const shadeBottom = document.getElementById('shade-bottom');

    // Check if there's overflow at the top
    if (container.scrollTop > 0) {
      shadeTop.style.display = 'flex';
    } else {
      shadeTop.style.display = 'none';
    }

    // Check if there's overflow at the bottom
    if (container.scrollHeight > container.clientHeight + container.scrollTop) {
      shadeBottom.style.display = 'block';
    } else {
      shadeBottom.style.display = 'none';
    }
  }

  function scrollToTop() {
    const container = document.getElementById('scroll-container');
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function LegendDemo({ children }: { children: React.ReactNode }) {
    return (
      <div className="legend">
        <div className="title">-Log<sub>10</sub>(FDR)</div>
        {children}
        <style>{`
          .legend {
            font-size: 10px;
            padding: 10px 10px;
            border: 1px solid grey;
            border-radius: 4px;
            margin: 0px 20px;
            position: absolute;
            bottom: 0;
            right: 0;
          }
          .title {
            font-size: 12px;
            margin-bottom: 10px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <Paper sx={{ width: props.width }}>
      <div id="scroll-container-wrapper" style={{ position: 'relative', maxHeight: props.height - spaceForBottomAxis }}>
        <div
          id="shade-top"
          style={{
            position: 'absolute',
            display: 'none',
            left: 0,
            right: 0,
            height: '80px',
            pointerEvents: 'none',
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
            justifyContent: 'center',
          }}
        >
          <KeyboardDoubleArrowUp fontSize='large' sx={{ mt: 1, pointerEvents: 'auto', cursor: 'pointer' }} onClick={scrollToTop} />
        </div>
        <div
          id="shade-bottom"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 'auto',
            bottom: 0,
            height: '80px',
            pointerEvents: 'none',
            background: "linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
          }}
        />
        <LegendDemo>
          <LegendSize scale={rScale}>
            {(labels) =>
              labels.map((label) => {
                const size = rScale(label.datum) ?? 0;
                return (
                  <LegendItem
                    key={`legend-${label.text}-${label.index}`}
                  >
                    <svg width={size * 2} height={size * 2} style={{ margin: '5px 0' }}>
                      <circle r={size} cx={size} cy={size} />
                    </svg>
                    <LegendLabel align="left" margin="0 4px">
                      {(+label.text).toFixed(2)}
                    </LegendLabel>
                  </LegendItem>
                );
              })
            }
          </LegendSize>
        </LegendDemo>
        <div onScroll={updateShading} id="scroll-container" style={{ maxHeight: props.height - spaceForBottomAxis, overflowY: 'auto' }}>
          <svg id="sugestions-plot" width={props.width - (2 * innerPaddingX)} height={yMax + (2 * innerPaddingY)}>
            <Group id="bars-goup" top={innerPaddingY}>
              {props.data.map((x) => {

                let barStart: number;
                let barWidth: number;
                let circleX: number;

                const barHeight = yScale.bandwidth()
                const barY = yScale(x.celltype)
                const radiusFDR = rScale(x.neglog10fdr)

                if (x.log2foldenrichment < 0) { //bar is to the left of 0
                  barStart = xMin + xScale(x.log2foldenrichment)
                  barWidth = xScale(0) - xScale(x.log2foldenrichment)
                  circleX = barStart
                } else { //bar is to the right of 0
                  barStart = xMin + xScale(0)
                  barWidth = xScale(x.log2foldenrichment) - xScale(0)
                  circleX = barStart + barWidth
                }

                return (
                  <Group
                    key={`bar-${x.celltype}`}
                    onMouseMove={(event) => {
                      showTooltip({
                        tooltipTop: event.pageY,
                        tooltipLeft: event.pageX,
                        tooltipData: x
                      })
                    }}
                    onMouseLeave={() => {
                      hideTooltip()
                    }}
                    onClick={() => props.onSuggestionClicked && props.onSuggestionClicked(x)}
                    cursor={props.onSuggestionClicked && "pointer"}
                  >
                    <Text
                      fontSize={12}
                      textAnchor='end'
                      verticalAnchor='middle'
                      x={spaceForCellNames - 5}
                      y={barY + (0.5 * barHeight)}
                    >
                      {x.displayname.length > 25 ? x.displayname.slice(0, 23) + '...' : x.displayname}
                    </Text>
                    <Bar
                      x={barStart}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={x.color}
                    />
                    <Circle
                      r={radiusFDR}
                      cx={circleX}
                      cy={barY + (0.5 * barHeight)}
                      fill={x.color}
                    />
                    <Circle
                      r={radiusFDR - 1.5}
                      cx={circleX}
                      cy={barY + (0.5 * barHeight)}
                      fill='black'
                    />
                  </Group>
                )
              })}
            </Group>
            <line stroke='black' x1={xMin + xScale(0)} y1={0} x2={xMin + xScale(0)} y2={yMax + (2 * innerPaddingY)} />
          </svg >
        </div>
      </div>
      <svg id="axis-container" width={props.width} height={spaceForBottomAxis}>
        <AxisBottom left={xMin} top={5} scale={xScale} label='Log2(Fold Enrichment)' />
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultTooltipStyles, backgroundColor: '#283238', color: 'white', zIndex: 1000 }}
        >
          <div>
            <Typography>{tooltipData.displayname}</Typography>
          </div>
          <div>
            <Typography>{tooltipData.ontology}</Typography>
          </div>
          <div>
            <Typography variant='body2'><i>P</i>: {tooltipData.pval}</Typography>
          </div>
          <div>
            <Typography variant='body2'>Log<sub>2</sub>(Fold Enrichment): {tooltipData.log2foldenrichment}</Typography>
          </div>
          <div>
            <Typography variant='body2'>-Log<sub>10</sub>(FDR): {tooltipData.neglog10fdr}</Typography>
          </div>
        </TooltipWithBounds>
      )}
    </Paper>
  )
}