"use client"
import React, { startTransition, useEffect, useState } from "react"
import { Tab, Tabs, Typography } from "@mui/material"
import MainResultsTable from "../../common/components/MainResultsTable"
import MainResultsFilters from "../../common/components/MainResultsFilters"
import { CcreDetails } from "./ccredetails/ccredetails"
import Grid2 from "../../common/mui-client-wrappers/Grid2"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import styled from "@emotion/styled"
import { GenomeBrowserView } from "./gbview/genomebrowserview"
import { MainQueryParams, MainResultTableRows } from "./types"
import { fetchRows } from "./fetchRows"

export const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
}))

export const CcreSearch = (props: { mainQueryParams: MainQueryParams, globals }) => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const [value, setValue] = useState(searchParams.get("accession") ? 1 : 0)
  const [tabIndex, setTabIndex] = useState(0)
  const [tableRows, setTableRows] = useState<MainResultTableRows>([])
  const handleChange = (_, newValue: number) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (searchParams.get("accession")) {
      setValue(1)
    }
  }, [searchParams])

  //Need meaningful variable names please, is showing that this is undefined and throwing an error when using back button on details page since accession is undefined
  //IMPORTANT: MAKE SURE THIS STILL WORKS
  let f = tableRows.find((c) => c.accession === searchParams.get("accession"))
  const region = { start: f?.start, chrom: f?.chromosome, end: f?.end }

  //@ts-expect-error
  //Setting react/experimental in types is not fixing this error? https://github.com/vercel/next.js/issues/49420#issuecomment-1537794691
  useEffect(() => startTransition(async () => {
    props.mainQueryParams.bed_intersect ?
      setTableRows(await fetchRows(props.mainQueryParams, sessionStorage.getItem("bed intersect")?.split(' ')))
      :
      setTableRows(await fetchRows(props.mainQueryParams))
  }), [props])

  return (
    <>
      <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>
        <Grid2 xs={12} lg={12}>
          <Tabs aria-label="basic tabs example" value={value} onChange={handleChange}>
            <StyledTab label="cCRE Search Results" />
            {searchParams.get("accession") && <StyledTab label="cCRE Details" />}
          </Tabs>
        </Grid2>
      </Grid2>
      {value === 0 && (
        <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
          <Grid2 xs={12} lg={3}>
            <MainResultsFilters mainQueryParams={props.mainQueryParams} byCellType={props.globals} />
          </Grid2>
          <Grid2 xs={12} lg={9}>
            <Tabs aria-label="basic tabs example" value={tabIndex} onChange={(_, val) => setTabIndex(val)}>
              <StyledTab label="Table View" />
              <StyledTab label="Genome Browser View" />
              
            </Tabs>
            {tabIndex === 1 && (
              <GenomeBrowserView
                gene={props.mainQueryParams.gene}
                biosample={props.mainQueryParams.Biosample.biosample}
                assembly={props.mainQueryParams.assembly}
                coordinates={{ start: +props.mainQueryParams.start, end: +props.mainQueryParams.end, chromosome: props.mainQueryParams.chromosome }}
              />
            )}
            {tabIndex === 0 && (
              <MainResultsTable
                rows={tableRows}
                tableTitle={props.mainQueryParams.bed_intersect ? `Intersecting by uploaded .bed file` : `Searching ${props.mainQueryParams.chromosome} in ${
                  props.mainQueryParams.assembly
                } from ${props.mainQueryParams.start.toLocaleString("en-US")} to ${props.mainQueryParams.end.toLocaleString("en-US")}`}
                itemsPerPage={10}
                titleHoverInfo={props.mainQueryParams.bed_intersect ? `${sessionStorage.getItem('filenames')}` : null}
              />
            )}
          </Grid2>
        </Grid2>
      )}
      {value === 1 && (
        <Grid2 container spacing={3}>
          <Grid2 xs={12} lg={12}>
            <CcreDetails
              accession={searchParams.get("accession")}
              region={region}
              globals={props.globals}
              assembly={props.mainQueryParams.assembly}
              genes={f?.linkedGenes}
            />
          </Grid2>
        </Grid2>
      )}
    </>
  )
}
