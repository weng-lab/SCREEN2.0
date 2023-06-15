
'use client'
import React, { useEffect } from 'react'
import { Tab, Tabs } from "@mui/material"
import MainResultsTable from "../../common/components/MainResultsTable"
import MainResultsFilers from "../../common/components/MainResultsFilters"
import { CcreDetails } from "./ccredetails/ccredetails"
import Grid2 from "../../common/mui-client-wrappers/Grid2"
import { useSearchParams } from 'next/navigation'
import styled from '@emotion/styled';
export const StyledTab = styled(Tab)(() => ({
    textTransform:'none'
  }));
export const CcreSearch = ({ mainQueryParams, ccrerows, globals, assembly}) =>{
    const searchParams: any = useSearchParams()!
    const [value, setValue] = React.useState(0);
    const handleChange = (_, newValue: number) => {
        setValue(newValue);
    };
    useEffect(()=>{
        if(searchParams.get('accession'))
        {
            setValue(1)
        }

    },[searchParams])
    
    let f  =  ccrerows.find(c=>c.accession===searchParams.get('accession'))  
    const region = {start: f?.start, chrom: f?.chromosome, end: f?.end}
    return (
        <>
        <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>
            <Grid2 xs={12} lg={12}>
            <Tabs aria-label="basic tabs example" value={value} onChange={handleChange}>
                <StyledTab label="cCRE Search Results"  />      
                {searchParams.get('accession') && <StyledTab label="cCRE Details"/>}                
            </Tabs>
            </Grid2>
        </Grid2>     
        {value===0 && <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
            <Grid2 xs={12} lg={3}>
                <MainResultsFilers mainQueryParams={mainQueryParams} />
            </Grid2>
            <Grid2 xs={12} lg={9}>
                <MainResultsTable
                    rows={ccrerows}
                    tableTitle={`Searching ${mainQueryParams.chromosome} in ${mainQueryParams.assembly} from ${mainQueryParams.start.toLocaleString(
                    "en-US"
                    )} to ${mainQueryParams.end.toLocaleString("en-US")}`}
                    itemsPerPage={10}
                />
            </Grid2>
        </Grid2>}
        {value===1 && <Grid2 container spacing={3} >
            <Grid2 xs={12} lg={12}>
                <CcreDetails accession={searchParams.get('accession')} region={region} globals={globals} assembly={assembly}/>
            </Grid2>
            
        </Grid2>}
  </>)
}