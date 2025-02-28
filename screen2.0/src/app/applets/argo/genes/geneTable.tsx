import React, { useMemo } from "react";
import { GeneTableProps, GeneTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import { Stack, Tooltip, Typography, useTheme } from "@mui/material";
import GeneLink from "../../../_utility/GeneLink";

const GeneTable: React.FC<GeneTableProps> = ({
    geneFilterVariables,
    SubTableTitle,
    geneRows,
    isolatedRows
}) => {
    const theme = useTheme();
    
    //handle column changes for the Gene rank table
    const geneColumns: DataTableColumn<GeneTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<GeneTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
        ]

        if (geneFilterVariables.useGenes) {
            cols.push({ header: "Gene Expression", value: (row) => row.geneExpression.score,
                render: (row) =>
                    row.geneExpression ? (
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
                                <Typography component="span">
                                    {row.geneExpression.score.toFixed(2)}
                                </Typography>
                            </Tooltip>
                            <GeneLink assembly="GRCh38" geneName={row.geneExpression.geneName} />
                        </Stack>
                    ) : (
                        "N/A"
                    ),
             })
            cols.push({ header: "Expression Specificity", value: (row) => row.expressionSpecificity.score,
                render: (row) =>
                    row.expressionSpecificity ? (
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
                                <Typography component="span">
                                    {row.expressionSpecificity.score.toFixed(2)}
                                </Typography>
                            </Tooltip>
                            <GeneLink assembly="GRCh38" geneName={row.expressionSpecificity.geneName} />
                        </Stack>
                    ) : (
                        "N/A"
                    ),
             })
        }

        return cols

    }, [geneFilterVariables])

    return (
        <DataTable
            key={Math.random()}
            columns={geneColumns}
            rows={geneRows  === null ? [] : isolatedRows ? isolatedRows.gene : geneRows}
            sortColumn={1}
            itemsPerPage={5}
            searchable
            tableTitle={<SubTableTitle title="Gene Details" table="genes" />}
            headerColor={{backgroundColor: theme.palette.secondary.main as "#", textColor: "inherit"}}
        />
    )
}

export default GeneTable;