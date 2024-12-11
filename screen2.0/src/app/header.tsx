"use client"

import React, { useState } from "react"
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, MenuItem, Paper, Link as MuiLink } from "@mui/material"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import MenuIcon from "@mui/icons-material/Menu"
import { MainSearch } from "./_mainsearch/mainsearch"
import Image from "next/image"
import SCREENLOGO from "../../public/screenLogo.png"
import Link from "next/link"
/*  
  Links for the AppBar. If adding another page with subpages, you need to add another 
  useState() hook for positioning, and add extra if case in open/close handlers 
*/
const pageLinks = [
  {
    pageName: "About",
    link: "/about",
    dropdownID: "0",
    subPages: [
      { pageName: "Overview", link: "/about" },
      { pageName: "API Documentation", link: "/about#api-documentation" },
      { pageName: "Contact Us", link: "/about#contact-us" },
    ],
  },
  {
    pageName: "Downloads",
    link: "/downloads",
  },
  {
    pageName: "Applets",
    link: "/applets",
    dropdownID: "1",
    subPages: [
      { pageName: "Gene Expression", link: "/applets/gene-expression " },
      { pageName: "GWAS", link: "/applets/gwas" },
    ],
  },
]

function ResponsiveAppBar() {
  // Hamburger Menu, deals with setting its position
  const [anchorElNav_Hamburger, setAnchorElNav_Hamburger] = useState<null | HTMLElement>(null)

  // Hover dropdowns, deals with setting its position
  const [anchorElNav_Dropdown0, setAnchorElNav_Dropdown0] = useState<null | HTMLElement>(null)
  const [anchorElNav_Dropdown1, setAnchorElNav_Dropdown1] = useState<null | HTMLElement>(null)

  // Open Hamburger
  const handleOpenNavMenu_Hamburger = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav_Hamburger(event.currentTarget)
  }

  // Open Dropdown
  const handleOpenNavMenu_Dropdown = (event: React.MouseEvent<HTMLElement>, dropdownID: string) => {
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
    if (dropdownID == "0") {
      setAnchorElNav_Dropdown0(null)
    } else if (dropdownID == "1") {
      setAnchorElNav_Dropdown1(null)
    }
  }

  const menuItem = (page, isSubPage = false) =>
    <MenuItem key={page.pageName} onClick={handleCloseNavMenu_Hamburger} >
      <MuiLink
        component={Link}
        href={page.link}
        pl={isSubPage ? 2 : 0}
        underline="hover"
        color={isSubPage ? "rgba(0, 0, 0, 0.8)" : "black"}
      >
        {page.pageName}
      </MuiLink>
    </MenuItem>
  
  function handleMenuPagesMapFunc(page) {
    if (page.subPages) {
      return ([menuItem(page), page.subPages.map(x => menuItem(x, true))])
    }
    else {
      return (menuItem(page))
    }
  }

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ justifyContent: "space-between", alignItems: "center" }}>
            {/* Logo, and desktop navigation */}
            <Box display='flex' flexGrow={1}>
              <Link href={"/"} style={{display: 'flex', }}>
                  <Image src={SCREENLOGO} alt="SCREEN Icon" height={45} style={{ marginRight: '25px' }}/>                
              </Link>
              {/* Main navigation items for desktop, hide on small screen size */}
              <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: 'center', gap: 2 }}>
                {pageLinks.map((page) => (
                  <Box key={page.pageName}>
                    <MuiLink
                      onMouseEnter={page.subPages ? (event) => handleOpenNavMenu_Dropdown(event, page.dropdownID) : undefined}
                      display={"flex"}
                      fontFamily={(theme) => theme.typography.fontFamily}
                      underline="hover"
                      color="primary.contrastText"
                      component={Link}
                      href={page.link}
                    >
                      {page.pageName}
                      {page.subPages && <ArrowDropDownIcon />}
                    </MuiLink>
                    {/* Create popup menu if page has subpages */}
                    {page.subPages && (
                      <Menu
                        id={`${page.pageName}-dropdown-appbar`}
                        // This logic would need to change when adding another dropdown
                        anchorEl={page.dropdownID == "0" ? anchorElNav_Dropdown0 : anchorElNav_Dropdown1}
                        anchorOrigin={{
                          vertical: "top",
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
                        slotProps={{ paper: { onMouseLeave: () => handleCloseNavMenu_Dropdown(page.dropdownID), elevation: 0, sx: { backgroundColor: "transparent" } } }}
                      >
                        {/* This box is here to provide better onMouseLeave behavior, still not ideal */}
                        <Box width="auto" height="25px"></Box>
                        <Paper elevation={4} sx={{ margin: 0.75 }}>
                          {page.subPages &&
                            page.subPages.map((subPage) => (
                              <MenuItem key={subPage.pageName} onClick={() => handleCloseNavMenu_Dropdown(page.dropdownID)}>
                                <MuiLink
                                  underline="hover"
                                  color="black"
                                  component={Link}
                                  href={subPage.link}
                                >
                                  {subPage.pageName}
                                </MuiLink>
                              </MenuItem>
                            ))}
                        </Paper>
                      </Menu>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <MainSearch header />
            </Box>
            <Box sx={{ flexGrow: 0, display: { xs: "inline", lg: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu_Hamburger}
                color="inherit"
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
                  display: { xs: "block", lg: "none" },
                }}
              >
                {pageLinks.map(handleMenuPagesMapFunc)}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {/* Bumps content down since header is position="fixed" */}
      <Toolbar />
    </>
  )
}

export default ResponsiveAppBar
