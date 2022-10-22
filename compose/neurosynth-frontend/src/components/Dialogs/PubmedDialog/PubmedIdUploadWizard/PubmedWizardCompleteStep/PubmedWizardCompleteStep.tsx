import { Box, Button, Typography } from '@mui/material';
import { ITag } from 'components/AnnotationContainer/DraggableItem/DraggableItem';
import StateHandlerComponent from 'components/StateHandlerComponent/StateHandlerComponent';
import { IPubmedArticle } from 'hooks/requests/useGetPubmedIDs';
import { useEffect, useState } from 'react';

interface IPubmedWizardCompleteStep {
    selectedPubmedArticles: IPubmedArticle[];
    onUploadPubmedArticles: (articles: IPubmedArticle[], tags: ITag[]) => void;
    onClose: (event: any) => void;
    selectedTags: ITag[];
}

const PubmedWizardCompleteStep: React.FC<IPubmedWizardCompleteStep> = (props) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            props.onUploadPubmedArticles(props.selectedPubmedArticles, props.selectedTags);
            setIsLoading(false);
        }, 1500);
    }, []);

    return (
        <StateHandlerComponent isLoading={isLoading} isError={false}>
            <Box>
                <Typography variant="h6" sx={{ margin: '1rem 0' }}>
                    Pubmed Ids have been uploaded to the studyset. You may now close this view.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={props.onClose} color="error">
                        Close
                    </Button>
                </Box>
            </Box>
        </StateHandlerComponent>
    );
};

export default PubmedWizardCompleteStep;
