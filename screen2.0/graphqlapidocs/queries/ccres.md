# Searching cCREs

## Query cCREs by genomic region 

Returns the cCREs in the given range, their location, and their group, zscores.

```graphql
query  {
    cCRESCREENSearch(
      assembly: "GRCh38"      
      coord_chrom: "chr11"
      coord_end: 5207263
      coord_start: 5205263   
      rank_atac_end: 10
      rank_atac_start: -10
      rank_ctcf_end: 10
      rank_ctcf_start: -10
      rank_dnase_end: 10
      rank_dnase_start: -10
      rank_enhancer_end: 10
      rank_enhancer_start: -10
      rank_promoter_end: 10
      rank_promoter_start: -10
     
    ) {
      chrom
      start
      len
      pct     
      ctcf_zscore
      dnase_zscore
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
      assembly: "GRCh38"      
      coord_chrom: "chr11"
      coord_end: 5207263
      coord_start: 5205263   
      rank_atac_end: 10
      rank_atac_start: -10
      rank_ctcf_end: 2
      rank_ctcf_start: 1
      rank_dnase_end: 10
      rank_dnase_start: -10
      rank_enhancer_end: 10
      rank_enhancer_start: -10
      rank_promoter_end: 10
      rank_promoter_start: -10
     
    ) {
      chrom
      start
      len
      pct     
      ctcf_zscore
      dnase_zscore
      enhancer_zscore
      promoter_zscore          
    }
  }
```

## Query cCREs by biosample-specific epigenetic signal

Returns cCREs active in K562 
```graphql
query  {
    cCRESCREENSearch(
      assembly: "GRCh38"      
      coord_chrom: "chr11"
      coord_end: 5207263
      coord_start: 5205263   
      rank_atac_end: 10
      rank_atac_start: -10
      rank_ctcf_end: 10
      rank_ctcf_start: -10
      rank_dnase_end: 10
      rank_dnase_start: -10
      rank_enhancer_end: 10
      rank_enhancer_start: -10
      rank_promoter_end: 10
      rank_promoter_start: -10
      cellType:"GM12878_ENCDO000AAK"
     
    ) {
      chrom    
      start
      len
      pct     
      ctspecific{
        ct
        ctcf_zscore
        dnase_zscore
        h3k4me3_zscore
        h3k27ac_zscore
      }         
    }
  }
```

## Query cCREs by accession

Returns multiple cCREs by accession.

```graphql
query  { 
  cCREQuery(accession: ["EH38E1516972","EH38E2941922"], assembly: "GRCh38") { 
    coordinates {
        start
        end
        chromosome
      } 
      rDHS
      assembly
    }
}
```

## Query cCREs with nearby genes

Returns nearby genes of each cCRE.
```graphql
query  {
    cCRESCREENSearch(
      assembly: "GRCh38"      
      coord_chrom: "chr11"
      coord_end: 5207263
      coord_start: 5205263   
      rank_atac_end: 10
      rank_atac_start: -10
      rank_ctcf_end: 10
      rank_ctcf_start: -10
      rank_dnase_end: 10
      rank_dnase_start: -10
      rank_enhancer_end: 10
      rank_enhancer_start: -10
      rank_promoter_end: 10
      rank_promoter_start: -10
      nearbygenesdistancethreshold: 1000000,
  		nearbygeneslimit: 4
    ) {
      chrom    
      start
      len
      pct     
       genesallpc {
        accession
        all {
          end
          start
          chromosome
          assembly
          intersecting_genes {
            name
          }
        }
        pc {
          end
          assembly
          chromosome
          start
          intersecting_genes {
            name
          }
        }
      }     
    }
  }
```

<br />