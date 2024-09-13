# Searching cCREs

## Query cCREs by genomic region 

Returns the cCREs in the given range, their location, and their group, zscores.

```graphql

query  {
    cCRESCREENSearch(
      assembly: "grch38"    
       coordinates: [{ chromosome: "chr11", start: 5205263, end: 5207263},{ chromosome: "chr1", start: 1205223, end: 1209243}]
    ) {
      chrom
      start
      len
      pct     
      ctcf_zscore
      dnase_zscore
      atac_zscore
      enhancer_zscore
      promoter_zscore          
    }
  }
```

## Query cCREs by max epigenetic signal

Searches for cCREs with CTCF zscore between 1 and 2.

```graphql

query  {
    cCRESCREENSearch(
      assembly: "grch38"    
      coordinates: [{ chromosome: "chr11", start: 5205263, end: 5207263},{ chromosome: "chr1", start: 1205223, end: 1209243}],
      rank_ctcf_end: 2
      rank_ctcf_start: 1
    ) {
      chrom
      start
      len
      pct     
      ctcf_zscore
      dnase_zscore
      atac_zscore
      enhancer_zscore
      promoter_zscore          
    }
  }
```

## Query cCREs by biosample-specific epigenetic signal

Returns cCREs active in GM12878 

```graphql

query  {
    cCRESCREENSearch(
      assembly: "grch38"    
      coordinates: [{ chromosome: "chr11", start: 5205263, end: 5207263},{ chromosome: "chr1", start: 1205223, end: 1209243}],
      cellType: "GM12878_ENCDO000AAK"
    ) {
      chrom
      start
      len
      pct     
      ctspecific {
          ct
          ctcf_zscore
          dnase_zscore
          h3k4me3_zscore
          h3k27ac_zscore
          atac_zscore
      }            
    }
  }

```

## Query cCREs by accession

Returns multiple cCREs by accession.

```graphql

query  {
    cCRESCREENSearch(
      assembly: "grch38"    
       accessions: ["EH38E1516972","EH38E2941920"]
    ) {
      chrom
      start
      len
      pct   
      ctcf_zscore
      dnase_zscore      
      enhancer_zscore
      promoter_zscore
      atac_zscore                 
    }
  }

```

## Get Near by genes from given cCREs

Returns 3 near by genes for a cCRE by distance.
  
```graphql
 
 query { 
  cCRESCREENSearch(
      assembly: "grch38",accessions: ["EH38E1832141","EH38E3340051"]      
    ) {
      chrom
      start
      len
      pct
      info {
        accession
      }
      nearestgenes {
        gene
        distance
      }
    }
  }

```

## Get Biosample Metadata for given assembly

Returns biosample metadata including short display name, value, ontology, life stage, sample type along with file and experiment accessions for corresponding assays for a given assembly (grch38 or mm10)

```graphql

query {
    ccREBiosampleQuery(assembly: "grch38") {
      biosamples {
        name
        ontology        
        lifeStage
        sampleType
        displayname
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")
        atac: experimentAccession(assay: "ATAC")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        atac_signal: fileAccession(assay: "ATAC")
      }
    }
  } 

```

<br />