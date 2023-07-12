export const initialStudy = {
  Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm: {
    gwas_study: {
      value: "Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm",
      author: "Gretarsdottir S",
      pubmed: "20622881",
      trait: "Abdominal aortic aneurysm",
      total_ldblocks: 2,
      hasenrichment: false,
    },
    mainTable: [
      {
        totalLDblocks: 2,
        numLdBlocksOverlap: 2,
        numLdBlocksOverlapFormat: "2 (100%)",
        numCresOverlap: [11],
      },
    ],
    topCellTypes: [],
    cres: {
      _all: {
        accessions: [
          {
            accession: "EH38E2724033",
            snps: ["rs10818576"],
            info: {
              accession: "EH38E2724033",
              isproximal: true,
              k4me3max: 3.083,
              k27acmax: 3.392,
              ctcfmax: 1.982,
              concordant: false,
            },
            geneid: "DAB2IP",
            start: 121650654,
            stop: 121650827,
            chrom: "chr9",
            gene_all_id: [56110, 56108, 56111, 56109, 56112],
            gene_pc_id: [56098, 56110, 56104, 56100, 56115],
            cts: 0,
            ctspecifc: {
              dnase_zscore: null,
              promoter_zscore: null,
              enhancer_zscore: null,
              ctcf_zscore: null,
            },
            "dnase zscore": "",
            "enhancer zscore": "",
            "promoter zscore": "",
            genesallpc: { all: [Array], pc: [Array], accession: "EH38E2724033" },
          },
        ],
      },
    },
  },
}

export const initialstudies = {
  gwas: {
    studies: [
      {
        Huang_KC_26169365_Yu_Zhi_constitution_type_in_type_2_diabetes: {
          value: "Huang_KC_26169365_Yu_Zhi_constitution_type_in_type_2_diabetes",
          author: "Huang KC",
          pubmed: "26169365",
          trait: "Yu-Zhi constitution type in type 2 diabetes",
          total_ldblocks: 11,
          hasenrichment: false,
        },
      },
    ],
  },
}
