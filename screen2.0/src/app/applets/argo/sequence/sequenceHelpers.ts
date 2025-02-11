import { OperationVariables, QueryResult } from "@apollo/client";
import {  GenomicRegion, InputRegions, MotifQueryDataOccurrence, RankedRegions, SequenceTableRow } from "../types";
import {  OccurrencesQuery } from "../../../../graphql/__generated__/graphql";

// switch between min, max, avg for conservation scores, calculate each respectivley
export const calculateConservationScores = (scores, rankBy: string, inputRegions: InputRegions): SequenceTableRow[] => {
    const conservationScores = scores.map((request) => {
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

    return conservationScores.filter(row => row.regionID !== undefined)
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
export const getNumOverlappingMotifs = (occurrences: QueryResult<OccurrencesQuery, OperationVariables>[], inputRegions: InputRegions): SequenceTableRow[] => {
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