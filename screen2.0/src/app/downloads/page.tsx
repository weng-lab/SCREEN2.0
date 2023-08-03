import * as React from 'react';
import DownloadsPage from './downloads';
import { biosampleQuery } from '../../common/lib/queries';
import { ThemeProvider } from '@mui/material';
import { defaultTheme } from '../../common/lib/themes';


export default async function Downloads() {
  const biosamples: any = await biosampleQuery()

  return (
    <main>
      <DownloadsPage biosamples={biosamples} />
    </main>
  )
}
