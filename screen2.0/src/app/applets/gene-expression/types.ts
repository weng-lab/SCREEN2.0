export type BiosampleList = {
    cell_line: boolean,
    in_vitro: boolean,
    primary_cell: boolean,
    tissue: boolean
}

export type CellComponents = {
    cell: boolean,
    chromatin: boolean,
    cytosol: boolean,
    membrane: boolean,
    nucleolus: boolean,
    nucleoplasm: boolean,
    nucleus: boolean
}

export type GeneExpression = {
    all: {
        assembly: string,
        coords: {
            chrom: string,
            start: number,
            stop: number
        },
        ensemblid_ver: string,
        gene: string,
        itemsByRID: {
            [id: number]: {
                ageTitle: string
                cellType: string,
                logFPKM: number,
                logTPM: number,
                rID: number,
                rawFPKM: number,
                rawTPM: number,
                rep: number,
                tissue: string
            }
        },
        mean: {
            byExpressionFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byExpressionTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueFPKM: {
                [tissue_type: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            }
        },
        single: {
            byExpressionFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byExpressionTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueFPKM: {
                [tissue_type: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            }
        },
        strand: string
    },
    assembly: string,
    gene: string,
    "polyA RNA-seq": {
        assembly: string,
        coords: {
            chrom: string,
            start: number,
            stop: number
        },
        ensemblid_ver: string,
        gene: string,
        itemsByRID: {
            [id: number]: {
                ageTitle: string
                cellType: string,
                logFPKM: number,
                logTPM: number,
                rID: number,
                rawFPKM: number,
                rawTPM: number,
                rep: number,
                tissue: string
            }
        },
        mean: {
            byExpressionFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byExpressionTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueFPKM: {
                [tissue_type: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            }
        },
        single: {
            byExpressionFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byExpressionTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueFPKM: {
                [tissue_type: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            }
        },
        strand: string
    },
    "total RNA-seq": {
        assembly: string,
        coords: {
            chrom: string,
            start: number,
            stop: number
        },
        ensemblid_ver: string,
        gene: string,
        itemsByRID: {
            [id: number]: {
                ageTitle: string
                cellType: string,
                logFPKM: number,
                logTPM: number,
                rID: number,
                rawFPKM: number,
                rawTPM: number,
                rep: number,
                tissue: string
            }
        },
        mean: {
            byExpressionFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byExpressionTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueFPKM: {
                [tissue_type: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            }
        },
        single: {
            byExpressionFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byExpressionTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueFPKM: {
                [tissue_type: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxFPKM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            },
            byTissueMaxTPM: {
                [id: string]: {
                    color: string,
                    displayName: string,
                    items: number[],
                    name: string
                }
            }
        },
        strand: string
    }
}