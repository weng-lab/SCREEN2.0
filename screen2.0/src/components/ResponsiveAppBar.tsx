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
  InputBase,
  Switch,
  Stack
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';

import ToggleSearch from './ToggleSearch';

const pageLinks = [{pageName: 'About', link: '/about' }, {pageName: 'Applets', link: '' }, {pageName: 'Downloads', link: '/downloads' }]

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
        <Toolbar disableGutters>
          {/* Display Icon on left when >=900px */}
          <Box component="a" href="/" sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, height: '40px', width: '40px'}}>
            <img src="screenIcon.png"/>
          </Box>
          {/* Display SCREEN after logo on left when >=900px*/}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SCREEN
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
                <MenuItem component='a' href={page.link} key={page.pageName} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page.pageName}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* Display SCREEN Icon after menu icon when <900px */}
          {/* <Box component="a" href="/" sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, height: 'fit-content', width: 'fit-content'}}>
            <img src="screenIcon.png" height={40} width={40}/>
          </Box> */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex', md: 'none' },
              flexGrow: 1,
              // textAlign: 'left',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SCREEN
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pageLinks.map((page) => (
              <Button
                key={page.pageName}
                component='a'
                href={page.link}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.pageName}
              </Button>
            ))}
          </Box>
          {/* TODO onSubmit for search box, styling for toggle*/}
          <Box sx={{ flexGrow: 0 }}>
            <ToggleSearch />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
