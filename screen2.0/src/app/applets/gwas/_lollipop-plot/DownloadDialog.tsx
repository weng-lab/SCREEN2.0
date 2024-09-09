import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Divider, Stack, Typography } from '@mui/material';

interface DownloadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (selections: string[]) => void;
}

export type FileOption = 'png' | 'svg' | 'tsv' | 'json'

const DownloadDialog: React.FC<DownloadDialogProps> = ({ open, onClose, onSubmit }) => {
  const [selectedOptions, setSelectedOptions] = React.useState<FileOption[]>(['png']);

  const handleToggle = (value: string) => {
    const currentIndex = selectedOptions.indexOf(value as FileOption);
    const newChecked = [...selectedOptions];

    if (currentIndex === -1) {
      newChecked.push(value as FileOption);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedOptions(newChecked);
  };

  const handleSubmit = () => {
    onSubmit(selectedOptions);
    onClose(); // Close dialog after submission
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{pb: 0}}>Download</DialogTitle>
      <DialogContent sx={{pb: 1}}>
        <Typography variant='subtitle1' color={"DimGrey"} sx={{pb: 1}}>Select format for download</Typography>
        <Stack>
          <FormControlLabel
            control={<Checkbox checked={selectedOptions.includes('png')} onChange={() => handleToggle('png')} />}
            label="Plot (.png)"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedOptions.includes('svg')} onChange={() => handleToggle('svg')} />}
            label="Plot (.svg)"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedOptions.includes('tsv')} onChange={() => handleToggle('tsv')} />}
            label="Data (.tsv)"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedOptions.includes('json')} onChange={() => handleToggle('json')} />}
            label="Data (.json)"
          />
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" >Download</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DownloadDialog;
