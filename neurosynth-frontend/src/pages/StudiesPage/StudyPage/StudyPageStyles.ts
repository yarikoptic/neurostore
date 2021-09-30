import makeStyles from '@mui/styles/makeStyles';

const StudyPageStyles = makeStyles((theme) => ({
    buttonContainer: {
        '& button': {
            marginRight: '15px',
        },
    },
    muted: {
        color: theme.palette.muted.main,
    },
    metadataContainer: {},
    noContent: {
        color: theme.palette.warning.dark,
    },
    spaceBelow: {
        marginBottom: '15px !important',
    },
}));

export default StudyPageStyles;
