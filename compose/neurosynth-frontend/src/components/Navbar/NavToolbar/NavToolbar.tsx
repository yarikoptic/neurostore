import { useAuth0 } from '@auth0/auth0-react';
import { Box, Button, Typography, Badge, Toolbar } from '@mui/material';
import NavbarStyles from '../Navbar.styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { NavLink, useHistory } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CreateDetailsDialog from 'components/Dialogs/CreateDetailsDialog/CreateDetailsDialog';
import NavToolbarStyles from './NavToolbar.styles';
import NavToolbarPopupSubMenu from 'components/Navbar/NavSubMenu/NavToolbarPopupSubMenu';
import { useState } from 'react';
import { INav } from '../Navbar';

const NavToolbar: React.FC<INav> = (props) => {
    const { isAuthenticated } = useAuth0();
    const [createDetailsDialogIsOpen, setCreateDetailsDialogIsOpen] = useState(false);
    const history = useHistory();

    return (
        <Toolbar disableGutters>
            <Box sx={NavbarStyles.toolbar}>
                <Box component={NavLink} to="/" sx={NavbarStyles.logoContainer}>
                    <Box
                        component="img"
                        sx={NavbarStyles.logo}
                        alt="neurosynth compose logo"
                        src="/static/synth.png"
                    />
                    <Badge
                        color="warning"
                        badgeContent={<Typography variant="caption">alpha</Typography>}
                    >
                        <Typography sx={NavbarStyles.logoText}>neurosynth compose</Typography>
                    </Badge>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CreateDetailsDialog
                        titleText="Create new project"
                        isOpen={createDetailsDialogIsOpen}
                        onCreate={props.onCreateProject}
                        onCloseDialog={() => setCreateDetailsDialogIsOpen(false)}
                    />
                    {isAuthenticated && (
                        <>
                            <Button
                                variant="contained"
                                onClick={() => setCreateDetailsDialogIsOpen(true)}
                                sx={[NavToolbarStyles.menuItem, { margin: '0 15px' }]}
                                color="secondary"
                                startIcon={<AddCircleOutlineIcon />}
                            >
                                new project
                            </Button>
                            <Button
                                onClick={() => history.push('/projects')}
                                sx={[
                                    NavToolbarStyles.menuItemColor,
                                    NavToolbarStyles.menuItemPadding,
                                    NavToolbarStyles.menuItem,
                                ]}
                            >
                                my projects
                            </Button>
                        </>
                    )}

                    <NavToolbarPopupSubMenu
                        buttonProps={{
                            sx: [
                                NavToolbarStyles.menuItemColor,
                                NavToolbarStyles.menuItemPadding,
                                NavToolbarStyles.menuItem,
                            ],
                            endIcon: <KeyboardArrowDownIcon />,
                        }}
                        options={[
                            {
                                label: 'STUDIES',
                                onClick: () => history.push('/studies'),
                            },
                            {
                                label: 'STUDYSETS',
                                onClick: () => history.push('/studysets'),
                            },
                            {
                                label: 'META-ANALYSES',
                                onClick: () => history.push('/meta-analyses'),
                            },
                        ]}
                        buttonLabel="explore"
                    />
                    <Button
                        sx={[
                            NavToolbarStyles.menuItemColor,
                            NavToolbarStyles.menuItemPadding,
                            NavToolbarStyles.menuItem,
                        ]}
                        variant="outlined"
                        target="_blank"
                        href="https://neurostuff.github.io/compose-docs/"
                    >
                        HELP
                        <OpenInNewIcon sx={{ marginLeft: '8px', fontSize: '1.2rem' }} />
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => (isAuthenticated ? props.onLogout() : props.onLogin())}
                        sx={[
                            NavToolbarStyles.menuItemColor,
                            NavToolbarStyles.menuItemPadding,
                            NavToolbarStyles.menuItem,
                        ]}
                    >
                        {isAuthenticated ? 'LOGOUT' : 'SIGN IN/SIGN UP'}
                    </Button>
                </Box>
            </Box>
        </Toolbar>
    );
};

export default NavToolbar;
