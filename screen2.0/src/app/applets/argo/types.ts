import { RegistryBiosample } from "../../_biosampleTables/types"

export type LinkedGenes = {
    gene_id: string
    method: string
    tpm: number
}

export type ZScores = {
    accession: string
    user_id: string
    linked_genes: LinkedGenes[]
    dnase: number
    dnase_rank: number
    h3k4me3: number
    h3k4me3_rank: number
    h3k27ac: number
    h3k27ac_rank: number
    ctcf: number
    ctcf_rank: number
    atac: number
    atac_rank: number
    "Intact-HiC": number
    "Intact-HiC_rank": number
    "CTCF-ChIAPET": number
    "CTCF-ChIAPET_rank": number
    "RNAPII-ChIAPET": number
    "RNAPII-ChIAPET_rank": number
    "CRISPRi-FlowFISH": number
    "CRISPRi-FlowFISH_rank": number
    "eQTLs": number
    "eQTLs_rank": number
    aggRank?: number
}

export type GenomicRegion = {
    chr: string
    start: number
    end: number
}

export type RankedRegions = (GenomicRegion & {rank: number})[]

export type CCREClasses = {
    CA: boolean
    CACTCF: boolean
    CAH3K4me3: boolean
    CATF: boolean
    dELS: boolean
    pELS: boolean
    PLS: boolean
    TF: boolean
}

export type CCREAssays = {
    DNase: boolean
    ATAC: boolean
    CTCF: boolean
    H3K4me3: boolean
    H3K27ac: boolean
}

export type FilterState = {
    useConservation: boolean;
    alignment: string;
    rankBy: string;
    useMotifs: boolean;
    motifCatalog: "factorbook" | "factorbookTF" | "hocomoco" | "zMotif";
    numOverlappingMotifs: boolean;
    motifScoreDelta: boolean;
    overlapsTFPeak: boolean;
    usecCREs: boolean;
    cCREAssembly: "GRCh38" | "mm10";
    mustHaveOrtholog: boolean;
    selectedBiosample: RegistryBiosample | null;
    assays: CCREAssays;
    availableAssays: CCREAssays;
    classes: CCREClasses;
    useGenes: boolean;
  }

export type UpdateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
) => void;