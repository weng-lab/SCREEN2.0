"use client"
import React, { useEffect } from "react"
import { Tab, Tabs, Typography } from "@mui/material"
import MainResultsTable from "../../common/components/MainResultsTable"
import MainResultsFilters from "../../common/components/MainResultsFilters"
import { CcreDetails } from "./ccredetails/ccredetails"
import Grid2 from "../../common/mui-client-wrappers/Grid2"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import styled from "@emotion/styled"
import { MainResultTableRows } from "./types"
export const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
}))
export const CcreSearch = (props: { mainQueryParams, ccrerows: MainResultTableRows, globals, assembly }) => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const [value, setValue] = React.useState(searchParams.get("accession") ? 1 : 0)

  const handleChange = (_, newValue: number) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (searchParams.get("accession")) {
      setValue(1)
    }
  }, [searchParams])

  //Need meaningful variable names please, is showing that this is undefined and throwing an error when using back button on details page since accession is undefined
  let f = props.ccrerows.find((c) => c.accession === searchParams.get("accession"))
  const region = { start: f?.start, chrom: f?.chromosome, end: f?.end }
  // console.log(f)

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
            <MainResultsTable
              rows={props.ccrerows}
              tableTitle={`Searching ${props.mainQueryParams.chromosome} in ${
                props.mainQueryParams.assembly
              } from ${props.mainQueryParams.start.toLocaleString("en-US")} to ${props.mainQueryParams.end.toLocaleString("en-US")}`}
              itemsPerPage={10}
            />
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
              assembly={props.assembly}
              genes={f.linkedGenes}
            />
          </Grid2>
        </Grid2>
      )}
    </>
  )
}
