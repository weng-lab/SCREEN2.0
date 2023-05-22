'use client'
import React from "react"
import { Typography } from "@mui/material"
import TabAbout from "./tab_about"

// export default function About() {
//   return (
//     <main>
//       <Typography>
//           This is the about page
//       </Typography>
//       <TabAbout></TabAbout>
//     </main>
//   )
// }

export default function About() {
  return (
    <main>
      <TabAbout/>
    </main>
  )
}

// const MainTabsConfig = () => {
//   return {
//     main: { title: "Overview", visible: true, f: TabMain },
//     about: { title: "About", visible: true, f: TabAbout },
//     ucsc: { title: "UCSC Genome Browser", visible: true, f: TabUCSC },
//     tutorial: { title: "Tutorials", visible: true, f: TabTutorial },
//     files: { title: "Downloads", visible: true, f: TabFiles },
//     cversions: { title: "cCRE Versions", visible: false, f: TabCCREVersions },
//     versions: { title: "Versions", visible: true, f: TabVersions },
//     query: { title: "Query Results", visible: false, f: TabQuery },
//     /*api: {title: "API", visible: true, f: TabAPI}*/
//   }
// }

// export default MainTabsConfig