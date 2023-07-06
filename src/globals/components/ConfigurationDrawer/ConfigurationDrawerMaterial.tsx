/*
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import Fab from '@mui/material/Fab';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ipcRenderer } from 'electron';
import { useEffect, useRef } from 'react';


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


type ConfigurationDrawerProps = {
  settings: any[]
}

const ConfigurationDrawer = ({ settings }: ConfigurationDrawerProps): JSX.Element => {
  const wrapperRef = useRef(null);
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function useOutsideAlerter(ref) {
    useEffect(() => {
       // Alert if clicked on outside of element
      function handleClickOutside(event) {
        if (open && ref.current && !ref.current.contains(event.target)) {
          handleDrawerClose();
        }
      }

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open, ref]);
  }

  useOutsideAlerter(wrapperRef);

  React.useEffect(() => {
    ipcRenderer.on("blur", (event: any) => {
      handleDrawerClose();
    })
  }, [])


  return (
    <Box sx={{}}>
      <Fab
        size="medium"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        sx={{
          position: 'fixed', bottom: 0, left: 0,
          ...(open && { display: 'none' })
        }}
      >
        <SettingsIcon fontSize="large" />
      </Fab>
      <Drawer
        ref={wrapperRef}
        sx={{
          position: 'fixed', bottom: 0,
          height: "fit-content",
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            height: "fit-content",
            boxSizing: 'border-box',
            flexDirection: "row",
          },
        }}
        variant="persistent"
        anchor="bottom"
        open={open}
      >
        <DrawerHeader>
          <IconButton
            onClick={handleDrawerClose}>
            <CancelIcon />
          </IconButton>
        </DrawerHeader>
        <div className="settings">
          {settings.map((setting: any, index: number) => 
            <div className="setting" key={index}>{setting}</div>)}
        </div>
      </Drawer>
    </Box>
  );
}

export default ConfigurationDrawer;
       */