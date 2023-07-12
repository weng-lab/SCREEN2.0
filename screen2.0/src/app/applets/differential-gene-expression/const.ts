export const GENE_AUTOCOMPLETE_QUERY = `
  query ($assembly: String!, $name_prefix: [String!], $limit: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit) {
      name
      id
      coordinates {
        start
        chromosome
        end
      }
    }
  }  
`

export const payload = JSON.stringify({
    assembly: "mm10",
    gene: "Gm25142",
    uuid: "62ba8f8c-8335-4404-8c48-b569cf401664",
    ct1: "C57BL/6_limb_embryo_11.5_days",
    ct2: "C57BL/6_limb_embryo_15.5_days",
})
  
export const initialGeneList = {
    chrom: "chr3",
    start: 108107280,
    end: 108146146,
    id: "ENSMUSG00000000001.4",
    name: "Gm25142",
}
  
/**
 * define types for cell info fetch - geneID is name cant set type
 */
export const initialChart = {
    Gm25142: {
      xdomain: [4818163.5, 5818163.5],
      coord: {
        chrom: "chr11",
        start: 5251850,
        end: 5251956,
      },
      diffCREs: {
        data: [
          {
            accession: "EM10E0493447",
            center: 4848833.5,
            len: 341,
            start: 4848663,
            stop: 4849004,
            typ: "promoter-like signature",
            value: 0.152,
            width: 4,
          },
        ],
      },
      nearbyDEs: {
        names: [null, "ENSMUSG00000064632.1"],
        data: [
          {
            fc: 0.669,
            gene: null,
            start: 5520659,
            stop: 5525893,
            strand: "+",
          },
        ],
        xdomain: [4818163.5, 5818163.5],
        genes: [
          {
            gene: "Nf2",
            start: 4765845,
            stop: 4849536,
            strand: "-",
          },
        ],
        ymin: -1.066,
        ymax: 2.958,
      },
    },
    assembly: "mm10",
    gene: "Gm25142",
    ct1: "C57BL/6_limb_embryo_11.5_days",
    ct2: "C57BL/6_limb_embryo_15.5_days",
}