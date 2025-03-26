import { AllLinkedGenes, CCREs, ClosestGenetocCRE, GeneFilterState, GeneLinkingMethod, GeneTableRow, RankedRegions } from "../types";
import { GeneOrthologQueryQuery, GeneSpecificityQuery, Test_GeneEXpBiosampleQueryQuery } from "../../../../graphql/__generated__/graphql";

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
            gene.genes.map((linkedGene) => ({
                geneName: linkedGene.name,
                score: linkedGene.expressionSpecificity || 0,
                linkedBy: linkedGene.linkedBy
            }))
        );

        // Calculate expressionSpecificity based on rankBy, only including filtered genes
        let expressionSpecificity: GeneTableRow["expressionSpecificity"] | undefined;

        if (specificityScores.length > 0) {
            if (geneFilterVariables.rankExpSpecBy === "max") {
                const maxGene = specificityScores.reduce((prev, curr) =>
                    curr.score > prev.score ? curr : prev
                );
                expressionSpecificity = { geneName: maxGene.geneName, score: maxGene.score, linkedBy: maxGene.linkedBy };
            } else {
                const avgScore =
                specificityScores.reduce((sum, { score }) => sum + score, 0) / specificityScores.length;
                const linkedBySet = new Set(specificityScores.flatMap(({ linkedBy }) => linkedBy));
                expressionSpecificity = { geneName: "Average", score: avgScore, linkedBy: Array.from(linkedBySet) };
            }
        }

        // Map each matching gene's details to the GeneTableRow format
        return matchingGenes.map((gene) => ({
            regionID: ccre.regionID,
            inputRegion: ccre.inputRegion,
            expressionSpecificity,
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

export const getExpressionScores = (allGenes: AllLinkedGenes, accessions: CCREs, geneExpression: Test_GeneEXpBiosampleQueryQuery, geneFilterVariables: GeneFilterState): GeneTableRow[] => {

    const updatedAllGenes: AllLinkedGenes = allGenes.map((gene) => ({
        ...gene,
        genes: gene.genes.map((geneEntry) => {
            // Find the matching gene in geneExpression
            const matchingGene = geneExpression.geneexpressiontpms.find(
                (expressionGene) => expressionGene.gene === geneEntry.name.replace(/\s+/g, "")
            );

            // Return a new geneEntry with the geneExpression if a match is found
            return {
                ...geneEntry,
                geneExpression: matchingGene ? matchingGene.tpm : geneEntry.geneExpression,
            };
        }),
    }));

    const expressionRows: GeneTableRow[] = accessions.flatMap((ccre) => {
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

        const expressionScores = filteredGenes.flatMap((gene) =>
            gene.genes.map((linkedGene) => ({
                geneName: linkedGene.name,
                score: linkedGene.geneExpression || 0,
                linkedBy: linkedGene.linkedBy
            }))
        );

        // Calculate geneExpression based on rankBy, only including filtered genes
        let geneExpression: GeneTableRow["geneExpression"] | undefined;

        if (expressionScores.length > 0) {
            if (geneFilterVariables.rankGeneExpBy === "max") {
                const maxGene = expressionScores.reduce((prev, curr) =>
                    curr.score > prev.score ? curr : prev
                );
                geneExpression = { geneName: maxGene.geneName, score: maxGene.score, linkedBy: maxGene.linkedBy };
            } else {
                const avgScore =
                    expressionScores.reduce((sum, { score }) => sum + score, 0) / expressionScores.length;
                    const linkedBySet = new Set(expressionScores.flatMap(({ linkedBy }) => linkedBy));
                geneExpression = { geneName: "Average", score: avgScore, linkedBy: Array.from(linkedBySet) };
            }
        }

        // Map each matching gene's details to the GeneTableRow format
        return matchingGenes.map((gene) => ({
            regionID: ccre.regionID,
            inputRegion: ccre.inputRegion,
            geneExpression,
            linkedGenes: gene.genes.map((linkedGene) => ({
                accession: gene.accession,
                name: linkedGene.name,
                geneid: linkedGene.geneId,
                linkedBy: linkedGene.linkedBy as GeneLinkingMethod[],
            })),
        }));
    });

    return expressionRows
}

export const parseLinkedGenes = (data, methodOfLinkage: { [key in GeneLinkingMethod]: boolean }): AllLinkedGenes => {
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
                if (!existingGene.linkedBy.includes(methodToPush) && methodOfLinkage[methodToPush]) {
                    existingGene.linkedBy.push(methodToPush);
                }
            } else {
                // Add a new gene entry if the gene name and geneId don't exist
                existingGeneEntry.genes.push({ name: geneNameToPush, geneId: geneIdToPush, linkedBy: methodOfLinkage[methodToPush] ? [methodToPush] : [] });
            }
        } else {
            // Create a new entry for the accession if it doesn't exist
            uniqueAccessions.push({
                accession: geneAccession,
                genes: [{ name: geneNameToPush, geneId: geneIdToPush, linkedBy: methodOfLinkage[methodToPush] ? [methodToPush] : [] }],
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
        const sortedRows = [...geneRows].sort((a, b) => b.expressionSpecificity.score - a.expressionSpecificity.score);
        let rank = 1;
        return sortedRows.map((row, index) => {
            if (index > 0 && sortedRows[index].expressionSpecificity.score !== sortedRows[index - 1].expressionSpecificity.score) {
                rank = index + 1; // Update rank only if not tied
            }
            return { ...row, specificityRank: rank };
        });
    })();

    // Assign ranks based on maxExpression
    const geneExpressionRankedRows = (() => {
        const sortedRows = [...geneRows].sort((a, b) => (b.geneExpression.score ?? 0) - (a.geneExpression.score ?? 0));
        let rank = 1;
        return sortedRows.map((row, index) => {
            if (index > 0 && (sortedRows[index].geneExpression.score ?? 0) !== (sortedRows[index - 1].geneExpression.score ?? 0)) {
                rank = index + 1; // Update rank only if not tied
            }
            return { ...row, maxExpRank: rank };
        });
    })();

    // Merge ranks and calculate total rank
    const combinedRanks = expressionSpecificityRankedRows.map((row) => {
        const rankedGenes = geneExpressionRankedRows.find(
            (motifRow) => motifRow.regionID === row.regionID
        )?.maxExpRank;

        return {
            ...row,
            totalRank: row.specificityRank + (rankedGenes ?? -1), // Use -1 if rank is missing
        };
    });

    // Sort by total rank score in ascending order
    const rankedRegions: RankedRegions = [];
    const sortedByTotalRank = [...combinedRanks].sort((a, b) => a.totalRank - b.totalRank);

    // Assign ranks, accounting for ties
    let currentRank = 1;
    let prevTotalRank = null;

    sortedByTotalRank.forEach((region, index) => {
        if (region.totalRank !== prevTotalRank) {
            currentRank = index + 1;
            prevTotalRank = region.totalRank;
        }
        rankedRegions.push({
            chr: region.inputRegion.chr,
            start: region.inputRegion.start,
            end: region.inputRegion.end,
            rank: region.totalRank === 0 ? 0 : currentRank,
        });
    });

    return rankedRegions;
};