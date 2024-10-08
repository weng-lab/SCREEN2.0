# Getting cCRE details

## Query a max Z scores of a cCRE 

Returns a cell type agnostic max Z scores of a cCRE 

```graphql

query {
  cCREQuery(assembly: "grch38", accession: "EH38E2941922") {
    accession
    group
    dnase: maxZ(assay: "DNase")
    h3k4me3: maxZ(assay: "H3K4me3")
    h3k27ac: maxZ(assay: "H3K27ac")
    ctcf: maxZ(assay: "CTCF")
    atac: maxZ(assay: "ATAC")
    
  }
}

```

## Get biosample-specific epigenetic signals

Returns all biosample-specific signals for a given cCRE.

```graphql
query {
   ccREBiosampleQuery(assembly: "grch38") {
    biosamples {
      sampleType
      cCREZScores(accession: "EH38E2941922") {
        score
        assay
        experiment_accession        
      }
      name
      ontology      
    }    
  }
}
```


## Get nearby genomic features

Returns nearby genomic features (genes, cCRES and SNPs)  for a single cCRE (based on genomic region).

```graphql

query {
  gene(chromosome: "chr11", start: 4291251, end: 6291587, assembly: "grch38") {
    name
    id
    strand
    coordinates {
      chromosome
      start
      end
    }
     transcripts {
        id
        coordinates {
          chromosome
          start
          end
        }
      }
  }
  cCREQuery(assembly: "grch38", coordinates:  { chromosome:"chr11", start:4291251,end:6291587 }) {
    accession
    coordinates {
      chromosome
      start
      end
    }
    group
  }
  snpQuery(coordinates: { chromosome:"chr11", start:4291251, end:6291587 }, assembly: "hg38", common: true) {
    id
    coordinates {
      chromosome
      start
      end
    }
  }
}
```

## Get orthologous cCREs in another assembly

Returns orthogolous cCREs in mm10 for a given grch38 cCRE or vice versa.

```graphql

query  {
  orthologQuery(accession: "EH38E2941922", assembly: "grch38") {
    assembly
    accession
    ortholog {
      stop
      start
      chromosome
      accession      
    }    
  }
}

```

## Get linked genes

Returns linked genes for a cCRE by various methods like Intact-HiC, CRISPR, eQTLs, RNAPII-ChIAPET and CTCF-ChIAPET.
  
```graphql

query {
  linkedGenesQuery(assembly: "grch38", accession: ["EH38E1516972"]) {
      accession  
      p_val
      gene
      geneid
      genetype
      method
      grnaid
      effectsize
      assay
      celltype
      experiment_accession
      tissue
      variantid
      source
      slope
      score
      displayname
    }
}
```
## Get ENTEx data for given cCRE

Returns ENTEx data for input accession

```graphql

query {
  entexQuery(accession: "EH38E1310345"){
    assay
    accession
    hap1_count
    hap2_count
    hap1_allele_ratio
    p_betabinom
    experiment_accession
    tissue
    donor    
    imbalance_significance
  }
}

```

## Get ENTEx Active Annotations for given cCRE genomic region 

Returns ENTEx active tissues and supoorting assays for input accession genomic coordinates

```graphql

query {
    entexActiveAnnotationsQuery(coordinates:  { chromosome: "chr1", start: 1000068, end: 1000409 }) {
        tissue
        assay_score
    }
}

```


# Try it out

What query would you use to get the max H3K27ac Z-score for nearby cCREs for `EH38E2941922`?

<details>
<summary>See answer</summary>

```graphql
query {
  cCREQuery(assembly: "GRCh38", accession: "EH38E2941922") {
    accession
    group
    h3k27ac: maxZ(assay: "H3K27ac")    
  }
}
```
</details>

<br />
