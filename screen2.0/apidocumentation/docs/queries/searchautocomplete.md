# Getting data required to autcomplete gene,snp,ccre  search

**NOTE: Due to performance limitations, its recommended to use limit input parameter with these autocomplete queries**

## Query matching genes starting with give name prefix  

Returns gene names matching given name prefix along with genomic region.

```graphql
query {
    gene(assembly: "grch38", name_prefix: "so", limit: 1000) {
      name
      id
      coordinates {
        start
        chromosome
        end
      }
    }
  }  
 
```

## Query matching cCRE accessions starting with give name prefix  

Returns cCRE accessions matching given name prefix along with genomic region.

```graphql

query  {
    cCREQuery(accession_prefix: "EH38E", assembly: "GRCh38", limit: 1000) {
        accession
      coordinates {
        start
        end
        chromosome
      }
    }
}

```

## Query matching SNP ids starting with give name prefix  

Returns SNP ids matching given name prefix along with genomic region.

```graphql
query {
     snpAutocompleteQuery(snpid: "rs78", assembly: "grch38") {
         id
         coordinates {
             chromosome
             start
             end
         }
     }
 }
 

```
<br />
