import { Style } from 'index';

const NavToolbarStyles: Style = {
    menuItemColor: {
        color: 'primary.contrastText',
        '&:hover': { backgroundColor: '#00689f' },
    },
    menuItemPadding: {
        paddingLeft: {
            md: '10px',
            lg: '15px',
        },
        paddingRight: {
            md: '10px',
            lg: '15px',
        },
    },
    menuItem: {
        fontSize: {
            md: '0.7rem',
            lg: '0.875rem',
            xl: '1rem',
        },
    },
};

export default NavToolbarStyles;
