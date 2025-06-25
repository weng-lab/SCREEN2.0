/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Generic BigResponse object; may contain BigBed, BigWig, or BigZoom data */
  BigResponseData: { input: any; output: any; }
  /** Scalar date type without associated time */
  Date: { input: any; output: any; }
  DeepLearnedMotitfResponseData: { input: any; output: any; }
  /** A string-serialized scalar represents a set of fields that's passed to a federated directive, such as @key, @requires, or @provides */
  FieldSet: { input: any; output: any; }
  JSON: { input: any; output: any; }
  PeakCentralityData: { input: any; output: any; }
  /** PeaksResponseData */
  PeaksResponseData: { input: any; output: any; }
  /**
   * Custom scalar type for a single cCRE
   *
   * Attributes
   * ----------
   *     chromosome : str
   *         Not Null. Chromosome
   *         Ex: chr1
   *     start : int
   *         Not Null. Start position
   *         Ex: 10033
   *     stop : int
   *         Not Null. Stop position
   *         Ex: 10250
   *     rdhs_id: str
   *         Unique id, starts with EH38D
   *         Ex: EH38D4327497
   *     accession: str
   *         The accession of the gene, starts with EH38E
   *         Ex: EH38E2776516
   *     group: str
   *         The ccre group
   *         Ex: pELS
   */
  cCRE: { input: any; output: any; }
  /** This string-serialized scalar represents an authorization policy. */
  federation__Policy: { input: any; output: any; }
  /** This string-serialized scalar represents a JWT scope */
  federation__Scope: { input: any; output: any; }
};

export type AtacAggregate = {
  __typename?: 'ATACAggregate';
  atac_alignments_accession: Scalars['String']['output'];
  atac_dataset_accession: Scalars['String']['output'];
  forward_values: Array<Scalars['Float']['output']>;
  motif: Scalars['String']['output'];
  peaks_accession: Scalars['String']['output'];
  peaks_dataset_accession: Scalars['String']['output'];
  reverse_values: Array<Scalars['Float']['output']>;
};

export enum AggregateByEnum {
  Average = 'AVERAGE',
  Max = 'MAX'
}

export type AggregationResult = {
  __typename?: 'AggregationResult';
  total: Scalars['Int']['output'];
  values: Array<Maybe<Scalars['Float']['output']>>;
};

export type AlleleFrequency = {
  __typename?: 'AlleleFrequency';
  afr_af?: Maybe<Scalars['Float']['output']>;
  amr_af?: Maybe<Scalars['Float']['output']>;
  eas_af?: Maybe<Scalars['Float']['output']>;
  eur_af?: Maybe<Scalars['Float']['output']>;
  frequency?: Maybe<Scalars['Float']['output']>;
  sas_af?: Maybe<Scalars['Float']['output']>;
  sequence?: Maybe<Scalars['String']['output']>;
};

export enum AssayEnum {
  Atac = 'ATAC',
  Dnase = 'DNASE'
}

export type Assembly = {
  __typename?: 'Assembly';
  /** Returns a collection of datasets that have files processed using this assembly */
  datasets: DatasetCollection;
  name: Scalars['String']['output'];
  species: Scalars['String']['output'];
};

export type BigBedReplicatedPeaks = File & {
  __typename?: 'BigBedReplicatedPeaks';
  accession: Scalars['String']['output'];
  assembly: Assembly;
  dataset: PeakDataset;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type BigBedUnreplicatedPeaks = File & {
  __typename?: 'BigBedUnreplicatedPeaks';
  accession: Scalars['String']['output'];
  assembly: Assembly;
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset: PeakDataset;
  peaks: Array<Peak>;
  techrep?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};


export type BigBedUnreplicatedPeaksPeaksArgs = {
  chrom: Scalars['String']['input'];
  chrom_end: Scalars['Int']['input'];
  chrom_start: Scalars['Int']['input'];
};

export type BigRequest = {
  /** Start chromosome */
  chr1: Scalars['String']['input'];
  /** (Optional) End chromosome. Start chromosome will be used if omitted. */
  chr2?: InputMaybe<Scalars['String']['input']>;
  /** End base pair */
  end: Scalars['Int']['input'];
  /** (Optional) If passed, returns twobit data in one hot encoded format */
  oneHotEncodedFormat?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * (Optional) If passed, pre-renders BigWig data to match the given number of
   * bins to save download and rendering time on the frontend.
   */
  preRenderedWidth?: InputMaybe<Scalars['Int']['input']>;
  /** Start base pair */
  start: Scalars['Int']['input'];
  /** URL of the file to request data from */
  url: Scalars['String']['input'];
  /** (Optional) Base pairs per item. Picks the highest available in the file without going over. */
  zoomLevel?: InputMaybe<Scalars['Int']['input']>;
};

export type BigResponse = {
  __typename?: 'BigResponse';
  data?: Maybe<Array<Maybe<Scalars['BigResponseData']['output']>>>;
  error?: Maybe<RequestError>;
};

export type BigResponseWithRange = {
  __typename?: 'BigResponseWithRange';
  chrom: Scalars['String']['output'];
  data?: Maybe<SingleBigResponse>;
  end: Scalars['Int']['output'];
  start: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type Biosample = {
  __typename?: 'Biosample';
  datasets: DatasetCollection;
  name: Scalars['String']['output'];
  species: Scalars['String']['output'];
};

export type BiosamplePartitionCollection = DatasetCollection & {
  __typename?: 'BiosamplePartitionCollection';
  biosample: Biosample;
  counts: DatasetCounts;
  datasets: Array<PeakDataset>;
  partitionByBiosample: Array<BiosamplePartitionCollection>;
  partitionByLab: Array<LabPartitionCollection>;
  partitionByTarget: Array<TargetPartitionCollection>;
};


export type BiosamplePartitionCollectionPartitionByBiosampleArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type BiosamplePartitionCollectionPartitionByLabArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type BiosamplePartitionCollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Caprafccdoubledata = {
  __typename?: 'CAPRAFCCDOUBLEDATA';
  dna_rep1: Scalars['Int']['output'];
  experiment: Scalars['String']['output'];
  fdr: Scalars['Float']['output'];
  log2fc: Scalars['Float']['output'];
  pvalue: Scalars['Float']['output'];
  rdhs_p1: Scalars['String']['output'];
  rdhs_p2: Scalars['String']['output'];
  rna_rep1: Scalars['Int']['output'];
  rna_rep2: Scalars['Int']['output'];
  rna_rep3: Scalars['Int']['output'];
};

export type Caprafccsolodata = {
  __typename?: 'CAPRAFCCSOLODATA';
  dna_rep1: Scalars['Int']['output'];
  experiment: Scalars['String']['output'];
  fdr: Scalars['Float']['output'];
  log2fc: Scalars['Float']['output'];
  pvalue: Scalars['Float']['output'];
  rdhs: Scalars['String']['output'];
  rna_rep1: Scalars['Int']['output'];
  rna_rep2: Scalars['Int']['output'];
  rna_rep3: Scalars['Int']['output'];
};

export type Ccre = GenomicObject & {
  __typename?: 'CCRE';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  coordinates: GenomicRange;
  group: Scalars['String']['output'];
  gtex_decorations: Array<GtExDecoration>;
  id: Scalars['String']['output'];
  maxZ?: Maybe<Scalars['Float']['output']>;
  nearby_genes?: Maybe<IntersectingGenes>;
  rDHS: Scalars['String']['output'];
  sequence?: Maybe<TwoBitData>;
  zScores?: Maybe<Array<ZScore>>;
};


export type CcreMaxZArgs = {
  assay: Scalars['String']['input'];
};


export type CcreNearby_GenesArgs = {
  include_downstream?: InputMaybe<Scalars['Int']['input']>;
  include_upstream?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  protein_coding?: InputMaybe<Scalars['Boolean']['input']>;
};


export type CcreSequenceArgs = {
  googleProject?: InputMaybe<Scalars['String']['input']>;
  twobit_url: Scalars['String']['input'];
};


export type CcrezScoresArgs = {
  experiments?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CcreInfo = {
  __typename?: 'CCREInfo';
  accession: Scalars['String']['output'];
  atacmax: Scalars['Float']['output'];
  concordant: Scalars['Boolean']['output'];
  ctcfmax: Scalars['Float']['output'];
  isproximal: Scalars['Boolean']['output'];
  k4me3max: Scalars['Float']['output'];
  k27acmax: Scalars['Float']['output'];
};

export type CcreWithRegion = {
  __typename?: 'CCREWithRegion';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  coordinates: GenomicRange;
  group: Scalars['String']['output'];
  icre?: Maybe<Scalars['String']['output']>;
  isiCRE?: Maybe<Scalars['Boolean']['output']>;
  rDHS: Scalars['String']['output'];
};

export type CcrezScore = {
  __typename?: 'CCREZScore';
  assay: Scalars['String']['output'];
  cCRE: Scalars['String']['output'];
  experiment_accession: Scalars['String']['output'];
  score: Scalars['Float']['output'];
};

export type CaQtls = {
  __typename?: 'CaQtls';
  snpid?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type CcreLinks = {
  __typename?: 'CcreLinks';
  destination: Scalars['String']['output'];
  distance: Scalars['Int']['output'];
  path: Scalars['String']['output'];
  source: Scalars['String']['output'];
  weights: Scalars['String']['output'];
};

export type CcreLinksDetails = {
  __typename?: 'CcreLinksDetails';
  ccrelinks?: Maybe<Array<Maybe<CcreLinks>>>;
  ccrenodegroups?: Maybe<Array<Maybe<CcreNodeGroups>>>;
};

export type CcreNearestGene = {
  __typename?: 'CcreNearestGene';
  chromosome?: Maybe<Scalars['String']['output']>;
  geneid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
  stop?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type CcreNodeGroups = {
  __typename?: 'CcreNodeGroups';
  accession: Scalars['String']['output'];
  ccre_group: Scalars['String']['output'];
};

export type CellTypeEnrichment = {
  __typename?: 'CellTypeEnrichment';
  encodeid: Scalars['String']['output'];
  fdr?: Maybe<Scalars['Float']['output']>;
  fe?: Maybe<Scalars['Float']['output']>;
  pValue?: Maybe<Scalars['Float']['output']>;
};

export type CellTypeInput = {
  celltype: Scalars['String']['input'];
  celltypedisplayname?: InputMaybe<Scalars['String']['input']>;
  rnaseq?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Celltype = {
  __typename?: 'Celltype';
  celltype?: Maybe<Scalars['String']['output']>;
  ct_image_url?: Maybe<Scalars['String']['output']>;
  wiki_desc?: Maybe<Scalars['String']['output']>;
};

export type CelltypeTf = {
  __typename?: 'CelltypeTF';
  celltype: Scalars['String']['output'];
  tf: Scalars['String']['output'];
};

export type ChromLength = {
  __typename?: 'ChromLength';
  chromosome: Scalars['String']['output'];
  length: Scalars['Int']['output'];
};

export type ChromRange = {
  chromosome: Scalars['String']['input'];
  start?: InputMaybe<Scalars['Int']['input']>;
  stop?: InputMaybe<Scalars['Int']['input']>;
};

export type ChromosomeRangeInput = {
  chrom: Scalars['String']['input'];
  chrom_end: Scalars['Int']['input'];
  chrom_start: Scalars['Int']['input'];
};

export type ClosestGene = {
  __typename?: 'ClosestGene';
  ccre?: Maybe<Scalars['String']['output']>;
  chromosome?: Maybe<Scalars['String']['output']>;
  gene?: Maybe<CcreNearestGene>;
  start?: Maybe<Scalars['Int']['output']>;
  stop?: Maybe<Scalars['Int']['output']>;
  strand?: Maybe<Scalars['String']['output']>;
  transcriptid?: Maybe<Scalars['String']['output']>;
};

export type Collection = DatasetCollection & {
  __typename?: 'Collection';
  counts: DatasetCounts;
  datasets: Array<PeakDataset>;
  partitionByBiosample: Array<BiosamplePartitionCollection>;
  partitionByLab: Array<LabPartitionCollection>;
  partitionByTarget: Array<TargetPartitionCollection>;
};


export type CollectionPartitionByBiosampleArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type CollectionPartitionByLabArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type CollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ComputationalGeneLinks = {
  __typename?: 'ComputationalGeneLinks';
  accession: Scalars['String']['output'];
  celltype: Scalars['String']['output'];
  fileaccession: Scalars['String']['output'];
  geneid: Scalars['String']['output'];
  genename: Scalars['String']['output'];
  genetype: Scalars['String']['output'];
  method: Scalars['String']['output'];
  methodregion: Scalars['String']['output'];
  score: Scalars['Float']['output'];
};

export type ConservationAggregate = {
  __typename?: 'ConservationAggregate';
  conservation_type: Scalars['String']['output'];
  motif: Scalars['String']['output'];
  peaks_accession: Scalars['String']['output'];
  peaks_dataset_accession: Scalars['String']['output'];
  values: Array<Scalars['Float']['output']>;
};

export type CoordinateInput = {
  field: Scalars['String']['input'];
  points: Array<PointInput>;
};

export type Cytoband = {
  __typename?: 'Cytoband';
  bandname: Scalars['String']['output'];
  coordinates: GenomicRange;
  stain: Scalars['String']['output'];
};

export type DlMotifPeakOccurrences = {
  __typename?: 'DLMotifPeakOccurrences';
  annotation: Scalars['String']['output'];
  class_of_transposable_element: Scalars['String']['output'];
  consensus_regex?: Maybe<Scalars['String']['output']>;
  genomic_region: GenomicRegion;
  name: Scalars['String']['output'];
  number_of_celltypes_instance_found_in: Scalars['Int']['output'];
  number_of_datasets_instance_found_in: Scalars['Int']['output'];
  ppm: Array<Maybe<Array<Scalars['Float']['output']>>>;
  rdhs: Scalars['String']['output'];
  score: Scalars['Float']['output'];
  sequence: Scalars['String']['output'];
  strand: Scalars['String']['output'];
  tf: Scalars['String']['output'];
  total_number_of_celltypes_instance_found_in?: Maybe<Scalars['Int']['output']>;
  total_number_of_datasets_instance_found_in?: Maybe<Scalars['Int']['output']>;
};

export type DlMotifRdhsOccurrences = {
  __typename?: 'DLMotifRdhsOccurrences';
  bound_or_gcr_match: Scalars['String']['output'];
  cell_types: Scalars['Float']['output'];
  constrained: Scalars['String']['output'];
  constrained_score: Scalars['Float']['output'];
  datasets: Scalars['Float']['output'];
  genomic_context: Scalars['String']['output'];
  genomic_region: GenomicRegion;
  in_rdhs: Scalars['String']['output'];
  instance_id: Scalars['String']['output'];
  score: Scalars['Float']['output'];
  sequence: Scalars['String']['output'];
  strand: Scalars['String']['output'];
  tf: Scalars['String']['output'];
  z_score: Scalars['Float']['output'];
};

export type DNaseAggregate = {
  __typename?: 'DNaseAggregate';
  dnase_alignments_accession: Scalars['String']['output'];
  dnase_dataset_accession: Scalars['String']['output'];
  forward_values: Array<Scalars['Float']['output']>;
  motif: Scalars['String']['output'];
  peaks_accession: Scalars['String']['output'];
  peaks_dataset_accession: Scalars['String']['output'];
  reverse_values: Array<Scalars['Float']['output']>;
};

export type DatasetCollection = {
  counts: DatasetCounts;
  datasets: Array<PeakDataset>;
  partitionByBiosample: Array<BiosamplePartitionCollection>;
  partitionByLab: Array<LabPartitionCollection>;
  partitionByTarget: Array<TargetPartitionCollection>;
};


export type DatasetCollectionPartitionByBiosampleArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type DatasetCollectionPartitionByLabArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type DatasetCollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type DatasetCounts = {
  __typename?: 'DatasetCounts';
  biosamples: Scalars['Int']['output'];
  labs: Scalars['Int']['output'];
  projects: Scalars['Int']['output'];
  species: Scalars['Int']['output'];
  targets: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type DeconQtls = {
  __typename?: 'DeconQtls';
  adj_beta_pval?: Maybe<Scalars['Float']['output']>;
  celltype?: Maybe<Scalars['String']['output']>;
  geneid?: Maybe<Scalars['String']['output']>;
  nom_val?: Maybe<Scalars['Float']['output']>;
  r_squared?: Maybe<Scalars['Float']['output']>;
  slope?: Maybe<Scalars['Float']['output']>;
  snp_chrom?: Maybe<Scalars['Int']['output']>;
  snp_start?: Maybe<Scalars['Int']['output']>;
  snpid?: Maybe<Scalars['String']['output']>;
};

export type DeepLearnedMotif = {
  __typename?: 'DeepLearnedMotif';
  accession: Scalars['String']['output'];
  assay?: Maybe<Scalars['String']['output']>;
  au_roc?: Maybe<Scalars['Float']['output']>;
  consensus_regex?: Maybe<Scalars['String']['output']>;
  dataset_id: Scalars['String']['output'];
  fractional_enrichment?: Maybe<Scalars['Float']['output']>;
  ppm: Array<Maybe<Array<Scalars['Float']['output']>>>;
  protein_type?: Maybe<Scalars['String']['output']>;
  roc_curve?: Maybe<Array<Maybe<Array<Scalars['Float']['output']>>>>;
  selex_round?: Maybe<Scalars['Int']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  species: Scalars['String']['output'];
  tf: Scalars['String']['output'];
  total_number_of_celltypes_instance_found_in?: Maybe<Scalars['Int']['output']>;
  total_number_of_datasets_instance_found_in?: Maybe<Scalars['Int']['output']>;
};

export type DeepLearnedMotifCount = {
  __typename?: 'DeepLearnedMotifCount';
  nonselexdlmotifs: Scalars['Int']['output'];
  selexdlmotifs: Scalars['Int']['output'];
};

export type DeepLearnedMotitfResponse = {
  __typename?: 'DeepLearnedMotitfResponse';
  data?: Maybe<Scalars['DeepLearnedMotitfResponseData']['output']>;
};

export type Deg = {
  __typename?: 'Deg';
  base_mean?: Maybe<Scalars['Float']['output']>;
  celltype?: Maybe<Scalars['String']['output']>;
  disease?: Maybe<Scalars['String']['output']>;
  gene?: Maybe<Scalars['String']['output']>;
  lfc_se?: Maybe<Scalars['Float']['output']>;
  log2_fc?: Maybe<Scalars['Float']['output']>;
  padj?: Maybe<Scalars['Float']['output']>;
  pvalue?: Maybe<Scalars['Float']['output']>;
  stat?: Maybe<Scalars['Float']['output']>;
};

export type EbiAssociations = {
  __typename?: 'EBIAssociations';
  ccre?: Maybe<Scalars['String']['output']>;
  chromosome?: Maybe<Scalars['String']['output']>;
  class?: Maybe<Scalars['String']['output']>;
  icre?: Maybe<Scalars['String']['output']>;
  immu_screen_trait?: Maybe<Scalars['String']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  mapped_trait?: Maybe<Scalars['String']['output']>;
  p_value?: Maybe<Scalars['Float']['output']>;
  position?: Maybe<Scalars['Int']['output']>;
  pubmedid?: Maybe<Scalars['Int']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  risk_allele_frequency?: Maybe<Scalars['Float']['output']>;
  snpid?: Maybe<Scalars['String']['output']>;
  strongest_snp_risk_allele?: Maybe<Scalars['String']['output']>;
  study?: Maybe<Scalars['String']['output']>;
};

export type Eqtl = {
  __typename?: 'EQTL';
  celltype?: Maybe<Scalars['String']['output']>;
  geneid?: Maybe<Scalars['String']['output']>;
  phenotype_id?: Maybe<Scalars['String']['output']>;
  pval_beta?: Maybe<Scalars['Float']['output']>;
  pval_nominal?: Maybe<Scalars['Float']['output']>;
  pvalue?: Maybe<Scalars['Float']['output']>;
  qvalue?: Maybe<Scalars['Float']['output']>;
  rsid?: Maybe<Scalars['String']['output']>;
  study: Scalars['String']['output'];
  variant_id?: Maybe<Scalars['String']['output']>;
};

export type Element = {
  __typename?: 'Element';
  category: Scalars['String']['output'];
  coordinates: GenomicRange;
  name: Scalars['String']['output'];
  signal?: Maybe<Array<Maybe<Scalars['Float']['output']>>>;
  signal_average?: Maybe<Scalars['Float']['output']>;
  umap_coordinates: Point;
};


export type ElementCategoryArgs = {
  field: Scalars['String']['input'];
};


export type ElementSignalArgs = {
  field: Scalars['String']['input'];
};


export type ElementSignal_AverageArgs = {
  field: Scalars['String']['input'];
};


export type ElementUmap_CoordinatesArgs = {
  field: Scalars['String']['input'];
};

export type EnsembleData = {
  __typename?: 'EnsembleData';
  biotype?: Maybe<Scalars['String']['output']>;
  ccds_id?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  description?: Maybe<Scalars['String']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
  hgnc_primary_id?: Maybe<Scalars['String']['output']>;
  hgnc_synonyms?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id?: Maybe<Scalars['String']['output']>;
  uniprot_primary_id?: Maybe<Scalars['String']['output']>;
  uniprot_synonyms?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  version?: Maybe<Scalars['String']['output']>;
};

export type EntexActiveAnnotations = {
  __typename?: 'EntexActiveAnnotations';
  assay_score: Scalars['String']['output'];
  tissue: Scalars['String']['output'];
};

export type EntexData = {
  __typename?: 'EntexData';
  accession: Scalars['String']['output'];
  assay: Scalars['String']['output'];
  donor: Scalars['String']['output'];
  experiment_accession: Scalars['String']['output'];
  hap1_allele_ratio: Scalars['Float']['output'];
  hap1_count: Scalars['Int']['output'];
  hap2_count: Scalars['Int']['output'];
  imbalance_significance: Scalars['Float']['output'];
  p_betabinom: Scalars['Float']['output'];
  tissue: Scalars['String']['output'];
};

export type Exon = {
  __typename?: 'Exon';
  UTRs?: Maybe<Array<Maybe<Utr>>>;
  coordinates: GenomicRange;
  exon_number: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  project: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
};

export type Fcdata = {
  __typename?: 'FCDATA';
  assay_result: Scalars['String']['output'];
  chromosome: Scalars['String']['output'];
  element_id: Scalars['String']['output'];
  start: Scalars['Int']['output'];
  stop: Scalars['Int']['output'];
  tissues: Scalars['String']['output'];
};

export type Factor = {
  __typename?: 'Factor';
  assembly: Scalars['String']['output'];
  color?: Maybe<Scalars['String']['output']>;
  coordinates?: Maybe<GenomeRange>;
  dbd?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  ensemble_data?: Maybe<EnsembleData>;
  factor_wiki?: Maybe<Scalars['String']['output']>;
  gene_id?: Maybe<Scalars['String']['output']>;
  hgnc_data?: Maybe<HgncData>;
  isTF?: Maybe<Scalars['Boolean']['output']>;
  modifications?: Maybe<Modifications>;
  name: Scalars['String']['output'];
  ncbi_data?: Maybe<Scalars['String']['output']>;
  pdbids?: Maybe<Scalars['String']['output']>;
  uniprot_data?: Maybe<Scalars['String']['output']>;
};

export type FieldResult = {
  __typename?: 'FieldResult';
  name: Scalars['String']['output'];
};

export enum FieldType {
  Category = 'CATEGORY',
  Coordinates = 'COORDINATES',
  SignalAverage = 'SIGNAL_AVERAGE',
  SignalMatrix = 'SIGNAL_MATRIX'
}

export type File = {
  accession: Scalars['String']['output'];
  dataset: PeakDataset;
  type: Scalars['String']['output'];
};

export type FilteredAlignments = File & {
  __typename?: 'FilteredAlignments';
  accession: Scalars['String']['output'];
  assembly: Assembly;
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset: PeakDataset;
  techrep?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type GtExDecoration = {
  __typename?: 'GTExDecoration';
  allele_specific: Scalars['Boolean']['output'];
  ctcf_bound: Scalars['Boolean']['output'];
  proximal: Scalars['Boolean']['output'];
  state: GtExState;
  tissue: Scalars['String']['output'];
};

export type GtExQtl = {
  __typename?: 'GTExQTL';
  chromosome: Scalars['String']['output'];
  gene_id: Scalars['String']['output'];
  ma_count: Scalars['Int']['output'];
  ma_samples: Scalars['Int']['output'];
  maf: Scalars['Float']['output'];
  min_pval_nominal: Scalars['Float']['output'];
  position: Scalars['Int']['output'];
  pval_beta: Scalars['Float']['output'];
  pval_nominal: Scalars['Float']['output'];
  pval_nominal_threshold: Scalars['Float']['output'];
  slope: Scalars['Float']['output'];
  slope_se: Scalars['Float']['output'];
  tissue: Scalars['String']['output'];
  tss_distance: Scalars['Int']['output'];
};

export enum GtExState {
  Active = 'ACTIVE',
  Bivalent = 'BIVALENT',
  Repressed = 'REPRESSED'
}

export type Gwas = {
  __typename?: 'GWAS';
  author: Scalars['String']['output'];
  cellTypeEnrichment?: Maybe<Array<Maybe<CellTypeEnrichment>>>;
  leadSNPs?: Maybe<Array<Maybe<Snp>>>;
  name: Scalars['String']['output'];
  pubMedId: Scalars['Int']['output'];
};


export type GwasCellTypeEnrichmentArgs = {
  encodeid?: InputMaybe<Scalars['String']['input']>;
  fdr_threshold?: InputMaybe<Scalars['Float']['input']>;
  fe_threshold?: InputMaybe<Scalars['Float']['input']>;
  pValue_threshold?: InputMaybe<Scalars['Float']['input']>;
};


export type GwasLeadSnPsArgs = {
  linkedSNP?: InputMaybe<Scalars['String']['input']>;
};

export type GwasCelltypeEnrichment = {
  __typename?: 'GWASCelltypeEnrichment';
  accession: Scalars['String']['output'];
  celltype: Scalars['String']['output'];
  fc: Scalars['Float']['output'];
  fdr: Scalars['Float']['output'];
  pvalue: Scalars['Float']['output'];
};

export type Gene = GenomicObject & {
  __typename?: 'Gene';
  assembly: Scalars['String']['output'];
  coordinates: GenomicRange;
  gene_quantification?: Maybe<Array<Maybe<GeneQuantification>>>;
  gene_type: Scalars['String']['output'];
  havana_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  intersecting_ccres?: Maybe<IntersectingCcrEs>;
  name: Scalars['String']['output'];
  project: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
  transcripts?: Maybe<Array<Maybe<Transcript>>>;
};


export type GeneGene_QuantificationArgs = {
  assembly: Scalars['String']['input'];
  experiment_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  file_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fpkm_range?: InputMaybe<QuantificationRange>;
  gene_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortByTpm?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<QuantDataSourceInput>;
  tpm_range?: InputMaybe<QuantificationRange>;
};


export type GeneIntersecting_CcresArgs = {
  include_downstream?: InputMaybe<Scalars['Int']['input']>;
  include_upstream?: InputMaybe<Scalars['Int']['input']>;
};

export type GeneAssociation = {
  __typename?: 'GeneAssociation';
  dge_fdr: Scalars['Float']['output'];
  dge_log2fc: Scalars['Float']['output'];
  disease: Scalars['String']['output'];
  gene_id: Scalars['String']['output'];
  gene_name: Scalars['String']['output'];
  hsq: Scalars['Float']['output'];
  twas_bonferroni: Scalars['Float']['output'];
  twas_p: Scalars['Float']['output'];
};

export type GeneDataset = {
  __typename?: 'GeneDataset';
  accession: Scalars['String']['output'];
  age_death?: Maybe<Scalars['Float']['output']>;
  assay_term_name?: Maybe<Scalars['String']['output']>;
  biosample: Scalars['String']['output'];
  biosample_type?: Maybe<Scalars['String']['output']>;
  biosample_value?: Maybe<Scalars['String']['output']>;
  cell_compartment?: Maybe<Scalars['String']['output']>;
  diagnosis?: Maybe<Scalars['String']['output']>;
  fetal?: Maybe<Scalars['Boolean']['output']>;
  gene_quantification_files?: Maybe<Array<Maybe<GeneQuantificationFile>>>;
  lab_friendly_name?: Maybe<Scalars['String']['output']>;
  lab_name?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  sex?: Maybe<Scalars['String']['output']>;
  signal_files?: Maybe<Array<Maybe<SignalFile>>>;
  source: QuantDataSource;
  study?: Maybe<Scalars['String']['output']>;
  suicidaldeath?: Maybe<Scalars['Boolean']['output']>;
  tissue?: Maybe<Scalars['String']['output']>;
  transcript_quantification_files?: Maybe<Array<Maybe<TranscriptQuantificationFile>>>;
  user_collection_accession?: Maybe<Scalars['String']['output']>;
};


export type GeneDatasetGene_Quantification_FilesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
};


export type GeneDatasetSignal_FilesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
};


export type GeneDatasetTranscript_Quantification_FilesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
};

export type GeneExpressionOutput = {
  __typename?: 'GeneExpressionOutput';
  gene?: Maybe<Scalars['String']['output']>;
  geneid?: Maybe<Scalars['String']['output']>;
  tpm?: Maybe<Scalars['Float']['output']>;
};

export type GeneOrtholog = {
  __typename?: 'GeneOrtholog';
  V17?: Maybe<Scalars['String']['output']>;
  V18?: Maybe<Scalars['Float']['output']>;
  chromosome_name?: Maybe<Scalars['String']['output']>;
  end_position?: Maybe<Scalars['Int']['output']>;
  ensembl_gene_id?: Maybe<Scalars['String']['output']>;
  external_gene_name?: Maybe<Scalars['String']['output']>;
  mmusculus_homolog_associated_gene_name?: Maybe<Scalars['String']['output']>;
  mmusculus_homolog_chrom_end?: Maybe<Scalars['Int']['output']>;
  mmusculus_homolog_chrom_start?: Maybe<Scalars['Int']['output']>;
  mmusculus_homolog_chromosome?: Maybe<Scalars['String']['output']>;
  mmusculus_homolog_ensembl_gene?: Maybe<Scalars['String']['output']>;
  mmusculus_homolog_goc_score?: Maybe<Scalars['Int']['output']>;
  mmusculus_homolog_orthology_type?: Maybe<Scalars['String']['output']>;
  mmusculus_homolog_perc_id?: Maybe<Scalars['Float']['output']>;
  mmusculus_homolog_perc_id_r1?: Maybe<Scalars['Float']['output']>;
  mmusculus_homolog_wga_coverage?: Maybe<Scalars['Float']['output']>;
  start_position?: Maybe<Scalars['Int']['output']>;
  strand?: Maybe<Scalars['String']['output']>;
};

export type GeneQuantification = {
  __typename?: 'GeneQuantification';
  effective_len: Scalars['Float']['output'];
  expected_count: Scalars['Float']['output'];
  experiment_accession: Scalars['String']['output'];
  file_accession: Scalars['String']['output'];
  fpkm: Scalars['Float']['output'];
  fpkm_ci_lower_bound: Scalars['Float']['output'];
  fpkm_ci_upper_bound: Scalars['Float']['output'];
  fpkm_coefficient_of_quartile_variation?: Maybe<Scalars['Float']['output']>;
  gene?: Maybe<Gene>;
  len: Scalars['Float']['output'];
  pme_fpkm: Scalars['Float']['output'];
  pme_tpm: Scalars['Float']['output'];
  posterior_mean_count: Scalars['Float']['output'];
  posterior_standard_deviation_of_count: Scalars['Float']['output'];
  tpm: Scalars['Float']['output'];
  tpm_ci_lower_bound: Scalars['Float']['output'];
  tpm_ci_upper_bound: Scalars['Float']['output'];
  tpm_coefficient_of_quartile_variation?: Maybe<Scalars['Float']['output']>;
};

export type GeneQuantificationFile = {
  __typename?: 'GeneQuantificationFile';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset_accession: Scalars['String']['output'];
  quantifications?: Maybe<Array<Maybe<GeneQuantification>>>;
  techrep?: Maybe<Scalars['Int']['output']>;
};


export type GeneQuantificationFileQuantificationsArgs = {
  experiment_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fpkm_range?: InputMaybe<QuantificationRange>;
  gene_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  gene_id_prefix?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tpm_range?: InputMaybe<QuantificationRange>;
};

export type GeneSpecificity = {
  __typename?: 'GeneSpecificity';
  chromosome?: Maybe<Scalars['String']['output']>;
  geneid?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
  stop?: Maybe<Scalars['Int']['output']>;
};

export type GenesCountResponse = {
  __typename?: 'GenesCountResponse';
  chromosome: Scalars['String']['output'];
  count?: Maybe<Scalars['Int']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
};

export type GenomeRange = {
  __typename?: 'GenomeRange';
  chromosome?: Maybe<Scalars['String']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
};

export type Genomes = {
  __typename?: 'Genomes';
  defaultPos?: Maybe<Scalars['String']['output']>;
  genome: Scalars['String']['output'];
  trackDb: Scalars['String']['output'];
};

export type GenomicAssembly = {
  __typename?: 'GenomicAssembly';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  species: Scalars['String']['output'];
};

export type GenomicCoordinateRange = GenomicObject & {
  __typename?: 'GenomicCoordinateRange';
  assembly: Scalars['String']['output'];
  coordinates: GenomicRange;
  id: Scalars['String']['output'];
};

export type GenomicObject = {
  assembly: Scalars['String']['output'];
  coordinates: GenomicRange;
  id: Scalars['String']['output'];
};

/**
 * An object with an ID.
 * Follows the [Relay Global Object Identification Specification](https://relay.dev/graphql/objectidentification.htm)
 */
export type GenomicRange = {
  __typename?: 'GenomicRange';
  chromosome: Scalars['String']['output'];
  end: Scalars['Int']['output'];
  start: Scalars['Int']['output'];
};

export type GenomicRangeInput = {
  chromosome: Scalars['String']['input'];
  end: Scalars['Int']['input'];
  start: Scalars['Int']['input'];
};

export type GenomicRegion = {
  __typename?: 'GenomicRegion';
  chromosome: Scalars['String']['output'];
  end: Scalars['Int']['output'];
  start: Scalars['Int']['output'];
};

export type GenomicRegionInput = {
  chromosome: Scalars['String']['input'];
  end: Scalars['Int']['input'];
  start: Scalars['Int']['input'];
};

export type GtexGenes = {
  __typename?: 'GtexGenes';
  description: Scalars['String']['output'];
  gene_id: Scalars['String']['output'];
  tissue_type: Scalars['String']['output'];
  tissue_type_detail: Scalars['String']['output'];
  val: Scalars['Float']['output'];
};

export type GwasIntersectingSnpsWithBcre = {
  __typename?: 'GwasIntersectingSnpsWithBcre';
  associated_gene: Scalars['String']['output'];
  association_p_val: Array<Maybe<Scalars['Float']['output']>>;
  bcre_group: Scalars['String']['output'];
  ccre_chrom: Scalars['String']['output'];
  ccre_class: Scalars['String']['output'];
  ccre_start: Scalars['Int']['output'];
  ccre_stop: Scalars['Int']['output'];
  ccreid: Scalars['String']['output'];
  disease: Scalars['String']['output'];
  rdhsid: Scalars['String']['output'];
  riskallele: Scalars['String']['output'];
  snp_chrom: Scalars['String']['output'];
  snp_start: Scalars['Int']['output'];
  snp_stop: Scalars['Int']['output'];
  snpid: Scalars['String']['output'];
};

export type GwasIntersectingSnpsWithCcre = {
  __typename?: 'GwasIntersectingSnpsWithCcre';
  associated_gene: Scalars['String']['output'];
  association_p_val: Array<Maybe<Scalars['Float']['output']>>;
  ccre_chrom: Scalars['String']['output'];
  ccre_class: Scalars['String']['output'];
  ccre_start: Scalars['Int']['output'];
  ccre_stop: Scalars['Int']['output'];
  ccreid: Scalars['String']['output'];
  disease: Scalars['String']['output'];
  rdhsid: Scalars['String']['output'];
  riskallele: Scalars['String']['output'];
  snp_chrom: Scalars['String']['output'];
  snp_start: Scalars['Int']['output'];
  snp_stop: Scalars['Int']['output'];
  snpid: Scalars['String']['output'];
};

export type GwasMotifEnrichment = {
  __typename?: 'GwasMotifEnrichment';
  accession?: Maybe<Scalars['String']['output']>;
  background_frequencies: Array<Scalars['Float']['output']>;
  cell_type?: Maybe<Scalars['String']['output']>;
  consensus_regex: Scalars['String']['output'];
  e_value: Scalars['Float']['output'];
  flank_occurrences_ratio: Scalars['Float']['output'];
  flank_p_value: Scalars['Float']['output'];
  flank_z_score: Scalars['Float']['output'];
  fold_enrichment: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  lesser_peaks_occurrences_ratio: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  original_peaks: Scalars['Int']['output'];
  original_peaks_occurrences: Scalars['Int']['output'];
  p_value: Scalars['Float']['output'];
  peak_centrality: Scalars['PeakCentralityData']['output'];
  peaks_accession: Scalars['String']['output'];
  pwm: Array<Maybe<Array<Scalars['Float']['output']>>>;
  shuffled_occurrences_ratio: Scalars['Float']['output'];
  shuffled_p_value: Scalars['Float']['output'];
  shuffled_z_score: Scalars['Float']['output'];
  sites: Scalars['Int']['output'];
  study_id: Scalars['Int']['output'];
  tomtom_matches?: Maybe<Array<Maybe<TargetMotif>>>;
};

export type GwasPeakEnrichment = {
  __typename?: 'GwasPeakEnrichment';
  dataset_accession: Scalars['String']['output'];
  fdr_d?: Maybe<Scalars['Float']['output']>;
  fdr_d_m?: Maybe<Scalars['Float']['output']>;
  fdr_p?: Maybe<Scalars['Float']['output']>;
  fdr_p_m?: Maybe<Scalars['Float']['output']>;
  fold_enrichment_d?: Maybe<Scalars['Float']['output']>;
  fold_enrichment_d_m?: Maybe<Scalars['Float']['output']>;
  fold_enrichment_p?: Maybe<Scalars['Float']['output']>;
  fold_enrichment_p_m?: Maybe<Scalars['Float']['output']>;
  number_of_peaks?: Maybe<Scalars['Int']['output']>;
  p_value_d?: Maybe<Scalars['Float']['output']>;
  p_value_d_m?: Maybe<Scalars['Float']['output']>;
  p_value_p?: Maybe<Scalars['Float']['output']>;
  p_value_p_m?: Maybe<Scalars['Float']['output']>;
  pmid: Scalars['String']['output'];
  tf: Scalars['String']['output'];
};

export type GwasSnpAssociation = {
  __typename?: 'GwasSnpAssociation';
  analyses_identifying_snp: Scalars['Int']['output'];
  associated_gene: Scalars['String']['output'];
  association_p_val: Array<Maybe<Scalars['Float']['output']>>;
  chrom: Scalars['String']['output'];
  disease: Scalars['String']['output'];
  riskallele: Scalars['String']['output'];
  snpid: Scalars['String']['output'];
  start: Scalars['Int']['output'];
  stop: Scalars['Int']['output'];
};

export type GwasStudies = {
  __typename?: 'GwasStudies';
  author?: Maybe<Scalars['String']['output']>;
  pubmedid?: Maybe<Scalars['String']['output']>;
  study?: Maybe<Scalars['String']['output']>;
  studyname?: Maybe<Scalars['String']['output']>;
  totalldblocks?: Maybe<Scalars['Int']['output']>;
};

export type GwasStudySnPs = {
  __typename?: 'GwasStudySNPs';
  author: Scalars['String']['output'];
  chromosome: Scalars['String']['output'];
  ldblock: Scalars['Int']['output'];
  ldblocksnpid: Scalars['String']['output'];
  pubmedid: Scalars['String']['output'];
  rsquare: Scalars['String']['output'];
  snpid: Scalars['String']['output'];
  start: Scalars['Int']['output'];
  stop: Scalars['Int']['output'];
  study: Scalars['String']['output'];
  studyname: Scalars['String']['output'];
};

export type HgncData = {
  __typename?: 'HgncData';
  alias_symbol?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  ccds_id?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  entrez_id?: Maybe<Scalars['String']['output']>;
  gene_group?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  gene_group_id?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  hgnc_id?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  locus_group?: Maybe<Scalars['String']['output']>;
  locus_type?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prev_name?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  prev_symbol?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  symbol?: Maybe<Scalars['String']['output']>;
  uniprot_ids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type HighQualityMemeMotif = {
  __typename?: 'HighQualityMemeMotif';
  assembly: Scalars['String']['output'];
  background_frequencies: Array<Scalars['Float']['output']>;
  celltype?: Maybe<Scalars['String']['output']>;
  consensus_regex: Scalars['String']['output'];
  e_value: Scalars['Float']['output'];
  flank_occurrences_ratio: Scalars['Float']['output'];
  flank_p_value: Scalars['Float']['output'];
  flank_z_score: Scalars['Float']['output'];
  lesser_peaks_occurrences_ratio: Scalars['Float']['output'];
  original_peaks: Scalars['Int']['output'];
  original_peaks_occurrences: Scalars['Int']['output'];
  peaks_accession: Scalars['String']['output'];
  points?: Maybe<Points>;
  pwm: Array<Maybe<Array<Scalars['Float']['output']>>>;
  shuffled_occurrences_ratio: Scalars['Float']['output'];
  shuffled_p_value: Scalars['Float']['output'];
  shuffled_z_score: Scalars['Float']['output'];
  sites: Scalars['Int']['output'];
  target?: Maybe<Scalars['String']['output']>;
};

export type HistoneAggregate = {
  __typename?: 'HistoneAggregate';
  assembly: Scalars['String']['output'];
  distal_values: Array<Scalars['Float']['output']>;
  histone_dataset_accession: Scalars['String']['output'];
  histone_signal_accession: Scalars['String']['output'];
  peaks_accession: Scalars['String']['output'];
  peaks_dataset_accession: Scalars['String']['output'];
  proximal_values: Array<Scalars['Float']['output']>;
  values: Array<Scalars['Float']['output']>;
};

export type HistoneAggregatePeakDataset = {
  __typename?: 'HistoneAggregatePeakDataset';
  assembly: Scalars['String']['output'];
  peaks_accession: Scalars['String']['output'];
  peaks_dataset_accession: Scalars['String']['output'];
};

export type Icre = {
  __typename?: 'ICRE';
  accession: Scalars['String']['output'];
  celltypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  coordinates: GenomicRange;
  dnasecelltypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  group: Scalars['String']['output'];
  rdhs: Scalars['String']['output'];
};

export type Icreldr = {
  __typename?: 'ICRELDR';
  celltype: Scalars['String']['output'];
  coefficient: Scalars['Float']['output'];
  coefficient_std_error: Scalars['Float']['output'];
  coefficient_zscore: Scalars['Float']['output'];
  enrichment: Scalars['Float']['output'];
  enrichment_p: Scalars['Float']['output'];
  enrichment_std_error: Scalars['Float']['output'];
  h2: Scalars['Float']['output'];
  h2_std_error: Scalars['Float']['output'];
  snps: Scalars['Float']['output'];
  study: Scalars['String']['output'];
};

export type IcreLdsc = {
  __typename?: 'ICRELdsc';
  author?: Maybe<Scalars['String']['output']>;
  biosample: Scalars['String']['output'];
  biosampleid: Scalars['String']['output'];
  biosampleorder: Scalars['Int']['output'];
  category: Scalars['String']['output'];
  celltype: Scalars['String']['output'];
  coefficient: Scalars['Float']['output'];
  coefficient_std_error: Scalars['Float']['output'];
  coefficient_zscore: Scalars['Float']['output'];
  disease: Scalars['String']['output'];
  enrichment: Scalars['Float']['output'];
  enrichment_p: Scalars['Float']['output'];
  enrichment_std_error: Scalars['Float']['output'];
  expvalue: Scalars['String']['output'];
  h2: Scalars['Float']['output'];
  h2_std_error: Scalars['Float']['output'];
  lineage: Scalars['String']['output'];
  snps: Scalars['Float']['output'];
  source: Scalars['String']['output'];
  stimulation: Scalars['String']['output'];
  study: Scalars['String']['output'];
  study_link: Scalars['String']['output'];
  study_source: Scalars['String']['output'];
};

export type IcreLdscBaseline = {
  __typename?: 'ICRELdscBaseline';
  celltype: Scalars['String']['output'];
  coefficient: Scalars['Float']['output'];
  coefficient_std_error: Scalars['Float']['output'];
  coefficient_zscore: Scalars['Float']['output'];
  enrichment: Scalars['Float']['output'];
  enrichment_p: Scalars['Float']['output'];
  enrichment_std_error: Scalars['Float']['output'];
  h2: Scalars['Float']['output'];
  h2_std_error: Scalars['Float']['output'];
  snps: Scalars['Float']['output'];
  study: Scalars['String']['output'];
};

export type IcreLdscStudyMetadata = {
  __typename?: 'ICRELdscStudyMetadata';
  author?: Maybe<Scalars['String']['output']>;
  category: Scalars['String']['output'];
  disease: Scalars['String']['output'];
  study_source: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type IcreCounts = {
  __typename?: 'IcreCounts';
  count?: Maybe<Scalars['Int']['output']>;
  excludedCelltypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  includedCelltypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type ImmuneAtacData = {
  __typename?: 'ImmuneATACData';
  accession: Scalars['String']['output'];
  assay: Scalars['String']['output'];
  biosample: Scalars['String']['output'];
  biosample_order: Scalars['Int']['output'];
  biosampleid: Scalars['String']['output'];
  celltype: Scalars['String']['output'];
  celltype_stim: Scalars['String']['output'];
  celltype_stim_order: Scalars['Int']['output'];
  chromosome: Scalars['String']['output'];
  class: Scalars['String']['output'];
  end?: Maybe<Scalars['Int']['output']>;
  expid: Scalars['String']['output'];
  lineage: Scalars['String']['output'];
  link: Scalars['String']['output'];
  name: Scalars['String']['output'];
  source: Scalars['String']['output'];
  start?: Maybe<Scalars['Int']['output']>;
  stimulation: Scalars['String']['output'];
  study: Scalars['String']['output'];
  umap_1: Scalars['Float']['output'];
  umap_2: Scalars['Float']['output'];
  umap_atac_1?: Maybe<Scalars['Float']['output']>;
  umap_atac_2?: Maybe<Scalars['Float']['output']>;
  umap_dnase_1?: Maybe<Scalars['Float']['output']>;
  umap_dnase_2?: Maybe<Scalars['Float']['output']>;
  value: Scalars['Float']['output'];
};

export type ImmuneGwasLdr = {
  __typename?: 'ImmuneGWASLdr';
  author?: Maybe<Scalars['String']['output']>;
  category: Scalars['String']['output'];
  disease: Scalars['String']['output'];
  effect_allele: Scalars['String']['output'];
  icre?: Maybe<Scalars['String']['output']>;
  icre_chr?: Maybe<Scalars['String']['output']>;
  icre_class?: Maybe<Scalars['String']['output']>;
  icre_end?: Maybe<Scalars['Int']['output']>;
  icre_start?: Maybe<Scalars['Int']['output']>;
  ref_allele: Scalars['String']['output'];
  snp_chr: Scalars['String']['output'];
  snp_end: Scalars['Int']['output'];
  snp_start: Scalars['Int']['output'];
  snpid: Scalars['String']['output'];
  study: Scalars['String']['output'];
  study_link: Scalars['String']['output'];
  study_source: Scalars['String']['output'];
  zscore: Scalars['Float']['output'];
};

export type ImmuneRnaData = {
  __typename?: 'ImmuneRnaData';
  biosample: Scalars['String']['output'];
  biosampleid: Scalars['String']['output'];
  celltype: Scalars['String']['output'];
  expid: Scalars['String']['output'];
  gene_id: Scalars['String']['output'];
  lineage: Scalars['String']['output'];
  link: Scalars['String']['output'];
  name: Scalars['String']['output'];
  source: Scalars['String']['output'];
  stimulation: Scalars['String']['output'];
  study: Scalars['String']['output'];
  umap_1: Scalars['Float']['output'];
  umap_2: Scalars['Float']['output'];
  value: Scalars['Float']['output'];
};

export type ImmuneeQtLs = {
  __typename?: 'ImmuneeQTLs';
  alt?: Maybe<Scalars['String']['output']>;
  ccre?: Maybe<Scalars['String']['output']>;
  celltype?: Maybe<Scalars['String']['output']>;
  chromosome?: Maybe<Scalars['String']['output']>;
  fdr?: Maybe<Scalars['Float']['output']>;
  genename?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Int']['output']>;
  pval_nominal?: Maybe<Scalars['Float']['output']>;
  ref?: Maybe<Scalars['String']['output']>;
  rsid?: Maybe<Scalars['String']['output']>;
  slope?: Maybe<Scalars['Float']['output']>;
  spearmans_rho?: Maybe<Scalars['Float']['output']>;
  study: Scalars['String']['output'];
  variant_id?: Maybe<Scalars['String']['output']>;
};

export type IntersectingCcrEs = {
  __typename?: 'IntersectingCCREs';
  assembly: Scalars['String']['output'];
  chromosome?: Maybe<Scalars['String']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  intersecting_ccres?: Maybe<Array<Maybe<Ccre>>>;
  start?: Maybe<Scalars['Int']['output']>;
};

export type IntersectingGenes = {
  __typename?: 'IntersectingGenes';
  assembly: Scalars['String']['output'];
  chromosome?: Maybe<Scalars['String']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  intersecting_genes?: Maybe<Array<Maybe<Gene>>>;
  limit?: Maybe<Scalars['Int']['output']>;
  protein_coding?: Maybe<Scalars['Boolean']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
};

export type LdrEnrichment = {
  __typename?: 'LDREnrichment';
  biosample: RegistryBiosample;
  conditional_enrichment: Scalars['Float']['output'];
  conditional_error: Scalars['Float']['output'];
  conditional_p: Scalars['Float']['output'];
  enrichment: Scalars['Float']['output'];
  enrichment_error: Scalars['Float']['output'];
  enrichment_p: Scalars['Float']['output'];
  study: Scalars['String']['output'];
};

export type Lab = {
  __typename?: 'Lab';
  friendly_name?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type LabPartitionCollection = DatasetCollection & {
  __typename?: 'LabPartitionCollection';
  counts: DatasetCounts;
  datasets: Array<PeakDataset>;
  lab: Lab;
  partitionByBiosample: Array<BiosamplePartitionCollection>;
  partitionByLab: Array<LabPartitionCollection>;
  partitionByTarget: Array<TargetPartitionCollection>;
};


export type LabPartitionCollectionPartitionByBiosampleArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type LabPartitionCollectionPartitionByLabArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type LabPartitionCollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type LinkedGenes = {
  __typename?: 'LinkedGenes';
  accession: Scalars['String']['output'];
  assay?: Maybe<Scalars['String']['output']>;
  assembly: Scalars['String']['output'];
  celltype?: Maybe<Scalars['String']['output']>;
  displayname?: Maybe<Scalars['String']['output']>;
  effectsize?: Maybe<Scalars['Float']['output']>;
  experiment_accession?: Maybe<Scalars['String']['output']>;
  gene: Scalars['String']['output'];
  geneid: Scalars['String']['output'];
  genetype: Scalars['String']['output'];
  grnaid?: Maybe<Scalars['String']['output']>;
  method: Scalars['String']['output'];
  p_val?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  slope?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  tissue?: Maybe<Scalars['String']['output']>;
  variantid?: Maybe<Scalars['String']['output']>;
};

export type LinkedGenesCelltypes = {
  __typename?: 'LinkedGenesCelltypes';
  celltype?: Maybe<Scalars['String']['output']>;
  displayname?: Maybe<Scalars['String']['output']>;
  method?: Maybe<Scalars['String']['output']>;
};

export type LinkedSnp = {
  __typename?: 'LinkedSNP';
  coordinates?: Maybe<GenomicRange>;
  dPrime: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  rSquared: Scalars['Float']['output'];
  snp?: Maybe<Snp>;
};


export type LinkedSnpCoordinatesArgs = {
  assembly: Scalars['String']['input'];
};


export type LinkedSnpSnpArgs = {
  assembly: Scalars['String']['input'];
};

export type MafResult = {
  __typename?: 'MAFResult';
  minorAlleles: Array<AlleleFrequency>;
  position: Position;
  refAllele: Scalars['String']['output'];
  snp: Scalars['String']['output'];
};

export type Mprafccdata = {
  __typename?: 'MPRAFCCDATA';
  assay_type: Scalars['String']['output'];
  barcode_location: Scalars['String']['output'];
  celltype: Scalars['String']['output'];
  chromosome: Scalars['String']['output'];
  element_location: Scalars['String']['output'];
  experiment: Scalars['String']['output'];
  log2fc: Scalars['Float']['output'];
  series: Scalars['String']['output'];
  start: Scalars['Int']['output'];
  stop: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
};

export type MemeMotif = {
  __typename?: 'MemeMotif';
  background_frequencies: Array<Scalars['Float']['output']>;
  cell_type: Scalars['String']['output'];
  consensus_regex: Scalars['String']['output'];
  e_value: Scalars['Float']['output'];
  factor: Scalars['String']['output'];
  flank_occurrences_ratio: Scalars['Float']['output'];
  flank_p_value: Scalars['Float']['output'];
  flank_z_score: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  lesser_peaks_occurrences_ratio: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  original_peaks: Scalars['Int']['output'];
  original_peaks_occurrences: Scalars['Int']['output'];
  peak_centrality: Scalars['PeakCentralityData']['output'];
  peaks_accession: Scalars['String']['output'];
  peaks_file?: Maybe<PeaksFile>;
  pwm: Array<Maybe<Array<Scalars['Float']['output']>>>;
  shuffled_occurrences_ratio: Scalars['Float']['output'];
  shuffled_p_value: Scalars['Float']['output'];
  shuffled_z_score: Scalars['Float']['output'];
  sites: Scalars['Int']['output'];
  tomtom_matches?: Maybe<Array<TargetMotif>>;
};

export type MemeMotifAlignment = {
  __typename?: 'MemeMotifAlignment';
  distance: Scalars['Float']['output'];
  motif: MemeMotif;
  offset: Scalars['Int']['output'];
  reverseComplement: Scalars['Boolean']['output'];
};

export type MemeMotifCount = {
  __typename?: 'MemeMotifCount';
  count: Scalars['Int']['output'];
};

export type MemeMotifOccurrence = {
  __typename?: 'MemeMotifOccurrence';
  consensus_regex: Scalars['String']['output'];
  genomic_region: GenomicRegion;
  motif?: Maybe<MemeMotif>;
  peaks_accession: Scalars['String']['output'];
  q_value: Scalars['Float']['output'];
  sequence?: Maybe<TwoBitData>;
  strand: Scalars['String']['output'];
};


export type MemeMotifOccurrenceSequenceArgs = {
  googleProject?: InputMaybe<Scalars['String']['input']>;
  twobit_url: Scalars['String']['input'];
};

export type MemeMotifSearchResult = {
  __typename?: 'MemeMotifSearchResult';
  results: Array<Maybe<MemeMotifAlignment>>;
  total: Scalars['Int']['output'];
};

export type MemeSelexMotif = {
  __typename?: 'MemeSelexMotif';
  assay?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  peaks_accession?: Maybe<Scalars['String']['output']>;
  pwm: Array<Maybe<Array<Scalars['Float']['output']>>>;
  selex_round?: Maybe<Scalars['Int']['output']>;
  study?: Maybe<Scalars['String']['output']>;
  target?: Maybe<Scalars['String']['output']>;
  tomtom_matches?: Maybe<Array<Maybe<TargetMotif>>>;
};

export type MethylFileMatch = {
  __typename?: 'MethylFileMatch';
  age: Scalars['String']['output'];
  age_units: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  biosample_ontology_id: Scalars['String']['output'];
  donor: Scalars['String']['output'];
  life_stage: Scalars['String']['output'];
  methyl_bed_accessions: Array<Scalars['String']['output']>;
  methyl_dataset_accession: Scalars['String']['output'];
  peaks_accession: Scalars['String']['output'];
  peaks_dataset_accession: Scalars['String']['output'];
};

export type ModificationData = {
  __typename?: 'ModificationData';
  amino_acid_code?: Maybe<Scalars['String']['output']>;
  modification?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['String']['output']>;
};

export type Modifications = {
  __typename?: 'Modifications';
  modification?: Maybe<Array<Maybe<ModificationData>>>;
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type MotifAlignment = {
  __typename?: 'MotifAlignment';
  distance: Scalars['Float']['output'];
  motif: MemeSelexMotif;
  offset: Scalars['Int']['output'];
  reverseComplement: Scalars['Boolean']['output'];
};

export type MotifEnrichment = {
  __typename?: 'MotifEnrichment';
  bins: Array<Scalars['Float']['output']>;
  biosample: Scalars['String']['output'];
  motif?: Maybe<MemeMotif>;
  motif_id: Scalars['String']['output'];
  p_value: Scalars['Float']['output'];
  statistic: Scalars['Float']['output'];
  top_enrichment_value: Scalars['Float']['output'];
  top_enrichment_z_score: Scalars['Float']['output'];
};

export type MotifEnrichmentMatrix = {
  __typename?: 'MotifEnrichmentMatrix';
  biosamples: Array<Scalars['String']['output']>;
  motif_ids: Array<Scalars['String']['output']>;
  z_scores: Array<Array<Maybe<Scalars['Float']['output']>>>;
};

export type MotifInstanceInput = {
  name: Scalars['String']['input'];
  peaks_accession: Scalars['String']['input'];
};

export type MotifRanking = {
  __typename?: 'MotifRanking';
  alt?: Maybe<Scalars['Float']['output']>;
  diff?: Maybe<Scalars['Float']['output']>;
  motif?: Maybe<Scalars['String']['output']>;
  ref?: Maybe<Scalars['Float']['output']>;
  regionid?: Maybe<Scalars['String']['output']>;
  threshold?: Maybe<Scalars['Float']['output']>;
};

export type MotifRankingInput = {
  alt: Scalars['String']['input'];
  chrom: Scalars['String']['input'];
  end: Scalars['Int']['input'];
  ref: Scalars['String']['input'];
  regionid: Scalars['String']['input'];
  start: Scalars['Int']['input'];
};

export type MotifRankingRefCheck = {
  __typename?: 'MotifRankingRefCheck';
  chrom?: Maybe<Scalars['String']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  ref?: Maybe<Scalars['String']['output']>;
  refTrue?: Maybe<Scalars['String']['output']>;
  regionid?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
  strand?: Maybe<Scalars['String']['output']>;
};

export type MotifRankingRefCheckInput = {
  chrom: Scalars['String']['input'];
  end: Scalars['Int']['input'];
  ref: Scalars['String']['input'];
  regionid: Scalars['String']['input'];
  start: Scalars['Int']['input'];
  strand: Scalars['String']['input'];
};

export type MotifSearchResult = {
  __typename?: 'MotifSearchResult';
  results: Array<Maybe<MotifAlignment>>;
  total: Scalars['Int']['output'];
};

export type MultipleGenomicRegionInput = {
  /** Start chromosome */
  chr1: Scalars['String']['input'];
  /** (Optional) End chromosome. Start chromosome will be used if omitted. */
  chr2?: InputMaybe<Scalars['String']['input']>;
  /** End base pair */
  end: Scalars['Int']['input'];
  /** (Optional) If passed, returns twobit data in one hot encoded format */
  oneHotEncodedFormat?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * (Optional) If passed, pre-renders BigWig data to match the given number of
   * bins to save download and rendering time on the frontend.
   */
  preRenderedWidth?: InputMaybe<Scalars['Int']['input']>;
  /** Start base pair */
  start: Scalars['Int']['input'];
  /** (Optional) Base pairs per item. Picks the highest available in the file without going over. */
  zoomLevel?: InputMaybe<Scalars['Int']['input']>;
};

export type MultipleRegionBigRequest = {
  regions: Array<InputMaybe<MultipleGenomicRegionInput>>;
  /** URL of the file to request data from */
  url: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addcCREs: Array<Maybe<Scalars['String']['output']>>;
  addupdatecCREs: Array<Maybe<Scalars['String']['output']>>;
  create_user_collection: UserCollection;
  create_user_dataset: GeneDataset;
  create_user_gene_quantification_file: GeneQuantificationFile;
  create_user_transcript_quantification_file: GeneQuantificationFile;
  delete_user_collection: Scalars['ID']['output'];
  delete_user_dataset: Scalars['ID']['output'];
  delete_user_gene_quantification_file: Scalars['ID']['output'];
  delete_user_transcript_quantification_file: Scalars['ID']['output'];
  queue_user_collection_import: Scalars['ID']['output'];
  update_user_collection: UserCollection;
  update_user_dataset: GeneDataset;
  update_user_gene_quantification_file: GeneQuantificationFile;
  update_user_transcript_quantification_file: GeneQuantificationFile;
};


export type MutationAddcCrEsArgs = {
  accessions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  uuid: Scalars['String']['input'];
};


export type MutationAddupdatecCrEsArgs = {
  accessions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  uuid: Scalars['String']['input'];
};


export type MutationCreate_User_CollectionArgs = {
  is_public?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreate_User_DatasetArgs = {
  assay_term_name?: InputMaybe<Scalars['String']['input']>;
  biosample: Scalars['String']['input'];
  biosample_type?: InputMaybe<Scalars['String']['input']>;
  cell_compartment?: InputMaybe<Scalars['String']['input']>;
  lab_friendly_name?: InputMaybe<Scalars['String']['input']>;
  lab_name?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  tissue?: InputMaybe<Scalars['String']['input']>;
  user_collection_accession: Scalars['ID']['input'];
};


export type MutationCreate_User_Gene_Quantification_FileArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  biorep?: InputMaybe<Scalars['Int']['input']>;
  dataset_accession: Scalars['ID']['input'];
  techrep?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationCreate_User_Transcript_Quantification_FileArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  biorep?: InputMaybe<Scalars['Int']['input']>;
  dataset_accession: Scalars['ID']['input'];
  techrep?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationDelete_User_CollectionArgs = {
  accession: Scalars['ID']['input'];
};


export type MutationDelete_User_DatasetArgs = {
  accession: Scalars['ID']['input'];
};


export type MutationDelete_User_Gene_Quantification_FileArgs = {
  accession: Scalars['ID']['input'];
};


export type MutationDelete_User_Transcript_Quantification_FileArgs = {
  accession: Scalars['ID']['input'];
};


export type MutationQueue_User_Collection_ImportArgs = {
  accession: Scalars['ID']['input'];
};


export type MutationUpdate_User_CollectionArgs = {
  accession: Scalars['ID']['input'];
  is_public?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdate_User_DatasetArgs = {
  accession: Scalars['ID']['input'];
  assay_term_name?: InputMaybe<Scalars['String']['input']>;
  biosample?: InputMaybe<Scalars['String']['input']>;
  biosample_type?: InputMaybe<Scalars['String']['input']>;
  cell_compartment?: InputMaybe<Scalars['String']['input']>;
  lab_friendly_name?: InputMaybe<Scalars['String']['input']>;
  lab_name?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  tissue?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdate_User_Gene_Quantification_FileArgs = {
  accession: Scalars['ID']['input'];
  assembly?: InputMaybe<Scalars['String']['input']>;
  biorep?: InputMaybe<Scalars['Int']['input']>;
  techrep?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdate_User_Transcript_Quantification_FileArgs = {
  accession: Scalars['ID']['input'];
  assembly?: InputMaybe<Scalars['String']['input']>;
  biorep?: InputMaybe<Scalars['Int']['input']>;
  techrep?: InputMaybe<Scalars['Int']['input']>;
};

export type NearbyGenes = {
  __typename?: 'NearbyGenes';
  assembly: Scalars['String']['output'];
  chromosome?: Maybe<Scalars['String']['output']>;
  end: Scalars['Int']['output'];
  intersecting_genes: Array<Gene>;
  start: Scalars['Int']['output'];
};

export type NearestGenes = {
  __typename?: 'NearestGenes';
  distance: Scalars['Int']['output'];
  gene: Scalars['String']['output'];
};

export type NormalizedSignal = File & {
  __typename?: 'NormalizedSignal';
  accession: Scalars['String']['output'];
  assembly: Assembly;
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset: PeakDataset;
  techrep?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type Ortholog = {
  __typename?: 'Ortholog';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  ortholog: Array<Maybe<OrthologcCre>>;
};

export type PCollection = PeaksCollection & {
  __typename?: 'PCollection';
  count?: Maybe<PeaksCounts>;
  partitionByTarget: Array<TargetPeaksPartitionCollection>;
  peaks: Array<Peak>;
};


export type PCollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Plsgenes = {
  __typename?: 'PLSGENES';
  accession: Scalars['String']['output'];
  geneid: Scalars['String']['output'];
};

export type Peak = {
  __typename?: 'Peak';
  chrom: Scalars['String']['output'];
  chrom_end: Scalars['Int']['output'];
  chrom_start: Scalars['Int']['output'];
  dataset: PeakDataset;
  experiment_accession: Scalars['String']['output'];
  file_accession: Scalars['String']['output'];
  name: Scalars['String']['output'];
  p_value: Scalars['Float']['output'];
  peak: Scalars['Int']['output'];
  q_value: Scalars['Float']['output'];
  score: Scalars['Int']['output'];
  signal_over_peaks?: Maybe<BigResponseWithRange>;
  signal_value: Scalars['Float']['output'];
  strand: Scalars['String']['output'];
};

export type PeakCount = {
  __typename?: 'PeakCount';
  count: Scalars['Int']['output'];
};

export type PeakDataset = {
  __typename?: 'PeakDataset';
  accession: Scalars['String']['output'];
  biosample: Scalars['String']['output'];
  cell_slims?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  developmental_slims?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /**
   * Returns all files from this dataset. Can filter by the processed assembly.
   * NOTE: files with no assembly (i.e. sequence reads) will be returned regardless of assembly filter
   * Can also filter by file types.
   * Current types are:
   * - sequence_reads
   * - unfiltered_alignments
   * - filtered_alignments
   * - unreplicated_peaks
   * - replicated_peaks
   * - normalized_signal
   */
  files: Array<File>;
  investigated_as?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  lab?: Maybe<Lab>;
  organ_slims?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  project: Scalars['String']['output'];
  released?: Maybe<Scalars['Date']['output']>;
  source: Scalars['String']['output'];
  species: Scalars['String']['output'];
  system_slims?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  target?: Maybe<Scalars['String']['output']>;
};


export type PeakDatasetFilesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type PeaksCollection = {
  count?: Maybe<PeaksCounts>;
  partitionByTarget: Array<TargetPeaksPartitionCollection>;
  peaks: Array<Peak>;
};


export type PeaksCollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type PeaksCounts = {
  __typename?: 'PeaksCounts';
  peaks: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PeaksFile = {
  __typename?: 'PeaksFile';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  biosample: Scalars['String']['output'];
  dataset?: Maybe<PeakDataset>;
  dataset_accession: Scalars['String']['output'];
  target: Scalars['String']['output'];
};

export type PeaksResponse = {
  __typename?: 'PeaksResponse';
  data?: Maybe<Scalars['PeaksResponseData']['output']>;
  error?: Maybe<RequestError>;
};

export type Point = {
  __typename?: 'Point';
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type PointInput = {
  x: Scalars['Float']['input'];
  y: Scalars['Float']['input'];
};

export type Points = {
  __typename?: 'Points';
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export enum Population {
  African = 'AFRICAN',
  American = 'AMERICAN',
  EastAsian = 'EAST_ASIAN',
  European = 'EUROPEAN',
  SouthAsian = 'SOUTH_ASIAN'
}

export type Position = {
  __typename?: 'Position';
  chromosome: Scalars['String']['output'];
  position: Scalars['Int']['output'];
};

export type PositionInput = {
  chromosome: Scalars['String']['input'];
  position: Scalars['Int']['input'];
};

export type ProCapPeaks = {
  __typename?: 'ProCapPeaks';
  celltype?: Maybe<Scalars['String']['output']>;
  chromosome: Scalars['String']['output'];
  experiment_accession?: Maybe<Scalars['String']['output']>;
  file_accession?: Maybe<Scalars['String']['output']>;
  start: Scalars['Int']['output'];
  stop: Scalars['Int']['output'];
  stringency?: Maybe<Scalars['String']['output']>;
};

export type PsychEncodeDatasetValues = {
  __typename?: 'PsychEncodeDatasetValues';
  avgexp?: Maybe<Scalars['Float']['output']>;
  celltype?: Maybe<Scalars['String']['output']>;
  dataset?: Maybe<Scalars['String']['output']>;
  gene?: Maybe<Scalars['String']['output']>;
  pctexp?: Maybe<Scalars['Float']['output']>;
};

export type QtlSigAssoc = {
  __typename?: 'QtlSigAssoc';
  dist?: Maybe<Scalars['Float']['output']>;
  fdr?: Maybe<Scalars['Float']['output']>;
  geneid?: Maybe<Scalars['String']['output']>;
  npval?: Maybe<Scalars['Float']['output']>;
  qtltype?: Maybe<Scalars['String']['output']>;
  slope?: Maybe<Scalars['Float']['output']>;
  snpid?: Maybe<Scalars['String']['output']>;
};

export type QuantDataSource = {
  __typename?: 'QuantDataSource';
  type?: Maybe<QuantDataSourceType>;
  user_collection?: Maybe<Scalars['String']['output']>;
};

export type QuantDataSourceInput = {
  type?: InputMaybe<QuantDataSourceType>;
  user_collection?: InputMaybe<Scalars['String']['input']>;
};

export enum QuantDataSourceType {
  Encode = 'ENCODE',
  PsychEncode = 'PSYCH_ENCODE',
  User = 'USER'
}

export type QuantificationRange = {
  high: Scalars['Float']['input'];
  low: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  ComputationalGeneLinksQuery?: Maybe<Array<Maybe<ComputationalGeneLinks>>>;
  aggregationQuery: AggregationResult;
  assemblies: Array<Assembly>;
  atac_aggregate?: Maybe<Array<AtacAggregate>>;
  /** Request BigWig / BigBed data */
  bigRequests: Array<BigResponse>;
  /** Request BigWig / BigBed data same url multiple regions */
  bigRequestsMultipleRegions: Array<BigResponse>;
  biosamples: Array<Biosample>;
  cCREAutocompleteQuery: Array<CcreWithRegion>;
  cCREQuery: Array<Ccre>;
  cCRESCREENSearch: Array<ScreenSearchResult>;
  cQTLQuery: Array<CQtl>;
  capraFccDoubleQuery?: Maybe<Array<Maybe<Caprafccdoubledata>>>;
  capraFccSoloQuery?: Maybe<Array<Maybe<Caprafccsolodata>>>;
  caqtls?: Maybe<Array<Maybe<CaQtls>>>;
  ccREBiosampleQuery: RegistryBiosampleCollection;
  ccreTranscriptionQuery?: Maybe<Array<Maybe<CcreTranscription>>>;
  celltype?: Maybe<Array<Maybe<Celltype>>>;
  chromlengths?: Maybe<Array<Maybe<ChromLength>>>;
  closestGenetocCRE?: Maybe<Array<Maybe<ClosestGene>>>;
  conservation_aggregate?: Maybe<Array<ConservationAggregate>>;
  createTrackhubQuery: Scalars['String']['output'];
  createicresFilesQuery: Scalars['String']['output'];
  cytoband?: Maybe<Array<Maybe<Cytoband>>>;
  deconqtlsQuery?: Maybe<Array<Maybe<DeconQtls>>>;
  deep_learned_motif_peak_occurrences?: Maybe<Array<Maybe<DlMotifPeakOccurrences>>>;
  deep_learned_motif_rdhs_occurrences?: Maybe<Array<Maybe<DlMotifRdhsOccurrences>>>;
  deep_learned_motifs?: Maybe<Array<Maybe<DeepLearnedMotif>>>;
  deep_learned_motifs_counts?: Maybe<DeepLearnedMotifCount>;
  deep_learned_motifs_data?: Maybe<DeepLearnedMotitfResponse>;
  degQuery?: Maybe<Array<Maybe<Deg>>>;
  dnase_aggregate?: Maybe<Array<DNaseAggregate>>;
  eQTLQuery: Array<EQtl>;
  ebiAssociationsQuery?: Maybe<Array<Maybe<EbiAssociations>>>;
  elementQuery: Array<Maybe<Element>>;
  entexActiveAnnotationsQuery?: Maybe<Array<Maybe<EntexActiveAnnotations>>>;
  entexQuery?: Maybe<Array<Maybe<EntexData>>>;
  factor?: Maybe<Array<Maybe<Factor>>>;
  fieldQuery: Array<Maybe<FieldResult>>;
  functionalCharacterizationQuery?: Maybe<Array<Maybe<Fcdata>>>;
  gene?: Maybe<Array<Maybe<Gene>>>;
  geneSpecificity?: Maybe<Array<Maybe<GeneSpecificity>>>;
  gene_count?: Maybe<Array<Maybe<GenesCountResponse>>>;
  gene_dataset?: Maybe<Array<Maybe<GeneDataset>>>;
  gene_quantification?: Maybe<Array<Maybe<GeneQuantification>>>;
  geneexpressiontpms?: Maybe<Array<Maybe<GeneExpressionOutput>>>;
  geneorthologQuery?: Maybe<Array<Maybe<GeneOrtholog>>>;
  genesAssociationsQuery?: Maybe<Array<Maybe<GeneAssociation>>>;
  genomeWideAssociationQuery: Array<Gwas>;
  genomicAssemblies?: Maybe<Array<Maybe<GenomicAssembly>>>;
  getAllGwasStudies?: Maybe<Array<Maybe<GwasStudies>>>;
  getGWASCtEnrichmentQuery?: Maybe<Array<Maybe<GwasCelltypeEnrichment>>>;
  getLinkedGenesCelltypes?: Maybe<Array<Maybe<LinkedGenesCelltypes>>>;
  getPedatasetValuesbyCelltypeQuery?: Maybe<Array<Maybe<PsychEncodeDatasetValues>>>;
  getPedatasetValuesbySubclassQuery?: Maybe<Array<Maybe<PsychEncodeDatasetValues>>>;
  getSNPsforGWASStudies?: Maybe<Array<Maybe<GwasStudySnPs>>>;
  getcCRELinksQuery?: Maybe<CcreLinksDetails>;
  getcCRENodeCelltypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  getcCRETFQuery?: Maybe<Array<Maybe<CelltypeTf>>>;
  getcartAccessionsQuery?: Maybe<Array<Scalars['String']['output']>>;
  gettssRampagePeaks?: Maybe<Array<Maybe<TssPeaksResponse>>>;
  groundLevelVersionsQuery: Array<GroundLevelVersionsEntries>;
  gtexQTLQuery: Array<GtExQtl>;
  gtex_genes?: Maybe<Array<Maybe<GtexGenes>>>;
  gwas_motif_enrichment?: Maybe<Array<Maybe<GwasMotifEnrichment>>>;
  gwas_peak_enrichment?: Maybe<Array<Maybe<GwasPeakEnrichment>>>;
  gwasintersectingSnpsWithBcreQuery?: Maybe<Array<Maybe<GwasIntersectingSnpsWithBcre>>>;
  gwasintersectingSnpsWithCcreQuery?: Maybe<Array<Maybe<GwasIntersectingSnpsWithCcre>>>;
  gwassnpAssociationsQuery?: Maybe<Array<Maybe<GwasSnpAssociation>>>;
  highquality_meme_motifs?: Maybe<Array<Maybe<HighQualityMemeMotif>>>;
  histone_aggregate_peak_datasets?: Maybe<Array<HistoneAggregatePeakDataset>>;
  histone_aggregate_values?: Maybe<Array<HistoneAggregate>>;
  iCRELdscBaselineQuery?: Maybe<Array<Maybe<IcreLdscBaseline>>>;
  iCRELdscQuery?: Maybe<Array<Maybe<IcreLdsc>>>;
  iCRELdscStudiesQuery: Array<Maybe<IcreLdscStudyMetadata>>;
  iCREQuery: Array<Icre>;
  iCREsCountQuery?: Maybe<Scalars['Int']['output']>;
  icreeQTLQuery?: Maybe<Array<Maybe<Eqtl>>>;
  immuneGWASLdrQuery?: Maybe<Array<Maybe<ImmuneGwasLdr>>>;
  immuneRnaUmapQuery?: Maybe<Array<Maybe<ImmuneRnaData>>>;
  immuneeQTLsQuery?: Maybe<Array<Maybe<ImmuneeQtLs>>>;
  immuneiCREsUmapQuery?: Maybe<Array<Maybe<ImmuneAtacData>>>;
  intersection?: Maybe<Array<Maybe<Scalars['cCRE']['output']>>>;
  ldr: Array<LdrEnrichment>;
  linkedGenesQuery: Array<Maybe<LinkedGenes>>;
  linkedcCREsQuery: Array<Maybe<LinkedGenes>>;
  maf: Array<MafResult>;
  meme_methyl_motifs?: Maybe<Array<Maybe<MemeMotif>>>;
  meme_methyl_occurrences?: Maybe<Array<Maybe<MemeMotifOccurrence>>>;
  meme_motif_count?: Maybe<MemeMotifCount>;
  meme_motif_search?: Maybe<Array<Maybe<MemeMotifSearchResult>>>;
  meme_motif_search_query?: Maybe<Array<Maybe<MotifSearchResult>>>;
  meme_motifs?: Maybe<Array<Maybe<MemeMotif>>>;
  meme_occurrences?: Maybe<Array<Maybe<MemeMotifOccurrence>>>;
  methyl_file_matches?: Maybe<Array<Maybe<MethylFileMatch>>>;
  motif_enrichment?: Maybe<Array<MotifEnrichment>>;
  motif_enrichment_biosamples?: Maybe<Array<Scalars['String']['output']>>;
  motif_enrichment_matrix?: Maybe<MotifEnrichmentMatrix>;
  motifranking?: Maybe<Array<Maybe<MotifRanking>>>;
  mpraFccQuery?: Maybe<Array<Maybe<Mprafccdata>>>;
  my_user_collections: Array<Maybe<UserCollection>>;
  nearby_genes?: Maybe<Array<Maybe<Gene>>>;
  nearestGenes: Array<NearbyGenes>;
  orthologQuery?: Maybe<Array<Maybe<Ortholog>>>;
  peakCount?: Maybe<PeakCount>;
  peakDataset: DatasetCollection;
  peaks: PeaksCollection;
  peaks_files?: Maybe<Array<Maybe<PeaksFile>>>;
  peaksrange?: Maybe<PeaksResponse>;
  peaksrangecount?: Maybe<Scalars['Boolean']['output']>;
  plsGenesQuery?: Maybe<Array<Maybe<Plsgenes>>>;
  proCapPeaksQuery?: Maybe<Array<Maybe<ProCapPeaks>>>;
  public_user_collections: Array<Maybe<UserCollection>>;
  qtlsigassocQuery?: Maybe<Array<Maybe<QtlSigAssoc>>>;
  rDHSQuery: Array<Rdhs>;
  rampageQuery?: Maybe<Array<Maybe<RampageResponse>>>;
  rdhs_motif_occurrences?: Maybe<Array<Maybe<RdhsMotifOccurrence>>>;
  rdhs_motif_occurrences_count?: Maybe<RdhsMotifOccurrenceCount>;
  refcheckmotifranking?: Maybe<Array<Maybe<MotifRankingRefCheck>>>;
  refseqgenes?: Maybe<Array<Maybe<RefSeqGene>>>;
  refseqxenogenes?: Maybe<Array<Maybe<RefSeqGene>>>;
  resolve: Array<GenomicObject>;
  rnaSeqQuery?: Maybe<Array<Maybe<RnaSeqData>>>;
  silencersQuery?: Maybe<Array<Maybe<SilencerData>>>;
  singleCellBoxPlotQuery?: Maybe<Array<Maybe<SinglCellBoxPlot>>>;
  singleCellGenesQuery?: Maybe<Array<Maybe<SingleCellGene>>>;
  singleCellUmapQuery?: Maybe<Array<Maybe<SingleCellType>>>;
  snpAssociationsQuery?: Maybe<Array<Maybe<SnpAssociation>>>;
  snpAutocompleteQuery: Array<Snp>;
  snpDensityQuery: Array<SnpDensity>;
  snpQuery: Array<Snp>;
  species: Array<Species>;
  specific_elements?: Maybe<Array<Maybe<SpecificElement>>>;
  suggest: Array<GenomicObject>;
  target_motifs?: Maybe<Array<Maybe<TargetMotif>>>;
  targets: Array<Target>;
  /** Request Trackhub data */
  trackHubRequests: TrackHubResponse;
  transcript?: Maybe<Array<Maybe<Transcript>>>;
  transcript_quantification?: Maybe<Array<Maybe<TranscriptQuantification>>>;
  tssrampageQuery?: Maybe<Array<Maybe<TssRampageResponse>>>;
  upsetploticrecounts?: Maybe<Array<Maybe<IcreCounts>>>;
  user_collection?: Maybe<UserCollection>;
  vistaQuery: Array<VistaEnhancer>;
  zScoreQuery: Array<ZScore>;
};


export type QueryComputationalGeneLinksQueryArgs = {
  accession: Scalars['String']['input'];
};


export type QueryAggregationQueryArgs = {
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  dataset: Scalars['String']['input'];
  field: Scalars['String']['input'];
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  umap_polygon?: InputMaybe<CoordinateInput>;
};


export type QueryAssembliesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  searchterm?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  species?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAtac_AggregateArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  atac_alignments_accession?: InputMaybe<Scalars['String']['input']>;
  atac_dataset_accession?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  motif?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Array<Scalars['String']['input']>>;
  peaks_dataset_accession?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBigRequestsArgs = {
  googleProject?: InputMaybe<Scalars['String']['input']>;
  requests: Array<BigRequest>;
};


export type QueryBigRequestsMultipleRegionsArgs = {
  googleProject?: InputMaybe<Scalars['String']['input']>;
  requests: MultipleRegionBigRequest;
};


export type QueryBiosamplesArgs = {
  biosample_prefix?: InputMaybe<Scalars['String']['input']>;
  exclude_investigatedas?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  include_investigatedas?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lab?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  processed_assembly?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<Scalars['String']['input']>;
  replicated_peaks?: InputMaybe<Scalars['Boolean']['input']>;
  searchterm?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  species?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCCreAutocompleteQueryArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  accession_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  group?: InputMaybe<Array<Scalars['String']['input']>>;
  includeiCREs?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rDHS?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryCCreQueryArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  accession_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  activeInAnyBiosample?: InputMaybe<Array<Scalars['String']['input']>>;
  activeInBiosamples?: InputMaybe<Array<Scalars['String']['input']>>;
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  group?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rDHS?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryCCrescreenSearchArgs = {
  accessions?: InputMaybe<Array<Scalars['String']['input']>>;
  assembly: Scalars['String']['input'];
  cellType?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<Array<InputMaybe<GenomicRangeInput>>>;
  element_type?: InputMaybe<Scalars['String']['input']>;
  gene_all_end?: InputMaybe<Scalars['Int']['input']>;
  gene_all_start?: InputMaybe<Scalars['Int']['input']>;
  gene_pc_end?: InputMaybe<Scalars['Int']['input']>;
  gene_pc_start?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  mammals_max?: InputMaybe<Scalars['Float']['input']>;
  mammals_min?: InputMaybe<Scalars['Float']['input']>;
  nearbygenesdistancethreshold?: InputMaybe<Scalars['Int']['input']>;
  nearbygeneslimit?: InputMaybe<Scalars['Int']['input']>;
  primates_max?: InputMaybe<Scalars['Float']['input']>;
  primates_min?: InputMaybe<Scalars['Float']['input']>;
  rank_atac_end?: InputMaybe<Scalars['Float']['input']>;
  rank_atac_start?: InputMaybe<Scalars['Float']['input']>;
  rank_ctcf_end?: InputMaybe<Scalars['Float']['input']>;
  rank_ctcf_start?: InputMaybe<Scalars['Float']['input']>;
  rank_dnase_end?: InputMaybe<Scalars['Float']['input']>;
  rank_dnase_start?: InputMaybe<Scalars['Float']['input']>;
  rank_enhancer_end?: InputMaybe<Scalars['Float']['input']>;
  rank_enhancer_start?: InputMaybe<Scalars['Float']['input']>;
  rank_promoter_end?: InputMaybe<Scalars['Float']['input']>;
  rank_promoter_start?: InputMaybe<Scalars['Float']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  vertebrates_max?: InputMaybe<Scalars['Float']['input']>;
  vertebrates_min?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryCQtlQueryArgs = {
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<GenomicRangeInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peakId?: InputMaybe<Scalars['String']['input']>;
  snpId?: InputMaybe<Scalars['String']['input']>;
  strand?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCapraFccDoubleQueryArgs = {
  accession: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QueryCapraFccSoloQueryArgs = {
  accession: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QueryCaqtlsArgs = {
  snpid: Scalars['String']['input'];
};


export type QueryCcReBiosampleQueryArgs = {
  assay?: InputMaybe<Array<Scalars['String']['input']>>;
  assembly: Scalars['String']['input'];
  name?: InputMaybe<Array<Scalars['String']['input']>>;
  umap_coordinates?: InputMaybe<Array<Scalars['Float']['input']>>;
};


export type QueryCcreTranscriptionQueryArgs = {
  assembly: Scalars['String']['input'];
  chromosome: Scalars['String']['input'];
  start: Scalars['Int']['input'];
  stop: Scalars['Int']['input'];
};


export type QueryCelltypeArgs = {
  assembly: Scalars['String']['input'];
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryChromlengthsArgs = {
  assembly: Scalars['String']['input'];
  chromosome?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxLength?: InputMaybe<Scalars['Int']['input']>;
  minLength?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryClosestGenetocCreArgs = {
  ccre?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  geneid?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryConservation_AggregateArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  conservation_type?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  motif?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Array<Scalars['String']['input']>>;
  peaks_dataset_accession?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCreateTrackhubQueryArgs = {
  assembly: Scalars['String']['input'];
  celltypes: Array<InputMaybe<CellTypeInput>>;
  uuid: Scalars['String']['input'];
};


export type QueryCreateicresFilesQueryArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  accession_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  allcelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  celltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  dnaseallcelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  dnasecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  dnaseexcludecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  excludecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  group?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rDHS?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
};


export type QueryCytobandArgs = {
  assembly: Scalars['String']['input'];
  bandname?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  chromosome?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<GenomicRangeInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  stain?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryDeconqtlsQueryArgs = {
  geneid?: InputMaybe<Scalars['String']['input']>;
  snpid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDeep_Learned_Motif_Peak_OccurrencesArgs = {
  genomic_region: Array<GenomicRegionInput>;
  tf?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDeep_Learned_Motif_Rdhs_OccurrencesArgs = {
  constrained_score_threshold?: InputMaybe<Scalars['Float']['input']>;
  genomic_region: Array<GenomicRegionInput>;
  rdhs?: InputMaybe<Scalars['Boolean']['input']>;
  sequence?: InputMaybe<Scalars['String']['input']>;
  tf?: InputMaybe<Scalars['String']['input']>;
  z_score_threshold?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryDeep_Learned_MotifsArgs = {
  accession?: InputMaybe<Scalars['String']['input']>;
  assay?: InputMaybe<Scalars['String']['input']>;
  protein_type?: InputMaybe<Scalars['String']['input']>;
  selex_round?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  source?: InputMaybe<Scalars['String']['input']>;
  species?: InputMaybe<Scalars['String']['input']>;
  tf?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDeep_Learned_Motifs_CountsArgs = {
  accession?: InputMaybe<Scalars['String']['input']>;
  assay?: InputMaybe<Scalars['String']['input']>;
  protein_type?: InputMaybe<Scalars['String']['input']>;
  selex_round?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  source?: InputMaybe<Scalars['String']['input']>;
  species?: InputMaybe<Scalars['String']['input']>;
  tf?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDeep_Learned_Motifs_DataArgs = {
  accession?: InputMaybe<Scalars['String']['input']>;
  assay?: InputMaybe<Scalars['String']['input']>;
  protein_type?: InputMaybe<Scalars['String']['input']>;
  selex_round?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  source?: InputMaybe<Scalars['String']['input']>;
  species?: InputMaybe<Scalars['String']['input']>;
  tf?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDegQueryArgs = {
  celltype?: InputMaybe<Scalars['String']['input']>;
  disease: Scalars['String']['input'];
  gene?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDnase_AggregateArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  dnase_alignments_accession?: InputMaybe<Scalars['String']['input']>;
  dnase_dataset_accession?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  motif?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Array<Scalars['String']['input']>>;
  peaks_dataset_accession?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEQtlQueryArgs = {
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<GenomicRangeInput>;
  geneId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  snpId?: InputMaybe<Scalars['String']['input']>;
  strand?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEbiAssociationsQueryArgs = {
  accession?: InputMaybe<Scalars['String']['input']>;
  snpid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryElementQueryArgs = {
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  dataset: Scalars['String']['input'];
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  umap_polygon?: InputMaybe<CoordinateInput>;
};


export type QueryEntexActiveAnnotationsQueryArgs = {
  coordinates: GenomicRangeInput;
};


export type QueryEntexQueryArgs = {
  accession: Scalars['String']['input'];
};


export type QueryFactorArgs = {
  assembly: Scalars['String']['input'];
  id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isTF?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_prefix?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFieldQueryArgs = {
  dataset: Scalars['String']['input'];
  type: FieldType;
};


export type QueryFunctionalCharacterizationQueryArgs = {
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
};


export type QueryGeneArgs = {
  assembly: Scalars['String']['input'];
  chromosome?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  gene_type?: InputMaybe<Scalars['String']['input']>;
  havana_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  idprefix?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderby?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  strand?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGeneSpecificityArgs = {
  geneid?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryGene_CountArgs = {
  assembly: Scalars['String']['input'];
  gene_type?: InputMaybe<Scalars['String']['input']>;
  havana_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  range?: InputMaybe<Array<InputMaybe<ChromRange>>>;
  strand?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGene_DatasetArgs = {
  accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assay_term_name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  biosample?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  biosample_type?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  biosample_value?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cell_compartment?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  diagnosis?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lab?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  life_stage?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  processed_assembly?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  source?: InputMaybe<QuantDataSourceInput>;
  study?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  suicidaldeath?: InputMaybe<Scalars['Boolean']['input']>;
  tissue?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user_collection_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryGene_QuantificationArgs = {
  assembly: Scalars['String']['input'];
  experiment_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  file_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fpkm_range?: InputMaybe<QuantificationRange>;
  gene_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  gene_id_prefix?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortByTpm?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<QuantDataSourceInput>;
  tpm_range?: InputMaybe<QuantificationRange>;
};


export type QueryGeneexpressiontpmsArgs = {
  aggregateBy?: InputMaybe<AggregateByEnum>;
  biosample?: InputMaybe<Array<Scalars['String']['input']>>;
  genes: Array<Scalars['String']['input']>;
  tissue?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGeneorthologQueryArgs = {
  assembly: Scalars['String']['input'];
  name: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QueryGenesAssociationsQueryArgs = {
  disease: Scalars['String']['input'];
  gene_id?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGenomeWideAssociationQueryArgs = {
  assembly: Scalars['String']['input'];
  pmIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};


export type QueryGenomicAssembliesArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  species?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetGwasCtEnrichmentQueryArgs = {
  study: Scalars['String']['input'];
};


export type QueryGetPedatasetValuesbyCelltypeQueryArgs = {
  dataset: Array<InputMaybe<Scalars['String']['input']>>;
  gene: Scalars['String']['input'];
};


export type QueryGetPedatasetValuesbySubclassQueryArgs = {
  dataset: Array<InputMaybe<Scalars['String']['input']>>;
  gene: Scalars['String']['input'];
};


export type QueryGetSnPsforGwasStudiesArgs = {
  study: Array<Scalars['String']['input']>;
};


export type QueryGetcCreLinksQueryArgs = {
  accession: Scalars['String']['input'];
  celltype: Scalars['String']['input'];
  degree_of_separation: Scalars['Int']['input'];
  method?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetcCreNodeCelltypesArgs = {
  accession: Scalars['String']['input'];
  method?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetcCretfQueryArgs = {
  accession: Scalars['String']['input'];
  assembly: Scalars['String']['input'];
};


export type QueryGetcartAccessionsQueryArgs = {
  uuid: Scalars['String']['input'];
};


export type QueryGettssRampagePeaksArgs = {
  coordinates: ChromRange;
};


export type QueryGtexQtlQueryArgs = {
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<GenomicRangeInput>;
  gene_id?: InputMaybe<Array<Scalars['String']['input']>>;
  ma_count?: InputMaybe<Scalars['Float']['input']>;
  ma_samples?: InputMaybe<Scalars['Float']['input']>;
  maf_max?: InputMaybe<Scalars['Float']['input']>;
  maf_min?: InputMaybe<Scalars['Float']['input']>;
  pval_beta?: InputMaybe<Scalars['Float']['input']>;
  tissue?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGtex_GenesArgs = {
  gene_id: Array<InputMaybe<Scalars['String']['input']>>;
  tissue?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tissue_subcategory?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryGwas_Motif_EnrichmentArgs = {
  accession?: InputMaybe<Scalars['String']['input']>;
  cell_type?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  study_id?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGwas_Peak_EnrichmentArgs = {
  number_of_peaks_threshold?: InputMaybe<Scalars['Int']['input']>;
  pmid: Scalars['String']['input'];
};


export type QueryGwasintersectingSnpsWithBcreQueryArgs = {
  bcre_group?: InputMaybe<Scalars['String']['input']>;
  disease: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  snpid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGwasintersectingSnpsWithCcreQueryArgs = {
  disease: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  snpid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGwassnpAssociationsQueryArgs = {
  disease: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  snpid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryHighquality_Meme_MotifsArgs = {
  assembly: Scalars['String']['input'];
  celltype?: InputMaybe<Scalars['String']['input']>;
  peaks_accessions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  target?: InputMaybe<Scalars['String']['input']>;
};


export type QueryHistone_Aggregate_Peak_DatasetsArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  peaks_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  peaks_dataset_accession?: InputMaybe<Scalars['String']['input']>;
};


export type QueryHistone_Aggregate_ValuesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  bin_size?: InputMaybe<Scalars['Int']['input']>;
  histone_dataset_accession?: InputMaybe<Scalars['String']['input']>;
  histone_signal_accession?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  peaks_dataset_accession?: InputMaybe<Scalars['String']['input']>;
  xrange?: InputMaybe<Range>;
};


export type QueryICreLdscBaselineQueryArgs = {
  study: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QueryICreLdscQueryArgs = {
  celltype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  study: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QueryICreQueryArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  accession_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  allcelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  celltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  dnaseallcelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  dnasecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  dnaseexcludecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  excludecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  group?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rDHS?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryICrEsCountQueryArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  accession_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  allcelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  celltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  dnaseallcelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  dnasecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  dnaseexcludecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  excludecelltypes?: InputMaybe<Array<InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>>>;
  group?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rDHS?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryIcreeQtlQueryArgs = {
  geneid?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  phenotype_id?: InputMaybe<Scalars['String']['input']>;
  rsid?: InputMaybe<Scalars['String']['input']>;
  study: Scalars['String']['input'];
};


export type QueryImmuneGwasLdrQueryArgs = {
  icres?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  snps?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryImmuneRnaUmapQueryArgs = {
  gene_id: Scalars['String']['input'];
};


export type QueryImmuneeQtLsQueryArgs = {
  ccre?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  genes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  snps?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryImmuneiCrEsUmapQueryArgs = {
  accession: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QueryIntersectionArgs = {
  assembly: Scalars['String']['input'];
  maxOutputLength?: InputMaybe<Scalars['Int']['input']>;
  userCcres: Array<InputMaybe<Scalars['cCRE']['input']>>;
};


export type QueryLdrArgs = {
  experiment?: InputMaybe<Array<Scalars['String']['input']>>;
  study?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryLinkedGenesQueryArgs = {
  accession: Array<InputMaybe<Scalars['String']['input']>>;
  assembly: Scalars['String']['input'];
  celltype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  method?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryLinkedcCrEsQueryArgs = {
  assembly: Scalars['String']['input'];
  celltype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  geneid: Array<InputMaybe<Scalars['String']['input']>>;
  method?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryMafArgs = {
  positions: Array<PositionInput>;
};


export type QueryMeme_Methyl_MotifsArgs = {
  consensus_regex?: InputMaybe<Scalars['String']['input']>;
  consensus_search?: InputMaybe<Scalars['String']['input']>;
  e_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  flank_p_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  flank_z_score_threshold?: InputMaybe<Scalars['Float']['input']>;
  lesser_peaks_occurrences_ratio_threshold?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  shuffled_p_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  shuffled_z_score_threshold?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryMeme_Methyl_OccurrencesArgs = {
  consensus_regex?: InputMaybe<Scalars['String']['input']>;
  genomic_region?: InputMaybe<GenomicRegionInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMeme_Motif_CountArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  consensus_regex?: InputMaybe<Scalars['String']['input']>;
  consensus_search?: InputMaybe<Scalars['String']['input']>;
  e_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  flank_p_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  flank_z_score_threshold?: InputMaybe<Scalars['Float']['input']>;
  lesser_peaks_occurrences_ratio_threshold?: InputMaybe<Scalars['Float']['input']>;
  peaks_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  shuffled_p_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  shuffled_z_score_threshold?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryMeme_Motif_SearchArgs = {
  assembly: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  pwms: Array<InputMaybe<Array<InputMaybe<Array<Scalars['Float']['input']>>>>>;
};


export type QueryMeme_Motif_Search_QueryArgs = {
  assembly: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  pwms: Array<InputMaybe<Array<InputMaybe<Array<Scalars['Float']['input']>>>>>;
};


export type QueryMeme_MotifsArgs = {
  cell_type?: InputMaybe<Array<Scalars['String']['input']>>;
  consensus_regex?: InputMaybe<Scalars['String']['input']>;
  consensus_search?: InputMaybe<Scalars['String']['input']>;
  e_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  factor?: InputMaybe<Array<Scalars['String']['input']>>;
  flank_p_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  flank_z_score_threshold?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lesser_peaks_occurrences_ratio_threshold?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  shuffled_p_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  shuffled_z_score_threshold?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryMeme_OccurrencesArgs = {
  consensus_regex?: InputMaybe<Scalars['String']['input']>;
  genomic_region?: InputMaybe<Array<GenomicRegionInput>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMethyl_File_MatchesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Scalars['String']['input']>;
  peaks_dataset_accession?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMotif_EnrichmentArgs = {
  biosample?: InputMaybe<Scalars['String']['input']>;
  dataset: Scalars['String']['input'];
  motif_id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMotif_Enrichment_BiosamplesArgs = {
  dataset: Scalars['String']['input'];
};


export type QueryMotif_Enrichment_MatrixArgs = {
  dataset: Scalars['String']['input'];
};


export type QueryMotifrankingArgs = {
  motifinputs?: InputMaybe<Array<InputMaybe<MotifRankingInput>>>;
};


export type QueryMpraFccQueryArgs = {
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
};


export type QueryNearby_GenesArgs = {
  assembly: Scalars['String']['input'];
  chromosome: Scalars['String']['input'];
  distanceThreshold?: InputMaybe<Scalars['Int']['input']>;
  end: Scalars['Int']['input'];
  gene_type?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  start: Scalars['Int']['input'];
};


export type QueryNearestGenesArgs = {
  assembly: Scalars['String']['input'];
  coordinates: ChromRange;
  limit?: InputMaybe<Scalars['Int']['input']>;
  protein_coding?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryOrthologQueryArgs = {
  accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  assembly?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPeakCountArgs = {
  assay?: InputMaybe<Scalars['String']['input']>;
  assembly?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPeakDatasetArgs = {
  accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  biosample?: InputMaybe<Scalars['String']['input']>;
  cell_slims?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  developmental_slims?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  exclude_investigatedas?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  include_investigatedas?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lab?: InputMaybe<Scalars['String']['input']>;
  organ_slims?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  processed_assembly?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<Scalars['String']['input']>;
  replicated_peak_accession?: InputMaybe<Scalars['String']['input']>;
  replicated_peaks?: InputMaybe<Scalars['Boolean']['input']>;
  searchterm?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  source?: InputMaybe<Scalars['String']['input']>;
  species?: InputMaybe<Scalars['String']['input']>;
  system_slims?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  target?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPeaksArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  experiment_accession?: InputMaybe<Scalars['String']['input']>;
  file_accession?: InputMaybe<Scalars['String']['input']>;
  range: Array<InputMaybe<ChromosomeRangeInput>>;
  searchterm?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  target?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryPeaks_FilesArgs = {
  accession?: InputMaybe<Scalars['String']['input']>;
  assembly?: InputMaybe<Scalars['String']['input']>;
  dataset_accession?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPeaksrangeArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  biosample?: InputMaybe<Scalars['String']['input']>;
  experiment_accession?: InputMaybe<Scalars['String']['input']>;
  file_accession?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderby?: InputMaybe<Scalars['Boolean']['input']>;
  range: Array<InputMaybe<ChromosomeRangeInput>>;
  target?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryPeaksrangecountArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  biosample?: InputMaybe<Scalars['String']['input']>;
  experiment_accession?: InputMaybe<Scalars['String']['input']>;
  file_accession?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  range: Array<InputMaybe<ChromosomeRangeInput>>;
  target?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryPlsGenesQueryArgs = {
  accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  geneid?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  geneid_prefix?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryProCapPeaksQueryArgs = {
  chromosome: Scalars['String']['input'];
  start: Scalars['Int']['input'];
  stop: Scalars['Int']['input'];
};


export type QueryPublic_User_CollectionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryQtlsigassocQueryArgs = {
  geneid?: InputMaybe<Scalars['String']['input']>;
  qtltype?: InputMaybe<Scalars['String']['input']>;
  snpid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRDhsQueryArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  activeInAnyBiosample?: InputMaybe<Array<Scalars['String']['input']>>;
  activeInBiosamples?: InputMaybe<Array<Scalars['String']['input']>>;
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
};


export type QueryRampageQueryArgs = {
  transcript_ids?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryRdhs_Motif_OccurrencesArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  consensus_regex?: InputMaybe<Scalars['String']['input']>;
  genomic_region?: InputMaybe<Array<GenomicRegionInput>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Scalars['String']['input']>;
  rdhss?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryRdhs_Motif_Occurrences_CountArgs = {
  assembly?: InputMaybe<Scalars['String']['input']>;
  consensus_regex?: InputMaybe<Scalars['String']['input']>;
  genomic_region?: InputMaybe<Array<GenomicRegionInput>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  peaks_accession?: InputMaybe<Scalars['String']['input']>;
  rdhss?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryRefcheckmotifrankingArgs = {
  refcheckmotifinputs?: InputMaybe<Array<InputMaybe<MotifRankingRefCheckInput>>>;
};


export type QueryRefseqgenesArgs = {
  assembly: Scalars['String']['input'];
  chromosome?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<GenomicRangeInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRefseqxenogenesArgs = {
  assembly: Scalars['String']['input'];
  chromosome?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<GenomicRangeInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};


export type QueryResolveArgs = {
  assembly: Scalars['String']['input'];
  id: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRnaSeqQueryArgs = {
  assembly: Scalars['String']['input'];
  biosample?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QuerySilencersQueryArgs = {
  accession: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QuerySingleCellBoxPlotQueryArgs = {
  celltype?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  disease: Scalars['String']['input'];
  gene?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySingleCellGenesQueryArgs = {
  barcodekey?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  disease: Scalars['String']['input'];
  featureid?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  featurekey?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QuerySingleCellUmapQueryArgs = {
  disease: Scalars['String']['input'];
};


export type QuerySnpAssociationsQueryArgs = {
  disease: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  snpid?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySnpAutocompleteQueryArgs = {
  assembly: Scalars['String']['input'];
  common?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  snpid: Scalars['String']['input'];
};


export type QuerySnpDensityQueryArgs = {
  assembly: Scalars['String']['input'];
  coordinates?: InputMaybe<Array<InputMaybe<GenomicRangeInput>>>;
  resolution: Scalars['Int']['input'];
};


export type QuerySnpQueryArgs = {
  af_threshold?: InputMaybe<Scalars['Float']['input']>;
  assembly: Scalars['String']['input'];
  common?: InputMaybe<Scalars['Boolean']['input']>;
  coordinates?: InputMaybe<Array<InputMaybe<GenomicRangeInput>>>;
  snpids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QuerySpeciesArgs = {
  biosample?: InputMaybe<Scalars['String']['input']>;
  lab?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<Scalars['String']['input']>;
  searchterm?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  target?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySpecific_ElementsArgs = {
  dataset: Scalars['String']['input'];
  rank_end?: InputMaybe<Scalars['Int']['input']>;
  rank_start?: InputMaybe<Scalars['Int']['input']>;
  rdhss?: InputMaybe<Array<Scalars['String']['input']>>;
  tissue?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySuggestArgs = {
  assembly: Scalars['String']['input'];
  id: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTarget_MotifsArgs = {
  e_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  motif_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  p_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  peaks_accessions?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  q_value_threshold?: InputMaybe<Scalars['Float']['input']>;
  query_motifs?: InputMaybe<Array<MotifInstanceInput>>;
  target_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryTargetsArgs = {
  exclude_investigatedas?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  include_investigatedas?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lab?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  processed_assembly?: InputMaybe<Scalars['String']['input']>;
  project?: InputMaybe<Scalars['String']['input']>;
  replicated_peaks?: InputMaybe<Scalars['Boolean']['input']>;
  searchterm?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  species?: InputMaybe<Scalars['String']['input']>;
  target?: InputMaybe<Scalars['String']['input']>;
  target_prefix?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTrackHubRequestsArgs = {
  googleProject?: InputMaybe<Scalars['String']['input']>;
  trackhuburl: TrackHubUrl;
};


export type QueryTranscriptArgs = {
  assembly: Scalars['String']['input'];
  chromosome?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name_prefix?: InputMaybe<Array<Scalars['String']['input']>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderby?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  strand?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTranscript_QuantificationArgs = {
  assembly: Scalars['String']['input'];
  experiment_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  file_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fpkm_range?: InputMaybe<QuantificationRange>;
  gene_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortByTpm?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<QuantDataSourceInput>;
  tpm_range?: InputMaybe<QuantificationRange>;
  transcript_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryTssrampageQueryArgs = {
  genename?: InputMaybe<Scalars['String']['input']>;
  peakId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUpsetploticrecountsArgs = {
  assay: AssayEnum;
  icreclasses?: InputMaybe<Array<Scalars['String']['input']>>;
  targetedcelltypes: Array<Scalars['String']['input']>;
};


export type QueryUser_CollectionArgs = {
  accession: Scalars['ID']['input'];
};


export type QueryVistaQueryArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  assembly: Scalars['String']['input'];
  cCRE?: InputMaybe<Array<Scalars['String']['input']>>;
  coordinates?: InputMaybe<GenomicRangeInput>;
  minimumOverlap?: InputMaybe<Scalars['Int']['input']>;
  tissues?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryZScoreQueryArgs = {
  assembly: Scalars['String']['input'];
  experiment?: InputMaybe<Array<Scalars['String']['input']>>;
  maximum_score?: InputMaybe<Scalars['Float']['input']>;
  minimum_score?: InputMaybe<Scalars['Float']['input']>;
  rDHS?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Rdhs = GenomicObject & {
  __typename?: 'RDHS';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  coordinates: GenomicRange;
  id: Scalars['String']['output'];
  maxZ?: Maybe<Scalars['Float']['output']>;
  sequence: Scalars['String']['output'];
  zScores?: Maybe<Array<ZScore>>;
};


export type RdhsMaxZArgs = {
  assay: Scalars['String']['input'];
};


export type RdhsSequenceArgs = {
  half_width?: InputMaybe<Scalars['Int']['input']>;
};


export type RdhszScoresArgs = {
  experiments?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type RdhsMotifOccurrence = {
  __typename?: 'RDHSMotifOccurrence';
  consensus_regex: Scalars['String']['output'];
  genomic_region: GenomicRegion;
  motif?: Maybe<MemeMotif>;
  p_value: Scalars['Float']['output'];
  peaks_accession: Scalars['String']['output'];
  rdhs: Scalars['String']['output'];
  start_offset: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
};

export type RdhsMotifOccurrenceCount = {
  __typename?: 'RDHSMotifOccurrenceCount';
  count: Scalars['Int']['output'];
};

export type RampageResponse = {
  __typename?: 'RampageResponse';
  biosampleType?: Maybe<Scalars['String']['output']>;
  chrom?: Maybe<Scalars['String']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  expAccession?: Maybe<Scalars['String']['output']>;
  fileAccession?: Maybe<Scalars['String']['output']>;
  geneId?: Maybe<Scalars['String']['output']>;
  lifeStage?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  organ?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
  strand?: Maybe<Scalars['String']['output']>;
  tissue?: Maybe<Scalars['String']['output']>;
  transcriptId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

export type Range = {
  end?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type RefSeqExon = {
  __typename?: 'RefSeqExon';
  UTRs?: Maybe<Array<Maybe<RefSeqUtr>>>;
  coordinates: GenomicRange;
  exon_number: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  project: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
};

export type RefSeqGene = {
  __typename?: 'RefSeqGene';
  id: Scalars['String']['output'];
  strand: Scalars['String']['output'];
  transcripts: Array<Maybe<RefSeqTranscript>>;
};

export type RefSeqTranscript = {
  __typename?: 'RefSeqTranscript';
  coordinates: GenomicRange;
  exons?: Maybe<Array<Maybe<RefSeqExon>>>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  project: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
};

export type RefSeqUtr = {
  __typename?: 'RefSeqUTR';
  coordinates: GenomicRange;
  strand: Scalars['String']['output'];
};

export type RegistryBiosample = {
  __typename?: 'RegistryBiosample';
  cCREZScores: Array<CcrezScore>;
  displayname: Scalars['String']['output'];
  experimentAccession?: Maybe<Scalars['String']['output']>;
  fileAccession?: Maybe<Scalars['String']['output']>;
  ldr_enrichment?: Maybe<Array<LdrEnrichment>>;
  lifeStage: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ontology: Scalars['String']['output'];
  sampleType: Scalars['String']['output'];
  umap_coordinates?: Maybe<Array<Scalars['Float']['output']>>;
  zscore_histogram: Array<ZScoreHistogramBin>;
};


export type RegistryBiosampleCCrezScoresArgs = {
  accession?: InputMaybe<Array<Scalars['String']['input']>>;
  coordinates?: InputMaybe<Array<GenomicRangeInput>>;
  ctcf_bound?: InputMaybe<Scalars['Boolean']['input']>;
  group?: InputMaybe<Array<Scalars['String']['input']>>;
  rDHS?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RegistryBiosampleExperimentAccessionArgs = {
  assay: Scalars['String']['input'];
};


export type RegistryBiosampleFileAccessionArgs = {
  assay: Scalars['String']['input'];
};


export type RegistryBiosampleLdr_EnrichmentArgs = {
  studies?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type RegistryBiosampleUmap_CoordinatesArgs = {
  assay: Scalars['String']['input'];
};


export type RegistryBiosampleZscore_HistogramArgs = {
  assay: Scalars['String']['input'];
  assembly: Scalars['String']['input'];
  histogram_bins: Scalars['Int']['input'];
  histogram_maximum: Scalars['Int']['input'];
  histogram_minimum: Scalars['Int']['input'];
};

export type RegistryBiosampleCollection = {
  __typename?: 'RegistryBiosampleCollection';
  biosamples?: Maybe<Array<RegistryBiosample>>;
};

export type ReplicatedPeaks = File & {
  __typename?: 'ReplicatedPeaks';
  accession: Scalars['String']['output'];
  assembly: Assembly;
  dataset: PeakDataset;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type RequestError = {
  __typename?: 'RequestError';
  errortype?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type RnaSeqData = {
  __typename?: 'RnaSeqData';
  biosample: Scalars['String']['output'];
  expid: Scalars['String']['output'];
  negfileid?: Maybe<Scalars['String']['output']>;
  posfileid?: Maybe<Scalars['String']['output']>;
  unstrandedfileid?: Maybe<Scalars['String']['output']>;
};

export type ScreenCellTypeSpecificResponse = {
  __typename?: 'SCREENCellTypeSpecificResponse';
  atac_zscore?: Maybe<Scalars['Float']['output']>;
  ct?: Maybe<Scalars['String']['output']>;
  ctcf_zscore?: Maybe<Scalars['Float']['output']>;
  dnase_zscore?: Maybe<Scalars['Float']['output']>;
  h3k4me3_zscore?: Maybe<Scalars['Float']['output']>;
  h3k27ac_zscore?: Maybe<Scalars['Float']['output']>;
};

export type ScreenNearbyGenes = {
  __typename?: 'SCREENNearbyGenes';
  accession: Scalars['String']['output'];
  all: IntersectingGenes;
  pc: IntersectingGenes;
};

export type ScreenSearchResult = {
  __typename?: 'SCREENSearchResult';
  atac_zscore: Scalars['Float']['output'];
  chrom: Scalars['String']['output'];
  ctcf_zscore: Scalars['Float']['output'];
  ctspecific?: Maybe<ScreenCellTypeSpecificResponse>;
  dnase_zscore: Scalars['Float']['output'];
  enhancer_zscore: Scalars['Float']['output'];
  in_cart: Scalars['Int']['output'];
  info: CcreInfo;
  len: Scalars['Int']['output'];
  mammals?: Maybe<Scalars['Float']['output']>;
  maxz: Scalars['Float']['output'];
  nearestgenes: Array<Maybe<NearestGenes>>;
  pct: Scalars['String']['output'];
  primates?: Maybe<Scalars['Float']['output']>;
  promoter_zscore: Scalars['Float']['output'];
  rfacets: Array<Scalars['String']['output']>;
  sct: Scalars['Float']['output'];
  start: Scalars['Int']['output'];
  vertebrates?: Maybe<Scalars['Float']['output']>;
  vistaids?: Maybe<Array<Scalars['String']['output']>>;
};

export type Snp = GenomicObject & {
  __typename?: 'SNP';
  assembly: Scalars['String']['output'];
  autocompleteSimilarity?: Maybe<Scalars['Float']['output']>;
  coordinates: GenomicRange;
  genomeWideAssociation?: Maybe<Array<Maybe<Gwas>>>;
  gtex_eQTLs: Array<GtExQtl>;
  id: Scalars['String']['output'];
  intersecting_ccres?: Maybe<IntersectingCcrEs>;
  linkageDisequilibrium?: Maybe<Array<Maybe<LinkedSnp>>>;
  minorAlleleFrequency?: Maybe<Array<Maybe<AlleleFrequency>>>;
  refAllele?: Maybe<Scalars['String']['output']>;
  refFrequency?: Maybe<Scalars['Float']['output']>;
};


export type SnpGtex_EQtLsArgs = {
  gene_id?: InputMaybe<Array<Scalars['String']['input']>>;
  pval_beta?: InputMaybe<Scalars['Float']['input']>;
  tissue?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type SnpLinkageDisequilibriumArgs = {
  dPrimeThreshold?: InputMaybe<Scalars['Float']['input']>;
  population: Population;
  rSquaredThreshold?: InputMaybe<Scalars['Float']['input']>;
  subpopulation?: InputMaybe<SubPopulation>;
};

export type SnpDensity = {
  __typename?: 'SNPDensity';
  common: Scalars['Int']['output'];
  coordinates: GenomicRange;
  total: Scalars['Int']['output'];
};

export type ScoredElement = {
  __typename?: 'ScoredElement';
  element: Rdhs;
  specificity: Scalars['Float']['output'];
};

export type SequenceReads = File & {
  __typename?: 'SequenceReads';
  accession: Scalars['String']['output'];
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset: PeakDataset;
  paired_end: Scalars['Boolean']['output'];
  read_id: Scalars['Int']['output'];
  techrep?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type SignalFile = {
  __typename?: 'SignalFile';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset_accession: Scalars['String']['output'];
  strand?: Maybe<Scalars['String']['output']>;
  techrep?: Maybe<Scalars['Int']['output']>;
  unique_reads?: Maybe<Scalars['Boolean']['output']>;
};

export type SilencerData = {
  __typename?: 'SilencerData';
  accession: Scalars['String']['output'];
  silencer_studies?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type SinglCellBoxPlot = {
  __typename?: 'SinglCellBoxPlot';
  celltype: Scalars['String']['output'];
  disease: Scalars['String']['output'];
  expr_frac: Scalars['Float']['output'];
  firstquartile: Scalars['Float']['output'];
  gene: Scalars['String']['output'];
  max: Scalars['Float']['output'];
  mean_count: Scalars['Float']['output'];
  median: Scalars['Float']['output'];
  min: Scalars['Float']['output'];
  thirdquartile: Scalars['Float']['output'];
};

export type SingleBigResponse = {
  __typename?: 'SingleBigResponse';
  data?: Maybe<Scalars['BigResponseData']['output']>;
  error?: Maybe<RequestError>;
};

export type SingleCellGene = {
  __typename?: 'SingleCellGene';
  anno?: Maybe<Scalars['String']['output']>;
  azimuth?: Maybe<Scalars['String']['output']>;
  barcodekey?: Maybe<Scalars['String']['output']>;
  celltype?: Maybe<Scalars['String']['output']>;
  channel?: Maybe<Scalars['String']['output']>;
  featureid?: Maybe<Scalars['String']['output']>;
  featurekey?: Maybe<Scalars['String']['output']>;
  individualid?: Maybe<Scalars['String']['output']>;
  n_cells?: Maybe<Scalars['Int']['output']>;
  n_counts?: Maybe<Scalars['Int']['output']>;
  n_genes?: Maybe<Scalars['Int']['output']>;
  percent_cells?: Maybe<Scalars['Float']['output']>;
  sampleid?: Maybe<Scalars['String']['output']>;
  subclass?: Maybe<Scalars['String']['output']>;
  umap_1?: Maybe<Scalars['Float']['output']>;
  umap_2?: Maybe<Scalars['Float']['output']>;
  val?: Maybe<Scalars['Float']['output']>;
};

export type SingleCellType = {
  __typename?: 'SingleCellType';
  anno?: Maybe<Scalars['String']['output']>;
  azimuth?: Maybe<Scalars['String']['output']>;
  barcodekey?: Maybe<Scalars['String']['output']>;
  celltype?: Maybe<Scalars['String']['output']>;
  channel?: Maybe<Scalars['String']['output']>;
  individualid?: Maybe<Scalars['String']['output']>;
  n_counts?: Maybe<Scalars['Int']['output']>;
  n_genes?: Maybe<Scalars['Int']['output']>;
  sampleid?: Maybe<Scalars['String']['output']>;
  subclass?: Maybe<Scalars['String']['output']>;
  umap_1?: Maybe<Scalars['Float']['output']>;
  umap_2?: Maybe<Scalars['Float']['output']>;
};

export type SnpAssociation = {
  __typename?: 'SnpAssociation';
  a1: Scalars['String']['output'];
  a2: Scalars['String']['output'];
  chisq?: Maybe<Scalars['Float']['output']>;
  disease: Scalars['String']['output'];
  n: Scalars['Float']['output'];
  snpid: Scalars['String']['output'];
  z: Scalars['Float']['output'];
};

export type Species = {
  __typename?: 'Species';
  datasets: DatasetCollection;
  name: Scalars['String']['output'];
};

export type SpecificElement = {
  __typename?: 'SpecificElement';
  location: GenomicRegion;
  rank: Scalars['Int']['output'];
  rdhs: Scalars['String']['output'];
  tissue: Scalars['String']['output'];
  value?: Maybe<Scalars['Float']['output']>;
};

export enum SubPopulation {
  AfricanAmerican = 'AFRICAN_AMERICAN',
  AfricanCaribbean = 'AFRICAN_CARIBBEAN',
  Bengali = 'BENGALI',
  British = 'BRITISH',
  Colombian = 'COLOMBIAN',
  Dai = 'DAI',
  Esan = 'ESAN',
  Finnish = 'FINNISH',
  Gambian = 'GAMBIAN',
  Gujarati = 'GUJARATI',
  HanChineseBeijing = 'HAN_CHINESE_BEIJING',
  Iberian = 'IBERIAN',
  IndianTelugu = 'INDIAN_TELUGU',
  Japanese = 'JAPANESE',
  Kinh = 'KINH',
  Luhya = 'LUHYA',
  Mende = 'MENDE',
  Mexican = 'MEXICAN',
  Peruvian = 'PERUVIAN',
  PuertoRican = 'PUERTO_RICAN',
  Punjabi = 'PUNJABI',
  SouthernHanChinese = 'SOUTHERN_HAN_CHINESE',
  SriLankanTamil = 'SRI_LANKAN_TAMIL',
  Toscani = 'TOSCANI',
  UtahResidentNwEuropean = 'UTAH_RESIDENT_NW_EUROPEAN',
  Yoruba = 'YORUBA'
}

export type Target = {
  __typename?: 'Target';
  datasets: DatasetCollection;
  name?: Maybe<Scalars['String']['output']>;
  target_desc?: Maybe<Factor>;
};

export type TargetMotif = {
  __typename?: 'TargetMotif';
  e_value: Scalars['Float']['output'];
  jaspar_name?: Maybe<Scalars['String']['output']>;
  motifid: Scalars['String']['output'];
  optimal_offset: Scalars['Int']['output'];
  orientation: Scalars['String']['output'];
  overlap: Scalars['Int']['output'];
  p_value: Scalars['Float']['output'];
  peaks_accession: Scalars['String']['output'];
  q_value: Scalars['Float']['output'];
  query_id: Scalars['String']['output'];
  sites: Scalars['Int']['output'];
  target_id: Scalars['String']['output'];
};

export type TargetPartitionCollection = DatasetCollection & {
  __typename?: 'TargetPartitionCollection';
  counts: DatasetCounts;
  datasets: Array<PeakDataset>;
  partitionByBiosample: Array<BiosamplePartitionCollection>;
  partitionByLab: Array<LabPartitionCollection>;
  partitionByTarget: Array<TargetPartitionCollection>;
  /** Null only if all datasets in this collection do not have a target. */
  target?: Maybe<Target>;
};


export type TargetPartitionCollectionPartitionByBiosampleArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type TargetPartitionCollectionPartitionByLabArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type TargetPartitionCollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type TargetPeaks = {
  __typename?: 'TargetPeaks';
  name?: Maybe<Scalars['String']['output']>;
  peaks: PeaksCollection;
};

export type TargetPeaksPartitionCollection = PeaksCollection & {
  __typename?: 'TargetPeaksPartitionCollection';
  count?: Maybe<PeaksCounts>;
  partitionByTarget: Array<TargetPeaksPartitionCollection>;
  peaks: Array<Peak>;
  /** Null only if all datasets in this collection do not have a target. */
  target?: Maybe<TargetPeaks>;
};


export type TargetPeaksPartitionCollectionPartitionByTargetArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type TrackHub = TrackHubResponse & {
  __typename?: 'TrackHub';
  trackHubContent: Scalars['String']['output'];
  trackhubname?: Maybe<Scalars['String']['output']>;
};

export type TrackHubGenomes = TrackHubResponse & {
  __typename?: 'TrackHubGenomes';
  genomes: Array<Maybe<Genomes>>;
  trackhubname?: Maybe<Scalars['String']['output']>;
};

export type Transcript = GenomicObject & {
  __typename?: 'Transcript';
  assembly: Scalars['String']['output'];
  associated_ccres_pls?: Maybe<IntersectingCcrEs>;
  coordinates: GenomicRange;
  exons?: Maybe<Array<Maybe<Exon>>>;
  havana_id?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  intersecting_ccres?: Maybe<IntersectingCcrEs>;
  name: Scalars['String']['output'];
  project: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
  support_level?: Maybe<Scalars['Int']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  transcript_type: Scalars['String']['output'];
};


export type TranscriptIntersecting_CcresArgs = {
  include_downstream?: InputMaybe<Scalars['Int']['input']>;
  include_upstream?: InputMaybe<Scalars['Int']['input']>;
};

export type TranscriptQuantification = {
  __typename?: 'TranscriptQuantification';
  effective_len: Scalars['Float']['output'];
  expected_count: Scalars['Float']['output'];
  experiment_accession: Scalars['String']['output'];
  file_accession: Scalars['String']['output'];
  fpkm: Scalars['Float']['output'];
  fpkm_ci_lower_bound: Scalars['Float']['output'];
  fpkm_ci_upper_bound: Scalars['Float']['output'];
  fpkm_coefficient_of_quartile_variation?: Maybe<Scalars['Float']['output']>;
  gene?: Maybe<Gene>;
  iso_pct: Scalars['Float']['output'];
  iso_pct_from_pme_tpm: Scalars['Float']['output'];
  len: Scalars['Int']['output'];
  pme_fpkm: Scalars['Float']['output'];
  pme_tpm: Scalars['Float']['output'];
  posterior_mean_count: Scalars['Float']['output'];
  posterior_standard_deviation_of_count: Scalars['Float']['output'];
  tpm: Scalars['Float']['output'];
  tpm_ci_lower_bound: Scalars['Float']['output'];
  tpm_ci_upper_bound: Scalars['Float']['output'];
  tpm_coefficient_of_quartile_variation?: Maybe<Scalars['Float']['output']>;
  transcript?: Maybe<Transcript>;
};

export type TranscriptQuantificationFile = {
  __typename?: 'TranscriptQuantificationFile';
  accession: Scalars['String']['output'];
  assembly: Scalars['String']['output'];
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset_accession: Scalars['String']['output'];
  quantifications?: Maybe<Array<Maybe<TranscriptQuantification>>>;
  techrep?: Maybe<Scalars['Int']['output']>;
};


export type TranscriptQuantificationFileQuantificationsArgs = {
  experiment_accession?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fpkm_range?: InputMaybe<QuantificationRange>;
  gene_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  gene_id_prefix?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tpm_range?: InputMaybe<QuantificationRange>;
  transcript_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transcript_id_prefix?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type TssPeaksGenes = {
  __typename?: 'TssPeaksGenes';
  geneName?: Maybe<Scalars['String']['output']>;
  locusType?: Maybe<Scalars['String']['output']>;
};

export type TssPeaksResponse = {
  __typename?: 'TssPeaksResponse';
  chrom?: Maybe<Scalars['String']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  genes?: Maybe<Array<Maybe<TssPeaksGenes>>>;
  peakId?: Maybe<Scalars['String']['output']>;
  peakType?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
};

export type TssRampageResponse = {
  __typename?: 'TssRampageResponse';
  biosampleName?: Maybe<Scalars['String']['output']>;
  biosampleSummary?: Maybe<Scalars['String']['output']>;
  biosampleType?: Maybe<Scalars['String']['output']>;
  chrom?: Maybe<Scalars['String']['output']>;
  end?: Maybe<Scalars['Int']['output']>;
  end1?: Maybe<Scalars['Int']['output']>;
  expAccession?: Maybe<Scalars['String']['output']>;
  genes?: Maybe<Array<Maybe<TssPeaksGenes>>>;
  organ?: Maybe<Scalars['String']['output']>;
  peakId?: Maybe<Scalars['String']['output']>;
  peakType?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
  start1?: Maybe<Scalars['Int']['output']>;
  strand?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

export type TwoBitData = {
  __typename?: 'TwoBitData';
  chrom: Scalars['String']['output'];
  data?: Maybe<Array<Maybe<Array<Maybe<Scalars['Int']['output']>>>>>;
  end: Scalars['Int']['output'];
  start: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type Utr = {
  __typename?: 'UTR';
  coordinates: GenomicRange;
  direction: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parent_protein: Scalars['String']['output'];
  phase: Scalars['Int']['output'];
  project: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  strand: Scalars['String']['output'];
  tag: Scalars['String']['output'];
};

export type UnfilteredAlignments = File & {
  __typename?: 'UnfilteredAlignments';
  accession: Scalars['String']['output'];
  assembly: Assembly;
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset: PeakDataset;
  techrep?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type UnreplicatedPeaks = File & {
  __typename?: 'UnreplicatedPeaks';
  accession: Scalars['String']['output'];
  assembly: Assembly;
  biorep?: Maybe<Scalars['Int']['output']>;
  dataset: PeakDataset;
  peaks: Array<Peak>;
  techrep?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};


export type UnreplicatedPeaksPeaksArgs = {
  chrom: Scalars['String']['input'];
  chrom_end: Scalars['Int']['input'];
  chrom_start: Scalars['Int']['input'];
};

export type UserCollection = {
  __typename?: 'UserCollection';
  accession: Scalars['ID']['output'];
  import_status?: Maybe<UserCollectionImportStatus>;
  is_public: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export enum UserCollectionImportStatus {
  Error = 'ERROR',
  InProgress = 'IN_PROGRESS',
  Queued = 'QUEUED',
  Success = 'SUCCESS'
}

export type VistaEnhancer = {
  __typename?: 'VistaEnhancer';
  accession: Scalars['String']['output'];
  active: Scalars['Boolean']['output'];
  cCRE: Scalars['String']['output'];
  coordinates: GenomicRange;
  overlap: Scalars['Int']['output'];
  tissues: Array<Scalars['String']['output']>;
};

export type ZScore = {
  __typename?: 'ZScore';
  experiment: Scalars['String']['output'];
  rDHS: Scalars['String']['output'];
  score: Scalars['Float']['output'];
};

export type ZScoreHistogramBin = {
  __typename?: 'ZScoreHistogramBin';
  bin: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
};

export type CQtl = {
  __typename?: 'cQTL';
  coordinates: GenomicRange;
  distance: Scalars['Int']['output'];
  fdr: Scalars['Float']['output'];
  is_top_snp: Scalars['Int']['output'];
  n_tested_snps: Scalars['Int']['output'];
  peak_coordinates: GenomicRange;
  peak_id: Scalars['String']['output'];
  pval: Scalars['Float']['output'];
  regression_slope: Scalars['Float']['output'];
  snp: Scalars['String']['output'];
  strand: Scalars['String']['output'];
};

export type CcreTranscription = {
  __typename?: 'ccreTranscription';
  biosample?: Maybe<Scalars['String']['output']>;
  chromosome: Scalars['String']['output'];
  experiment_accession?: Maybe<Scalars['String']['output']>;
  number_of_support_reads?: Maybe<Scalars['Int']['output']>;
  reads_per_million?: Maybe<Scalars['Float']['output']>;
  sequencing_platform?: Maybe<Scalars['String']['output']>;
  start: Scalars['Int']['output'];
  stop: Scalars['Int']['output'];
};

export type EQtl = {
  __typename?: 'eQTL';
  coordinates: GenomicRange;
  distance_to_tss: Scalars['Int']['output'];
  fdr: Scalars['Float']['output'];
  gene_id: Scalars['String']['output'];
  is_top_snp: Scalars['Int']['output'];
  n_tested_snps: Scalars['Int']['output'];
  pval: Scalars['Float']['output'];
  regression_slope: Scalars['Float']['output'];
  snp: Scalars['String']['output'];
  strand: Scalars['String']['output'];
};

export type GroundLevelVersionsEntries = {
  __typename?: 'groundLevelVersionsEntries';
  accession: Scalars['String']['output'];
  assay: Scalars['String']['output'];
  biosample: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type OrthologcCre = {
  __typename?: 'orthologcCRE';
  accession: Scalars['String']['output'];
  chromosome?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['Int']['output']>;
  stop?: Maybe<Scalars['Int']['output']>;
};

export type TrackHubResponse = {
  trackhubname?: Maybe<Scalars['String']['output']>;
};

export type TrackHubUrl = {
  hubUrl: Scalars['Boolean']['input'];
  trackHubUrl?: InputMaybe<Scalars['String']['input']>;
};

export type RnaSeqQueryQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
}>;


export type RnaSeqQueryQuery = { __typename?: 'Query', rnaSeqQuery?: Array<{ __typename?: 'RnaSeqData', biosample: string } | null> | null };

export type Biosamples_1QueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  assays?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type Biosamples_1Query = { __typename?: 'Query', ccREBiosampleQuery: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, ontology: string, lifeStage: string, sampleType: string, displayname: string, dnase?: string | null, h3k4me3?: string | null, h3k27ac?: string | null, ctcf?: string | null, atac?: string | null, dnase_signal?: string | null, h3k4me3_signal?: string | null, h3k27ac_signal?: string | null, ctcf_signal?: string | null, atac_signal?: string | null }> | null } };

export type CCreQueryQueryVariables = Exact<{
  accession_prefix?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  assembly: Scalars['String']['input'];
}>;


export type CCreQueryQuery = { __typename?: 'Query', cCREQuery: Array<{ __typename?: 'CCRE', accession: string, coordinates: { __typename?: 'GenomicRange', start: number, end: number, chromosome: string } }> };

export type BedIntersectCcre_1QueryVariables = Exact<{
  user_ccres: Array<InputMaybe<Scalars['cCRE']['input']>> | InputMaybe<Scalars['cCRE']['input']>;
  assembly: Scalars['String']['input'];
  max_ouput_length?: InputMaybe<Scalars['Int']['input']>;
}>;


export type BedIntersectCcre_1Query = { __typename?: 'Query', intersection?: Array<any | null> | null };

export type GetGeneLocationQueryVariables = Exact<{
  name: Scalars['String']['input'];
  assembly: Scalars['String']['input'];
  version: Scalars['Int']['input'];
}>;


export type GetGeneLocationQuery = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null };

export type GeneexpressionQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  gene_id?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type GeneexpressionQuery = { __typename?: 'Query', gene_dataset?: Array<{ __typename?: 'GeneDataset', biosample: string, tissue?: string | null, cell_compartment?: string | null, biosample_type?: string | null, assay_term_name?: string | null, accession: string, gene_quantification_files?: Array<{ __typename?: 'GeneQuantificationFile', accession: string, biorep?: number | null, quantifications?: Array<{ __typename?: 'GeneQuantification', tpm: number, file_accession: string } | null> | null } | null> | null } | null> | null };

export type GeneAutocompleteQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  name?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GeneAutocompleteQuery = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, id: string, coordinates: { __typename?: 'GenomicRange', start: number, chromosome: string, end: number } } | null> | null };

export type GeneOrthologQueryQueryVariables = Exact<{
  name: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
  assembly: Scalars['String']['input'];
}>;


export type GeneOrthologQueryQuery = { __typename?: 'Query', geneOrthologQuery?: Array<{ __typename?: 'GeneOrtholog', humanGene?: string | null, mouseGene?: string | null } | null> | null };

export type GetAllGwasStudiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllGwasStudiesQuery = { __typename?: 'Query', getAllGwasStudies?: Array<{ __typename?: 'GwasStudies', study?: string | null, totalldblocks?: number | null, author?: string | null, pubmedid?: string | null, studyname?: string | null } | null> | null };

export type GetSnPsforgivengwasStudyQueryVariables = Exact<{
  study: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetSnPsforgivengwasStudyQuery = { __typename?: 'Query', getSNPsforGWASStudies?: Array<{ __typename?: 'GwasStudySNPs', snpid: string, ldblock: number, rsquare: string, chromosome: string, stop: number, start: number, ldblocksnpid: string } | null> | null };

export type BedIntersectCcreQueryVariables = Exact<{
  inp: Array<InputMaybe<Scalars['cCRE']['input']>> | InputMaybe<Scalars['cCRE']['input']>;
  assembly: Scalars['String']['input'];
  maxOutputLength?: InputMaybe<Scalars['Int']['input']>;
}>;


export type BedIntersectCcreQuery = { __typename?: 'Query', intersection?: Array<any | null> | null };

export type CcreSearchQuery_2QueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  celltype?: InputMaybe<Scalars['String']['input']>;
  accessions?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type CcreSearchQuery_2Query = { __typename?: 'Query', cCRESCREENSearch: Array<{ __typename?: 'SCREENSearchResult', chrom: string, start: number, len: number, pct: string, ctcf_zscore: number, dnase_zscore: number, enhancer_zscore: number, promoter_zscore: number, atac_zscore: number, nearestgenes: Array<{ __typename?: 'NearestGenes', gene: string, distance: number } | null>, ctspecific?: { __typename?: 'SCREENCellTypeSpecificResponse', dnase_zscore?: number | null, ctcf_zscore?: number | null, atac_zscore?: number | null, h3k4me3_zscore?: number | null, h3k27ac_zscore?: number | null } | null, info: { __typename?: 'CCREInfo', accession: string } }> };

export type GetGwasctEnrichmentQueryQueryVariables = Exact<{
  study: Scalars['String']['input'];
}>;


export type GetGwasctEnrichmentQueryQuery = { __typename?: 'Query', getGWASCtEnrichmentQuery?: Array<{ __typename?: 'GWASCelltypeEnrichment', celltype: string, accession: string, fc: number, fdr: number, pvalue: number } | null> | null };

export type GetDisplayNamesQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  samples?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type GetDisplayNamesQuery = { __typename?: 'Query', ccREBiosampleQuery: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, displayname: string, ontology: string }> | null } };

export type Q_4QueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  assay?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  a: Scalars['String']['input'];
}>;


export type Q_4Query = { __typename?: 'Query', ccREBiosampleQuery: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, displayname: string, ontology: string, sampleType: string, lifeStage: string, umap_coordinates?: Array<number> | null, experimentAccession?: string | null }> | null } };

export type S_3QueryVariables = Exact<{
  chromosome?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  assembly: Scalars['String']['input'];
}>;


export type S_3Query = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, strand: string, transcripts?: Array<{ __typename?: 'Transcript', name: string, strand: string, exons?: Array<{ __typename?: 'Exon', coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null } | null> | null };

export type EntexQueryQueryVariables = Exact<{
  accession: Scalars['String']['input'];
}>;


export type EntexQueryQuery = { __typename?: 'Query', entexQuery?: Array<{ __typename?: 'EntexData', assay: string, accession: string, hap1_count: number, hap2_count: number, hap1_allele_ratio: number, p_betabinom: number, experiment_accession: string, tissue: string, donor: string, imbalance_significance: number } | null> | null };

export type EntexActiveAnnotationsQueryQueryVariables = Exact<{
  coordinates: GenomicRangeInput;
}>;


export type EntexActiveAnnotationsQueryQuery = { __typename?: 'Query', entexActiveAnnotationsQuery?: Array<{ __typename?: 'EntexActiveAnnotations', tissue: string, assay_score: string } | null> | null };

export type CCretfQueryVariables = Exact<{
  accession: Scalars['String']['input'];
  assembly: Scalars['String']['input'];
}>;


export type CCretfQuery = { __typename?: 'Query', getcCRETFQuery?: Array<{ __typename?: 'CelltypeTF', celltype: string, tf: string } | null> | null };

export type TopTissuesQueryVariables = Exact<{
  accession?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  assembly: Scalars['String']['input'];
}>;


export type TopTissuesQuery = { __typename?: 'Query', ccREBiosampleQuery: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', sampleType: string, displayname: string, name: string, ontology: string, cCREZScores: Array<{ __typename?: 'CCREZScore', score: number, assay: string, experiment_accession: string }> }> | null }, cCREQuery: Array<{ __typename?: 'CCRE', accession: string, group: string, dnase?: number | null, h3k4me3?: number | null, h3k27ac?: number | null, ctcf?: number | null, atac?: number | null }> };

export type LinkedGenesQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  accessions: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
  methods?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  celltypes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type LinkedGenesQuery = { __typename?: 'Query', linkedGenes: Array<{ __typename?: 'LinkedGenes', p_val?: number | null, gene: string, geneid: string, genetype: string, method: string, accession: string, grnaid?: string | null, effectsize?: number | null, assay?: string | null, celltype?: string | null, experiment_accession?: string | null, tissue?: string | null, score?: number | null, variantid?: string | null, source?: string | null, slope?: number | null, displayname?: string | null } | null> };

export type Mpra_FccQueryVariables = Exact<{
  coordinates?: InputMaybe<Array<GenomicRangeInput> | GenomicRangeInput>;
}>;


export type Mpra_FccQuery = { __typename?: 'Query', mpraFccQuery?: Array<{ __typename?: 'MPRAFCCDATA', celltype: string, chromosome: string, stop: number, start: number, assay_type: string, element_location: string, series: string, strand: string, log2fc: number, experiment: string, barcode_location: string } | null> | null };

export type CapraFccSoloQueryQueryVariables = Exact<{
  accession: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type CapraFccSoloQueryQuery = { __typename?: 'Query', capraFccSoloQuery?: Array<{ __typename?: 'CAPRAFCCSOLODATA', rdhs: string, log2fc: number, fdr: number, dna_rep1: number, rna_rep1: number, rna_rep2: number, rna_rep3: number, pvalue: number, experiment: string } | null> | null };

export type CapraFccDoubleQueryQueryVariables = Exact<{
  accession: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type CapraFccDoubleQueryQuery = { __typename?: 'Query', capraFccDoubleQuery?: Array<{ __typename?: 'CAPRAFCCDOUBLEDATA', rdhs_p1: string, rdhs_p2: string, log2fc: number, fdr: number, dna_rep1: number, rna_rep1: number, rna_rep2: number, rna_rep3: number, pvalue: number, experiment: string } | null> | null };

export type RdhsQueryVariables = Exact<{
  rDHS?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  assembly: Scalars['String']['input'];
}>;


export type RdhsQuery = { __typename?: 'Query', cCREQuery: Array<{ __typename?: 'CCRE', accession: string }> };

export type FunctionalCharacterizationQueryQueryVariables = Exact<{
  coordinates?: InputMaybe<Array<GenomicRangeInput> | GenomicRangeInput>;
  assembly: Scalars['String']['input'];
}>;


export type FunctionalCharacterizationQueryQuery = { __typename?: 'Query', functionalCharacterizationQuery?: Array<{ __typename?: 'FCDATA', tissues: string, element_id: string, assay_result: string, chromosome: string, stop: number, start: number } | null> | null };

export type GeneNameQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  name_prefix?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GeneNameQuery = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, id: string } | null> | null };

export type OrthologTabQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  accession?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type OrthologTabQuery = { __typename?: 'Query', orthologQuery?: Array<{ __typename?: 'Ortholog', assembly: string, accession: string, ortholog: Array<{ __typename?: 'orthologcCRE', stop?: number | null, start?: number | null, chromosome?: string | null, accession: string } | null> } | null> | null };

export type NearbyGenomicFeaturesQueryVariables = Exact<{
  coordinates?: InputMaybe<Array<GenomicRangeInput> | GenomicRangeInput>;
  chromosome?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  b: Scalars['String']['input'];
  c: Scalars['String']['input'];
  a: Scalars['String']['input'];
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NearbyGenomicFeaturesQuery = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, id: string, strand: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number }, transcripts?: Array<{ __typename?: 'Transcript', id: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null } | null> | null, cCREQuery: Array<{ __typename?: 'CCRE', accession: string, group: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } }>, snpQuery: Array<{ __typename?: 'SNP', id: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } }> };

export type NearbyGenomicFeaturesNoSnPsQueryVariables = Exact<{
  coordinates?: InputMaybe<Array<GenomicRangeInput> | GenomicRangeInput>;
  chromosome?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  b: Scalars['String']['input'];
  c: Scalars['String']['input'];
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NearbyGenomicFeaturesNoSnPsQuery = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, id: string, strand: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number }, transcripts?: Array<{ __typename?: 'Transcript', id: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null } | null> | null, cCREQuery: Array<{ __typename?: 'CCRE', accession: string, group: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } }> };

export type Tfpeaks_1QueryVariables = Exact<{
  assembly?: InputMaybe<Scalars['String']['input']>;
  range: Array<InputMaybe<ChromosomeRangeInput>> | InputMaybe<ChromosomeRangeInput>;
  target?: InputMaybe<Scalars['String']['input']>;
}>;


export type Tfpeaks_1Query = { __typename?: 'Query', peaks: { __typename?: 'PCollection', peaks: Array<{ __typename?: 'Peak', chrom: string, chrom_start: number, chrom_end: number, dataset: { __typename?: 'PeakDataset', biosample: string, accession: string, target?: string | null, files: Array<{ __typename?: 'BigBedReplicatedPeaks', accession: string } | { __typename?: 'BigBedUnreplicatedPeaks', accession: string } | { __typename?: 'FilteredAlignments', accession: string } | { __typename?: 'NormalizedSignal', accession: string } | { __typename?: 'ReplicatedPeaks', accession: string } | { __typename?: 'SequenceReads', accession: string } | { __typename?: 'UnfilteredAlignments', accession: string } | { __typename?: 'UnreplicatedPeaks', accession: string }> } }> } | { __typename?: 'TargetPeaksPartitionCollection', peaks: Array<{ __typename?: 'Peak', chrom: string, chrom_start: number, chrom_end: number, dataset: { __typename?: 'PeakDataset', biosample: string, accession: string, target?: string | null, files: Array<{ __typename?: 'BigBedReplicatedPeaks', accession: string } | { __typename?: 'BigBedUnreplicatedPeaks', accession: string } | { __typename?: 'FilteredAlignments', accession: string } | { __typename?: 'NormalizedSignal', accession: string } | { __typename?: 'ReplicatedPeaks', accession: string } | { __typename?: 'SequenceReads', accession: string } | { __typename?: 'UnfilteredAlignments', accession: string } | { __typename?: 'UnreplicatedPeaks', accession: string }> } }> } };

export type Tfpeaks_2QueryVariables = Exact<{
  assembly?: InputMaybe<Scalars['String']['input']>;
  range: Array<InputMaybe<ChromosomeRangeInput>> | InputMaybe<ChromosomeRangeInput>;
  species?: InputMaybe<Scalars['String']['input']>;
}>;


export type Tfpeaks_2Query = { __typename?: 'Query', peaks: { __typename?: 'PCollection', peaks: Array<{ __typename?: 'Peak', chrom: string, chrom_start: number, chrom_end: number, dataset: { __typename?: 'PeakDataset', biosample: string, accession: string, target?: string | null } }> } | { __typename?: 'TargetPeaksPartitionCollection', peaks: Array<{ __typename?: 'Peak', chrom: string, chrom_start: number, chrom_end: number, dataset: { __typename?: 'PeakDataset', biosample: string, accession: string, target?: string | null } }> }, peakDataset: { __typename?: 'BiosamplePartitionCollection', partitionByTarget: Array<{ __typename?: 'TargetPartitionCollection', target?: { __typename?: 'Target', name?: string | null } | null, counts: { __typename?: 'DatasetCounts', total: number } }> } | { __typename?: 'Collection', partitionByTarget: Array<{ __typename?: 'TargetPartitionCollection', target?: { __typename?: 'Target', name?: string | null } | null, counts: { __typename?: 'DatasetCounts', total: number } }> } | { __typename?: 'LabPartitionCollection', partitionByTarget: Array<{ __typename?: 'TargetPartitionCollection', target?: { __typename?: 'Target', name?: string | null } | null, counts: { __typename?: 'DatasetCounts', total: number } }> } | { __typename?: 'TargetPartitionCollection', partitionByTarget: Array<{ __typename?: 'TargetPartitionCollection', target?: { __typename?: 'Target', name?: string | null } | null, counts: { __typename?: 'DatasetCounts', total: number } }> } };

export type NearbyAndLinkedGenesQueryVariables = Exact<{
  accessions: Array<Scalars['String']['input']> | Scalars['String']['input'];
  assembly: Scalars['String']['input'];
  geneSearchStart: Scalars['Int']['input'];
  geneSearchEnd: Scalars['Int']['input'];
  geneSearchChrom: Scalars['String']['input'];
  geneVersion: Scalars['Int']['input'];
}>;


export type NearbyAndLinkedGenesQuery = { __typename?: 'Query', nearbyGenes?: Array<{ __typename?: 'Gene', name: string, id: string, gene_type: string, strand: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number }, transcripts?: Array<{ __typename?: 'Transcript', id: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null } | null> | null, linkedGenes: Array<{ __typename?: 'LinkedGenes', accession: string, p_val?: number | null, gene: string, geneid: string, genetype: string, method: string, grnaid?: string | null, effectsize?: number | null, assay?: string | null, celltype?: string | null, experiment_accession?: string | null, tissue?: string | null, variantid?: string | null, source?: string | null, slope?: number | null, score?: number | null, displayname?: string | null } | null> };

export type GeneQueryQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  name_prefix?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GeneQueryQuery = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, id: string, coordinates: { __typename?: 'GenomicRange', start: number, chromosome: string, end: number } } | null> | null };

export type TssRampageQueryVariables = Exact<{
  gene: Scalars['String']['input'];
}>;


export type TssRampageQuery = { __typename?: 'Query', tssrampageQuery?: Array<{ __typename?: 'TssRampageResponse', start?: number | null, organ?: string | null, strand?: string | null, peakId?: string | null, biosampleName?: string | null, biosampleType?: string | null, biosampleSummary?: string | null, peakType?: string | null, expAccession?: string | null, value?: number | null, end?: number | null, chrom?: string | null, genes?: Array<{ __typename?: 'TssPeaksGenes', geneName?: string | null, locusType?: string | null } | null> | null } | null> | null };

export type ComputationalGeneLinksQueryVariables = Exact<{
  accession: Scalars['String']['input'];
}>;


export type ComputationalGeneLinksQuery = { __typename?: 'Query', ComputationalGeneLinksQuery?: Array<{ __typename?: 'ComputationalGeneLinks', geneid: string, genetype: string, method: string, celltype: string, score: number, methodregion: string, fileaccession: string, gene: string } | null> | null };

export type SilencersQueryQueryVariables = Exact<{
  accession: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type SilencersQueryQuery = { __typename?: 'Query', silencersQuery?: Array<{ __typename?: 'SilencerData', silencer_studies?: Array<string | null> | null } | null> | null };

export type CCre_1QueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  accession?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  experiments?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type CCre_1Query = { __typename?: 'Query', cCREQuery: Array<{ __typename?: 'CCRE', group: string, zScores?: Array<{ __typename?: 'ZScore', experiment: string, score: number }> | null }> };

export type CCre_2QueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  accession?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type CCre_2Query = { __typename?: 'Query', cCREQuery: Array<{ __typename?: 'CCRE', group: string, dnase?: number | null, h3k4me3?: number | null, h3k27ac?: number | null, ctcf?: number | null, atac?: number | null }> };

export type CytobandsQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  chromosome?: InputMaybe<Scalars['String']['input']>;
}>;


export type CytobandsQuery = { __typename?: 'Query', cytoband?: Array<{ __typename?: 'Cytoband', stain: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null };

export type Biosamples_2QueryVariables = Exact<{ [key: string]: never; }>;


export type Biosamples_2Query = { __typename?: 'Query', human: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, dnase?: string | null, h3k4me3?: string | null, h3k27ac?: string | null, ctcf?: string | null, atac?: string | null, dnase_signal?: string | null, h3k4me3_signal?: string | null, h3k27ac_signal?: string | null, ctcf_signal?: string | null, atac_signal?: string | null }> | null }, mouse: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, dnase?: string | null, h3k4me3?: string | null, h3k27ac?: string | null, ctcf?: string | null, atac?: string | null, dnase_signal?: string | null, h3k4me3_signal?: string | null, h3k27ac_signal?: string | null, ctcf_signal?: string | null, atac_signal?: string | null }> | null } };

export type S_2QueryVariables = Exact<{
  chromosome?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  assembly: Scalars['String']['input'];
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type S_2Query = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, strand: string, transcripts?: Array<{ __typename?: 'Transcript', name: string, strand: string, exons?: Array<{ __typename?: 'Exon', coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null } | null> | null };

export type BigRequestsQueryVariables = Exact<{
  bigRequests: Array<BigRequest> | BigRequest;
}>;


export type BigRequestsQuery = { __typename?: 'Query', bigRequests: Array<{ __typename?: 'BigResponse', data?: Array<any | null> | null, error?: { __typename?: 'RequestError', errortype?: string | null, message?: string | null } | null }> };

export type Q_1QueryVariables = Exact<{
  assembly: Scalars['String']['input'];
}>;


export type Q_1Query = { __typename?: 'Query', ccREBiosampleQuery: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, displayname: string, dnase?: string | null, h3k4me3?: string | null, h3k27ac?: string | null, ctcf?: string | null, dnase_signal?: string | null, h3k4me3_signal?: string | null, h3k27ac_signal?: string | null, ctcf_signal?: string | null }> | null } };

export type S_1QueryVariables = Exact<{
  chromosome?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  end?: InputMaybe<Scalars['Int']['input']>;
  assembly: Scalars['String']['input'];
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type S_1Query = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, strand: string, transcripts?: Array<{ __typename?: 'Transcript', name: string, strand: string, exons?: Array<{ __typename?: 'Exon', coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null } | null> | null };

export type GeneTssQueryVariables = Exact<{
  assembly: Scalars['String']['input'];
  name?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GeneTssQuery = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', name: string, id: string, strand: string, coordinates: { __typename?: 'GenomicRange', start: number, chromosome: string, end: number }, transcripts?: Array<{ __typename?: 'Transcript', name: string, coordinates: { __typename?: 'GenomicRange', start: number, end: number } } | null> | null } | null> | null };

export type GetlistofLinkedGenesCelltypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetlistofLinkedGenesCelltypesQuery = { __typename?: 'Query', linkedGenesCelltypes?: Array<{ __typename?: 'LinkedGenesCelltypes', celltype?: string | null, displayname?: string | null, method?: string | null } | null> | null };

export type GetGeneLocation1QueryVariables = Exact<{
  name: Scalars['String']['input'];
  assembly: Scalars['String']['input'];
  version: Scalars['Int']['input'];
}>;


export type GetGeneLocation1Query = { __typename?: 'Query', gene?: Array<{ __typename?: 'Gene', coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } } | null> | null };

export type SnpAutocompleteQueryQueryVariables = Exact<{
  snpid: Scalars['String']['input'];
  assembly: Scalars['String']['input'];
}>;


export type SnpAutocompleteQueryQuery = { __typename?: 'Query', snpAutocompleteQuery: Array<{ __typename?: 'SNP', id: string, coordinates: { __typename?: 'GenomicRange', chromosome: string, start: number, end: number } }> };

export type GetAcccessionCoordsQueryVariables = Exact<{
  accession?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  assembly: Scalars['String']['input'];
}>;


export type GetAcccessionCoordsQuery = { __typename?: 'Query', cCREQuery: Array<{ __typename?: 'CCRE', accession: string, coordinates: { __typename?: 'GenomicRange', start: number, end: number, chromosome: string } }> };

export type CcreSearchQuery_1QueryVariables = Exact<{
  accessions?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  assembly: Scalars['String']['input'];
  cellType?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<Array<InputMaybe<GenomicRangeInput>> | InputMaybe<GenomicRangeInput>>;
  element_type?: InputMaybe<Scalars['String']['input']>;
  gene_all_start?: InputMaybe<Scalars['Int']['input']>;
  gene_all_end?: InputMaybe<Scalars['Int']['input']>;
  gene_pc_start?: InputMaybe<Scalars['Int']['input']>;
  gene_pc_end?: InputMaybe<Scalars['Int']['input']>;
  rank_ctcf_end?: InputMaybe<Scalars['Float']['input']>;
  rank_ctcf_start?: InputMaybe<Scalars['Float']['input']>;
  rank_dnase_end?: InputMaybe<Scalars['Float']['input']>;
  rank_dnase_start?: InputMaybe<Scalars['Float']['input']>;
  rank_enhancer_end?: InputMaybe<Scalars['Float']['input']>;
  rank_enhancer_start?: InputMaybe<Scalars['Float']['input']>;
  rank_promoter_end?: InputMaybe<Scalars['Float']['input']>;
  rank_promoter_start?: InputMaybe<Scalars['Float']['input']>;
  rank_atac_end?: InputMaybe<Scalars['Float']['input']>;
  rank_atac_start?: InputMaybe<Scalars['Float']['input']>;
  mammals_min?: InputMaybe<Scalars['Float']['input']>;
  mammals_max?: InputMaybe<Scalars['Float']['input']>;
  vertebrates_min?: InputMaybe<Scalars['Float']['input']>;
  vertebrates_max?: InputMaybe<Scalars['Float']['input']>;
  primates_min?: InputMaybe<Scalars['Float']['input']>;
  primates_max?: InputMaybe<Scalars['Float']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  nearbygeneslimit?: InputMaybe<Scalars['Int']['input']>;
  nearbygenesdistancethreshold?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CcreSearchQuery_1Query = { __typename?: 'Query', cCRESCREENSearch: Array<{ __typename?: 'SCREENSearchResult', chrom: string, start: number, len: number, pct: string, vertebrates?: number | null, mammals?: number | null, primates?: number | null, ctcf_zscore: number, dnase_zscore: number, enhancer_zscore: number, promoter_zscore: number, atac_zscore: number, ctspecific?: { __typename?: 'SCREENCellTypeSpecificResponse', ct?: string | null, dnase_zscore?: number | null, h3k4me3_zscore?: number | null, h3k27ac_zscore?: number | null, ctcf_zscore?: number | null, atac_zscore?: number | null } | null, info: { __typename?: 'CCREInfo', accession: string, isproximal: boolean, concordant: boolean }, nearestgenes: Array<{ __typename?: 'NearestGenes', gene: string, distance: number } | null> }> };

export type Biosamples_3QueryVariables = Exact<{ [key: string]: never; }>;


export type Biosamples_3Query = { __typename?: 'Query', human: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, ontology: string, lifeStage: string, sampleType: string, displayname: string, dnase?: string | null, h3k4me3?: string | null, h3k27ac?: string | null, ctcf?: string | null, atac?: string | null, dnase_signal?: string | null, h3k4me3_signal?: string | null, h3k27ac_signal?: string | null, ctcf_signal?: string | null, atac_signal?: string | null }> | null }, mouse: { __typename?: 'RegistryBiosampleCollection', biosamples?: Array<{ __typename?: 'RegistryBiosample', name: string, ontology: string, lifeStage: string, sampleType: string, displayname: string, dnase?: string | null, h3k4me3?: string | null, h3k27ac?: string | null, ctcf?: string | null, atac?: string | null, dnase_signal?: string | null, h3k4me3_signal?: string | null, h3k27ac_signal?: string | null, ctcf_signal?: string | null, atac_signal?: string | null }> | null } };


export const RnaSeqQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RNASeqQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rnaSeqQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosample"}}]}}]}}]} as unknown as DocumentNode<RnaSeqQueryQuery, RnaSeqQueryQueryVariables>;
export const Biosamples_1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"biosamples_1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assays"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ontology"}},{"kind":"Field","name":{"kind":"Name","value":"lifeStage"}},{"kind":"Field","name":{"kind":"Name","value":"sampleType"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"dnase_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]}]}}]}}]}}]} as unknown as DocumentNode<Biosamples_1Query, Biosamples_1QueryVariables>;
export const CCreQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"cCREQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession_prefix"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession_prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession_prefix"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}}]}}]}}]}}]} as unknown as DocumentNode<CCreQueryQuery, CCreQueryQueryVariables>;
export const BedIntersectCcre_1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"bedIntersectCCRE_1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_ccres"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"cCRE"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"max_ouput_length"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"intersection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userCcres"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_ccres"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxOutputLength"},"value":{"kind":"Variable","name":{"kind":"Name","value":"max_ouput_length"}}}]}]}}]} as unknown as DocumentNode<BedIntersectCcre_1Query, BedIntersectCcre_1QueryVariables>;
export const GetGeneLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getGeneLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"name"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<GetGeneLocationQuery, GetGeneLocationQueryVariables>;
export const GeneexpressionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"geneexpression"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gene_id"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene_dataset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"processed_assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosample"}},{"kind":"Field","name":{"kind":"Name","value":"tissue"}},{"kind":"Field","name":{"kind":"Name","value":"cell_compartment"}},{"kind":"Field","name":{"kind":"Name","value":"biosample_type"}},{"kind":"Field","name":{"kind":"Name","value":"assay_term_name"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"gene_quantification_files"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"biorep"}},{"kind":"Field","name":{"kind":"Name","value":"quantifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gene_id_prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gene_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tpm"}},{"kind":"Field","name":{"kind":"Name","value":"file_accession"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GeneexpressionQuery, GeneexpressionQueryVariables>;
export const GeneAutocompleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"geneAutocomplete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<GeneAutocompleteQuery, GeneAutocompleteQueryVariables>;
export const GeneOrthologQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"geneOrthologQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"geneOrthologQuery"},"name":{"kind":"Name","value":"geneorthologQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"humanGene"},"name":{"kind":"Name","value":"external_gene_name"}},{"kind":"Field","alias":{"kind":"Name","value":"mouseGene"},"name":{"kind":"Name","value":"mmusculus_homolog_associated_gene_name"}}]}}]}}]} as unknown as DocumentNode<GeneOrthologQueryQuery, GeneOrthologQueryQueryVariables>;
export const GetAllGwasStudiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAllGWASStudies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllGwasStudies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"study"}},{"kind":"Field","name":{"kind":"Name","value":"totalldblocks"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"pubmedid"}},{"kind":"Field","name":{"kind":"Name","value":"studyname"}}]}}]}}]} as unknown as DocumentNode<GetAllGwasStudiesQuery, GetAllGwasStudiesQueryVariables>;
export const GetSnPsforgivengwasStudyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getSNPsforgivengwasStudy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"study"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getSNPsforGWASStudies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"study"},"value":{"kind":"Variable","name":{"kind":"Name","value":"study"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"snpid"}},{"kind":"Field","name":{"kind":"Name","value":"ldblock"}},{"kind":"Field","name":{"kind":"Name","value":"rsquare"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"ldblocksnpid"}}]}}]}}]} as unknown as DocumentNode<GetSnPsforgivengwasStudyQuery, GetSnPsforgivengwasStudyQueryVariables>;
export const BedIntersectCcreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"bedIntersectCCRE"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inp"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"cCRE"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxOutputLength"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"intersection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userCcres"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inp"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxOutputLength"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxOutputLength"}}}]}]}}]} as unknown as DocumentNode<BedIntersectCcreQuery, BedIntersectCcreQueryVariables>;
export const CcreSearchQuery_2Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ccreSearchQuery_2"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"celltype"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cCRESCREENSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"accessions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}}},{"kind":"Argument","name":{"kind":"Name","value":"cellType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"celltype"}}},{"kind":"Argument","name":{"kind":"Name","value":"nearbygeneslimit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chrom"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"len"}},{"kind":"Field","name":{"kind":"Name","value":"pct"}},{"kind":"Field","name":{"kind":"Name","value":"nearestgenes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ctcf_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"dnase_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"enhancer_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"promoter_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"atac_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"ctspecific"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dnase_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"ctcf_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"atac_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"h3k4me3_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"h3k27ac_zscore"}}]}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}}]}}]}}]}}]} as unknown as DocumentNode<CcreSearchQuery_2Query, CcreSearchQuery_2QueryVariables>;
export const GetGwasctEnrichmentQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getGWASCTEnrichmentQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"study"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getGWASCtEnrichmentQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"study"},"value":{"kind":"Variable","name":{"kind":"Name","value":"study"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"celltype"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"fc"}},{"kind":"Field","name":{"kind":"Name","value":"fdr"}},{"kind":"Field","name":{"kind":"Name","value":"pvalue"}}]}}]}}]} as unknown as DocumentNode<GetGwasctEnrichmentQueryQuery, GetGwasctEnrichmentQueryQueryVariables>;
export const GetDisplayNamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getDisplayNames"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"samples"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"samples"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","name":{"kind":"Name","value":"ontology"}}]}}]}}]}}]} as unknown as DocumentNode<GetDisplayNamesQuery, GetDisplayNamesQueryVariables>;
export const Q_4Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"q_4"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assay"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"a"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assay"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","name":{"kind":"Name","value":"ontology"}},{"kind":"Field","name":{"kind":"Name","value":"sampleType"}},{"kind":"Field","name":{"kind":"Name","value":"lifeStage"}},{"kind":"Field","name":{"kind":"Name","value":"umap_coordinates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"a"}}}]},{"kind":"Field","name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"Variable","name":{"kind":"Name","value":"a"}}}]}]}}]}}]}}]} as unknown as DocumentNode<Q_4Query, Q_4QueryVariables>;
export const S_3Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"s_3"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chromosome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}}},{"kind":"Argument","name":{"kind":"Name","value":"start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"Argument","name":{"kind":"Name","value":"end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"transcripts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"exons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]}}]} as unknown as DocumentNode<S_3Query, S_3QueryVariables>;
export const EntexQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ENTEXQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entexQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assay"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"hap1_count"}},{"kind":"Field","name":{"kind":"Name","value":"hap2_count"}},{"kind":"Field","name":{"kind":"Name","value":"hap1_allele_ratio"}},{"kind":"Field","name":{"kind":"Name","value":"p_betabinom"}},{"kind":"Field","name":{"kind":"Name","value":"experiment_accession"}},{"kind":"Field","name":{"kind":"Name","value":"tissue"}},{"kind":"Field","name":{"kind":"Name","value":"donor"}},{"kind":"Field","name":{"kind":"Name","value":"imbalance_significance"}}]}}]}}]} as unknown as DocumentNode<EntexQueryQuery, EntexQueryQueryVariables>;
export const EntexActiveAnnotationsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"entexActiveAnnotationsQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenomicRangeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entexActiveAnnotationsQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"coordinates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tissue"}},{"kind":"Field","name":{"kind":"Name","value":"assay_score"}}]}}]}}]} as unknown as DocumentNode<EntexActiveAnnotationsQueryQuery, EntexActiveAnnotationsQueryQueryVariables>;
export const CCretfDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"cCRETF"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getcCRETFQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"celltype"}},{"kind":"Field","name":{"kind":"Name","value":"tf"}}]}}]}}]} as unknown as DocumentNode<CCretfQuery, CCretfQueryVariables>;
export const TopTissuesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"topTissues"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sampleType"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","name":{"kind":"Name","value":"cCREZScores"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"assay"}},{"kind":"Field","name":{"kind":"Name","value":"experiment_accession"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ontology"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]}]}}]}}]} as unknown as DocumentNode<TopTissuesQuery, TopTissuesQueryVariables>;
export const LinkedGenesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"linkedGenes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"methods"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"celltypes"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"linkedGenes"},"name":{"kind":"Name","value":"linkedGenesQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}}},{"kind":"Argument","name":{"kind":"Name","value":"method"},"value":{"kind":"Variable","name":{"kind":"Name","value":"methods"}}},{"kind":"Argument","name":{"kind":"Name","value":"celltype"},"value":{"kind":"Variable","name":{"kind":"Name","value":"celltypes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"p_val"}},{"kind":"Field","name":{"kind":"Name","value":"gene"}},{"kind":"Field","name":{"kind":"Name","value":"geneid"}},{"kind":"Field","name":{"kind":"Name","value":"genetype"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"grnaid"}},{"kind":"Field","name":{"kind":"Name","value":"effectsize"}},{"kind":"Field","name":{"kind":"Name","value":"assay"}},{"kind":"Field","name":{"kind":"Name","value":"celltype"}},{"kind":"Field","name":{"kind":"Name","value":"experiment_accession"}},{"kind":"Field","name":{"kind":"Name","value":"tissue"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"variantid"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"slope"}},{"kind":"Field","name":{"kind":"Name","value":"tissue"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}}]}}]}}]} as unknown as DocumentNode<LinkedGenesQuery, LinkedGenesQueryVariables>;
export const Mpra_FccDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MPRA_FCC"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenomicRangeInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mpraFccQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"coordinates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"celltype"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"assay_type"}},{"kind":"Field","name":{"kind":"Name","value":"element_location"}},{"kind":"Field","name":{"kind":"Name","value":"series"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"log2fc"}},{"kind":"Field","name":{"kind":"Name","value":"experiment"}},{"kind":"Field","name":{"kind":"Name","value":"barcode_location"}}]}}]}}]} as unknown as DocumentNode<Mpra_FccQuery, Mpra_FccQueryVariables>;
export const CapraFccSoloQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"capraFccSoloQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capraFccSoloQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rdhs"}},{"kind":"Field","name":{"kind":"Name","value":"log2fc"}},{"kind":"Field","name":{"kind":"Name","value":"fdr"}},{"kind":"Field","name":{"kind":"Name","value":"dna_rep1"}},{"kind":"Field","name":{"kind":"Name","value":"rna_rep1"}},{"kind":"Field","name":{"kind":"Name","value":"rna_rep2"}},{"kind":"Field","name":{"kind":"Name","value":"rna_rep3"}},{"kind":"Field","name":{"kind":"Name","value":"pvalue"}},{"kind":"Field","name":{"kind":"Name","value":"experiment"}}]}}]}}]} as unknown as DocumentNode<CapraFccSoloQueryQuery, CapraFccSoloQueryQueryVariables>;
export const CapraFccDoubleQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"capraFccDoubleQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capraFccDoubleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rdhs_p1"}},{"kind":"Field","name":{"kind":"Name","value":"rdhs_p2"}},{"kind":"Field","name":{"kind":"Name","value":"log2fc"}},{"kind":"Field","name":{"kind":"Name","value":"fdr"}},{"kind":"Field","name":{"kind":"Name","value":"dna_rep1"}},{"kind":"Field","name":{"kind":"Name","value":"rna_rep1"}},{"kind":"Field","name":{"kind":"Name","value":"rna_rep2"}},{"kind":"Field","name":{"kind":"Name","value":"rna_rep3"}},{"kind":"Field","name":{"kind":"Name","value":"pvalue"}},{"kind":"Field","name":{"kind":"Name","value":"experiment"}}]}}]}}]} as unknown as DocumentNode<CapraFccDoubleQueryQuery, CapraFccDoubleQueryQueryVariables>;
export const RdhsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"rdhs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rDHS"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"rDHS"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rDHS"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}}]}}]}}]} as unknown as DocumentNode<RdhsQuery, RdhsQueryVariables>;
export const FunctionalCharacterizationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"functionalCharacterizationQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenomicRangeInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"functionalCharacterizationQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"coordinates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tissues"}},{"kind":"Field","name":{"kind":"Name","value":"element_id"}},{"kind":"Field","name":{"kind":"Name","value":"assay_result"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"stop"}},{"kind":"Field","name":{"kind":"Name","value":"start"}}]}}]}}]} as unknown as DocumentNode<FunctionalCharacterizationQueryQuery, FunctionalCharacterizationQueryQueryVariables>;
export const GeneNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"geneName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name_prefix"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"name_prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name_prefix"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GeneNameQuery, GeneNameQueryVariables>;
export const OrthologTabDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"orthologTab"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orthologQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assembly"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"ortholog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stop"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}}]}}]}}]}}]} as unknown as DocumentNode<OrthologTabQuery, OrthologTabQueryVariables>;
export const NearbyGenomicFeaturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"nearbyGenomicFeatures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenomicRangeInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"b"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"c"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"a"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chromosome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}}},{"kind":"Argument","name":{"kind":"Name","value":"start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"Argument","name":{"kind":"Name","value":"end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"b"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transcripts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"c"}}},{"kind":"Argument","name":{"kind":"Name","value":"coordinates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"group"}}]}},{"kind":"Field","name":{"kind":"Name","value":"snpQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"coordinates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"a"}}},{"kind":"Argument","name":{"kind":"Name","value":"common"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<NearbyGenomicFeaturesQuery, NearbyGenomicFeaturesQueryVariables>;
export const NearbyGenomicFeaturesNoSnPsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"nearbyGenomicFeaturesNoSNPs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenomicRangeInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"b"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"c"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chromosome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}}},{"kind":"Argument","name":{"kind":"Name","value":"start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"Argument","name":{"kind":"Name","value":"end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"b"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transcripts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"c"}}},{"kind":"Argument","name":{"kind":"Name","value":"coordinates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"group"}}]}}]}}]} as unknown as DocumentNode<NearbyGenomicFeaturesNoSnPsQuery, NearbyGenomicFeaturesNoSnPsQueryVariables>;
export const Tfpeaks_1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"tfpeaks_1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChromosomeRangeInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"target"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"peaks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}},{"kind":"Argument","name":{"kind":"Name","value":"target"},"value":{"kind":"Variable","name":{"kind":"Name","value":"target"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"peaks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chrom"}},{"kind":"Field","name":{"kind":"Name","value":"chrom_start"}},{"kind":"Field","name":{"kind":"Name","value":"chrom_end"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosample"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"StringValue","value":"replicated_peaks","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<Tfpeaks_1Query, Tfpeaks_1QueryVariables>;
export const Tfpeaks_2Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"tfpeaks_2"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChromosomeRangeInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"species"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"peaks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"peaks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chrom"}},{"kind":"Field","name":{"kind":"Name","value":"chrom_start"}},{"kind":"Field","name":{"kind":"Name","value":"chrom_end"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosample"}},{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"target"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"peakDataset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"species"},"value":{"kind":"Variable","name":{"kind":"Name","value":"species"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"partitionByTarget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"target"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"counts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]}}]} as unknown as DocumentNode<Tfpeaks_2Query, Tfpeaks_2QueryVariables>;
export const NearbyAndLinkedGenesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"nearbyAndLinkedGenes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"geneSearchStart"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"geneSearchEnd"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"geneSearchChrom"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"geneVersion"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"nearbyGenes"},"name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chromosome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"geneSearchChrom"}}},{"kind":"Argument","name":{"kind":"Name","value":"start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"geneSearchStart"}}},{"kind":"Argument","name":{"kind":"Name","value":"end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"geneSearchEnd"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"geneVersion"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"gene_type"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transcripts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"linkedGenes"},"name":{"kind":"Name","value":"linkedGenesQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"p_val"}},{"kind":"Field","name":{"kind":"Name","value":"gene"}},{"kind":"Field","name":{"kind":"Name","value":"geneid"}},{"kind":"Field","name":{"kind":"Name","value":"genetype"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"grnaid"}},{"kind":"Field","name":{"kind":"Name","value":"effectsize"}},{"kind":"Field","name":{"kind":"Name","value":"assay"}},{"kind":"Field","name":{"kind":"Name","value":"celltype"}},{"kind":"Field","name":{"kind":"Name","value":"experiment_accession"}},{"kind":"Field","name":{"kind":"Name","value":"tissue"}},{"kind":"Field","name":{"kind":"Name","value":"variantid"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"slope"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}}]}}]}}]} as unknown as DocumentNode<NearbyAndLinkedGenesQuery, NearbyAndLinkedGenesQueryVariables>;
export const GeneQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"geneQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name_prefix"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"name_prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name_prefix"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<GeneQueryQuery, GeneQueryQueryVariables>;
export const TssRampageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"tssRampage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gene"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tssrampageQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"genename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gene"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"organ"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"peakId"}},{"kind":"Field","name":{"kind":"Name","value":"biosampleName"}},{"kind":"Field","name":{"kind":"Name","value":"biosampleType"}},{"kind":"Field","name":{"kind":"Name","value":"biosampleSummary"}},{"kind":"Field","name":{"kind":"Name","value":"peakType"}},{"kind":"Field","name":{"kind":"Name","value":"expAccession"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"chrom"}},{"kind":"Field","name":{"kind":"Name","value":"genes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"geneName"}},{"kind":"Field","name":{"kind":"Name","value":"locusType"}}]}}]}}]}}]} as unknown as DocumentNode<TssRampageQuery, TssRampageQueryVariables>;
export const ComputationalGeneLinksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ComputationalGeneLinks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ComputationalGeneLinksQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"gene"},"name":{"kind":"Name","value":"genename"}},{"kind":"Field","name":{"kind":"Name","value":"geneid"}},{"kind":"Field","name":{"kind":"Name","value":"genetype"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"celltype"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"methodregion"}},{"kind":"Field","name":{"kind":"Name","value":"fileaccession"}}]}}]}}]} as unknown as DocumentNode<ComputationalGeneLinksQuery, ComputationalGeneLinksQueryVariables>;
export const SilencersQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"silencersQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"silencersQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"silencer_studies"}}]}}]}}]} as unknown as DocumentNode<SilencersQueryQuery, SilencersQueryQueryVariables>;
export const CCre_1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"cCRE_1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"experiments"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","name":{"kind":"Name","value":"zScores"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"experiments"},"value":{"kind":"Variable","name":{"kind":"Name","value":"experiments"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"experiment"}},{"kind":"Field","name":{"kind":"Name","value":"score"}}]}}]}}]}}]} as unknown as DocumentNode<CCre_1Query, CCre_1QueryVariables>;
export const CCre_2Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"cCRE_2"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"dnase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"h3k4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"h3k27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ctcf","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac"},"name":{"kind":"Name","value":"maxZ"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"atac","block":false}}]}]}}]}}]} as unknown as DocumentNode<CCre_2Query, CCre_2QueryVariables>;
export const CytobandsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"cytobands"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cytoband"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"chromosome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stain"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<CytobandsQuery, CytobandsQueryVariables>;
export const Biosamples_2Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"biosamples_2"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"human"},"name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"StringValue","value":"grch38","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"dnase_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"mouse"},"name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"StringValue","value":"mm10","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"dnase_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]}]}}]}}]}}]} as unknown as DocumentNode<Biosamples_2Query, Biosamples_2QueryVariables>;
export const S_2Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"s_2"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chromosome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}}},{"kind":"Argument","name":{"kind":"Name","value":"start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"Argument","name":{"kind":"Name","value":"end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"transcripts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"exons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]}}]} as unknown as DocumentNode<S_2Query, S_2QueryVariables>;
export const BigRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BigRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bigRequests"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigRequest"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bigRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"requests"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bigRequests"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"error"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errortype"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<BigRequestsQuery, BigRequestsQueryVariables>;
export const Q_1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"q_1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"dnase_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]}]}}]}}]}}]} as unknown as DocumentNode<Q_1Query, Q_1QueryVariables>;
export const S_1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"s_1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chromosome"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chromosome"}}},{"kind":"Argument","name":{"kind":"Name","value":"start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"Argument","name":{"kind":"Name","value":"end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"transcripts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"exons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]}}]} as unknown as DocumentNode<S_1Query, S_1QueryVariables>;
export const GeneTssDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"geneTSS"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"strand"}},{"kind":"Field","name":{"kind":"Name","value":"transcripts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GeneTssQuery, GeneTssQueryVariables>;
export const GetlistofLinkedGenesCelltypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getlistofLinkedGenesCelltypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"linkedGenesCelltypes"},"name":{"kind":"Name","value":"getLinkedGenesCelltypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"celltype"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}}]}}]} as unknown as DocumentNode<GetlistofLinkedGenesCelltypesQuery, GetlistofLinkedGenesCelltypesQueryVariables>;
export const GetGeneLocation1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getGeneLocation1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"name"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<GetGeneLocation1Query, GetGeneLocation1QueryVariables>;
export const SnpAutocompleteQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"snpAutocompleteQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"snpid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"snpAutocompleteQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"snpid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"snpid"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chromosome"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<SnpAutocompleteQueryQuery, SnpAutocompleteQueryQueryVariables>;
export const GetAcccessionCoordsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAcccessionCoords"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accession"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cCREQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accession"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accession"}}},{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"coordinates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"chromosome"}}]}}]}}]}}]} as unknown as DocumentNode<GetAcccessionCoordsQuery, GetAcccessionCoordsQueryVariables>;
export const CcreSearchQuery_1Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ccreSearchQuery_1"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cellType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GenomicRangeInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"element_type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gene_all_start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gene_all_end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gene_pc_start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gene_pc_end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_ctcf_end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_ctcf_start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_dnase_end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_dnase_start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_enhancer_end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_enhancer_start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_promoter_end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_promoter_start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_atac_end"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rank_atac_start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mammals_min"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mammals_max"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vertebrates_min"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vertebrates_max"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"primates_min"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"primates_max"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nearbygeneslimit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nearbygenesdistancethreshold"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cCRESCREENSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assembly"}}},{"kind":"Argument","name":{"kind":"Name","value":"accessions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accessions"}}},{"kind":"Argument","name":{"kind":"Name","value":"cellType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cellType"}}},{"kind":"Argument","name":{"kind":"Name","value":"coordinates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coordinates"}}},{"kind":"Argument","name":{"kind":"Name","value":"element_type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"element_type"}}},{"kind":"Argument","name":{"kind":"Name","value":"gene_all_start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gene_all_start"}}},{"kind":"Argument","name":{"kind":"Name","value":"gene_all_end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gene_all_end"}}},{"kind":"Argument","name":{"kind":"Name","value":"gene_pc_start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gene_pc_start"}}},{"kind":"Argument","name":{"kind":"Name","value":"gene_pc_end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gene_pc_end"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_atac_end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_atac_end"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_atac_start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_atac_start"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_ctcf_end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_ctcf_end"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_ctcf_start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_ctcf_start"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_dnase_end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_dnase_end"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_dnase_start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_dnase_start"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_enhancer_end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_enhancer_end"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_enhancer_start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_enhancer_start"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_promoter_end"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_promoter_end"}}},{"kind":"Argument","name":{"kind":"Name","value":"rank_promoter_start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rank_promoter_start"}}},{"kind":"Argument","name":{"kind":"Name","value":"mammals_min"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mammals_min"}}},{"kind":"Argument","name":{"kind":"Name","value":"mammals_max"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mammals_max"}}},{"kind":"Argument","name":{"kind":"Name","value":"vertebrates_min"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vertebrates_min"}}},{"kind":"Argument","name":{"kind":"Name","value":"vertebrates_max"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vertebrates_max"}}},{"kind":"Argument","name":{"kind":"Name","value":"primates_min"},"value":{"kind":"Variable","name":{"kind":"Name","value":"primates_min"}}},{"kind":"Argument","name":{"kind":"Name","value":"primates_max"},"value":{"kind":"Variable","name":{"kind":"Name","value":"primates_max"}}},{"kind":"Argument","name":{"kind":"Name","value":"uuid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uuid"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"nearbygeneslimit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nearbygeneslimit"}}},{"kind":"Argument","name":{"kind":"Name","value":"nearbygenesdistancethreshold"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nearbygenesdistancethreshold"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chrom"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"len"}},{"kind":"Field","name":{"kind":"Name","value":"pct"}},{"kind":"Field","name":{"kind":"Name","value":"vertebrates"}},{"kind":"Field","name":{"kind":"Name","value":"mammals"}},{"kind":"Field","name":{"kind":"Name","value":"primates"}},{"kind":"Field","name":{"kind":"Name","value":"ctcf_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"dnase_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"enhancer_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"promoter_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"atac_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"ctspecific"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ct"}},{"kind":"Field","name":{"kind":"Name","value":"dnase_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"h3k4me3_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"h3k27ac_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"ctcf_zscore"}},{"kind":"Field","name":{"kind":"Name","value":"atac_zscore"}}]}},{"kind":"Field","name":{"kind":"Name","value":"info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accession"}},{"kind":"Field","name":{"kind":"Name","value":"isproximal"}},{"kind":"Field","name":{"kind":"Name","value":"concordant"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nearestgenes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gene"}},{"kind":"Field","name":{"kind":"Name","value":"distance"}}]}}]}}]}}]} as unknown as DocumentNode<CcreSearchQuery_1Query, CcreSearchQuery_1QueryVariables>;
export const Biosamples_3Document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"biosamples_3"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"human"},"name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"StringValue","value":"grch38","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ontology"}},{"kind":"Field","name":{"kind":"Name","value":"lifeStage"}},{"kind":"Field","name":{"kind":"Name","value":"sampleType"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"dnase_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"mouse"},"name":{"kind":"Name","value":"ccREBiosampleQuery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assembly"},"value":{"kind":"StringValue","value":"mm10","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"biosamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ontology"}},{"kind":"Field","name":{"kind":"Name","value":"lifeStage"}},{"kind":"Field","name":{"kind":"Name","value":"sampleType"}},{"kind":"Field","name":{"kind":"Name","value":"displayname"}},{"kind":"Field","alias":{"kind":"Name","value":"dnase"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac"},"name":{"kind":"Name","value":"experimentAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"dnase_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"DNase","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k4me3_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K4me3","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"h3k27ac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"H3K27ac","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"ctcf_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"CTCF","block":false}}]},{"kind":"Field","alias":{"kind":"Name","value":"atac_signal"},"name":{"kind":"Name","value":"fileAccession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assay"},"value":{"kind":"StringValue","value":"ATAC","block":false}}]}]}}]}}]}}]} as unknown as DocumentNode<Biosamples_3Query, Biosamples_3QueryVariables>;