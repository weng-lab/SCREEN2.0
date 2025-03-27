import { GenomicRegion, InputRegions, MotifRanking, RankedRegions, SequenceTableRow } from "../types";

// switch between min, max, avg for conservation scores, calculate each respectivley
export const calculateConservationScores = (scores, rankBy: string, inputRegions: InputRegions): SequenceTableRow[] => {
    const filteredScores = scores.filter((request) => request.data.length > 0)

    const conservationScores = filteredScores.map((request) => {
        const data = request.data;

        // Extract the shared information for chr, start, and end
        //query's first item is one base pair back so we use the end of the first item for the start
        //and the end of the last item for the end
        const chr = data[0]?.chr || '';
        let start = data[0]?.end || 0;
        let end = data[data.length - 1]?.end || 0;

        //Some of the files were not built properly and return a several base pair score
        //this checks each start and end to see if they actually exist in input regions to get the real start and end
        if (data[0].end - data[0].start > 1) {
            for (let i = data[0].start; i < data[0].end; i++) {
                const newStart = inputRegions.find(
                    region => region.start === i
                )
                if (newStart) {
                    start = newStart.start
                    break
                }
            }
        }
        if (data[data.length - 1].end - data[data.length - 1].start > 1) {
            for (let i = data[data.length - 1].start; i < data[data.length - 1].end; i++) {
                const newEnd = inputRegions.find(
                    region => region.end === i
                )
                if (newEnd) {
                    end = newEnd.end
                    break
                }
            }
        }
        
        // Find matching input region with the same chromosome, start, and end
        const matchingRegion = inputRegions.find(
            region => region.chr === chr &&
                region.start === start &&
                region.end === end
        );
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

        return {
            regionID: matchingRegion?.regionID,
            inputRegion: { chr, start, end },
            conservationScore: score
        } as SequenceTableRow;
    });
    
    return conservationScores
}

//function to batch the input regions together to call smaller queries
export const batchRegions = (regions: GenomicRegion[], limit: number): GenomicRegion[][] => {
    const batches: GenomicRegion[][] = [];
    for (let i = 0; i < regions.length; i += limit) {
        batches.push(regions.slice(i, i + limit));
    }
    return batches;
}

export const calculateMotifScores = (inputRegions: InputRegions, scores: MotifRanking): SequenceTableRow[] => {
    const motifScores =  inputRegions.map(region => {
        const matchingMotifs = scores.filter(motif => motif.regionid === region.regionID.toString());

        // Find the one with the max absolute diff
        const bestMotif = matchingMotifs.length > 0 
            ? matchingMotifs.reduce((maxMotif, currMotif) => 
                Math.abs(currMotif.diff) > Math.abs(maxMotif.diff) ? currMotif : maxMotif
            ) 
            : null;
        
        if (bestMotif) {
                return {
                    regionID: region.regionID,
                    inputRegion: {
                        chr: region.chr,
                        start: region.start,
                        end: region.end,
                    },
                    referenceAllele: {
                        sequence: region.ref,
                        score: bestMotif.ref
                    },
                    alt: {
                        sequence: region.alt,
                        score: bestMotif.alt
                    },
                    motifScoreDelta: Math.abs(bestMotif.diff),
                    motifID: bestMotif.motif
                };
            } else { return null}
    });

    return motifScores.filter(motif => motif !== null)
}

// find the number of overlapping motifs for each input region
export const getNumOverlappingMotifs = (inputRegions: InputRegions, scores: MotifRanking): SequenceTableRow[] => {
    const overlapping = inputRegions.map(region => {
        const matchingMotifs = scores.filter(motif => motif.regionid === region.regionID.toString());

        return {
            regionID: region.regionID,
            inputRegion: {
                chr: region.chr,
                start: region.start,
                end: region.end,
            },
            numOverlappingMotifs: matchingMotifs.length,
            motifs: matchingMotifs.map(motif => ({
                referenceAllele: {
                    sequence: region.ref,
                    score: motif.ref,
                },
                alt: {
                    sequence: region.alt,
                    score: motif.alt,
                },
                diff: Math.abs(motif.diff),
                motifID: motif.motif,
            }))
        };
    })

    return overlapping;
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
                rank: rank,
            };
        });
    })();

    // Assign ranks based on difference
    const differenceRankedRows = (() => {
        const sortedRows = [...sequenceRows].sort((a, b) => b.motifScoreDelta! - a.motifScoreDelta!);
        let rank = 1;
        return sortedRows.map((row, index) => {
            if (index > 0 && sortedRows[index].motifScoreDelta !== sortedRows[index - 1].motifScoreDelta) {
                rank = index + 1;
            }
            return {
                ...row,
                rank: rank,
            };
        });
    })();

    // Assign ranks based on numOverlappingMotifs
    const overlappingRankedRows = (() => {
        const sortedRows = [...sequenceRows].sort((a, b) => b.numOverlappingMotifs! - a.numOverlappingMotifs!);
        let rank = 1;
        return sortedRows.map((row, index) => {
            if (index > 0 && sortedRows[index].numOverlappingMotifs !== sortedRows[index - 1].numOverlappingMotifs) {
                rank = index + 1;
            }
            return {
                ...row,
                rank: rank,
            };
        });
    })();

    // Merge ranks and calculate total rank
    const combinedRanks = sequenceRows.map((row) => {

        const conservationRank = conservationRankedRows.find(r => r.regionID === row.regionID)?.rank ?? sequenceRows.length;
        const motifRank = differenceRankedRows.find(r => r.regionID === row.regionID)?.rank ?? sequenceRows.length;
        const numMotifRank = overlappingRankedRows.find(r => r.regionID === row.regionID)?.rank ?? sequenceRows.length;

        return {
            ...row,
            totalRank: conservationRank + motifRank + numMotifRank, // Sum of ranks
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