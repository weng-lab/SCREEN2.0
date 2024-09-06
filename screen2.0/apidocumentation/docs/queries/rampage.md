# Get RAMPAGE data

## Get RAMPAGE data for a given gene

**NOTE: RAMPAGE data is only available for GRCh38**

Returns RAMPAGE data for the OR51B4 gene.

```graphql
  query  {
  tssrampageQuery(genename: "OR51B4"
) {
    start
    geneName
    organ
    locusType
    strand
    peakId
    biosampleName
    biosampleType
    biosampleSummary   
    expAccession
    value
    start
    end 
    chrom 
  }
}
```
<br />