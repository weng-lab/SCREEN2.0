"use client"
import * as React from "react"

import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem } from "@mui/material"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import MenuIcon from "@mui/icons-material/Menu"

import Link from "next/link"
import Image from "next/image"

import HeaderSearch from "./HeaderSearch"

import nextConfig from "../../../next.config"

// CLICKING ON LINKS ONCE THE POPUP IS OPEN IS BROKEN!!!

/*  
  Links for the AppBar. If adding another page with subpages, you need to add another 
  useState() hook for positionong, and add extra if case in open/close handlers 
*/
const pageLinks = [
  {
    pageName: "About",
    link: "/about",
    dropdownID: "0",
    subPages: [
      { pageName: "Overview", link: "/about" },
      { pageName: "Tutorials", link: "/about#tutorials" },
      { pageName: "API Documentation", link: "/about#api-documentation" },
      { pageName: "Versions", link: "/about#versions" },
      { pageName: "UCSC Genome Browser", link: "/about#ucsc-genome-browser" },
      { pageName: "Contact US", link: "/about#contact-us" },
    ],
  },
  {
    pageName: "Applets",
    link: "/applets",
    dropdownID: "1",
    subPages: [
      { pageName: "GWAS", link: "/applets/gwas" },
      { pageName: "Differential Gene Expression", link: "/applets/differential-gene-expression" },
      { pageName: "Multi-Region Search", link: "/applets/multi-region-search" },
    ],
  },
  {
    pageName: "Downloads",
    link: "/downloads",
  },
]

/**
 * @todo: Hamburger Menu, need to align optically without setting the margin to zero - it messes up interacting with the button
 */

function ResponsiveAppBar() {
  // Hamburger Menu, deals with setting it's position
  const [anchorElNav_Hamburger, setAnchorElNav_Hamburger] = React.useState<null | HTMLElement>(null)

  // Hover dropdowns, deals with setting it's position
  const [anchorElNav_Dropdown0, setAnchorElNav_Dropdown0] = React.useState<null | HTMLElement>(null)
  const [anchorElNav_Dropdown1, setAnchorElNav_Dropdown1] = React.useState<null | HTMLElement>(null)

  // Open Hamburger
  const handleOpenNavMenu_Hamburger = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav_Hamburger(event.currentTarget)
  }

  // Open Dropdown
  const handleOpenNavMenu_Dropdown = (event: React.MouseEvent<HTMLElement>, dropdownID: string) => {
    console.log("Open Dropdown " + String(dropdownID))
    if (dropdownID == "0") {
      setAnchorElNav_Dropdown0(event.currentTarget)
    } else if (dropdownID == "1") {
      setAnchorElNav_Dropdown1(event.currentTarget)
    }
  }

  // Close Hamburger
  const handleCloseNavMenu_Hamburger = () => {
    setAnchorElNav_Hamburger(null)
  }

  // Close Dropdown
  const handleCloseNavMenu_Dropdown = (dropdownID: string) => {
    console.log("Close Dropdown " + String(dropdownID))
    if (dropdownID == "0") {
      setAnchorElNav_Dropdown0(null)
    } else if (dropdownID == "1") {
      setAnchorElNav_Dropdown1(null)
    }
  }

  return (
    <AppBar position="static">
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Display Icon on left when >=900px */}
          <Box
            component="a"
            href={`${nextConfig.basePath}`}
            sx={{ display: { xs: "none", md: "flex" }, flexShrink: "0", mr: 1, height: "40px", width: "40px" }}
          >
            <Image src={`${nextConfig.basePath}` + "/screenIcon.png"} alt="SCREEN Icon" height={40} width={40} />
          </Box>
          {/* Display SCREEN after logo on left when >=900px*/}

          <Typography
            variant="h5"
            noWrap
            component="a"
            href={`${nextConfig.basePath}`}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              // flexShrink: 0,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            SCREEN
          </Typography>
          {/* Display Menu icon on left (and hide above icon and title) when <900px */}
          <Box sx={{ flexGrow: 0, display: { xs: "inline", md: "none" } }}>
            {/* Hamburger Menu, open on click */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu_Hamburger}
              color="inherit"
              sx={{ pl: 0 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav_Hamburger}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav_Hamburger)}
              onClose={handleCloseNavMenu_Hamburger}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <MenuItem onClick={handleCloseNavMenu_Hamburger}>
                <Typography component="a" href={`${nextConfig.basePath}`} textAlign="center">
                  Home
                </Typography>
              </MenuItem>
              {pageLinks.map((page) => (
                <MenuItem key={page.pageName} onClick={handleCloseNavMenu_Hamburger}>
                  {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                  <Link href={page.link}>
                    <Typography textAlign="center">{page.pageName}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href={`${nextConfig.basePath}`}
            sx={{
              mr: 2,
              display: { xs: "none", sm: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            SCREEN
          </Typography>
          {/* Main navigation items for desktop */}
          <Box sx={{ flexGrow: 1, flexShrink: 1, display: { xs: "none", md: "flex" } }}>
            {pageLinks.map((page) => (
              <Box key={page.pageName}>
                <Button
                  sx={{
                    my: 2,
                    color: "white",
                    display: "flex",
                    "& .MuiButton-endIcon": { ml: 0 },
                  }}
                  endIcon={page.subPages && <ArrowDropDownIcon />}
                  onMouseEnter={page.subPages ? (event) => handleOpenNavMenu_Dropdown(event, page.dropdownID) : undefined}
                >
                  {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                  <Link href={page.link}>{page.pageName}</Link>
                </Button>
                {/* Hover dropdowns, open on hover. Create new instance for each menu item */}
                {page.subPages && (
                  <Menu
                    id={`${page.pageName}-dropdown-appbar`}
                    // This logic would need to change when adding another dropdown
                    anchorEl={page.dropdownID == "0" ? anchorElNav_Dropdown0 : anchorElNav_Dropdown1}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    open={page.dropdownID == "0" ? Boolean(anchorElNav_Dropdown0) : Boolean(anchorElNav_Dropdown1)}
                    onClose={() => handleCloseNavMenu_Dropdown(page.dropdownID)}
                    //These are to prevent focus ring from showing up in some browsers, but doesn't work completely
                    MenuListProps={{ autoFocusItem: false, autoFocus: false }}
                    sx={{
                      display: { xs: "block" },
                    }}
                  >
                    {page.subPages &&
                      page.subPages.map((subPage) => (
                        <MenuItem key={subPage.pageName} onClick={() => handleCloseNavMenu_Dropdown(page.dropdownID)}>
                          {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                          <Link href={subPage.link}>
                            <Typography textAlign="center">{subPage.pageName}</Typography>
                          </Link>
                        </MenuItem>
                      ))}
                  </Menu>
                )}
              </Box>
            ))}
          </Box>
          {/* TODO onSubmit for search box */}
          <Box sx={{ flexGrow: 0 }}>
            <HeaderSearch />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default ResponsiveAppBar
