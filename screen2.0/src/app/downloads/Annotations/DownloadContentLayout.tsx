import { Divider, Stack, Typography } from "@mui/material";

const DownloadContentLayout = ({title, children}: {title: string, children: React.ReactNode}) => {
  return (
    <Stack gap={1} display={"flex"} flexDirection={"column"} flexGrow={1}>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Divider />
      {children}
    </Stack>
  );
}

export default DownloadContentLayout