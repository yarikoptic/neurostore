import { Typography, Box } from '@mui/material';
import ProgressLoader from 'components/ProgressLoader/ProgressLoader';

export interface IStateHandlerComponent {
    isError: boolean;
    errorMessage?: string;
    isLoading: boolean;
    loadingText?: string;
    loadingColor?: string;
}

const StateHandlerComponent: React.FC<IStateHandlerComponent> = (props) => {
    if (props.isError) {
        return (
            <Typography sx={{ color: 'error.main' }}>
                {props.errorMessage || 'There was an error'}
            </Typography>
        );
    }

    if (props.isLoading) {
        return (
            <Box
                sx={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '2rem 0' }}
            >
                <ProgressLoader sx={{ color: props.loadingColor }} />
                <Typography>{props.loadingText || ''}</Typography>
            </Box>
        );
    }

    return <>{props.children}</>;
};

export default StateHandlerComponent;
