"use client"

import React, { useState } from "react"
import { AppBar, Box, Toolbar, IconButton, Menu, Container, MenuItem, Link as MuiLink, Stack, Typography } from "@mui/material"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import MenuIcon from "@mui/icons-material/Menu"
import { MainSearch } from "./_mainsearch/mainsearch"
import Image from "next/image"
import Link from "next/link"
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type PageInfo = {
  pageName: string,
  link: string,
  dropdownID?: number,
  subPages?: { pageName: string, link: string }[]
}

/*  
  Links for the AppBar. If adding another page with subpages, you need to add another 
  useState() hook for positioning, and add extra if case in open/close handlers 
*/
const pageLinks: PageInfo[] = [
  {
    pageName: "About",
    link: "/about",
    dropdownID: 0,
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
    dropdownID: 1,
    subPages: [
      { pageName: "Gene Expression", link: "/applets/gene-expression " },
      { pageName: "GWAS", link: "/applets/gwas" },
    ],
  },
]

type ResponsiveAppBarProps = {
  maintenance?: boolean;
};

function ResponsiveAppBar({ maintenance }: ResponsiveAppBarProps) {

  // Hamburger Menu, deals with setting its position
  const [anchorHamburger, setAnchorHamburger] = useState<null | HTMLElement>(null)

  // Hover dropdowns, deals with setting its position
  const [anchorDropdown0, setAnchorDropdown0] = useState<null | HTMLElement>(null)
  const [anchorDropdown1, setAnchorDropdown1] = useState<null | HTMLElement>(null)

  // Open Hamburger
  const handleOpenHamburger = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorHamburger(event.currentTarget)
  }

  // Open Dropdown
  const handleOpenDropdown = (event: React.MouseEvent<HTMLElement>, dropdownID: number) => {
    if (dropdownID === 0) {
      setAnchorDropdown0(event.currentTarget)
    } else if (dropdownID === 1) {
      setAnchorDropdown1(event.currentTarget)
    }
  }

  // Close Hamburger
  const handleCloseHamburger = () => {
    setAnchorHamburger(null)
  }

  // Close Dropdown
  const handleCloseDropdown = (dropdownID: number) => {
    if (dropdownID === 0) {
      setAnchorDropdown0(null)
    } else if (dropdownID === 1) {
      setAnchorDropdown1(null)
    }
  }

  const menuItem = (page, isSubPage = false) =>
    <MuiLink
      key={page.pageName}
      component={Link}
      href={page.link}
      underline="hover"
      color={isSubPage ? "rgba(0, 0, 0, 0.7)" : "black"}
      onClick={handleCloseHamburger}
    >
      <MenuItem>
        <Box pl={isSubPage ? 2 : 0}>
          {page.pageName}
        </Box>
      </MenuItem>
    </MuiLink>

  function handleMenuPagesMapFunc(page) {
    if (page.subPages) {
      return ([menuItem(page), page.subPages.map(x => menuItem(x, true))])
    }
    else {
      return (menuItem(page))
    }
  }

  const handleMouseMoveLink = (event: React.MouseEvent<HTMLElement>, page: PageInfo) => {
    if (page?.subPages && 'dropdownID' in page) {
      handleOpenDropdown(event, page.dropdownID)
    }
  }

  const handleMouseLeaveLink = (event: React.MouseEvent<HTMLElement>, page: PageInfo) => {
    if (page?.subPages && 'dropdownID' in page) {
      switch (page.dropdownID) {
        case 0: {
          if (anchorDropdown0) {
            handleCloseDropdown(0)
          }
          break;
        }
        case 1: {
          if (anchorDropdown1) {
            handleCloseDropdown(1)
          }
          break;
        }
      }
    }
  }

  return (
    <>
      <Stack
        direction={"row"}
        style={{
          position: 'fixed',
          width: '100%',
          height: "40px",
          backgroundColor: '#ff9800',
          zIndex: 1301,
          color: '#fff',
          textAlign: 'center',
          display: !maintenance && "none"
        }}
        justifyContent={"center"}
        alignItems={"center"}
        spacing={2}
      >
        <WarningAmberIcon />
        <Typography sx={{ fontWeight: 'bold' }}>Scheduled maintenance is in progress... Some features may be unavailable</Typography>
        <WarningAmberIcon />
      </Stack>
      <AppBar position="fixed" sx={{ top: maintenance ? '40px' : '0px' }}>
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ justifyContent: "space-between", alignItems: "center" }}>
            {/* Logo, and desktop navigation */}
            <Stack direction="row" gap={3} flexGrow={1} >
              <Box component={Link} href={'/'} height={45} width={87} position={"relative"}>
                <Image
                  priority
                  src={"/SCREEN_logo_dark_small.png"}
                  alt="SCREEN Icon"
                  fill
                  style={{ objectFit: "contain", objectPosition: 'left center' }}
                />
              </Box>
              {/* Main navigation items for desktop, hide on small screen size */}
              <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: 'stretch', gap: 2 }} id="NavItems">
                {pageLinks.map((page) => (
                  <Box
                    key={page.pageName}
                    display={"flex"}
                    alignItems={"center"}
                    onMouseMove={(event) => handleMouseMoveLink(event, page)}
                    onMouseLeave={(event) => handleMouseLeaveLink(event, page)}
                    id="LinkBox"
                  >
                    <MuiLink
                      id="Link"
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
                        anchorEl={page.dropdownID === 0 ? anchorDropdown0 : anchorDropdown1}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        open={page.dropdownID === 0 ? Boolean(anchorDropdown0) : Boolean(anchorDropdown1)}
                        onClose={() => handleCloseDropdown(page.dropdownID)}
                        slotProps={{ paper: { onMouseLeave: () => handleCloseDropdown(page.dropdownID), sx: { pointerEvents: 'auto' } } }}
                        sx={{ pointerEvents: 'none', zIndex: 2000 }} //z index of AppBar is 1100 for whatever reason
                      >
                        {page.subPages &&
                          page.subPages.map((subPage) => (
                            <MuiLink
                              key={subPage.pageName}
                              underline="hover"
                              color="black"
                              component={Link}
                              href={subPage.link}
                            >
                              <MenuItem>
                                {subPage.pageName}
                              </MenuItem>
                            </MuiLink>
                          ))}
                      </Menu>
                    )}
                  </Box>
                ))}
              </Box>
            </Stack>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <MainSearch header />
            </Box>
            <Box sx={{ flexGrow: 0, display: { xs: "inline", lg: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenHamburger}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorHamburger}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorHamburger)}
                onClose={handleCloseHamburger}
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
      {/* Bumps content down even more if banner is open */}
      {maintenance && <Box sx={{ height: '40px' }} />}
      <Toolbar />
    </>
  )
}

export default ResponsiveAppBar
