import React, { useMemo } from "react";
import { ElementTableProps, ElementTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";

const ElementTable: React.FC<ElementTableProps> = ({
    elementFilterVariables,
    SubTableTitle,
    elementRows,
    isolatedRows
}) => {
    //handle column changes for the Element rank table
    const elementColumns: DataTableColumn<ElementTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<ElementTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
            { header: "Class", value: (row) => row.class === "PLS" ? "Promoter" : row.class === "pELS" ? "Proximal Enhancer" : row.class === "dELS" ? "Distal Enhancer" : row.class },
            { header: "Accession", value: (row) => row.accession },
        ]

        if (elementFilterVariables.usecCREs) {
            if (elementFilterVariables.mustHaveOrtholog && elementFilterVariables.cCREAssembly !== "mm10") { cols.push({ header: "Orthologous Accesion", value: (row) => row.ortholog }) }
            if (elementFilterVariables.assays.dnase) { cols.push({ header: "DNase", value: (row) => row.dnase !== null ? row.dnase.toFixed(2) : null }) }
            if (elementFilterVariables.assays.h3k4me3) { cols.push({ header: "H3K4me3", value: (row) => row.h3k4me3 !== null ? row.h3k4me3.toFixed(2) : null }) }
            if (elementFilterVariables.assays.h3k27ac) { cols.push({ header: "H3K27ac", value: (row) => row.h3k27ac !== null ? row.h3k27ac.toFixed(2) : null }) }
            if (elementFilterVariables.assays.ctcf) { cols.push({ header: "CTCF", value: (row) => row.ctcf !== null ? row.ctcf.toFixed(2) : null }) }
            if (elementFilterVariables.assays.atac) { cols.push({ header: "ATAC", value: (row) => row.atac !== null ? row.atac.toFixed(2) : null }) }
        }

        return cols

    }, [elementFilterVariables])

    //open ccre details on ccre click
    const handlecCREClick = (row) => {
        window.open(`/search?assembly=${elementFilterVariables.cCREAssembly}&chromosome=${row.chr}&start=${row.start}&end=${row.end}&accessions=${row.accession}&page=2`, "_blank", "noopener,noreferrer")
    }
    
    return (
        <DataTable
            key={Math.random()}
            columns={elementColumns}
            rows={elementRows === null ? [] : isolatedRows ? isolatedRows.element : elementRows}
            sortDescending
            itemsPerPage={5}
            searchable
            tableTitle={<SubTableTitle title="Element Details (Overlapping cCREs)" table="elements" />}
            onRowClick={handlecCREClick}
        />
    )
}
export default ElementTable;