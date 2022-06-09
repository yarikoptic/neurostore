import { Box, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IEditAnalysisDetails } from '../..';
import EditAnalysisDetailsStyles from './EditAnalysisDetails.styles';
import EditAnalysisStyles from '../EditAnalysis.styles';
import { useUpdateAnalysis, useDeleteAnalysis } from 'hooks';
import ConfirmationDialog from 'components/Dialogs/ConfirmationDialog/ConfirmationDialog';
import LoadingButton from 'components/Buttons/LoadingButton/LoadingButton';
import { useSnackbar } from 'notistack';

const textFieldInputProps = {
    style: {
        fontSize: 15,
    },
};

const EditAnalysisDetails: React.FC<IEditAnalysisDetails> = React.memo((props) => {
    const { enqueueSnackbar } = useSnackbar();
    const { isLoading: updateAnalysisIsLoading, mutate: updateAnalysis } = useUpdateAnalysis();
    const { isLoading: deleteAnalysisIsLoading, mutate: deleteAnalysis } = useDeleteAnalysis();
    const [name, setName] = useState(props.name);
    const [description, setDescription] = useState(props.description);
    const [dialogIsOpen, setDialogIsOpen] = useState(false);

    useEffect(() => {
        setName(props.name);
        setDescription(props.description);
    }, [props.name, props.description]);

    const [saveDisabled, setSaveDisabled] = useState(true);

    const handleSavePressed = () => {
        updateAnalysis(
            {
                analysisId: props.analysisId,
                analysis: {
                    name,
                    description,
                },
            },
            {
                onSuccess: () => {
                    enqueueSnackbar('updated analysis', { variant: 'success' });
                    setSaveDisabled(true);
                },
            }
        );
    };

    const handleDeleteAnalysis = (analysisId: string | undefined) => {
        if (analysisId) deleteAnalysis(analysisId);
    };

    return (
        <Box>
            <ConfirmationDialog
                dialogTitle="Are you sure you want to delete this analysis?"
                isOpen={dialogIsOpen}
                confirmText="Yes"
                rejectText="No"
                onCloseDialog={(confirmed) => {
                    if (confirmed) handleDeleteAnalysis(props.analysisId);
                    setDialogIsOpen(false);
                }}
            />
            <TextField
                sx={[EditAnalysisDetailsStyles.textfield]}
                variant="outlined"
                label="Edit Analysis Name"
                value={name}
                InputProps={textFieldInputProps}
                name="name"
                onChange={(e) => {
                    setSaveDisabled(false);
                    setName(e.target.value);
                }}
            />
            <TextField
                sx={[EditAnalysisDetailsStyles.textfield]}
                variant="outlined"
                label="Edit Analysis Description"
                value={description}
                InputProps={textFieldInputProps}
                name="description"
                multiline
                onChange={(e) => {
                    setSaveDisabled(false);
                    setDescription(e.target.value);
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <LoadingButton
                    isLoading={updateAnalysisIsLoading}
                    text="save"
                    variant="contained"
                    color="success"
                    sx={EditAnalysisDetailsStyles.button}
                    onClick={handleSavePressed}
                    disabled={saveDisabled}
                    loaderColor="secondary"
                />
                <LoadingButton
                    isLoading={deleteAnalysisIsLoading}
                    sx={EditAnalysisStyles.analysisButton}
                    color="error"
                    variant="contained"
                    onClick={() => setDialogIsOpen(true)}
                    text="delete analysis"
                />
            </Box>
        </Box>
    );
});

export default EditAnalysisDetails;
