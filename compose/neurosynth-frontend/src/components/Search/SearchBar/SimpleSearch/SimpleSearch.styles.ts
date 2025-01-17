import { Style } from '../../../..';

const SimpleSearchStyles: Style = {
    textfield: {
        flexGrow: 1,
        padding: '5px 15px',
    },
    iconContainer: {
        width: '50px',
        height: '56px',
        borderTopLeftRadius: '0 !important',
        borderBottomLeftRadius: '0 !important',
        '&:hover': {
            backgroundColor: '#00689e !important',
            transition: '0.5s',
        },
    },
    searchContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
    },
    paper: {
        flexGrow: 1,
        borderRadius: 0,
        borderLeft: 'none !important',
        justifyContent: 'center',
        display: 'flex',
    },
    select: {
        borderBottomRightRadius: '0 !important',
        borderTopRightRadius: '0 !important',
    },
};

export default SimpleSearchStyles;
