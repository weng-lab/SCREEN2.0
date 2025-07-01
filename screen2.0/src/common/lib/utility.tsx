import React from "react"
import { Link, Alert, AlertTitle, CircularProgress, Typography, TypographyPropsVariantOverrides, TypographyOwnProps } from "@mui/material"
import Grid from "@mui/material/Grid2"
import { Snackbar, Box } from "@mui/material"
import { OverridableStringUnion } from '@mui/types';
import { Variant } from "@mui/material/styles/createTypography";
import { Launch } from "@mui/icons-material";

/**
 * 
 * @param props 
 * @returns 
 */
export const CreateLink: React.FC<{ 
  linkPrefix: string,
   linkArg?: string, 
   label: string, 
   showExternalIcon?: boolean,
   onClick?: React.MouseEventHandler<HTMLAnchorElement>
    variant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>, textColor?: string, underline?: "none" | "always" | "hover" }> = (props) => {
  const link = props.linkPrefix + (props.linkArg ?? "")
  return (
    <Link variant={props.variant} href={link} rel="noopener noreferrer" target="_blank" color={props.textColor} underline={props.underline} onClick={props.onClick}>
      {props.label}
      {props.showExternalIcon && <Launch sx={{ display: "inline-flex", verticalAlign: "middle", ml: 0.5 }} color="inherit" fontSize="inherit" />}
    </Link>
  )
}


/**
 * Returns loading wheel
 * @returns active loader
 */
export function LoadingMessage() {
  return (
    <Grid container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: "90vh" }}>
      <Box>
        <CircularProgress />
      </Box>
      <Box mt={1} ml={1}>
        <Typography>Loading...</Typography>
      </Box>
    </Grid>
  )
}

/**
 * Logs and returns error message
 * @param {Error} error
 * @returns error message
 */
export function ErrorMessage(props: { error: Error }) {
  console.log(props.error)
  // throw error

  return (
    <Grid container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: "90vh" }}>
      <Snackbar
        id="errorpopper"
        open={true}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert severity="error" variant="filled">
          <AlertTitle>Error</AlertTitle>
          There was an error loading
        </Alert>
      </Snackbar>
    </Grid>
  )
}

/**
 * 
 * @param num Number to convert to Sci Notation
 * @param sigFigs Number of desired significant figures
 * @returns 
 */
export function toScientificNotationString(num: number, sigFigs: number = 2) {
  // Convert the number to scientific notation using toExponential
  let scientific = num.toExponential(sigFigs);
  let [coefficient, exponent] = scientific.split('e');
  
  // Format the exponent part
  let expSign = exponent[0];
  exponent = exponent.slice(1);
  
  // Convert the exponent to a superscript string
  let superscriptExponent = exponent
    .split('')
    .map(char => '⁰¹²³⁴⁵⁶⁷⁸⁹'[char] || char)
    .join('');
  
  // Add the sign back to the exponent
  superscriptExponent = (expSign === '-' ? '⁻' : '') + superscriptExponent;
  
  // Combine the coefficient with the superscript exponent
  return coefficient + '×10' + superscriptExponent;
}

/**
 * 
 * @param num Number to convert to Sci Notation
 * @param variant MUI Typography Variant to be used
 * @param sigFigs Number of desired significant figures
 * @returns 
 */
export function toScientificNotationElement(num: number, sigFigs: number, typographyProps?: TypographyOwnProps) {
  if (num > 0.01) { return <Typography {...typographyProps}>{num.toFixed(2)}</Typography> }

  // Convert the number to scientific notation using toExponential
  let scientific = num.toExponential(sigFigs);
  let [coefficient, exponent] = scientific.split('e');
  
  return (
    <Typography {...typographyProps}>{coefficient}&nbsp;×&nbsp;10<sup>{exponent}</sup></Typography>
  )
}