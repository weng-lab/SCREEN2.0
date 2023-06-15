"use client"
import * as React from "react"

import { InputBase, InputBaseProps, Stack, InputAdornment, IconButton } from "@mui/material"

import { styled, alpha } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"

import GenomeSwitch from "./GenomeSwitch"

import { useRouter } from "next/navigation"

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.25),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  marginRight: "1rem",
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(${theme.spacing(1.5)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "16ch",
      "&:focus": {
        width: "25ch",
      },
    },
    [theme.breakpoints.up("lg")]: {
      width: "30ch",
      "&:focus": {
        width: "40ch",
      },
    },
  },
}))

export type HeaderSearchProps = InputBaseProps & {
  //false for human, true for mouse
  initialChecked?: boolean
}

const HeaderSearch: React.FC<HeaderSearchProps> = (props: HeaderSearchProps) => {
  const [value, setValue] = React.useState("")
  const [checked, setChecked] = React.useState(props.initialChecked || false)

  const router = useRouter()

  function handleChange(event: { target: { value: React.SetStateAction<string> } }) {
    setValue(event.target.value)
  }

  function handleSubmit() {
    const assembly = checked ? "mm10" : "GRCh38"
    //if submitted with empty value, use default search
    if (value == "") {
      router.push(`/search?assembly=${assembly}&chromosome=chr11&start=5205263&end=5381894`)
      return
    }
    const input = value.split(":")
    const chromosome = input[0]
    const coordinates = input[1].split("-")
    const start = coordinates[0]
    const end = coordinates[1]
    router.push(`/search?assembly=${assembly}&chromosome=${chromosome}&start=${start}&end=${end}`)
  }

  return (
    <Stack direction="row" alignItems="center">
      {/* For some reason, maybe because it is defined in layout, useRouter() is broken in onSubmit in a form component,
                so cant use typical <form>. Maybe revist eventually */}
      <Search>
        <StyledInputBase
          placeholder="Search SCREEN"
          inputProps={{ "aria-label": "search" }}
          fullWidth
          value={value}
          onChange={handleChange}
          // I'm not positive this is a bulletproof workaround for <form> not working as expected
          onKeyDown={(event) => {
            if (event.code === "Enter") {
              handleSubmit()
            }
          }}
          type="search"
          endAdornment={
            <InputAdornment position="end">
              <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </Search>
      <GenomeSwitch
        initialChecked={props.initialChecked && props.initialChecked}
        checked={checked}
        onSwitchChange={(checked) => setChecked(checked)}
      />
    </Stack>
  )
}

export default HeaderSearch
