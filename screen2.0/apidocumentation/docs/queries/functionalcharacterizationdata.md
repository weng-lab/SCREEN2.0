# Getting Functional Characterization Details

## Query VISTA enhancer regions

Returns VISTA enhancer regions with tissues,result and element id 

```graphql
query  {
  functionalCharacterizationQuery(assembly: "grch38", coordinates:  { chromosome: "chr11", start: 5291251, end: 5291587 }) {
    tissues
    element_id
    assay_result
    chromosome
    stop
    start
  }
}
```

## Get MPRA Regions

Returns MPRA regions for given genomic region.

```graphql
query {
  mpraFccQuery(coordinates: {  
    chromosome: "chr11",
    start: 5291251,
    end: 5291587  
}) {
    celltype
    chromosome
    stop
    start
    assay_type
    element_location
    series
    strand
    log2fc
    experiment
    barcode_location    
  }
}

```


## Get STARR-seq CAPRA Quantification (solo and double fragments)


Returns STARR-seq CAPRA Quantification (solo fragments) for a single cCRE.

```graphql
query {
  capraFccSoloQuery(accession: ["EH38E2941922"]) {
    rdhs
    log2fc
    fdr
    dna_rep1
    rna_rep1
    rna_rep2
    rna_rep3
    pvalue
    experiment    
  }
}

```

Returns STARR-seq CAPRA Quantification (double fragments) for a single cCRE.

```graphql
query  {
  capraFccDoubleQuery(accession: ["EH38E2941922"]) {
    rdhs_p1
    rdhs_p2
    log2fc
    fdr
    dna_rep1
    rna_rep1
    rna_rep2
    rna_rep3
    pvalue
    experiment    
  }
}
```

<br />
