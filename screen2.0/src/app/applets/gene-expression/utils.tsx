import { ToggleButton } from "@mui/material"
import { styled } from "@mui/material/styles"

export const ToggleButtonMean = styled(ToggleButton)(() => ({
    "&.Mui-selected, &.Mui-selected:hover": {
      color: "white",
      backgroundColor: "blue"
    }
}))