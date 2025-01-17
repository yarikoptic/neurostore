import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Box, Button, Chip, Typography } from '@mui/material';
import ExtractionReconcileDialog from 'components/Dialogs/ExtractionReconcileDialog/ExtractionReconcileDialog';
import { resolveStudysetAndCurationDifferences } from 'components/ExtractionComponents/Ingestion/helpers/utils';
import ReadOnlyStudySummaryVirtualizedItem from 'components/ExtractionComponents/ReadOnlyStudySummary';
import NeurosynthBreadcrumbs from 'components/NeurosynthBreadcrumbs/NeurosynthBreadcrumbs';
import StateHandlerComponent from 'components/StateHandlerComponent/StateHandlerComponent';
import TextEdit from 'components/TextEdit/TextEdit';
import { useGetStudysetById, useUpdateStudyset } from 'hooks';
import useGetWindowHeight from 'hooks/useGetWindowHeight';
import { StudyReturn } from 'neurostore-typescript-sdk';
import ProjectIsLoadingText from 'pages/CurationPage/ProjectIsLoadingText';
import {
    useInitProjectStoreIfRequired,
    useProjectCurationColumn,
    useProjectExtractionStudyStatusList,
    useProjectExtractionStudysetId,
    useProjectName,
    useProjectNumCurationColumns,
} from 'pages/Projects/ProjectPage/ProjectStore';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

const selectedChipLocalStorageKey = 'SELECTED_CHIP';

export enum ESelectedChip {
    'COMPLETED' = 'completed',
    'SAVEDFORLATER' = 'savedforlater',
    'UNCATEGORIZED' = 'uncategorized',
}

const ReadOnlyStudySummaryFixedSizeListRow: React.FC<
    ListChildComponentProps<{ studies: StudyReturn[]; currentSelectedChip: ESelectedChip }>
> = (props) => {
    const study = props.data.studies[props.index];
    const currentSelectedChip = props.data.currentSelectedChip;

    return (
        <ReadOnlyStudySummaryVirtualizedItem
            {...study}
            currentSelectedChip={currentSelectedChip}
            style={props.style}
        />
    );
};

const ExtractionPage: React.FC = (props) => {
    const { projectId }: { projectId: string | undefined } = useParams();
    const history = useHistory();
    const windowHeight = useGetWindowHeight();

    useInitProjectStoreIfRequired();

    const projectName = useProjectName();
    const studysetId = useProjectExtractionStudysetId();
    const studyStatusList = useProjectExtractionStudyStatusList();
    const numColumns = useProjectNumCurationColumns();
    const curationIncludedStudies = useProjectCurationColumn(numColumns - 1);

    const {
        data: studyset,
        isLoading: getStudysetIsLoading,
        isError: getStudysetIsError,
    } = useGetStudysetById(studysetId, true);
    const { mutate } = useUpdateStudyset();

    const [fieldBeingUpdated, setFieldBeingUpdated] = useState('');
    const selectedChipInLocalStorage =
        (localStorage.getItem(selectedChipLocalStorageKey) as ESelectedChip) ||
        ESelectedChip.UNCATEGORIZED;
    const [currentChip, setCurrentChip] = useState<ESelectedChip>(selectedChipInLocalStorage);
    const [studiesDisplayedState, setStudiesDisplayedState] = useState<{
        uncategorized: StudyReturn[];
        saveForLater: StudyReturn[];
        completed: StudyReturn[];
    }>({
        uncategorized: [],
        saveForLater: [],
        completed: [],
    });
    const [showReconcilePrompt, setShowReconcilePrompt] = useState(false);
    const [reconcileDialogIsOpen, setReconcileDialogIsOpen] = useState(false);

    useEffect(() => {
        if (
            !getStudysetIsLoading &&
            (curationIncludedStudies?.stubStudies?.length || 0) > 0 &&
            studyset?.studies
        ) {
            const { removedFromStudyset, stubsToIngest } = resolveStudysetAndCurationDifferences(
                curationIncludedStudies.stubStudies,
                (studyset.studies as StudyReturn[]).map((x) => x.id as string)
            );

            setShowReconcilePrompt(removedFromStudyset.length > 0 || stubsToIngest.length > 0);
        }
    }, [curationIncludedStudies, getStudysetIsLoading, studyset?.studies]);

    useEffect(() => {
        if (studyStatusList && studyset?.studies) {
            const map = new Map<string, 'COMPLETE' | 'SAVEFORLATER'>();

            studyStatusList.forEach((studyStatus) => {
                map.set(studyStatus.id, studyStatus.status);
            });

            setStudiesDisplayedState((prev) => {
                if (!prev) return prev;

                const allStudies = studyset.studies as StudyReturn[];

                const completed: StudyReturn[] = [];
                const saveForLater: StudyReturn[] = [];
                const uncategorized: StudyReturn[] = [];

                allStudies.forEach((study) => {
                    if (!study?.id) return;

                    if (map.has(study.id)) {
                        const status = map.get(study.id);
                        status === 'COMPLETE' ? completed.push(study) : saveForLater.push(study);
                    } else {
                        uncategorized.push(study);
                    }
                });

                return {
                    completed,
                    saveForLater,
                    uncategorized,
                };
            });
        }
    }, [studyStatusList, studyset?.studies]);

    const handleSelectChip = (arg: ESelectedChip) => {
        if (projectId) {
            setCurrentChip(arg);
            localStorage.setItem(selectedChipLocalStorageKey, arg);
        }
    };

    const handleUpdateStudyset = (updatedText: string, fieldName: string) => {
        if (studysetId) {
            setFieldBeingUpdated(fieldName);
            mutate(
                {
                    studysetId: studysetId,
                    studyset: {
                        [fieldName]: updatedText,
                    },
                },
                {
                    onSettled: () => {
                        setFieldBeingUpdated('');
                    },
                }
            );
        }
    };

    const studiesDisplayed =
        currentChip === ESelectedChip.COMPLETED
            ? studiesDisplayedState.completed
            : currentChip === ESelectedChip.SAVEDFORLATER
            ? studiesDisplayedState.saveForLater
            : studiesDisplayedState.uncategorized;

    const text =
        currentChip === ESelectedChip.COMPLETED
            ? 'completed'
            : currentChip === ESelectedChip.SAVEDFORLATER
            ? 'saved for later'
            : 'uncategorized';

    const pxInVh = Math.round((windowHeight * 60) / 100);

    return (
        <StateHandlerComponent isError={getStudysetIsError} isLoading={getStudysetIsLoading}>
            <Box sx={{ minWidth: '450px', margin: '0 auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', marginBottom: '0.5rem' }}>
                        <NeurosynthBreadcrumbs
                            breadcrumbItems={[
                                {
                                    text: 'Projects',
                                    link: '/projects',
                                    isCurrentPage: false,
                                },
                                {
                                    text: projectName || '',
                                    link: `/projects/${projectId}`,
                                    isCurrentPage: false,
                                },
                                {
                                    text: 'Extraction',
                                    link: '',
                                    isCurrentPage: true,
                                },
                            ]}
                        />
                        <ProjectIsLoadingText />
                    </Box>
                    <Box>
                        <Button
                            color="secondary"
                            variant="contained"
                            disableElevation
                            onClick={() =>
                                history.push(`/projects/${projectId}/extraction/annotations`)
                            }
                        >
                            View Annotations
                        </Button>
                    </Box>
                </Box>
                {showReconcilePrompt && (
                    <>
                        <ExtractionReconcileDialog
                            isOpen={reconcileDialogIsOpen}
                            onCloseDialog={() => setReconcileDialogIsOpen(false)}
                        />
                        <Box
                            sx={{
                                backgroundColor: 'secondary.main',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '4px',
                                marginBottom: '1rem',
                                position: 'sticky',
                                top: '1.5rem',
                                zIndex: 10,
                            }}
                        >
                            <Typography variant="body1">
                                <b>This studyset is out of sync with the curation phase.</b> Either
                                some studies specified as "included" within the curation phase are
                                not in the studyset, or some studies within the studyset are not
                                specified as "included" within the curation phase.
                            </Typography>
                            <Button
                                onClick={() => setReconcileDialogIsOpen(true)}
                                sx={{ marginTop: '1rem' }}
                                variant="contained"
                            >
                                Fix this issue
                            </Button>
                        </Box>
                    </>
                )}
                <Box>
                    <Box>
                        <TextEdit
                            editIconIsVisible={true}
                            isLoading={fieldBeingUpdated === 'name'}
                            label="Studyset Name"
                            sx={{ input: { fontSize: '1.5rem' } }}
                            fieldName="name"
                            onSave={handleUpdateStudyset}
                            textToEdit={studyset?.name || ''}
                        >
                            <Typography variant="h5">
                                {studyset?.name || (
                                    <Box component="span" sx={{ color: 'warning.dark' }}>
                                        No name
                                    </Box>
                                )}
                            </Typography>
                        </TextEdit>
                    </Box>
                    <Box>
                        <TextEdit
                            editIconIsVisible={true}
                            isLoading={fieldBeingUpdated === 'description'}
                            multiline
                            fieldName="description"
                            label="Studyset Description"
                            sx={{ fontSize: '1rem' }}
                            onSave={handleUpdateStudyset}
                            textToEdit={studyset?.description || ''}
                        >
                            <Typography sx={{ color: 'muted.main' }} variant="body1">
                                {studyset?.description || (
                                    <Box component="span" sx={{ color: 'warning.dark' }}>
                                        No description
                                    </Box>
                                )}
                            </Typography>
                        </TextEdit>
                    </Box>
                </Box>
                <Box sx={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        <Chip
                            size="medium"
                            onClick={() => handleSelectChip(ESelectedChip.UNCATEGORIZED)}
                            color="warning"
                            sx={{ marginRight: '8px' }}
                            variant={
                                currentChip === ESelectedChip.UNCATEGORIZED ? 'filled' : 'outlined'
                            }
                            icon={<QuestionMarkIcon />}
                            label="Uncategorized"
                        />
                        <Chip
                            size="medium"
                            onClick={() => handleSelectChip(ESelectedChip.SAVEDFORLATER)}
                            variant={
                                currentChip === ESelectedChip.SAVEDFORLATER ? 'filled' : 'outlined'
                            }
                            color="info"
                            sx={{ marginRight: '8px' }}
                            icon={<BookmarkIcon />}
                            label="Save for later"
                        />
                        <Chip
                            size="medium"
                            onClick={() => handleSelectChip(ESelectedChip.COMPLETED)}
                            variant={
                                currentChip === ESelectedChip.COMPLETED ? 'filled' : 'outlined'
                            }
                            color="success"
                            sx={{ marginRight: '8px' }}
                            icon={<CheckIcon />}
                            label="Completed"
                        />
                    </Box>
                    <Box>
                        <Typography sx={{ textAlign: 'end' }} variant="h6">
                            {studiesDisplayed.length} studies
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        marginBottom: '1rem',
                    }}
                >
                    {studiesDisplayed.length === 0 && (
                        <Typography sx={{ color: 'warning.dark' }}>
                            No studies marked as {text}
                        </Typography>
                    )}
                    <Box>
                        <FixedSizeList
                            height={pxInVh}
                            itemCount={studiesDisplayed.length}
                            width="100%"
                            itemSize={140}
                            itemKey={(index, data) => data.studies[index]?.id || index}
                            itemData={{
                                studies: studiesDisplayed,
                                currentSelectedChip: currentChip,
                            }}
                            layout="vertical"
                            overscanCount={3}
                        >
                            {ReadOnlyStudySummaryFixedSizeListRow}
                        </FixedSizeList>
                    </Box>
                </Box>
            </Box>
        </StateHandlerComponent>
    );
};

export default ExtractionPage;
