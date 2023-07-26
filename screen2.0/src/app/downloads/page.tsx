import * as React from 'react';
import DownloadsPage from './downloads';
import { biosampleQuery } from '../../common/lib/queries';


export default async function Downloads() {
  const biosamples: any = await biosampleQuery()

  return (
    <main>
      <DownloadsPage biosamples={biosamples}/>
    </main>
  )
}
