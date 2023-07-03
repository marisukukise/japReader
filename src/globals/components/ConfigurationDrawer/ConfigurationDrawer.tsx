import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Fab from '@mui/material/Fab';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { ipcRenderer } from 'electron';
import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect';
import log from 'electron-log/renderer';


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

type Setting = {
  key: string,
  label: string,
  icon: JSX.Element,
  fn: () => void,
}

type ConfigurationDrawerProps = {
  settings: Setting[]
}

const ConfigurationDrawer = ({ settings }: ConfigurationDrawerProps): JSX.Element => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
          position: 'fixed', bottom: 0, right: 0,
          ...(open && { display: 'none' })
        }}
      >
        <SettingsIcon fontSize="large" />
      </Fab>
      <Drawer
        sx={{
          position: 'fixed', bottom: 0,
          height: "fit-content",
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            height: "fit-content",
            boxSizing: 'border-box',
            flexDirection: "row-reverse",
          },
        }}
        variant="persistent"
        anchor="bottom"
        open={open}
      >
        <DrawerHeader>
          <IconButton
            onClick={handleDrawerClose}>
            <ExpandMoreIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ display: "flex", flexDirection: "row-reverse", alignItems: "flex-start" }}>
          {settings.map((setting: any) => (
            <ListItem key={setting.key} disablePadding>
              <ListItemButton sx={{ flexDirection: "column" }} onClick={setting.fn}>
                <ListItemIcon sx={{ minWidth: "fit-content" }}>
                  {setting.icon}
                </ListItemIcon>
                <ListItemText sx={{ writingMode: "vertical-rl" }} primary={setting.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}


export default ConfigurationDrawer;