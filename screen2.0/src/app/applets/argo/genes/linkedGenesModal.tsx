import { Typography, Modal, Paper, IconButton } from "@mui/material";
import { DataTableColumn, DataTable } from "@weng-lab/psychscreen-ui-components";
import CloseIcon from '@mui/icons-material/Close';
import GeneLink from "../../../_utility/GeneLink";
import { GeneLinkingMethod } from "../types";

type LinkedGenes = {
    accession: string
    name: string
    geneid: string
    linkedBy: GeneLinkingMethod[]
};

type GeneModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    chromosome: string;
    start: number;
    end: number;
    genes: LinkedGenes[];
};

const GenesModal: React.FC<GeneModalProps> = ({
    open,
    setOpen,
    chromosome,
    start,
    end,
    genes,
}) => {

    const GENE_COLS: DataTableColumn<LinkedGenes>[] = [
        {
            header: "Gene Name",
            value: (row) => row.name.trim(),
            render: (row) => (
                <GeneLink assembly="GRCh38" geneName={row.name.trim()} />
            )
        },
        {
            header: "Gene ID",
            value: (row) => row.geneid
        },
        {
            header: "Linked By",
            value: (row) => row.linkedBy.join(", "),
        },
    ];

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000,
        p: 4,
    };

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <>
                <Paper sx={style}>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h4">
                        Linked Genes found in {chromosome}:{start.toLocaleString()}-
                        {end.toLocaleString()}
                    </Typography>
                    <br />
                    <br/>
                    {genes && (
                        <DataTable
                            searchable
                            columns={GENE_COLS}
                            rows={genes}
                            sortColumn={2}
                            key={"tfpeaks"}
                            itemsPerPage={10}
                        />
                    )}
                </Paper>
            </>
        </Modal>
    );
};

export default GenesModal;