import * as React from "react"
import DownloadsPage from "./downloads"
import { biosampleQuery } from "../../common/lib/queries"

export default async function Downloads({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const biosamples = await biosampleQuery()
  return (
    <main>
      <DownloadsPage biosamples={biosamples} searchParams={searchParams} />
    </main>
  )
}
