'use client'
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import  { TOP_TISSUES } from "./queries"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { z_score, ctgroup } from "./utils"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { CircularProgress } from '@mui/material';

type cCRERow = {
    ct?: string,
    dnase: number,
    h3k4me3: number,
    h3k27ac: number,
    ctcf: number,
    group: any
}    

const tableCols = (globals,showGroup=true) => {
    let cols = [
    { header: "Cell Type", 
    value: (row: cCRERow) => globals.byCellType[row.ct] && globals.byCellType[row.ct][0] ? globals.byCellType[row.ct][0]["biosample_summary"] : "" },
    {
      header: "DNase Z-score",
      value: (row: cCRERow) => row.dnase,
      render: (row: cCRERow) => z_score(row.dnase)
    },
    {
        header: "H3K4me3 Z-score",
        value: (row: cCRERow) => row.h3k4me3,
        render: (row: cCRERow) => z_score(row.h3k4me3)
    },{
        header: "H3K27ac Z-score",
        value: (row: cCRERow) => row.h3k27ac,
        render: (row: cCRERow) => z_score(row.h3k27ac)
    },{
        header: "CTCF Z-score",
        value: (row: cCRERow) => row.ctcf,
        render: (row: cCRERow) => z_score(row.ctcf)
    }
  ]
    if(showGroup) { 
        cols.push(
            {
                header: "Group",
                value: (row: cCRERow) => row.group,
                render: (row: cCRERow) => ctgroup(row.group)
            })
    }
    
  return cols
}    

const ctAgnosticColumns = () =>  [
    { header: "Cell Type", 
    value: () => "cell type agnostic" },
    {
      header: "DNase max-Z",
      value: (row: cCRERow) => row.dnase,
      render: (row: cCRERow) => z_score(row.dnase)
    },
    {
        header: "H3K4me3 max-Z",
        value: (row: cCRERow) => row.h3k4me3,
        render: (row: cCRERow) => z_score(row.h3k4me3)
    },{
        header: "H3K27ac max-Z",
        value: (row: cCRERow) => row.h3k27ac,
        render: (row: cCRERow) => z_score(row.h3k27ac)
    },{
        header: "CTCF max-Z",
        value: (row: cCRERow) => row.ctcf,
        render: (row: cCRERow) => z_score(row.ctcf)
    },
    {
        header: "Group",
        value: (row: cCRERow) => row.group,
        render: (row: cCRERow) => ctgroup(row.group)
    }
  ]   

export const InSpecificBiosamples = ({accession, globals, assembly}) =>{
   
      const { loading: loading_toptissues, error: error_toptissues, data: data_toptissues } = useQuery(TOP_TISSUES,
        {
          variables: {
            assembly: assembly.toLowerCase(),
            accession: [ accession ]
          },
          fetchPolicy: 'cache-and-network',
          nextFetchPolicy: 'cache-first',       
          client 
        }
      )  
     let withdnase,typea,typec
     if(data_toptissues){

        let r  = data_toptissues.ccREBiosampleQuery.biosamples
        let ctcfdata = r.map((rs)=>{  return rs.cCREZScores.filter(d=>d.assay.toLowerCase()==='ctcf').map((c)=>{  return { score: c.score, ct: rs.name, tissue: rs.ontology } })   }) 
    
        let d = ctcfdata.filter(s=>s.length>0).flat()
    
        let c = {}
        d.forEach(g=>{
            c[g.ct] = {ctcf: g.score, tissue: g.tissue}
        })  

        let dnasedata = r.map((rs)=>{  return rs.cCREZScores.filter(d=>d.assay.toLowerCase()==='dnase').map((c)=>{  return { score: c.score, ct: rs.name, tissue: rs.ontology } })   }) 

        let dnase = dnasedata.filter(s=>s.length>0).flat()

        let dn = {}
        dnase.forEach(g=>{
            dn[g.ct] = {dnase: g.score, tissue: g.tissue}
        })

        let h3k4me3data = r.map((rs)=>{  return rs.cCREZScores.filter(d=>d.assay.toLowerCase()==='h3k4me3').map((c)=>{  return { score: c.score, ct: rs.name, tissue: rs.ontology } })   }) 

        let h3k4me3 = h3k4me3data.filter(s=>s.length>0).flat()

        let h3 = {}
        h3k4me3.forEach(g=>{
            h3[g.ct] = {h3k4me3: g.score, tissue: g.tissue}
        })

        let h3k27acdata = r.map((rs)=>{  return rs.cCREZScores.filter(d=>d.assay.toLowerCase()==='h3k27ac').map((c)=>{  return { score: c.score, ct: rs.name, tissue: rs.ontology } })   }) 

        let h3k27ac = h3k27acdata.filter(s=>s.length>0).flat()

        let h3k = {}
        h3k27ac.forEach(g=>{
            h3k[g.ct] = {h3k27ac: g.score, tissue: g.tissue}
        })

        let typedata = r.map(d=>{ return { ct: d.name, tissue: d.ontology, dnase: d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="dnase") ? d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="dnase").score : -11.0, ctcf: d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="ctcf") ? d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="ctcf").score : -11.0, h3k4me3: d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="h3k4me3") ? d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="h3k4me3").score : -11.0, h3k27ac: d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="h3k27ac") ? d.cCREZScores.find(cz=> cz.assay.toLowerCase()==="h3k27ac").score : -11.0  }})

        let igroup = data_toptissues.cCREQuery[0].group;
        let ccreCts = typedata.map(t => {
            let group = igroup
            if(t.dnase <= 1.64 && t.dnase != -11.0)
                    group = "ylowdnase"
            if(igroup == "PLS")
            {
                if(t.h3k4me3 > 1.64) group = "PLS"
                if(t.h3k27ac > 1.64) group= "pELS"
            } else {
                if(t.h3k27ac > 1.64) {
                    if(igroup==="pELS")
                    {
                        group= "pELS"
                    } else {
                        group= "dELS"
                    }
                }
                if(t.h3k4me3 > 1.64) group= "CA-H3K4me3"
            }        
            if(t.ctcf > 1.64)  group ="ctcf"
            if(-11.0 ===t.dnase) group = "zunclassified"
            if(t.dnase > 1.64) {
                group = "dnase"
            } else { group = "ylowdnase"}

            let type = ""
            if(t.dnase!==-11.0){
                type = "withdnase"
            } else {
                type = "typec"
            }
            if(t.dnase!==-11.0 && t.ctcf!==-11.0 && t.h3k27ac!==-11.0 && t.h3k4me3!==-11.0){
                type = "typea"
            }
            return {...t, type, group}
        })
    
        withdnase = ccreCts.filter(c=>c.type==="withdnase")
        typea = ccreCts.filter(c=>c.type==="typea")
        typec = ccreCts.filter(c=>c.type==="typec")

     }
    return(<>
    {loading_toptissues || error_toptissues ? 
        <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>
            <Grid2 xs={12} lg={12}>        
                <CircularProgress/>
            </Grid2>
        </Grid2> :
        <>
        <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>       
            
            <Grid2 xs={12} lg={12}>
                {data_toptissues && <DataTable
                    rows={[{...data_toptissues.cCREQuery[0]}]}
                    tableTitle="Cell type agnostic classification"
                    columns={ctAgnosticColumns()}
                    sortColumn={1}
                />}
            </Grid2>
        </Grid2>
        <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>       
            <Grid2 xs={12} lg={12}>
            {withdnase && <DataTable
                    columns={tableCols(globals)}
                    sortColumn={1}
                    tableTitle="Classification in Type B and D biosamples (DNase-seq available)"
                    rows={withdnase}
                    itemsPerPage={5}
                    
                />}
            </Grid2>
        </Grid2>

        
        <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>
            <Grid2 xs={6} lg={6}>        
                {typea && <DataTable
                    columns={tableCols(globals)}
                    tableTitle="Classification in Type A biosamples (all four marks available)"
                    rows={typea}
                    sortColumn={1}
                    itemsPerPage={5}
                    
                />}
            </Grid2>
            <Grid2 xs={6} lg={6}>
                
                {typec && <DataTable
                    columns={tableCols(globals,false)}
                    tableTitle="Classification in Type C biosamples (DNase-seq not available)"
                    rows={withdnase}
                    sortColumn={4}
                    itemsPerPage={5}
                    
                />}
            </Grid2>
        </Grid2>
        
        

    

    </>}</>)
}