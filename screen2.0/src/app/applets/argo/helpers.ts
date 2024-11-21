import { GenomicRegion, SequenceTableRow } from "./types";

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