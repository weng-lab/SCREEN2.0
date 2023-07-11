export const payload = JSON.stringify({
    "assembly": "mm10",
    "gene": "Gm25142",
    "uuid": "62ba8f8c-8335-4404-8c48-b569cf401664",
    "ct1": "C57BL/6_limb_embryo_11.5_days",
    "ct2": "C57BL/6_limb_embryo_15.5_days"
})
  
/**
 * define types for list of cell types
 */
export const initialCellTypes = {
    cellTypeInfoArr: [
        {
            assay: "DNase",
            cellTypeDesc: "with mild cognitive impairment; head of caudate nucleus tissue female adult (89 years)",
            cellTypeName: "with_mild_cognitive_impairment_head_of_caudate_nucleus_tissue_female_adult_89_years_ENCDO896WHW",
            biosample_summary: "with mild cognitive impairment; head of caudate nucleus tissue female adult (89 years)",
            biosample_type: "tissue",
            name: "head of caudate nucleus (mild cognitive impairment)",
            expID: "ENCSR334MDJ",
            isde: false,
            fileID: "ENCFF193ZCX",
            synonyms: null,
            tissue: "brain",
            rnaseq: false,
            checked: false,
            value: "with_mild_cognitive_impairment_head_of_caudate_nucleus_tissue_female_adult_89_years_ENCDO896WHW"
        },
    ]
}

/**
 * define types for cell info fetch
 */
export const initialChart = {
    Gm25142: {
        xdomain: [ 4818163.5, 5818163.5 ],
        coord: { 
            chrom: "chr11", 
            start: 5251850, 
            end: 5251956 
        },
        diffCREs: { 
            data: [{
                accession: "EM10E0493447",
                center: 4848833.5,
                len: 341,
                start: 4848663,
                stop: 4849004,
                typ: "promoter-like signature",
                value: 0.152,
                width: 4
            }] 
        },
        nearbyDEs: {
            names: [ null, "ENSMUSG00000064632.1" ],
            data: [{
                fc: 0.669, 
                gene: null, 
                start: 5520659, 
                stop: 5525893, 
                strand: '+'
            }],
            xdomain: [ 4818163.5, 5818163.5 ],
            genes: [{
                gene: "Nf2", 
                start: 4765845, 
                stop: 4849536, 
                strand: "-"
            }],
            ymin: -1.066,
            ymax: 2.958
        }
    },
    assembly: "mm10",
    gene: "Gm25142",
    ct1: "C57BL/6_limb_embryo_11.5_days",
    ct2: "C57BL/6_limb_embryo_15.5_days"
}

/**
 * define types for list of cell types
 */
export type initialCellTypesInfo = {
    cellTypeInfoArr: [
        {
            assay: string,
            cellTypeDesc: string,
            cellTypeName: string,
            biosample_summary: string,
            biosample_type: string,
            name: string,
            expID: string,
            isde: boolean,
            fileID: string,
            synonyms: string,
            tissue: string,
            rnaseq: boolean,
            checked: boolean,
            value: string
        },
    ]
}

/**
 * define types for cell info fetch
 */
export type initialChartTypes = {
    Gm25142: {
        xdomain: number[],
        coord: { 
            chrom: string, 
            start: number, 
            end: number 
        },
        diffCREs: { 
            data: [{
                accession: string,
                center: number,
                len: number,
                start: number,
                stop: number,
                typ: string,
                value: number,
                width: number
            }] 
        },
        nearbyDEs: {
            names: string[],
            data: [{
                fc: number, 
                gene: string, 
                start: number, 
                stop: number, 
                strand: string
            }],
            xdomain: number[],
            genes: [{
                gene: string, 
                start: number, 
                stop: number, 
                strand: string
            }],
            ymin: number,
            ymax: number
        }
    },
    assembly: string,
    gene: string,
    ct1: string,
    ct2: string
}