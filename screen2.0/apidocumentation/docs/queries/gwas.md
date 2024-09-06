# Fetching genome-wide association Studies data

## Query genome-wide association studies 

Returns all GWAS studies along with author, pubmedid

```graphql

query getAllGWASStudies {
  getAllGwasStudies {
    study
    totalldblocks    
    author
    pubmedid
    studyname    
  }
}

```

## Query SNPs for given genome-wide association study 

Returns SNPs, genomic regions, rsquare value for given study

```graphql

query {
  getSNPsforGWASStudies(study: "Ahola-Olli_AV-27989323-Eotaxin_levels") {
    snpid
    ldblock
    rsquare
    chromosome
    stop
    start
    ldblocksnpid
  }
}

```

## Query GWAS celltype enrichment data

Returns celltype enrichment data for given study value

```graphql

query {
    getGWASCtEnrichmentQuery(study: "Ahola-Olli_AV-27989323-Eotaxin_levels") {
      celltype    
      accession
      fc
      fdr
      pvalue
    }
  }

```

<br />