// Search Results Page

import TypographyCSR from "../../common/components/TypographyCSR";

// import { DataTable } from "@weng-lab/psychscreen-ui-components"

import MainQuery from "../../common/components/MainQuery";

// How can data be passed to this function? Where is it called from? The Layout?
// Can I extract the data from the current url with ? and dynamic routes
//Turns out pages have access to certain props, like searchParams https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
export default async function Search({
  // Children unused probably should be removed
  assembly,
}: {
  assembly: string;
}) {

  // data can be extracted from URL
  const res = await MainQuery("mm10")

  return (
    <main>
        <TypographyCSR contains={res.data.cCRESCREENSearch[0].start}/>
    </main>
  )
}