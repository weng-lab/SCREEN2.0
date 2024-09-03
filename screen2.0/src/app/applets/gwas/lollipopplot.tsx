"use client"
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear, scaleLog } from '@visx/scale';
import { AxisBottom } from '@visx/axis'
import { Text } from '@visx/text'
import { defaultStyles as defaultTooltipStyles, useTooltip, TooltipWithBounds, Portal } from '@visx/tooltip';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { KeyboardDoubleArrowUp } from '@mui/icons-material';
import {
  LegendSize,
  LegendItem,
  LegendLabel,
} from '@visx/legend';
import { tissueColors } from '../../../common/lib/colors';
import { localPoint } from '@visx/event';
import { NumberValue } from '@visx/vendor/d3-scale';

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
  pvalue: number
  fc: number
  accession: string
  ontology: string
  color: string
}

export type TransformedEnrichmentData = RawEnrichmentData & {
  log2fc: number
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
  const [pvalCutoff, setPvalCutoff] = useState<boolean>(false)
  const [groupTissues, setGroupTissues] = useState<boolean>(true)

  const handleSortBy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy((event.target as HTMLInputElement).value as "FDR" | "foldEnrichment");
  };

  const handleFDRcutoff = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFDRcutoff(event.target.checked);
  };

  const handlePvalcutoff = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPvalCutoff(event.target.checked);
  };

  const handleGroupTissues = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGroupTissues(event.target.checked);
  };

  /**
   * Filtered, log transformed, and sorted enrichment data. Includes grouped and ungrouped data
   */
  const plotData: { grouped: { [key: string]: TransformedEnrichmentData[] } } & { ungrouped: TransformedEnrichmentData[] } = useMemo(() => {
    const data: { grouped: { [key: string]: TransformedEnrichmentData[] } } & { ungrouped: TransformedEnrichmentData[] } = { grouped: {}, ungrouped: [] }

    props.data.forEach((x: RawEnrichmentData) => {
      const transformedData: TransformedEnrichmentData = {
        ...x,

        fdr: x.fdr === 0 ? x.fdr + 0.000001 : x.fdr,
        log2fc: Math.log2(x.fc + 0.0001),
      }
      if ((!FDRcutoff || (FDRcutoff && x.fdr < 0.05)) && (!pvalCutoff || (pvalCutoff && x.pvalue < 0.05))) {
        data.ungrouped.push(transformedData)
        if (!data.grouped[transformedData.ontology]) {
          data.grouped[transformedData.ontology] = []
        }
        data.grouped[transformedData.ontology].push(transformedData)
      }
    })

    data.ungrouped.sort((a, b) => sortBy === "foldEnrichment" ? b.log2fc - a.log2fc : a.fdr - b.fdr)

    const sortedGroups = Object.entries(data.grouped)
      //Sort each tissue's values by specified sort
      .map((x: [string, TransformedEnrichmentData[]]) => { x[1].sort((a, b) => sortBy === "foldEnrichment" ? b.log2fc - a.log2fc : a.fdr - b.fdr); return x })
      //Sort the tissues
      .sort((a, b) => {
        //check first index since it should be the largest of that tissue
        return sortBy === "foldEnrichment" ? b[1][0].log2fc - a[1][0].log2fc : a[1][0].fdr - b[1][0].fdr
      });

    data.grouped = Object.fromEntries(sortedGroups)

    return data
  }, [FDRcutoff, pvalCutoff, props.data, sortBy])

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip<TransformedEnrichmentData>();


  const paddingRightOfMaxVal = props.width * 0.10
  const spaceForCellNames = 200
  const spaceForTissueName = 90
  const spaceForBottomAxis = 60
  const innerPaddingY = 10
  const innerPaddingX = 10

  const xMin = spaceForCellNames
  const xMax = props.width - spaceForCellNames - paddingRightOfMaxVal - (2 * innerPaddingX) - (groupTissues && spaceForTissueName)

  const yMax = plotData.ungrouped.length * 27

  // xScale used for the width (value) of bars
  const xScale = useMemo(() =>
    scaleLinear<number>({
      domain: [Math.min(0, Math.min(...plotData.ungrouped.map(x => x.log2fc))), Math.max(0, Math.max(...plotData.ungrouped.map(x => x.log2fc)))], //Accounts for values not crossing zero, always include zero as anchor for scores
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

  // 
  /**
   * Scale for the radius of the FDR circle.
   */
  const rScale = useMemo(() =>
    scaleLog<number>({
      base: 2,
      domain: [Math.min(...plotData.ungrouped.map(x => x.fdr)), 1], // Min/Max of fdr values in data
      range: [10, 5],
      round: true,
    }),
    [plotData]
  )

  function updateShading() {
    const container = document.getElementById('scroll-container');
    const shadeTop = document.getElementById('shade-top');
    const shadeBottom = document.getElementById('shade-bottom');

    if (container && shadeTop && shadeBottom) {
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
  }

  //Update shading whenever data changes
  useEffect(() => {
    updateShading()
  }, [plotData])

  function scrollToTop() {
    const container = document.getElementById('scroll-container');
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function LegendDemo({ children }: { children: React.ReactNode }) {
    return (
      <div className="legend">
        <div className="title">FDR</div>
        {children}
        <style>{`
          .legend {
            font-size: 10px;
            padding: 6px 6px;
            border: 1px solid grey;
            border-radius: 4px;
            margin: 0px 20px;
            position: absolute;
            bottom: 0;
            right: 0;
            background-color: rgba(255, 255, 255, 0.3); /* White with 30% transparency */
            backdrop-filter: blur(3px); /* Apply blur to the content behind */
            -webkit-backdrop-filter: blur(3px); /* Safari support */
          }
          .title {
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  const dataPoint = (x: TransformedEnrichmentData) => {
    let barStart: number;
    let barWidth: number;
    let circleX: number;

    const barHeight = yScale.bandwidth()
    const barY = yScale(x.celltype)
    const radiusFDR = rScale(x.fdr)

    if (x.log2fc < 0) { //bar is to the left of 0
      barStart = xMin + xScale(x.log2fc)
      barWidth = xScale(0) - xScale(x.log2fc)
      circleX = barStart
    } else { //bar is to the right of 0
      barStart = xMin + xScale(0)
      barWidth = xScale(x.log2fc) - xScale(0)
      circleX = barStart + barWidth
    }

    return (
      <Group
        key={`bar-${x.celltype}`}
        onMouseMove={(event) => {
          const coords = localPoint(event);
          console.log(coords)
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
  }

  return (
    <Stack direction={"column"} spacing={2} width={props.width}>
      <Stack direction={"row"} spacing={2} alignItems={"center"} m={2}>
        <FormControl>
          <FormLabel>Sort By</FormLabel>
          <RadioGroup row value={sortBy} onChange={handleSortBy}>
            <FormControlLabel value="foldEnrichment" control={<Radio />} label={<>Log<sub>2</sub>(Fold Enrichment)</>} />
            <FormControlLabel value="FDR" control={<Radio />} label={"FDR"} />
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel>FDR Threshold</FormLabel>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} checked={FDRcutoff} onChange={handleFDRcutoff} label={'FDR < 0.05'} />
          </FormGroup>
        </FormControl>
        <FormControl>
          <FormLabel><i>P</i>-value Threshold</FormLabel>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} checked={pvalCutoff} onChange={handlePvalcutoff} label={<><i>P</i>{" < 0.05"}</>} />
          </FormGroup>
        </FormControl>
        <FormControl>
          <FormLabel>Grouping</FormLabel>
          <FormGroup>
            <FormControlLabel control={<Checkbox />} checked={groupTissues} onChange={handleGroupTissues} label={'Group Tissues'} />
          </FormGroup>
        </FormControl>
      </Stack>
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
                display: 'none',
                left: 0,
                right: 0,
                top: 'auto',
                bottom: 0,
                height: '80px',
                pointerEvents: 'none',
                background: "linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
              }}
            />
            {/** @todo name this something else */}
            <LegendDemo>
              <LegendSize scale={rScale} steps={3}>
                {(labels) => {
                  type Label = { datum: NumberValue, index: number, text: string, value?: number };

                  const deduplicatedLabels: Label[] = labels.reduce<Label[]>((acc, current) => {
                    const isDuplicate = acc.some(item => item.text === current.text);
                    if (!isDuplicate) {
                      acc.push(current);
                    }
                    return acc;
                  }, []);

                  return deduplicatedLabels.map((label) => {
                    if (plotData.ungrouped.length === 1 && label.index === 1) return (<></>)
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
                }}
              </LegendSize>
            </LegendDemo>
            <div onScroll={updateShading} id="scroll-container" style={{ maxHeight: props.height - spaceForBottomAxis, overflowY: 'auto' }}>
              <svg id="sugestions-plot" width={props.width - (2 * innerPaddingX)} height={yMax + (2 * innerPaddingY)}>
                <Group id="bars-goup" top={innerPaddingY}>
                  {groupTissues ?
                    Object.entries(plotData.grouped)
                      //Each Tissues
                      .map((entry: [string, TransformedEnrichmentData[]]) => {
                        const firstDatum = entry[1][0]
                        const BarHeight = yScale.step() * (entry[1].length - 1) + yScale.bandwidth()

                        return (
                          <Group key={entry[0]}>
                            <Bar
                              x={xMin + xMax + 15}
                              y={yScale(firstDatum.celltype)} //Y position of first data point
                              width={yScale.bandwidth()}
                              height={BarHeight} //bandwidth = bar height, step = bandwidth + gap between bars
                              fill={firstDatum.color}
                            />
                            <Text
                              fontSize={12}
                              verticalAnchor='middle'
                              x={xMin + xMax + 25}
                              y={yScale(firstDatum.celltype) + 0.5 * BarHeight} //Y position of first data point + half of bar width
                            >
                              {entry[0].charAt(0).toUpperCase() + entry[0].slice(1)}
                            </Text>
                            {/* Each Data point for that tissue */}
                            {entry[1].map((x) => dataPoint(x))}
                          </Group>
                        )
                      })
                    :
                    plotData.ungrouped.map((x) => dataPoint(x))
                  }
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
      {tooltipOpen && (
        <Portal>
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={{ ...defaultTooltipStyles, backgroundColor: '#283238', color: 'white' }}
          >
            <div>
              <Typography>{tooltipData.displayname}</Typography>
            </div>
            <div>
              <Typography>{tooltipData.ontology}</Typography>
            </div>
            <div>
              <Typography variant='body2'>{tooltipData.accession}</Typography>
            </div>
            <div>
              <Typography variant='body2'><i>P</i>: {tooltipData.pvalue}</Typography>
            </div>
            <div>
              <Typography variant='body2'>Fold Enrichment: {tooltipData.fc}</Typography>
            </div>
            <div>
              <Typography variant='body2'>Log<sub>2</sub>(Fold Enrichment): {tooltipData.log2fc}</Typography>
            </div>
            <div>
              <Typography variant='body2'>FDR: {tooltipData.fdr}</Typography>
            </div>
          </TooltipWithBounds>
        </Portal>
      )}
    </Stack>
  )
}