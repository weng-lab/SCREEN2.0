import { MenuProps, PaperProps, StackProps } from "@mui/material"

/**
 * Type for biosamples in this component
 */
export type BiosampleData<HasRNASeq extends boolean> = HasRNASeq extends true ? RegistryBiosamplePlusRNA : RegistryBiosample

export interface RegistryBiosamplePlusRNA extends RegistryBiosample {
  rnaseq: boolean
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

/**
 * Props for biosample tables
 */
export interface BiosampleTablesProps<
  HasRNASeq extends boolean = false,
  AllowTissueSelection extends boolean = false
> {
  /**
   * Adds UI element for selecting all samples from a tissue category
   */
  allowTissueSelection?: AllowTissueSelection
  /**
   * Assembly used in fetching samples
   */
  assembly: "GRCh38" | "mm10"
  /**
   * If specified, component will only fetch biosamples which include data for any of specified assays.
   * More complex filtering can be done with preFilterBiosamples
   * @default ["dnase","h3k4me3","h3k27ac","ctcf","atac"]
   */
  fetchBiosamplesWith?: ("dnase" | "h3k4me3" | "h3k27ac" | "ctcf" | "atac")[]
  /**
   * 
   * @param selected 
   * Fired on click of biosample
  */
  onBiosampleClicked?: (selected: BiosampleData<HasRNASeq>) => void,
  /**
   * Fired when a tissue is selected (only if allowTissueSelection is true)
   */
  onTissueSelected?: AllowTissueSelection extends true
  ? (selected: { tissue: string; samples: BiosampleData<HasRNASeq>[] }) => void
  : never;
  /**
   * @param sample 
   * If specified, samples will be passed through this function before populating tables
  */
  preFilterBiosamples?: (sample: BiosampleData<HasRNASeq>) => boolean,
  /**
   * Highlights samples in the tables. Can pass name or displayname of sample
   */
  selected?: string | string[],
  /**
   * If true, table will display columns for assay signal files for each biosample
   */
  showDownloads?: boolean, //I feel like this is maybe more appropriate to be something that is user-defined. Allow them to add extra columns?
  /**
   * If true, table will display column with check marks for biosamples with RNA seq data.
   */
  showRNAseq?: HasRNASeq,
  /**
   * Props spread into each slot inside, helpful for changing things such as width and height
   */
  slotProps?: {
    /**
     * Parent element, wraps everything. Is a ```<Stack component={Paper}>``` with access to props of both Paper and Stack
     */
    paperStack?: PaperProps & StackProps,
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

export type SampleType = "Cell Line" | "Primary Cell" | "Tissue" | "Organoid" | "In Vitro Differentiated Cells"

export type Collection = "Core Collection" | "Partial Collection" | "Ancillary Collection"

export type LifeStage = "Embryo" | "Adult"

export type CheckboxType = SampleType | Collection | LifeStage

export type SampleTypeCheckboxes = { [key in SampleType]: boolean }

export type CollectionCheckboxes = { [key in Collection]: boolean }

export type LifeStageCheckboxes = { [key in LifeStage]: boolean }

export type Checkboxes = SampleTypeCheckboxes | CollectionCheckboxes | LifeStageCheckboxes

export type assay = "DNase" | "H3K27ac" | "H3K4me3" | "CTCF" | "ATAC"