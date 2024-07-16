import React from "react"
import { Link, Alert, AlertTitle, CircularProgress, Typography, TypographyPropsVariantOverrides, Stack } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Snackbar, Box } from "@mui/material"
import { OverridableStringUnion } from '@mui/types';
import { Variant } from "@mui/material/styles/createTypography";
import { Launch } from "@mui/icons-material";

/**
 * Uses fetch to make a query call (server side)
 * @param {string} url
 * @param {string} jq json of variables to use when fetching
 * @returns data
 */
export async function fetchServer<T>(url: string, jq: BodyInit) {
  return await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: jq,
  })
    .then((response) => {
      if (!response.ok) {
        // throw new Error(response.statusText)
        return <ErrorMessage error={Error(response.statusText)} />
      }
      return response.json()
    })
    .then((data) => {
      return data
    })
    .catch((error: Error) => {
      // logging
      // throw error
      return <ErrorMessage error={error} />
    })
}

/**
 * Creates a hyperlink to the url + id with the id as the button
 * @param url
 * @param id string to be pasted at the end of the url
 * @returns link anchor to url + id
 */
export const createLink = (url: string, id: string, label?: string, showExternalIcon?: boolean, variant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>, textColor?: string) => {
  const link = url + id
  return (
    <Stack alignItems={"center"} direction="row" gap={0.5}>
      <Link variant={variant} href={link} rel="noopener noreferrer" target="_blank" color={textColor}>
        {label ? <button>{label}</button> : <button>{id}</button>}
      </Link>
      <Launch fontSize="inherit" /> 
    </Stack>
  )
}

export const CreateLink: React.FC<{linkPrefix: string, linkArg: string, label: string, showExternalIcon?: boolean, variant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>, textColor?: string, underline?: "none" | "always" | "hover"}> = (props) => {
  const link = props.linkPrefix + props.linkArg
  return (
    <Stack display={"inline"} alignItems={"center"} direction="row" gap={0.5}>
      <Link variant={props.variant} href={link} rel="noopener noreferrer" target="_blank" color={props.textColor} underline={props.underline}>
        {props.label}
      </Link>
      {props.showExternalIcon && <Launch fontSize="inherit" /> }
    </Stack>
  )
}


/**
 * Returns loading wheel
 * @returns active loader
 */
export function LoadingMessage() {
  return (
    <Grid2 container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: "90vh" }}>
      <Box>
        <CircularProgress />
      </Box>
      <Box mt={1} ml={1}>
        <Typography>Loading...</Typography>
      </Box>
    </Grid2>
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
    <Grid2 container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: "90vh" }}>
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
    </Grid2>
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
export function toScientificNotationElement(num: number, variant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>, sigFigs: number = 2) {
  // Convert the number to scientific notation using toExponential
  let scientific = num.toExponential(sigFigs);
  let [coefficient, exponent] = scientific.split('e');
  
  return (
    <Typography variant={variant}>{coefficient}&nbsp;×&nbsp;10<sup>{exponent}</sup></Typography>
  )
}