import { SelectChangeEvent } from "@mui/material"
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

export type InputRegions = (GenomicRegion & {regionID: number})[]

export type CCREs = (GenomicRegion & {
    accession: string
    inputRegion: GenomicRegion
    regionID: number
})[]

export type CCREClasses = {
    CA: boolean
    "CA-CTCF": boolean
    "CA-H3K4me3": boolean
    "CA-TF": boolean
    dELS: boolean
    pELS: boolean
    PLS: boolean
    TF: boolean
}

export type CCREAssays = {
    dnase: boolean
    atac: boolean
    ctcf: boolean
    h3k4me3: boolean
    h3k27ac: boolean
}

export type Alignment = 
    "241-mam-phyloP" | 
    "447-mam-phyloP" | 
    "241-mam-phastCons" |
    "43-prim-phyloP" |
    "43-prim-phastCons" |
    "243-prim-phastCons" |
    "100-vert-phyloP" |
    "100-vert-phastCons"

  export type SequenceFilterState = {
    useConservation: boolean;
    alignment: Alignment;
    rankBy: string;
    useMotifs: boolean;
    motifCatalog: "factorbook" | "factorbookTF" | "hocomoco" | "zMotif";
    numOverlappingMotifs: boolean;
    motifScoreDelta: boolean;
    overlapsTFPeak: boolean;
  }

  export type ElementFilterState = {
    usecCREs: boolean;
    cCREAssembly: "GRCh38" | "mm10";
    mustHaveOrtholog: boolean;
    selectedBiosample: RegistryBiosample | null;
    assays: CCREAssays;
    rankBy: "avg" | "max";
    availableAssays: CCREAssays;
    classes: CCREClasses;
  }

  export type GeneFilterState = {
    useGenes: boolean;
    idk: string;
  }

type UpdateSequenceFilter = <K extends keyof SequenceFilterState>(
    key: K,
    value: SequenceFilterState[K]
) => void;

type UpdateElementFilter = <K extends keyof ElementFilterState>(
    key: K,
    value: ElementFilterState[K]
) => void;

type UpdateGeneFilter = <K extends keyof GeneFilterState>(
    key: K,
    value: GeneFilterState[K]
) => void;

export type FilterProps = {
    sequenceFilterVariables: SequenceFilterState;
    elementFilterVariables: ElementFilterState;
    geneFilterVariables: GeneFilterState;
    updateSequenceFilter: UpdateSequenceFilter;
    updateElementFilter: UpdateElementFilter;
    updateGeneFilter: UpdateGeneFilter;
    toggleAssay: (assayName: keyof ElementFilterState['assays']) => void;
    toggleClass: (className: keyof ElementFilterState['classes']) => void;
    drawerOpen: boolean;
    toggleDrawer: () => void;
}

export type UploadProps = {
    selectedSearch: string;
    handleSearchChange: (event: SelectChangeEvent) => void;
    onRegionsConfigured: (regions: GenomicRegion[]) => void;
}

export type MainTableRow = {
    regionID: number
    inputRegion: GenomicRegion
    aggregateRank?: number
    sequenceRank?: number
    elementRank?: number
    geneRank?: number
}

export type SequenceTableRow = {
    inputRegion: GenomicRegion
    conservationScore?: number
    numOverlappingMotifs?: number
    motifScoreDelta?: number
}

export type ElementTableRow = {
    regionID: number
    inputRegion: GenomicRegion
    chr: number
    start: number
    end: number
    accession: string
    ortholog?: string
    class: string
    dnase?: number
    atac?: number
    h3k4me3?: number
    h3k27ac?: number
    ctcf?: number
}

export type GeneTableRow = {
    inputRegion: GenomicRegion
}

export type AssayRankEntry = {
    chr: string;
    start: number;
    end: number;
    ranks: { [assayName: string]: number };
};