import React, { useMemo } from "react";
import { AllLinkedGenes, GeneTableProps, GeneTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import { Skeleton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import GeneLink from "../../../_utility/GeneLink";
import { useLazyQuery, useQuery } from "@apollo/client";
import { AggregateByEnum } from "../../../../graphql/__generated__/graphql";
import { client } from "../../../search/_ccredetails/client";
import { CLOSEST_LINKED_QUERY, SPECIFICITY_QUERY, GENE_EXP_QUERY, GENE_ORTHO_QUERY } from "../queries";
import { parseLinkedGenes, pushClosestGenes, filterOrthologGenes, getSpecificityScores, getExpressionScores } from "./geneHelpers";

const GeneTable: React.FC<GeneTableProps> = ({
    geneFilterVariables,
    SubTableTitle,
    intersectingCcres,
    loadingIntersect,
    isolatedRows,
    updateGeneRows,
    updateLoadingGeneRows
}) => {
    const theme = useTheme();
    const [getOrthoGenes, { data: orthoGenes }] = useLazyQuery(GENE_ORTHO_QUERY)

    //Query to get the closest gene to eah ccre
    const { loading: loading_linked_genes, data: closestAndLinkedGenes } = useQuery(CLOSEST_LINKED_QUERY, {
        variables: {
            accessions: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
        },
        skip: !intersectingCcres,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const filteredGenes = useMemo<AllLinkedGenes>(() => {
        if (!intersectingCcres || !closestAndLinkedGenes) {
            return [];
        }

        //switch between protein coding and all linked genes
        const filteredLinkedGenes = geneFilterVariables.mustBeProteinCoding ? closestAndLinkedGenes.linkedGenesQuery.filter((gene) => gene.genetype === "protein_coding")
            : closestAndLinkedGenes.linkedGenesQuery
        const linkedGenes = parseLinkedGenes(filteredLinkedGenes, geneFilterVariables.methodOfLinkage);

        //switch between protein coding and all closest gene
        let closestGenes = closestAndLinkedGenes.closestGenetocCRE.filter((gene) => gene.gene.type === "ALL")
        if (geneFilterVariables.mustBeProteinCoding) {
            closestGenes = closestAndLinkedGenes.closestGenetocCRE.filter((gene) => gene.gene.type === "PC")
        }

        const allGenes = geneFilterVariables.methodOfLinkage.distance ? pushClosestGenes(closestGenes, linkedGenes) : linkedGenes;
        const uniqueGeneNames = Array.from(
            new Set(
                allGenes.flatMap((item) => item.genes.map((gene) => gene.name))
            )
        );
        let filteringGenes = allGenes;
        if (geneFilterVariables.mustHaveOrtholog) {
            getOrthoGenes({
                variables: {
                    name: uniqueGeneNames,
                    assembly: "grch38"
                },
                client: client,
                fetchPolicy: 'cache-and-network',
            })
            if (orthoGenes) {
                filteringGenes = filterOrthologGenes(orthoGenes, allGenes)
            }
        }

        return filteringGenes;

    }, [closestAndLinkedGenes, geneFilterVariables.methodOfLinkage, geneFilterVariables.mustBeProteinCoding, geneFilterVariables.mustHaveOrtholog, getOrthoGenes, intersectingCcres, orthoGenes])

    const { loading: loading_gene_specificity, data: geneSpecificity } = useQuery(SPECIFICITY_QUERY, {
        variables: {
            geneids: filteredGenes.flatMap((entry) =>
                entry.genes.map((gene) => gene.geneId)
            )
        },
        skip: !closestAndLinkedGenes || closestAndLinkedGenes.closestGenetocCRE.length === 0,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const { loading: loading_gene_expression, data: geneExpression } = useQuery(GENE_EXP_QUERY, {
        variables: {
            genes: Array.from(
                new Set(
                    filteredGenes.flatMap((entry) =>
                        entry.genes.map((gene) => gene.name.trim())
                    )
                )
            ).map((name) => ({
                gene: name,
                biosample: geneFilterVariables.selectedBiosample?.map((sample) => sample.name),
                aggregateBy: (geneFilterVariables.rankGeneExpBy === "avg" ? "AVERAGE" : "MAX") as AggregateByEnum
            }))
        },
        skip: !closestAndLinkedGenes || closestAndLinkedGenes.closestGenetocCRE.length === 0,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const geneRows = useMemo<GeneTableRow[]>(() => {
        if (filteredGenes === null) {
            return null
        }
        if (filteredGenes.length === 0) {
            return []
        }

        const specificityRows = geneSpecificity ? getSpecificityScores(filteredGenes, intersectingCcres, geneSpecificity, geneFilterVariables) : []
        const expressionRows = geneExpression ? getExpressionScores(filteredGenes, intersectingCcres, geneExpression, geneFilterVariables) : []

        const mergedRowsMap = new Map<string | number, GeneTableRow>();

        specificityRows.forEach(row => {
            mergedRowsMap.set(row.regionID, { ...row });
        });

        // Process expressionRows, merging data when `regionID` matches
        expressionRows.forEach(row => {
            if (mergedRowsMap.has(row.regionID)) {
                mergedRowsMap.set(row.regionID, {
                    ...mergedRowsMap.get(row.regionID),
                    geneExpression: row.geneExpression,
                });
            } else {
                // Otherwise, add as a new entry
                mergedRowsMap.set(row.regionID, { ...row });
            }
        });

        // Convert map back to an array
        const mergedRows = Array.from(mergedRowsMap.values());
        if (geneSpecificity && geneExpression) {
            return mergedRows
        } else {
            return []
        }

    }, [filteredGenes, geneExpression, geneFilterVariables, geneSpecificity, intersectingCcres]);

    updateGeneRows(geneRows)
    const loadingRows = loading_gene_expression || loading_gene_specificity || loading_linked_genes || loadingIntersect;
    updateLoadingGeneRows(loadingRows);
    
    //handle column changes for the Gene rank table
    const geneColumns: DataTableColumn<GeneTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<GeneTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
        ]

        if (geneFilterVariables.useGenes) {
            cols.push({ header: "Gene Expression", value: (row) => row.geneExpression.score, tooltip: "TPM",
                render: (row) =>
                    row.geneExpression?.geneName !== "Average" ? (
                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                            <Tooltip
                                title={
                                    <span>
                                        {row.geneExpression.linkedBy && (
                                            <>
                                                <strong>Linked By:</strong> {row.geneExpression.linkedBy.join(", ")}
                                            </>
                                        )}
                                    </span>
                                }
                                arrow
                                placement="left"
                            >
                                <Typography fontSize={"14px"}>
                                    {row.geneExpression.score.toFixed(2)}
                                </Typography>
                            </Tooltip>
                            <GeneLink assembly="GRCh38" geneName={row.geneExpression.geneName.trim()} />
                        </Stack>
                    ) : row.geneExpression ? (
                        row.geneExpression.score.toFixed(2)
                    ) :
                    (
                        "N/A"
                    ),
             })
            cols.push({ header: "Expression Specificity", value: (row) => row.expressionSpecificity.score,
                render: (row) =>
                    row.expressionSpecificity?.geneName !== "Average" ? (
                        <Stack direction={"row"} alignItems={"center"} spacing={1}>
                            <Tooltip
                                title={
                                    <span>
                                        {row.expressionSpecificity.linkedBy && (
                                            <>
                                                <strong>Linked By:</strong> {row.expressionSpecificity.linkedBy.join(", ")}
                                            </>
                                        )}
                                    </span>
                                }
                                arrow
                                placement="left"
                            >
                                <Typography fontSize={"14px"}>
                                    {row.expressionSpecificity.score.toFixed(2)}
                                </Typography>
                            </Tooltip>
                            <GeneLink assembly="GRCh38" geneName={row.expressionSpecificity.geneName.trim()} />
                        </Stack>
                    ) :row.expressionSpecificity ? (
                        row.expressionSpecificity.score.toFixed(2)
                    ) :
                    (
                        "N/A"
                    ),
             })
        }

        return cols

    }, [geneFilterVariables])

    return (
        <>
            {loadingRows ? <Skeleton width={"auto"} height={"440px"} variant="rounded" /> :
                <DataTable
                    key={Math.random()}
                    columns={geneColumns}
                    rows={geneRows === null ? [] : isolatedRows ? isolatedRows.gene : geneRows}
                    sortColumn={1}
                    itemsPerPage={5}
                    searchable
                    tableTitle={<SubTableTitle title="Gene Details" table="genes" />}
                    headerColor={{ backgroundColor: theme.palette.secondary.main as "#", textColor: "inherit" }}
                />
            }
        </>
    )
}

export default GeneTable;