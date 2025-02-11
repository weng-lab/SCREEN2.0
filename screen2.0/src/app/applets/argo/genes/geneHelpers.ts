import { AllLinkedGenes, CCREs, ClosestGenetocCRE, GeneFilterState, GeneLinkingMethod, GeneTableRow, RankedRegions } from "../types";
import { GeneOrthologQueryQuery, GeneSpecificityQuery } from "../../../../graphql/__generated__/graphql";

export const getSpecificityScores = (allGenes: AllLinkedGenes, accessions: CCREs, geneSpecificity: GeneSpecificityQuery, geneFilterVariables: GeneFilterState): GeneTableRow[] => {
    
    const updatedAllGenes: AllLinkedGenes = allGenes.map((gene) => ({
        ...gene,
        genes: gene.genes.map((geneEntry) => {
            // Find the matching gene in geneSpecificity
            const matchingGene = geneSpecificity.geneSpecificity.find(
                (specificityGene) => specificityGene.name.replace(/\s+/g, "") === geneEntry.name.replace(/\s+/g, "")
            );

            // Return a new geneEntry with the expressionSpecificity if a match is found
            return {
                ...geneEntry,
                expressionSpecificity: matchingGene ? matchingGene.score : geneEntry.expressionSpecificity,
            };
        }),
    }));

    const specificityRows: GeneTableRow[] = accessions.flatMap((ccre) => {
        // Filter out ccres by matching accession
        const matchingGenes = updatedAllGenes.filter((gene) => ccre.accession === gene.accession);

        const filteredGenes = matchingGenes.map((gene) => ({
            ...gene,
            genes: gene.genes.filter((linkedGene) => {
                // Check if at least one linkage method is valid based on geneFilterVariables
                return linkedGene.linkedBy.some((method) =>
                    geneFilterVariables.methodOfLinkage[method as keyof GeneFilterState['methodOfLinkage']]
                );
            }),
        }));

        const specificityScores = filteredGenes.flatMap((gene) =>
            gene.genes.map((linkedGene) => linkedGene.expressionSpecificity || 0)
        );

        // Calculate expressionSpecificity based on rankBy, only including filtered genes
        const expressionSpecificity =
            geneFilterVariables.rankBy === "max"
                ? Math.max(...specificityScores)
                : specificityScores.reduce((sum, score) => sum + score, 0) / specificityScores.length || 0;

        // Map each matching gene's details to the GeneTableRow format
        return matchingGenes.map((gene) => ({
            regionID: ccre.regionID,
            inputRegion: ccre.inputRegion,
            expressionSpecificity: expressionSpecificity === -Infinity ? 0 : expressionSpecificity,
            linkedGenes: gene.genes.map((linkedGene) => ({
                accession: gene.accession,
                name: linkedGene.name,
                geneid: linkedGene.geneId,
                linkedBy: linkedGene.linkedBy as GeneLinkingMethod[],
            })),
        }));
    });

    return specificityRows
}

export const parseLinkedGenes = (data): AllLinkedGenes => {
    const uniqueAccessions: {
        accession: string;
        genes: { name: string; geneId: string; linkedBy: string[] }[]
    }[] = [];

    for (const gene of data) {
        const geneNameToPush = gene.gene;
        const geneIdToPush = gene.geneid
        const methodToPush = (gene.assay ?? gene.method).replace(/-/g, '_');
        const geneAccession = gene.accession;

        const existingGeneEntry = uniqueAccessions.find((uniqueGene) => uniqueGene.accession === geneAccession);

        if (existingGeneEntry) {
            const existingGene = existingGeneEntry.genes.find((gene) => gene.name === geneNameToPush && gene.geneId === geneIdToPush);

            if (existingGene) {
                // Add the method if it's not already in the linkedBy array
                if (!existingGene.linkedBy.includes(methodToPush)) {
                    existingGene.linkedBy.push(methodToPush);
                }
            } else {
                // Add a new gene entry if the gene name and geneId don't exist
                existingGeneEntry.genes.push({ name: geneNameToPush, geneId: geneIdToPush, linkedBy: [methodToPush] });
            }
        } else {
            // Create a new entry for the accession if it doesn't exist
            uniqueAccessions.push({
                accession: geneAccession,
                genes: [{ name: geneNameToPush, geneId: geneIdToPush, linkedBy: [methodToPush] }],
            });
        }
    }

    return uniqueAccessions
}

export const pushClosestGenes = (closestGenes: ClosestGenetocCRE, linkedGenes: AllLinkedGenes): AllLinkedGenes => {
    // Iterate over each closest gene
    for (const closestGene of closestGenes) {
        const closestGeneName = closestGene.gene.name;
        const closestGeneId = closestGene.gene.geneid;
        const accession = closestGene.ccre;

        // Find the matching accession in linkedGenes
        const linkedAccession = linkedGenes.find((linked) => linked.accession === accession);

        if (linkedAccession) {
            // Find the matching gene in the linked genes
            const existingGene = linkedAccession.genes.find(
                (gene) => gene.name === closestGeneName && gene.geneId === closestGeneId
            );

            if (existingGene) {
                // Add "distance" to the linkedBy array if not already present
                if (!existingGene.linkedBy.includes("distance")) {
                    existingGene.linkedBy.push("distance");
                }
            } else {
                // Add a new gene with "distance" as the linkedBy method
                linkedAccession.genes.push({
                    name: closestGeneName,
                    geneId: closestGeneId,
                    linkedBy: ["distance"],
                });
            }
        } else {
            // If no matching accession exists, add a new accession with the gene
            linkedGenes.push({
                accession: accession,
                genes: [
                    {
                        name: closestGeneName,
                        geneId: closestGeneId,
                        linkedBy: ["distance"],
                    },
                ],
            });
        }
    }

    return linkedGenes;
}

export const filterOrthologGenes = (orthoGenes: GeneOrthologQueryQuery, allGenes: AllLinkedGenes): AllLinkedGenes => {
    const orthologs = orthoGenes.geneOrthologQuery; // List of ortholog genes
    const orthologNames = new Set(
        orthologs.map((ortholog: { humanGene: string }) => ortholog.humanGene)
    );

    // Filter out genes that do not have an ortholog
    const filteredGenes = allGenes
        .map((item) => ({
            ...item,
            genes: item.genes.filter((gene) => {
                const geneNameWithoutSpaces = gene.name.replace(/\s+/g, '');
                return orthologNames.has(geneNameWithoutSpaces);
            }),
        }))
        .filter((item) => item.genes.length > 0); // Remove items that end up with no genes

    return (filteredGenes)
}

export const generateGeneRanks = (geneRows: GeneTableRow[]): RankedRegions => {
    // Assign ranks based on expression specificity
    const expressionSpecificityRankedRows = (() => {
        const sortedRows = [...geneRows].sort((a, b) => b.expressionSpecificity - a.expressionSpecificity);
        let rank = 1; // Start rank at 1
        return sortedRows.map((row, index) => {
            if (row.expressionSpecificity === 0) {
                return { ...row, speceficityRank: 0 }; // Set rank to 0 for 0 specificity
            }
            if (index > 0 && sortedRows[index].expressionSpecificity !== sortedRows[index - 1].expressionSpecificity) {
                rank = index + 1;
            }
            return { ...row, speceficityRank: rank };
        });
    })();

    // Assign ranks based on maxExpression
    const maxExpressionRankedRows = (() => {
        const sortedRows = [...geneRows].sort((a, b) => (b.maxExpression ?? 0) - (a.maxExpression ?? 0));
        let rank = 1; // Start rank at 1
        return sortedRows.map((row, index) => {
            if ((row.maxExpression ?? 0) === 0) {
                return { ...row, maxExpRank: 0 }; // Set rank to 0 for 0 maxExpression
            }
            if (index > 0 && (sortedRows[index].maxExpression ?? 0) !== (sortedRows[index - 1].maxExpression ?? 0)) {
                rank = index + 1;
            }
            return { ...row, maxExpRank: rank };
        });
    })();

    // Merge ranks and calculate total rank
    const combinedRanks = expressionSpecificityRankedRows.map((row) => {
        const rankedGenes = maxExpressionRankedRows.find(
            (motifRow) => motifRow.regionID === row.regionID
        )?.maxExpRank;

        return {
            ...row,
            totalRank: row.speceficityRank + (rankedGenes ?? 0), // Use 0 if rank is missing
        };
    });

    // Sort by total rank and assign final ranks
    const rankedRegions: RankedRegions = (() => {
        const sortedByTotalRank = [...combinedRanks].sort((a, b) => a.totalRank - b.totalRank);
        let rank = 1; // Start rank at 1
        return sortedByTotalRank.map((row, index) => {
            if (row.totalRank === 0) {
                return {
                    chr: row.inputRegion.chr,
                    start: row.inputRegion.start,
                    end: row.inputRegion.end,
                    rank: 0, // Set rank to 0 if totalRank is 0
                };
            }
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

    return rankedRegions;
};