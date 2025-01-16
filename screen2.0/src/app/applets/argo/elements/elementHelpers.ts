import { AssayRankEntry, CCREAssays, CCREClasses, ElementTableRow, RankedRegions } from "../types";

const assayNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]

export const mapScores = (obj, data) => {
    const matchingObj = data.find((e) => obj.accession === e.info.accession);
    if (!matchingObj) return obj;
    return {
        ...obj,
        dnase: matchingObj.dnase_zscore,
        h3k4me3: matchingObj.promoter_zscore,
        h3k27ac: matchingObj.enhancer_zscore,
        ctcf: matchingObj.ctcf_zscore,
        atac: matchingObj.atac_zscore,
        class: matchingObj.pct
    };
};

export const mapScoresCTSpecific = (obj, data) => {
    const matchingObj = data.find((e) => obj.accession === e.info.accession);
    if (!matchingObj) return obj;
    return {
        ...obj,
        dnase: matchingObj.ctspecific.dnase_zscore,
        h3k4me3: matchingObj.ctspecific.h3k4me3_zscore,
        h3k27ac: matchingObj.ctspecific.h3k4me3_zscore,
        ctcf: matchingObj.ctspecific.ctcf_zscore,
        atac: matchingObj.ctspecific.atac_zscore,
        class: matchingObj.pct
    };
};

//find ccres with same input region and combine them based on users rank by selected
export const handleSameInputRegion = (rankBy: string, elementRows: ElementTableRow[]) => {
    //Group by `inputRegion` and calculate average or max scores
    const groupedData = elementRows.reduce((acc, row) => {
        const key = `${row.inputRegion.chr}-${row.inputRegion.start}-${row.inputRegion.end}`;

        if (!acc[key]) {
            acc[key] = {
                ...row, // Start with the first entry's properties to retain the structure
                dnase: rankBy === "max" ? row.dnase : 0,
                atac: rankBy === "max" ? row.atac : 0,
                h3k4me3: rankBy === "max" ? row.h3k4me3 : 0,
                h3k27ac: rankBy === "max" ? row.h3k27ac : 0,
                ctcf: rankBy === "max" ? row.ctcf : 0,
                count: 0 // Only increment count if averaging
            };
        }

        // Sum assay scores for averaging
        if (rankBy === "avg") {
            assayNames.forEach(assay => {
                acc[key][assay] += row[assay] || 0;
            });
            acc[key].count += 1;
        } else if (rankBy === "max") {
            assayNames.forEach(assay => {
                acc[key][assay] = Math.max(acc[key][assay], row[assay] || 0);
            });
        }

        return acc;
    }, {} as { [key: string]: ElementTableRow & { count: number } });

    //Compute averages if necesarry and create `ElementTableRow` entries
    const processedRows: ElementTableRow[] = Object.values(groupedData).map(region => {
        const processedAssays: Partial<ElementTableRow> = {};
        assayNames.forEach(assay => {
            if (rankBy === "avg") {
                processedAssays[assay] = region.count > 0 ? region[assay] / region.count : 0;
            } else {
                processedAssays[assay] = region[assay]; // Already max in reduce step if rankBy is "max"
            }
        });

        return {
            ...region,
            ...processedAssays,
            count: undefined // Remove the helper count property
        };
    });

    return processedRows;
};

export const generateElementRanks = (rows: ElementTableRow[], classes: CCREClasses, assays: CCREAssays): RankedRegions => {
    const assayRanks: { [key: number]: AssayRankEntry } = {};

    //assign a rank to each assay
    assayNames.forEach(assay => {
        const sortedRows = rows
            .sort((a, b) => {
                if (classes[a.class] && classes[b.class]) {
                    return b[assay] - a[assay];
                }
                return 0;
            });

        sortedRows.forEach((row, index) => {
            const isClassEnabled = classes[row.class];
            const score = row[assay];

            if (!assayRanks[row.inputRegion.start]) {
                assayRanks[row.inputRegion.start] = {
                    chr: row.inputRegion.chr,
                    start: row.inputRegion.start,
                    end: row.inputRegion.end,
                    ranks: {}
                };
            }

            // Assign rank based on score order if the class is enabled, otherwise assign rank 0
            assayRanks[row.inputRegion.start].ranks[assay] = isClassEnabled && score !== null ? index + 1 : 0;
        });
    });

    // add up all assay ranks
    const totalAssayRanks = Object.values(assayRanks).map((row) => {
        const totalRank = assayNames.reduce((sum, assay) => {
            return assays[assay] ? sum + (row.ranks[assay] || 0) : sum;
        }, 0);

        return {
            chr: row.chr,
            start: row.start,
            end: row.end,
            totalRank: totalRank,
        };
    });

    // Sort by total rank score in ascending order
    const rankedRegions: RankedRegions = [];
    totalAssayRanks.sort((a, b) => a.totalRank - b.totalRank);

    // Assign ranks, accounting for ties
    let currentRank = 1;
    let prevTotalRank = null;

    totalAssayRanks.forEach((region, index) => {
        if (region.totalRank !== prevTotalRank) {
            currentRank = index + 1;
            prevTotalRank = region.totalRank;
        }
        rankedRegions.push({
            chr: region.chr,
            start: region.start,
            end: region.end,
            rank: region.totalRank === 0 ? 0 : currentRank,
        });
    });
    return rankedRegions
};