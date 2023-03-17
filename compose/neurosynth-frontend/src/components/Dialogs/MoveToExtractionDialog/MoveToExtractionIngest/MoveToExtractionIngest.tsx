import { Box, Typography } from '@mui/material';
import NavigationButtons, {
    ENavigationButton,
} from 'components/Buttons/NavigationButtons/NavigationButtons';
import Ingestion from 'components/ExtractionComponents/Ingestion/Ingestion';
import { useState } from 'react';

const MoveToExtractionIngest: React.FC<{ onNavigate: (button: ENavigationButton) => void }> = (
    props
) => {
    const [doIngestion, setDoIngestion] = useState(false);

    const handleOnComplete = () => {
        // TODO: handle complete ingestion
        props.onNavigate(ENavigationButton.NEXT);
    };

    if (doIngestion) {
        return <Ingestion />;
    }

    return (
        <Box>
            <Typography gutterBottom>
                Your studyset has been created - let's get started ingesting your studies.
            </Typography>
            <Typography gutterBottom>
                Neurosynth Compose will add the studies you included in the previous curation step
                to the database.
            </Typography>
            <Typography>
                If a matching study (or studies if there are multiple copies) already exists within
                the database, you will have the option of either <b>creating a brand new study</b>{' '}
                or <b>adding the existing neurostore study to your studyset</b>.
            </Typography>
            <Typography gutterBottom color="secondary">
                We recommend using the existing neurostore study as that will often have
                automatically extracted data available which may save you some time.
            </Typography>
            <Typography>To get started, click "START INGESTION" below</Typography>
            <NavigationButtons
                nextButtonText="start ingestion"
                prevButtonDisabled={true}
                nextButtonStyle="contained"
                onButtonClick={() => setDoIngestion(true)}
            />
        </Box>
    );
};

export default MoveToExtractionIngest;
