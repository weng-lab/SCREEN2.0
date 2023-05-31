'use client'
import * as React from 'react';

import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from '@mui/material';

import Link from 'next/link';

import MenuIcon from '@mui/icons-material/Menu';
import HeaderSearch from './HeaderSearch';
import Image from 'next/image';

import nextConfig from '../../../next.config'

const pageLinks = [
  {pageName: 'About', link: '/about' }, 
  {pageName: 'Applets', link: '/' }, 
  {pageName: 'Downloads', link: '/downloads' },
  {pageName: 'Versions', link: '/versions'}
]

/*
  TODO:
  - Hamburger Menu, need to align optically without setting the margin to zero - it messes up interacting with the button
*/

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };


  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between'}}>
          {/* Display Icon on left when >=900px */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: '0', mr: 1, height: '40px', width: '40px'}}>
            <Link href="/"><Image src={`${nextConfig.basePath}` + "/screenIcon.png"} alt="SCREEN Icon" height={40} width={40} /></Link>
          </Box>
          {/* Display SCREEN after logo on left when >=900px*/}
          
            <Typography
            variant="h5"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              // flexShrink: 0,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
            >
              <Link href="/">SCREEN</Link>
            </Typography>
          {/* Display Menu icon on left (and hide above icon and title) when <900px */}
          <Box sx={{ flexGrow: 0, display: { xs: 'inline', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{pl:0}}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {/* This needs to change, onClick it just closes the Menu */}
              {pageLinks.map((page) => (
                <MenuItem  key={page.pageName} onClick={handleCloseNavMenu}>
                  {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                  <Link href={page.link}><Typography textAlign="center">{page.pageName}</Typography></Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Link href="/">SCREEN</Link>
          </Typography>
          <Box sx={{ flexGrow: 1, flexShrink: 1, display: { xs: 'none', md: 'flex' } }}>
            {pageLinks.map((page) => (
              <Button
                key={page.pageName}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {/* Wrap in next/link to enable dyanic link changing from basePath in next.config.js */}
                <Link href={page.link}>{page.pageName}</Link>
              </Button>
            ))}
          </Box>
          {/* TODO onSubmit for search box */}
          <Box sx={{ flexGrow: 0 }}>
            <HeaderSearch />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
