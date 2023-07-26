export type QueryResponse = [number, string[], any, [string, string, string, string, string, string][], string[]]

export type GenomicRange = {
    chromosome: string;
    start: number;
    end: number;
};

export type BiosampleEntry = {
    biosample_name: string;
    [key: string]: string | null | undefined;
};

export type RDHSEntry = {
    accession: string;
    chromosome: string;
    start: number;
    stop: number;
    assembly?: string;
};

export type LinkedGenesParameters = {
    assembly?: string;
    accession: string[];
};

export type LinkedGene = {
    assembly: string;
    accession: string;
    assay: string;
    experiment_accession: string;
    celltype: string;
    gene: string;
};

export type BiosampleParemeters = {
    assembly: string;
    accession?: string[];
    name?: string[];
    assay?: string[];
    assays?: Set<string>;
    umap_coordinates?: [[number, number], [number, number]];
};

export type RDHSParemeters = {
    assembly: string;
    accession_prefix?: string[];
    accession?: string[];
    coordinates?: GenomicRange[];
    limit?: number;
    activeInBiosamples?: string[];
};

export type CCREEntry = {
    accession: string;
    rdhs: string;
    ccre_group: string;
    ctcf_bound: boolean;
    chromosome: string;
    start: number;
    stop: number;
    assembly?: string;
};

export type CCREParameters = {
    assembly: string;
    accession_prefix?: string[];
    accession?: string[];
    rDHS?: string[];
    group?: string[];
    ctcf_bound?: boolean;
    coordinates?: GenomicRange[];
    limit?: number;
    activeInBiosamples?: string[];
    activeInAnyBiosample?: string[];
};

export type CCREMaxZParameters = {
    assembly: string;
    accession: string[];
    assay: string;
};

export type CCREMaxZEntry = {
    accession: string;
    score: number;
};

export type CellTypeAssayEntry = {
    biosample_name: string;
    [key: string]: string;
};

export type ZScoreEntry = {
    experiment_accession: string;
    rdhs: string;
    score: number;
};

export type ZScoreParameters = {
    assembly: string;
    experiment?: string[];
    rDHS?: string[];
    minimum_score?: number;
    maximum_score?: number;
};

export type ZScoreHistogramParameters = {
    histogram_minimum: number;
    histogram_maximum: number;
    histogram_bins: number;
};

export type VersionCollection = {
    version: string;
    biosamples: VersionBiosamples[];
};

export type VersionBiosamples = {
    biosample: string;
    assays: VersionExperiments[];
};

export type VersionExperiments = {
    assay: string;
    experiments: string[];
};

export type VersionEntry = {
    accession: string;
    biosample: string;
    assay: string;
    version: string;
};

export type Ortholog = {
    accession: string;
    assembly: string;
    ortholog: string[];
};

export type OrthologParameters = {
    assembly: string;
    accession: string;
};

export type OrthologEntry = {
    grch38: string;
    mm10: string;
};
