import { MenuProps, PaperProps, StackProps } from "@mui/material"

/**
 * Type for biosamples in this component
 */
export type BiosampleData<T extends boolean> = T extends true ? RegistryBiosamplePlusRNA : RegistryBiosample

/**
 * Props for biosample tables
 */
export interface Props<T extends boolean = false> {
  /**
   * Assembly used in fetching samples
   */
  assembly: "GRCh38" | "mm10"
  /**
   * Highlights samples in the tables. Can pass name or displayname of sample
   */
  selected?: string | string[],
  /**
   * 
   * @param selected 
   * Fired on click of biosample
   */
  onBiosampleClicked?: (selected: BiosampleData<T>) => void,
  /**
   * @param sample 
   * If specified, samples will be passed through this function before populating tables
   */
  preFilterBiosamples?: (sample: BiosampleData<T>) => boolean,

  //Should I change this? Seems like so-so way to handle this behavior
  showRNAseq?: T, //I feel like this is fine
  showDownloads?: boolean, //I feel like this is maybe more appropriate to be something that is user-defined. Allow them to add extra columns?
  /**
   * Props spread into each slot inside, helpful for changing things such as width and height
   */
  slotProps?: {
    /**
     * Parent element, wraps everything. Is a ```<Stack component={Paper}>``` with access to props of both Paper and Stack
     */
    paperStack?: PaperProps & StackProps,
    /**
     * Vertical Stack for header elements (search and filters icon) and tables
     */
    columnStack?: StackProps,
    /**
     * Horizontal Stack for search bar and filters icon
     */
    headerStack?: StackProps,
    /**
     * Vertical Stack for Accordions
     */
    tableStack?: StackProps
    /**
     * Filters Checkbox parent element
     */
    menu?: MenuProps,
    /**
     * Vertical Stack for FormGroups in menu
     */
    menuStack?: StackProps
  }
}

export interface RegistryBiosamplePlusRNA extends RegistryBiosample {
  rnaseq: boolean | undefined
}

export type RegistryBiosample = {
  name: string;
  ontology: string;
  lifeStage: string;
  sampleType: string;
  displayname: string;
  dnase: string | null;
  h3k4me3: string | null;
  h3k27ac: string | null;
  ctcf: string | null;
  atac: string | null;
  dnase_signal: string | null;
  h3k4me3_signal: string | null;
  h3k27ac_signal: string | null;
  ctcf_signal: string | null;
  atac_signal: string | null;
};

export type RNA_SEQ_Data = {
  rnaSeqQuery: {
    biosample: string
  }[]
}

export type RNA_SEQ_Variables = {
  assembly: "mm10" | "grch38",
}

export type BiosampleReturnData = {
  ccREBiosampleQuery: { biosamples: RegistryBiosample[] }
}

export type BiosampleDataVars = {
  assembly: "grch38" | "mm10"
}

export type FiltersKey = "CellLine" | "PrimaryCell" | "Tissue" | "Organoid" | "InVitro" | "Core" | "Partial" | "Ancillary" | "Embryo" | "Adult"

export type CheckboxState = { [key in FiltersKey]: boolean }