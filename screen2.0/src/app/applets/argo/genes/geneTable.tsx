import React, { useMemo } from "react";
import { GeneTableProps, GeneTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";

const GeneTable: React.FC<GeneTableProps> = ({
    geneFilterVariables,
    SubTableTitle,
    geneRows,
    isolatedRows
}) => {
    //handle column changes for the Gene rank table
    const geneColumns: DataTableColumn<GeneTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<GeneTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
        ]

        if (geneFilterVariables.useGenes) {
            // cols.push({ header: "Max Expression", value: (row) => row.maxExpression })
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
            headerColor={{backgroundColor: `#E7EEF8`, textColor: "inherit"}}
        />
    )
}

export default GeneTable;