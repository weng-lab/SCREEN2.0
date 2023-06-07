// Search Results Page

import TypographyCSR from "../../common/components/TypographyCSR";

// import { DataTable } from "@weng-lab/psychscreen-ui-components"

import MainQuery from "../../common/components/MainQuery";

//Should the query be a prop of the search function here?
//So we can fetch stuff in a server component, but passing it to a client-rendered component is the issue. Can this be done?
//If we can force the server component to send the original request, maybe with that server-only code, we can also send the request client-side but it will be deduped, in effect, making the data fetching server only
// Challenge 1: Passing unknown data from a client-rendered component to a server component - MOSTLY? DONE
// Challenge 2: Passing that data from the server to a client-rendered component
// How can data be passed to this function? Where is it called from? The Layout?
// Can I extract the data from the current url with ? and dynamic routes
//Turns out pages have access to certain props, like searchParams https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
export default async function Search({
  // Children unused probably should be removed
  assembly,
}: {
  assembly: string;
}) {

  const res = await MainQuery("mm10")

  return (
    <main>

        <TypographyCSR contains={res.data.cCRESCREENSearch[0].start}/>
    </main>
  )
}