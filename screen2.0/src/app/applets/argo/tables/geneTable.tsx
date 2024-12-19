import React, { useMemo } from "react";
import { GeneTableProps, GeneTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";

const GeneTable: React.FC<GeneTableProps> = ({
    geneFilterVariables,
    SubTableTitle,
    geneRows
}) => {
    //handle column changes for the Gene rank table
    const geneColumns: DataTableColumn<GeneTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<GeneTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
        ]

        if (geneFilterVariables.useGenes) {
            cols.push({ header: "Max Expression", value: (row) => row.maxExpression })
            cols.push({ header: "Expression Specificity", value: (row) => row.expressionSpecificity ? row.expressionSpecificity : "N/A" })
        }

        return cols

    }, [geneFilterVariables])

    return (
        <DataTable
            key={Math.random()}
            columns={geneColumns}
            rows={geneRows}
            sortDescending
            itemsPerPage={10}
            searchable
            tableTitle={<SubTableTitle title="Gene Details" />}
        />
    )
}

export default GeneTable;