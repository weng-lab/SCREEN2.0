import { InputRegions, MainTableRow, RankedRegions } from "./types";

// calculate the aggregate rank for each input region
export const calculateAggregateRanks = (inputRegions: InputRegions, sequenceRanks: RankedRegions, elementRanks: RankedRegions, geneRanks: RankedRegions): RankedRegions => {
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

        // Calculate the total rank, using 1000000 if no matching rank is found for any
        const totalRank = (matchingSequence?.rank || 1000000) +
            (matchingElement?.rank || 1000000) +
            (matchingGene?.rank || 1000000);

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

export const matchRanks = (inputRegions: InputRegions, sequenceRanks: RankedRegions, elementRanks: RankedRegions, geneRanks: RankedRegions, aggregateRanks: RankedRegions): MainTableRow[] => {
    const updatedMainRows = inputRegions.map(row => {
        // Find the matching ranks for this `inputRegion`
        const matchingElement = elementRanks.find(
            element =>
                element.chr == row.chr &&
                element.start == row.start &&
                element.end == row.end
        );

        const elementRank = matchingElement ? matchingElement.rank : 0;

        const matchingSequence = sequenceRanks.find(
            sequence =>
                sequence.chr == row.chr &&
                sequence.start == row.start &&
                sequence.end == row.end
        );

        const sequenceRank = matchingSequence ? matchingSequence.rank : 0;

        const matchingGene = geneRanks.find(
            gene =>
                gene.chr == row.chr &&
                gene.start == row.start &&
                gene.end == row.end
        );

        const geneRank = matchingGene ? matchingGene.rank : 0;

        const matchingAggregateRank = aggregateRanks.find(
            mainRank =>
                mainRank.chr == row.chr &&
                mainRank.start == row.start &&
                mainRank.end == row.end
        );

        const aggregateRank = (matchingAggregateRank ? matchingAggregateRank.rank : 0);

        return {
            regionID: row.regionID,
            inputRegion: { chr: row.chr, start: row.start, end: row.end },
            sequenceRank,
            elementRank,
            geneRank,
            aggregateRank
        };
    }).filter(row => row.aggregateRank !== 0);

    return updatedMainRows;
}