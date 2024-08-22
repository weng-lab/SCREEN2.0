"use client"
import React, { useMemo, useState } from 'react';
import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis'
import { Text } from '@visx/text'
import { defaultStyles as defaultTooltipStyles, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { Container, FormControl, FormLabel, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { KeyboardDoubleArrowUp } from '@mui/icons-material';
import {
  LegendSize,
  LegendItem,
  LegendLabel,
} from '@visx/legend';
import { tissueColors } from '../../../common/lib/colors';

export type EnrichmentLollipopPlot = {
  /**
   * Data used to populate the plot
   */
  data: RawEnrichmentData[],
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
  onSuggestionClicked?: (selected: TransformedEnrichmentData) => void
}


export type RawEnrichmentData = {
  celltype: string
  displayname: string
  fdr: number
  pval: number
  foldenrichment: number
  study: string
  expID: string
}

export type TransformedEnrichmentData = RawEnrichmentData & {
  neglog10fdr: number
  log2foldenrichment: number
  ontology: string
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
  const [sortBy, setSortBy] = useState<"FDR" | "foldEnrichment">("foldEnrichment")
  const [FDRcutoff, setFDRcutoff] = useState<boolean>(false)
  const [groupTissues, setGroupTissues] = useState<boolean>(false)

  const handleSortBy = (
    event: React.MouseEvent<HTMLElement>,
    newSort: string | null,
  ) => {
    if (newSort === "FDR" || newSort === "foldEnrichment") {
      setSortBy(newSort);
    }
  };

  const handleFDRcutoff = (
    event: React.MouseEvent<HTMLElement>,
    newVal: boolean | null,
  ) => {
    if (newVal !== null) {
      setFDRcutoff(newVal);
    }
  };

  const handleGroupTissues = (
    event: React.MouseEvent<HTMLElement>,
    newVal: boolean | null,
  ) => {
    if (newVal !== null) {
      setGroupTissues(newVal);
    }
  };

  /**
   * Filtered, log transformed, and sorted enrichment data. Includes grouped and ungrouped data
   */
  const plotData: {grouped: {[key: string]: TransformedEnrichmentData[]}} & {ungrouped: TransformedEnrichmentData[]} = useMemo(() => {
    const tissues = Object.entries(tissueColors) //temporary

    const data: {grouped: {[key: string]: TransformedEnrichmentData[]}} & {ungrouped: TransformedEnrichmentData[]} = {grouped: {}, ungrouped: []}

    props.data.forEach((x: RawEnrichmentData) => {
      const randomIndex = Math.floor(Math.random() * tissues.length)
      const transformedData: TransformedEnrichmentData = {
        ...x,
        ontology: tissues[randomIndex][0], //temporary
        neglog10fdr: -Math.log10(x.fdr),
        log2foldenrichment: Math.log2(x.foldenrichment),
        color: tissues[randomIndex][1], //temporary
      }
      if (!FDRcutoff || (FDRcutoff && x.fdr < 0.05)) {
        data.ungrouped.push(transformedData)
        if (!data.grouped[transformedData.ontology]) {
          data.grouped[transformedData.ontology] = []
        }
        data.grouped[transformedData.ontology].push(transformedData)
      }
    })

    data.ungrouped.sort((a, b) => sortBy === "foldEnrichment" ? b.log2foldenrichment - a.log2foldenrichment : a.neglog10fdr - b.neglog10fdr)

    const sortedGroups = Object.entries(data.grouped)
    //Sort each tissue's values by specified sort
    .map((x: [string, TransformedEnrichmentData[]]) => {x[1].sort((a, b) => sortBy === "foldEnrichment" ? b.log2foldenrichment - a.log2foldenrichment : a.neglog10fdr - b.neglog10fdr); return x})
    //Sort the tissues
    .sort((a, b) => {
      //check first index since it should be the largest of that tissue
      return sortBy === "foldEnrichment" ? b[1][0].log2foldenrichment - a[1][0].log2foldenrichment : a[1][0].neglog10fdr - b[1][0].neglog10fdr
      });

    data.grouped = Object.fromEntries(sortedGroups)

    return data
  }, [FDRcutoff, props.data, sortBy])

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip, updateTooltip } = useTooltip<TransformedEnrichmentData>();

  const paddingRightOfMaxVal = props.width * 0.10
  const spaceForCellNames = 200
  const spaceForBottomAxis = 60
  const innerPaddingY = 10
  const innerPaddingX = 10

  const gapBetweenTissues = 40

  const xMin = spaceForCellNames
  const xMax = props.width - spaceForCellNames - paddingRightOfMaxVal - (2 * innerPaddingX) //If adding tissue categories, need to add a space for it here
  
  const yMax = plotData.ungrouped.length * 27
  // const yMax = groupTissues ? (plotData.ungrouped.length * 27) + ((Object.keys(plotData.grouped).length - 1) * gapBetweenTissues) : plotData.ungrouped.length * 27

  // xScale used for the width (value) of bars
  const xScale = useMemo(() =>
    scaleLinear<number>({
      domain: [Math.min(0, Math.min(...plotData.ungrouped.map(x => x.log2foldenrichment))), Math.max(0, Math.max(...plotData.ungrouped.map(x => x.log2foldenrichment)))], //Accounts for values not crossing zero, always include zero as anchor for scores
      range: [0, xMax],
      round: true,
    }),
    [plotData, xMax]
  )

  // yScale used for the vertical placement and height (thickness) of the bars
  const yScale = useMemo(() =>
    scaleBand<string>({
      domain: groupTissues ? Object.values(plotData.grouped).flat().map(x => x.celltype) : plotData.ungrouped.map(x => x.celltype),
      range: [0, yMax],
      round: true,
      paddingInner: 0.85
    }),
    [yMax, plotData, groupTissues]
  )

  // rScale used for the radius of the circle
  const rScale = useMemo(() =>
    scaleLinear<number>({
      domain: [Math.min(...plotData.ungrouped.map(x => x.neglog10fdr)), Math.max(...plotData.ungrouped.map(x => x.neglog10fdr))], // Min/Max of fdr values in data
      range: [10, 3],
      round: true,
    }),
    [plotData]
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
    <Stack direction={"column"} spacing={2}>
      <Stack direction={"row"} spacing={2}>
        <FormControl>
          <FormLabel>Sort By</FormLabel>
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={handleSortBy}
            aria-label="Sort By"
          >
            <ToggleButton value="foldEnrichment" aria-label="fold enrichment" sx={{ textTransform: 'none' }}>
              Log<sub>2</sub>(Fold Enrichment)
            </ToggleButton>
            <ToggleButton value="FDR" aria-label="FDR" sx={{ textTransform: 'none' }}>
              -Log<sub>10</sub>(FDR)
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>FDR Cutoff</FormLabel>
          <ToggleButtonGroup
            value={FDRcutoff}
            exclusive
            onChange={handleFDRcutoff}
            aria-label="FDR Cutoff"
          >
            <ToggleButton value={false} aria-label="No FDR Cutoff" sx={{ textTransform: 'none' }}>
              All Values
            </ToggleButton>
            <ToggleButton value={true} aria-label="FDR less than 0.05" sx={{ textTransform: 'none' }}>
              {"FDR < 0.05"}
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Group By</FormLabel>
          <ToggleButtonGroup
            value={groupTissues}
            exclusive
            onChange={handleGroupTissues}
            aria-label="Group By"
          >
            <ToggleButton value={false} aria-label="No FDR Cutoff" sx={{ textTransform: 'none' }}>
              Don&apos;t Group
            </ToggleButton>
            <ToggleButton value={true} aria-label="FDR less than 0.05" sx={{ textTransform: 'none' }}>
              Group Tissues
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
      <Paper sx={{ width: props.width }}>
        {plotData.ungrouped.length < 1 ?
          <Typography m={2}>No Data to Display</Typography>
          :
          <div>
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
                    {(groupTissues ? Object.values(plotData.grouped).flat() : plotData.ungrouped).map((x) => {
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
          </div>
        }
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
              <Typography>{tooltipData.expID}</Typography>
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
    </Stack>
  )
}