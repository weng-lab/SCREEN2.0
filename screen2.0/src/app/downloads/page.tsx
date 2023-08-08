import * as React from 'react';
import DownloadsPage from './downloads';
import { UMAPQuery, biosampleQuery } from '../../common/lib/queries';
import { ThemeProvider } from '@mui/material';
import { defaultTheme } from '../../common/lib/themes';
import { ApolloQueryResult } from '@apollo/client';


export default async function Downloads({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const biosamples: any = await biosampleQuery()
  //I would feed the data from searchParams into the fetch here. I think all that needs to be done is to push the relevant info to the ULR on the matrices tab
  const assembly = searchParams.assembly === "Human" ? "grch38" : "mm10"
  const assay = (searchParams.assay === "DNase" || searchParams.assay === "H3K4me3" || searchParams.assay === "H3K27ac" || searchParams.assay === "CTCF") ? searchParams.assay : "DNase"

  const matrices: any = await UMAPQuery(assembly, assay)
 
  return (
    <main>
      <DownloadsPage biosamples={biosamples} matrices={matrices} searchParams={searchParams}/>
    </main>
  )
}
