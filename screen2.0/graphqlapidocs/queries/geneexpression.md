# Getting gene expression data

## Get gene expression for all biosamples for a given gene

Returns gene id data for the OR51B4 gene.

```graphql

query  {
  gene(assembly: "grch38", name: ["OR51B4"]) {
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

Returns gene expression data for the OR51B4 gene (based on gene id).

```graphql

query {
  gene_dataset {
    biosample
    tissue
    cell_compartment
    biosample_type
    assay_term_name
    accession
    gene_quantification_files(assembly: "GRCh38") {
      accession
      quantifications(gene_id_prefix: "ENSG00000183251") {
        tpm
        file_accession             
      }      
    }    
  }
}

```
<br />
