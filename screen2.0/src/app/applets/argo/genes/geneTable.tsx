import React, { useMemo } from "react";
import { GeneTableProps, GeneTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import { useTheme } from "@mui/material";

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
                    row.geneExpression?.geneName !== "Average" ? (
                        <span>
                            <strong>Gene:</strong> {row.geneExpression.geneName} <strong>TPM:</strong> {row.geneExpression.score.toFixed(2)}
                        </span>
                    ) : row.geneExpression? (
                        row.geneExpression.score.toFixed(2)
                    ) : "N/A"
             })
            cols.push({ header: "Expression Specificity", value: (row) => row.expressionSpecificity ? row.expressionSpecificity.toFixed(2) : "N/A" })
        }

        return cols

    }, [geneFilterVariables])

    //open ccre details on ccre click
    const handleRowClick = (row: GeneTableRow) => {
        window.open(`/search?assembly=GRCh38&chromosome=${row.inputRegion.chr}&start=${row.inputRegion.start}&end=${row.inputRegion.end}&accessions=${row.linkedGenes[0].accession}&page=2`, "_blank", "noopener,noreferrer")
    }

    return (
        <DataTable
            key={Math.random()}
            columns={geneColumns}
            rows={geneRows  === null ? [] : isolatedRows ? isolatedRows.gene : geneRows}
            sortColumn={1}
            itemsPerPage={5}
            searchable
            tableTitle={<SubTableTitle title="Gene Details" table="genes" />}
            onRowClick={handleRowClick}
            headerColor={{backgroundColor: theme.palette.secondary.main as "#", textColor: "inherit"}}
        />
    )
}

export default GeneTable;