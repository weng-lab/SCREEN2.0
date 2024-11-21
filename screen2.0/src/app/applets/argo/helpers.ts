import { AssayRankEntry, ElementTableRow, GenomicRegion, MotifQueryDataOccurrence, RankedRegions, SequenceTableRow } from "./types";

const assayNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]

// switch between min, max, avg for conservation scores, calculate each respectivley
export const  calculateConservationScores = (scores, rankBy, inputRegions): SequenceTableRow[] => {
    return scores.map((request) => {
        const data = request.data;

        // Extract the shared information for chr, start, and end
        //query's first item is one base pair back so we use the end of the first item for the start
        //and the end of the last item for the end
        const chr = data[0]?.chr || '';
        const start = data[0]?.end || 0;
        const end = data[data.length - 1]?.end || 0;

        let score;
        // calculate the score based on selected rank by
        if (rankBy === "max") {
            score = Math.max(...data.map(item => item.value));
        } else if (rankBy === "min") {
            score = Math.min(...data.map(item => item.value));
        } else {
            const sum = data.reduce((total, item) => total + item.value, 0);
            score = data.length > 0 ? sum / data.length : 0;
        }

        // Find matching input region with the same chromosome, start, and end
        const matchingRegion = inputRegions.find(
            region => region.chr === chr &&
                region.start === start &&
                region.end === end
        );

        return {
            regionID: matchingRegion?.regionID,
            inputRegion: { chr, start, end },
            conservationScore: score
        } as SequenceTableRow;
    });
}

//function to batch the input regions together to call smaller queries
export const batchRegions = (regions: GenomicRegion[], maxBasePairs: number): GenomicRegion[][] => {
    const result: GenomicRegion[][] = [];
    let currentBatch: GenomicRegion[] = [];
    let currentBatchLength = 0;

    for (const region of regions) {
        let regionStart = region.start;

        // If the region is larger than maxBasePairs, split it into chunks
        while (regionStart < region.end) {
            const chunkEnd = Math.min(regionStart + maxBasePairs, region.end);
            const chunk = { chr: region.chr, start: regionStart, end: chunkEnd };
            const chunkLength = chunk.end - chunk.start;

            // If adding this chunk exceeds the max base pairs for the current batch
            if (currentBatchLength + chunkLength > maxBasePairs) {
                result.push(currentBatch);
                currentBatch = [];
                currentBatchLength = 0;
            }

            // Add the chunk to the current batch
            currentBatch.push(chunk);
            currentBatchLength += chunkLength;

            // Move the start pointer forward
            regionStart = chunkEnd;
        }
    }

    // Push any remaining regions in the final batch
    if (currentBatch.length > 0) {
        result.push(currentBatch);
    }

    return result;
}

// find the number of overlapping motifs for each input region
export const getNumOverlappingMotifs = (occurrences, inputRegions): SequenceTableRow[] => {
    if (occurrences.length === 0 || inputRegions.length === 0) return [];
    return inputRegions.map(inputRegion => {
        const overlappingMotifs = occurrences.flatMap(occurrence =>
            occurrence.data.meme_occurrences.filter(motif =>
                motif.genomic_region.chromosome === inputRegion.chr &&
                motif.genomic_region.start < inputRegion.end &&
                motif.genomic_region.end > inputRegion.start
            )
        );

        return {
            regionID: inputRegion.regionID,
            inputRegion: inputRegion,
            numOverlappingMotifs: overlappingMotifs.length,
            occurrences: overlappingMotifs as MotifQueryDataOccurrence[]
        };
    });
}

export const generateSequenceRanks = (sequenceRows: SequenceTableRow[]): RankedRegions => {
    // Assign ranks based on conservationScore
    const conservationRankedRows = (() => {
        const sortedRows = [...sequenceRows].sort((a, b) => b.conservationScore - a.conservationScore);
        let rank = 1;
        return sortedRows.map((row, index) => {
            if (index > 0 && sortedRows[index].conservationScore !== sortedRows[index - 1].conservationScore) {
                rank = index + 1;
            }
            return {
                ...row,
                conservationRank: rank,
            };
        });
    })();

    // Assign ranks based on numOverlappingMotifs
    const motifRankedRows = (() => {
        const sortedRows = [...sequenceRows].sort((a, b) => b.numOverlappingMotifs! - a.numOverlappingMotifs!);
        let rank = 1;
        return sortedRows.map((row, index) => {
            if (index > 0 && sortedRows[index].numOverlappingMotifs !== sortedRows[index - 1].numOverlappingMotifs) {
                rank = index + 1; 
            }
            return {
                ...row,
                motifRank: rank,
            };
        });
    })();

    // Merge ranks and calculate total rank
    const combinedRanks = conservationRankedRows.map((row) => {
        const motifRank = motifRankedRows.find(
            (motifRow) => motifRow.regionID === row.regionID
        )?.motifRank;

        return {
            ...row,
            totalRank: row.conservationRank + (motifRank ?? sequenceRows.length), // Sum of ranks
        };
    });

    // Sort by total rank and assign final ranks 
    const rankedRegions: RankedRegions = (() => {
        const sortedByTotalRank = [...combinedRanks].sort((a, b) => a.totalRank - b.totalRank);
        let rank = 1;
        return sortedByTotalRank.map((row, index) => {
            if (index > 0 && sortedByTotalRank[index].totalRank !== sortedByTotalRank[index - 1].totalRank) {
                rank = index + 1;
            }
            return {
                chr: row.inputRegion.chr,
                start: row.inputRegion.start,
                end: row.inputRegion.end,
                rank, 
            };
        });
    })();

    return rankedRegions

};

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
export const handleSameInputRegion = (rankBy, elementRows: ElementTableRow[]) => {
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

export const generateElementRanks = (rows: ElementTableRow[], classes, assays): RankedRegions => {
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

// calculate the aggregate rank for each input region
export const calculateAggregateRanks = (inputRegions, sequenceRanks, elementRanks, geneRanks): RankedRegions => {
    const totalRanks = inputRegions.map(row => {
        // Find matching ranks based on inputRegion coordinates
        const matchingSequence = sequenceRanks.find(seq =>
            seq.chr == row.chr &&
            seq.start == row.start &&
            seq.end == row.end
        );

        const matchingElement = elementRanks.find(ele =>
            ele.chr == row.chr &&
            ele.start == row.start &&
            ele.end == row.end
        );

        const matchingGene = geneRanks.find(gene =>
            gene.chr == row.chr &&
            gene.start == row.start &&
            gene.end == row.end
        );

        // Calculate the total rank, using 0 if no matching rank is found for any
        const totalRank = (matchingSequence?.rank || 0) +
            (matchingElement?.rank || 0) +
            (matchingGene?.rank || 0);

        return {
            ...row,
            rank: totalRank
        };
    });

    // Assign aggregate ranks, accounting for ties
    let currentRank = 1;
    let prevTotalRank = null;

    const aggregateRanks = totalRanks
        .sort((a, b) => a.rank - b.rank) // Sort by rank
        .map((region, index) => {
            // Update current rank only if rank is different from the previous
            if (region.rank !== prevTotalRank) {
                currentRank = index + 1;
                prevTotalRank = region.rank;
            }

            return {
                chr: region.chr,
                start: region.start,
                end: region.end,
                rank: region.rank === 0 ? 0 : currentRank, // Assign 0 for unranked regions
            };
        });

        return (aggregateRanks as RankedRegions)
};