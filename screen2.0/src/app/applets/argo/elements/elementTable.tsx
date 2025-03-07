import React, { useMemo } from "react";
import { ElementTableProps, ElementTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import { useTheme } from "@mui/material";
import { useQuery } from "@apollo/client";
import { client } from "../../../search/_ccredetails/client";
import { ORTHOLOG_QUERY, Z_SCORES_QUERY } from "../queries";
import { mapScoresCTSpecific, mapScores } from "./elementHelpers";

const ElementTable: React.FC<ElementTableProps> = ({
    elementFilterVariables,
    SubTableTitle,
    intersectingCcres,
    isolatedRows,
    updateElementRows,
    updateLoadingElementRows
}) => {
    const theme = useTheme();

    //query to get orthologous cCREs of the intersecting cCREs (also used in gene)
    const { loading: loading_ortho, data: orthoData } = useQuery(ORTHOLOG_QUERY, {
        variables: {
            assembly: "GRCh38",
            accessions: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
        },
        skip: (!elementFilterVariables.mustHaveOrtholog && elementFilterVariables.cCREAssembly !== "mm10") || !intersectingCcres,
        client: client,
        fetchPolicy: 'cache-first',
    })

    const mouseAccessions = useMemo(() => {
        if (elementFilterVariables.cCREAssembly === "mm10") {
            return orthoData?.orthologQuery
                .flatMap(entry => entry.ortholog)
                .map(orthologEntry => orthologEntry.accession);
        }
    }, [elementFilterVariables.cCREAssembly, orthoData?.orthologQuery]);

    //Query to get the assay zscores of the intersecting ccres
    const { loading: loading_scores, data: zScoreData } = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accessions: elementFilterVariables.cCREAssembly === "mm10" ? mouseAccessions : intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
            cellType: elementFilterVariables.selectedBiosample ? elementFilterVariables.selectedBiosample.name : null
        },
        skip: !intersectingCcres || (elementFilterVariables.cCREAssembly === "mm10" && !mouseAccessions),
        client: client,
        fetchPolicy: 'cache-first',
    });

    //all data pertaining to the element table
    const allElementData: ElementTableRow[] = useMemo(() => {
        if (!zScoreData) return [];
        const data = zScoreData['cCRESCREENSearch'];
        let mapObj = intersectingCcres;

        //use mouse accesion instead if mm10 selected
        if (elementFilterVariables.cCREAssembly === "mm10") {
            const orthologMapping: { [accession: string]: string | undefined } = {};

            orthoData.orthologQuery.forEach((entry: { accession: string; ortholog: Array<{ accession: string }> }) => {
                if (entry.ortholog.length > 0) {
                    orthologMapping[entry.accession] = entry.ortholog[0].accession;
                }
            });

            mapObj = intersectingCcres
                .map((ccre) => ({
                    ...ccre,
                    accession: orthologMapping[ccre.accession]
                }))
                .filter((ccre) => ccre.accession !== undefined);
        }

        //map assay scores bsed on selected biosample
        if (elementFilterVariables.selectedBiosample) {
            return mapObj.map(obj => mapScoresCTSpecific(obj, data));
        } else {
            return mapObj.map(obj => mapScores(obj, data));
        }
    }, [zScoreData, intersectingCcres, elementFilterVariables.cCREAssembly, elementFilterVariables.selectedBiosample, orthoData]);

    // Filter cCREs based on class and ortholog
    const elementRows: ElementTableRow[] = useMemo(() => {
        if (allElementData.length === 0 || loading_scores || loading_ortho) {
            return [];
        }
        let data = allElementData;
        //filter through ortholog
        if (elementFilterVariables.mustHaveOrtholog && orthoData && elementFilterVariables.cCREAssembly !== "mm10") {
            const orthologMapping: { [accession: string]: string | undefined } = {};

            orthoData.orthologQuery.forEach((entry: { accession: string; ortholog: Array<{ accession: string }> }) => {
                if (entry.ortholog.length > 0) {
                    orthologMapping[entry.accession] = entry.ortholog[0].accession;
                }
            });

            data = data
                .map((row) => ({
                    ...row,
                    ortholog: orthologMapping[row.accession]
                }))
                .filter((row) => row.ortholog !== undefined);
        }
        //filter through classes return if the data set i fully filtered
        const filteredClasses = data.filter(row => elementFilterVariables.classes[row.class] !== false);
        if (filteredClasses.length === 0) {
            return null
        }

        return filteredClasses;

    }, [allElementData, elementFilterVariables.cCREAssembly, elementFilterVariables.classes, elementFilterVariables.mustHaveOrtholog, loading_ortho, loading_scores, orthoData]);

    updateElementRows(elementRows)
    const loadingRows = loading_ortho || loading_scores;
    updateLoadingElementRows(loadingRows);
    
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
            sortColumn={3}
            itemsPerPage={5}
            searchable
            tableTitle={<SubTableTitle title="Element Details (Overlapping cCREs)" table="elements" />}
            onRowClick={handlecCREClick}
            headerColor={{backgroundColor: theme.palette.secondary.main as "#", textColor: "inherit"}}
        />
    )
}
export default ElementTable;