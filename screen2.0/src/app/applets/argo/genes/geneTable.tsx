import React, { useMemo, useState } from "react";
import { AllLinkedGenes, GeneTableProps, GeneTableRow, LinkedGenes } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import { Skeleton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import GeneLink from "../../../_utility/GeneLink";
import { useLazyQuery, useQuery } from "@apollo/client";
import { AggregateByEnum } from "../../../../graphql/__generated__/graphql";
import { client } from "../../../search/_ccredetails/client";
import { CLOSEST_LINKED_QUERY, SPECIFICITY_QUERY, GENE_EXP_QUERY, GENE_ORTHO_QUERY } from "../queries";
import { parseLinkedGenes, pushClosestGenes, filterOrthologGenes, getSpecificityScores, getExpressionScores } from "./geneHelpers";
import GenesModal from "./linkedGenesModal";

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
    const [modalData, setModalData] = useState<{
        open: boolean;
        chromosome: string;
        start: number;
        end: number;
        genes: LinkedGenes;
    } | null>(null);

    //Query to get the closest gene to eah ccre
    const { loading: loading_linked_genes, data: closestAndLinkedGenes, error: error_linked_genes } = useQuery(CLOSEST_LINKED_QUERY, {
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
                allGenes.flatMap((item) => item.genes.map((gene) => gene.name.trim()))
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

        //filter out all unselected methods of linkage
        const linkageFilter: AllLinkedGenes = filteringGenes
            .map(accession => ({
                accession: accession.accession,
                genes: accession.genes.filter(gene => gene.linkedBy.length > 0)
            }))
            .filter(accession => accession.genes.length > 0);

        return linkageFilter.length > 0 ? linkageFilter : null;

    }, [closestAndLinkedGenes, geneFilterVariables.methodOfLinkage, geneFilterVariables.mustBeProteinCoding, geneFilterVariables.mustHaveOrtholog, getOrthoGenes, intersectingCcres, orthoGenes])

    const { loading: loading_gene_specificity, data: geneSpecificity } = useQuery(SPECIFICITY_QUERY, {
        variables: {
            geneids: filteredGenes?.flatMap((entry) =>
                entry.genes.map((gene) => gene.geneId)
            )
        },
        skip: !closestAndLinkedGenes || closestAndLinkedGenes.closestGenetocCRE.length === 0 || filteredGenes === null,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const { loading: loading_gene_expression, data: geneExpression, error: error_gene_expression } = useQuery(GENE_EXP_QUERY, {
        variables: {
            genes: filteredGenes?.flatMap((entry) => entry.genes.map((gene) => gene.geneId)),
            biosample: geneFilterVariables.selectedBiosample?.map((sample) => sample.name),
            aggregateBy: (geneFilterVariables.rankGeneExpBy === "avg" ? "AVERAGE" : "MAX") as AggregateByEnum
        },
        skip: !closestAndLinkedGenes || closestAndLinkedGenes.closestGenetocCRE.length === 0 || filteredGenes === null,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const geneRows = useMemo<GeneTableRow[]>(() => {
        if (filteredGenes === null || error_gene_expression || error_linked_genes) {
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

    }, [filteredGenes, error_gene_expression, error_linked_genes, geneSpecificity, intersectingCcres, geneFilterVariables, geneExpression]);

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
             cols.push({
                header: "# of Linked Genes", value: (row) => row.linkedGenes.length,
                render: (row) => (
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontFamily: "arial, sans-serif",
                            color: "#030f98",
                            cursor: "pointer",
                            outline: "none",
                        }}
                        onClick={() =>
                            setModalData({
                                open: true,
                                chromosome: row.inputRegion.chr,
                                start: row.inputRegion.start,
                                end: row.inputRegion.end,
                                genes: row.linkedGenes
                            })
                        }
                    >
                        {row.linkedGenes.length}
                    </button>
                )
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
            {modalData && (
                <GenesModal
                    key={`${modalData?.chromosome}-${modalData?.start}-${modalData?.end}`}
                    open={modalData?.open || false}
                    setOpen={(isOpen) =>
                        setModalData((prev) => (prev ? { ...prev, open: isOpen } : null))
                    }
                    chromosome={modalData?.chromosome || ""}
                    start={modalData?.start || 0}
                    end={modalData?.end || 0}
                    genes={modalData?.genes || []}
                />
            )}
        </>
    )
}

export default GeneTable;