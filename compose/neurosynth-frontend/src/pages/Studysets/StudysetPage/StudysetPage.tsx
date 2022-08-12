import { useAuth0 } from '@auth0/auth0-react';
import { Typography, Box, Button, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import TextExpansion from 'components/TextExpansion/TextExpansion';
import StudiesTable from 'components/Tables/StudiesTable/StudiesTable';
import NeurosynthLoader from 'components/NeurosynthLoader/NeurosynthLoader';
import ConfirmationDialog from 'components/Dialogs/ConfirmationDialog/ConfirmationDialog';
import CreateDetailsDialog from 'components/Dialogs/CreateDetailsDialog/CreateDetailsDialog';
import AnnotationsTable from '../../../components/Tables/AnnotationsTable/AnnotationsTable';
import TextEdit from '../../../components/TextEdit/TextEdit';
import useIsMounted from '../../../hooks/useIsMounted';
import API, {
    AnnotationsApiResponse,
    StudysetsApiResponse,
    StudyApiResponse,
} from '../../../utils/api';
import StudysetPageStyles from './StudysetPage.styles';
import { useSnackbar } from 'notistack';
import HelpIcon from '@mui/icons-material/Help';
import useGetTour from 'hooks/useGetTour';

const StudysetsPage: React.FC = (props) => {
    const { startTour } = useGetTour('StudysetPage');
    const [studyset, setStudyset] = useState<StudysetsApiResponse | undefined>();
    const [annotations, setAnnotations] = useState<AnnotationsApiResponse[] | undefined>();
    const { isAuthenticated } = useAuth0();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();

    const [confirmationIsOpen, setConfirmationIsOpen] = useState(false);
    const [createDetailsIsOpen, setCreateDetailsIsOpen] = useState(false);

    const params: { studysetId: string } = useParams();
    const { current } = useIsMounted();

    useEffect(() => {
        const getStudyset = async (id: string) => {
            API.NeurostoreServices.StudySetsService.studysetsIdGet(id, true)
                .then((res) => {
                    if (current) {
                        const receivedStudyset = res.data;
                        setStudyset(receivedStudyset);
                    }
                })
                .catch((err) => {
                    setStudyset({});
                    enqueueSnackbar('there was an error getting the studyset', {
                        variant: 'error',
                    });
                });
        };

        getStudyset(params.studysetId);
    }, [params.studysetId, current, enqueueSnackbar]);

    useEffect(() => {
        const getAnnotations = async (id: string) => {
            API.NeurostoreServices.AnnotationsService.annotationsGet(id).then(
                (res) => {
                    if (current && res?.data?.results) {
                        setAnnotations(res.data.results);
                    }
                },
                (err) => {
                    setAnnotations([]);
                    enqueueSnackbar('there was an error getting annotations for this studyset', {
                        variant: 'error',
                    });
                }
            );
        };

        if (params.studysetId) getAnnotations(params.studysetId);
    }, [params.studysetId, current, enqueueSnackbar]);

    const handleSaveTextEdit = (editedText: string, fieldName: string) => {
        if (!studyset) return;

        API.NeurostoreServices.StudySetsService.studysetsIdPut(params.studysetId, {
            name: studyset.name,
            studies: (studyset.studies as StudyApiResponse[]).map((x) => x.id as string),
            [fieldName]: editedText,
        })
            .then(() => {
                if (current) {
                    enqueueSnackbar('studyset updated successfully', { variant: 'success' });
                    setStudyset((prevState) => {
                        if (!prevState) return prevState;
                        return {
                            ...prevState,
                            [fieldName]: editedText,
                        };
                    });
                }
            })
            .catch((err) => {
                enqueueSnackbar('there was an error updating the studyset', { variant: 'error' });
                console.error(err);
            });
    };

    const handleCloseDialog = async (confirm: boolean | undefined) => {
        setConfirmationIsOpen(false);

        if (studyset?.id && confirm) {
            API.NeurostoreServices.StudySetsService.studysetsIdDelete(studyset.id)
                .then((res) => {
                    history.push('/userstudysets');
                    enqueueSnackbar('studyset deleted successfully', { variant: 'success' });
                })
                .catch((err) => {
                    enqueueSnackbar('there was a problem deleting the studyset', {
                        variant: 'error',
                    });
                    console.error(err);
                });
        }
    };

    const handleCreateAnnotation = async (name: string, description: string) => {
        if (studyset && studyset?.id) {
            API.NeurostoreServices.AnnotationsService.annotationsPost('neurosynth', undefined, {
                name,
                description,
                note_keys: {},
                studyset: params.studysetId,
            })
                .then((res) => {
                    enqueueSnackbar('created annotation successfully', { variant: 'success' });
                    setAnnotations((prevState) => {
                        if (!prevState) return prevState;
                        const newState = [...prevState];
                        newState.push(res.data);
                        return newState;
                    });
                })
                .catch((err) => {
                    enqueueSnackbar('there was a problem creating the annotation', {
                        variant: 'error',
                    });
                    console.error(err);
                });
        }
    };

    return (
        <NeurosynthLoader loaded={!!studyset}>
            {studyset && (
                <>
                    <Box
                        data-tour="StudysetPage-2"
                        sx={{ display: 'flex', marginBottom: '1rem', width: '100%' }}
                    >
                        <Box sx={{ flexGrow: 1 }}>
                            <TextEdit
                                onSave={handleSaveTextEdit}
                                sx={{ fontSize: '1.5rem' }}
                                label="name"
                                textToEdit={studyset.name || ''}
                            >
                                <Box sx={StudysetPageStyles.displayedText}>
                                    <Typography
                                        sx={[
                                            StudysetPageStyles.displayedText,
                                            !studyset.name ? StudysetPageStyles.noData : {},
                                        ]}
                                        variant="h5"
                                    >
                                        {studyset.name || 'No name'}
                                    </Typography>
                                </Box>
                            </TextEdit>
                            <TextEdit
                                sx={{ fontSize: '1.25rem' }}
                                onSave={handleSaveTextEdit}
                                label="publication"
                                textToEdit={studyset.publication || ''}
                            >
                                <Box sx={StudysetPageStyles.displayedText}>
                                    <Typography
                                        variant="h6"
                                        sx={[
                                            StudysetPageStyles.displayedText,
                                            !studyset.publication ? StudysetPageStyles.noData : {},
                                        ]}
                                    >
                                        {studyset.publication || 'No publication'}
                                    </Typography>
                                </Box>
                            </TextEdit>
                            <TextEdit
                                sx={{ fontSize: '1.25rem' }}
                                label="doi"
                                onSave={handleSaveTextEdit}
                                textToEdit={studyset.doi || ''}
                            >
                                <Box sx={StudysetPageStyles.displayedText}>
                                    <Typography
                                        variant="h6"
                                        sx={[
                                            StudysetPageStyles.displayedText,
                                            !studyset.doi ? StudysetPageStyles.noData : {},
                                        ]}
                                    >
                                        {studyset.doi || 'No DOI'}
                                    </Typography>
                                </Box>
                            </TextEdit>
                            <TextEdit
                                sx={{ fontSize: '1.25rem' }}
                                onSave={handleSaveTextEdit}
                                label="description"
                                textToEdit={studyset.description || ''}
                                multiline
                            >
                                <Box
                                    sx={{
                                        ...StudysetPageStyles.displayedText,
                                        ...(!studyset.description ? StudysetPageStyles.noData : {}),
                                    }}
                                >
                                    <TextExpansion
                                        textSx={{ fontSize: '1.25rem' }}
                                        text={studyset.description || 'No description'}
                                    />
                                </Box>
                            </TextEdit>
                        </Box>
                        <Box>
                            <IconButton onClick={() => startTour()} color="primary">
                                <HelpIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box data-tour="StudysetPage-4">
                        <Box sx={{ marginBottom: '1rem' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        marginBottom: '1rem',
                                        fontWeight: 'bold',
                                        margin: 'auto 0',
                                    }}
                                >
                                    Annotations for this studyset
                                </Typography>
                                <Button
                                    data-tour="StudysetPage-5"
                                    onClick={() => setCreateDetailsIsOpen(true)}
                                    variant="contained"
                                    sx={{ width: '200px' }}
                                    startIcon={<AddIcon />}
                                    disabled={!isAuthenticated}
                                >
                                    new Annotation
                                </Button>
                                <CreateDetailsDialog
                                    titleText="Create new Annotation"
                                    isOpen={createDetailsIsOpen}
                                    onCreate={handleCreateAnnotation}
                                    onCloseDialog={() => setCreateDetailsIsOpen(false)}
                                />
                            </Box>
                            <AnnotationsTable
                                studysetId={params.studysetId}
                                annotations={annotations || []}
                            />
                        </Box>
                    </Box>

                    <Box data-tour="StudysetPage-3">
                        <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                            Studies in this studyset
                        </Typography>
                        <StudiesTable studies={studyset.studies as StudyApiResponse[]} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <ConfirmationDialog
                            dialogTitle="Are you sure you want to delete the studyset?"
                            dialogMessage="You will not be able to undo this action"
                            confirmText="Yes"
                            rejectText="No"
                            isOpen={confirmationIsOpen}
                            onCloseDialog={handleCloseDialog}
                        />
                        <Button
                            data-tour="StudysetPage-6"
                            onClick={() => setConfirmationIsOpen(true)}
                            variant="contained"
                            sx={{ width: '200px' }}
                            color="error"
                            disabled={!isAuthenticated}
                        >
                            Delete studyset
                        </Button>
                    </Box>
                </>
            )}
        </NeurosynthLoader>
    );
};

export default StudysetsPage;
