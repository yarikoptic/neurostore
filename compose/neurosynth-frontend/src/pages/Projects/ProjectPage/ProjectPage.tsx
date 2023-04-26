import {
    Box,
    Typography,
    Stepper,
    ToggleButtonGroup,
    ToggleButton,
    Button,
    Tabs,
    Tab,
} from '@mui/material';
import {
    // useClearProvenance,
    useInitProjectStore,
    useProjectAlgorithmMetadata,
    useProjectCurationColumns,
    useProjectDescription,
    useProjectExtractionMetadata,
    useProjectSelectionMetadata,
    useProjectName,
    useUpdateProjectDescription,
    useUpdateProjectName,
} from 'pages/Projects/ProjectPage/ProjectStore';
import AlgorithmStep from 'components/ProjectStepComponents/AlgorithmStep/AlgorithmStep';
import CurationStep from 'components/ProjectStepComponents/CurationStep/CurationStep';
import ExtractionStep from 'components/ProjectStepComponents/ExtractionStep/ExtractionStep';
import SelectionStep from 'components/ProjectStepComponents/SelectionStep/SelectionStep';
import StateHandlerComponent from 'components/StateHandlerComponent/StateHandlerComponent';
import TextEdit from 'components/TextEdit/TextEdit';
import useGetProjectById from 'hooks/requests/useGetProjectById';
import useGetCurationSummary from 'hooks/useGetCurationSummary';
import useGetExtractionSummary from 'hooks/useGetExtractionSummary';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectPageStyles from './ProjectPage.styles';
import NeurosynthBreadcrumbs from 'components/NeurosynthBreadcrumbs/NeurosynthBreadcrumbs';
import ProjectIsLoadingText from 'pages/CurationPage/ProjectIsLoadingText';

export interface IProjectPageLocationState {
    projectPage?: {
        openCurationDialog?: boolean;
    };
}

// TODO: for now, we will only be supporting a single meta-analysis, so we only assume there is one. This will change later.
// const metaAnalysisId = (project?.meta_analyses as MetaAnalysis[]).
const ProjectPage: React.FC = (props) => {
    const { projectId }: { projectId: string } = useParams();
    const {
        data: project,
        isError: getProjectIsError,
        isLoading: getProjectIsLoading,
    } = useGetProjectById(projectId);
    const curationSummary = useGetCurationSummary();
    const extractionSummary = useGetExtractionSummary(projectId);
    const [tab, setTab] = useState(0);

    const updateProjectName = useUpdateProjectName();
    const updateProjectDescription = useUpdateProjectDescription();
    const initProjectStore = useInitProjectStore();
    // const clearProvenance = useClearProvenance();

    const projectName = useProjectName();
    const projectDescription = useProjectDescription();

    const curationStepHasBeenInitialized = useProjectCurationColumns().length > 0;

    const extractionMetadata = useProjectExtractionMetadata();
    const extractionStepHasBeenInitialized =
        !!extractionMetadata.annotationId && !!extractionMetadata.studysetId;

    const disableExtractionStep =
        curationSummary.total === 0 ||
        curationSummary.included === 0 ||
        curationSummary.uncategorized > 0;

    const selectionMetadata = useProjectSelectionMetadata();

    const disableFiltrationStep =
        extractionSummary?.total === 0 || extractionSummary.total !== extractionSummary.completed;

    const selectionStepHasBeenInitialized = !!selectionMetadata?.filter?.selectionKey;
    const selectionFilterHasBeenSet = !!selectionMetadata?.filter?.selectionKey;

    // variables realted to algorithm
    const algorithmMetadata = useProjectAlgorithmMetadata();
    const algorithmStepHasBeenInitialized =
        !!algorithmMetadata.specificationId && !!algorithmMetadata.metaAnalysisId;

    // activeStep is 0 indexed.
    const activeStep =
        +!!extractionStepHasBeenInitialized +
        +!disableFiltrationStep +
        +!!selectionStepHasBeenInitialized;

    useEffect(() => {
        initProjectStore(projectId);
    }, [initProjectStore, projectId]);

    const handleTabChange = (event: any, tab: number) => {
        setTab((prev) => {
            if (tab === null) return prev;
            return tab;
        });
    };

    return (
        <StateHandlerComponent isLoading={getProjectIsLoading} isError={getProjectIsError}>
            <Box sx={{ marginBottom: '5rem' }}>
                <Box sx={{ marginBottom: '0.5rem', display: 'flex' }}>
                    <NeurosynthBreadcrumbs
                        breadcrumbItems={[
                            {
                                text: 'Projects',
                                link: '/projects',
                                isCurrentPage: false,
                            },
                            {
                                text: projectName || '',
                                link: '',
                                isCurrentPage: true,
                            },
                        ]}
                    />
                    <ProjectIsLoadingText />
                </Box>

                <Box sx={{ marginBottom: '0.5rem' }}>
                    <TextEdit
                        onSave={(updatedName, label) => updateProjectName(updatedName)}
                        sx={{ input: { fontSize: '2rem' }, width: '50%' }}
                        textToEdit={projectName || ''}
                    >
                        <Typography
                            sx={{ color: projectName ? 'initial' : 'warning.dark' }}
                            variant="h4"
                        >
                            {projectName || 'No name'}
                        </Typography>
                    </TextEdit>
                    <TextEdit
                        onSave={(updatedDescription, label) =>
                            updateProjectDescription(updatedDescription)
                        }
                        sx={{ input: { fontSize: '1.25rem' }, width: '50%' }}
                        textToEdit={projectDescription || ''}
                    >
                        <Typography
                            sx={{ color: projectDescription ? 'initial' : 'warning.dark' }}
                            variant="h6"
                        >
                            {projectDescription || 'No description'}
                        </Typography>
                    </TextEdit>
                </Box>

                <Box sx={{ borderBottom: 1, margin: '1rem 0 2rem 0', borderColor: 'divider' }}>
                    <Tabs
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: '#ef8a24',
                            },
                        }}
                        value={tab}
                        onChange={handleTabChange}
                    >
                        <Tab
                            sx={{
                                fontSize: '1.2rem',
                                color: tab === 0 ? '#ef8a24 !important' : 'primary.main',
                                fontWeight: tab === 0 ? 'bold' : 'normal',
                            }}
                            label="Edit Meta-Analyses"
                        />
                        <Tab
                            sx={{
                                fontSize: '1.2rem',
                                color: tab === 1 ? '#ef8a24 !important' : 'primary.main',
                                fontWeight: tab === 1 ? 'bold' : 'normal',
                            }}
                            label="View Meta-Analyses"
                        />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Stepper
                        activeStep={activeStep}
                        orientation="vertical"
                        sx={[
                            ProjectPageStyles.stepper,
                            { display: tab === 0 ? 'initial' : 'none' },
                        ]}
                    >
                        <CurationStep
                            curationStepHasBeenInitialized={curationStepHasBeenInitialized}
                        />
                        <ExtractionStep
                            extractionStepHasBeenInitialized={extractionStepHasBeenInitialized}
                            disabled={disableExtractionStep}
                        />
                        <SelectionStep
                            selectionStepHasBeenInitialized={selectionStepHasBeenInitialized}
                            disabled={disableFiltrationStep}
                        />
                        <AlgorithmStep
                            algorithmStepHasBeenInitialized={algorithmStepHasBeenInitialized}
                            disabled={!selectionFilterHasBeenSet}
                        />
                    </Stepper>
                )}
                {tab === 1 && <div>view meta-analysis</div>}
                {/* <Button
                onClick={() => {
                    clearProvenance();
                }}
                sx={{ marginTop: '1rem' }}
                variant="contained"
                color="error"
            >
                Clear Provenance (FOR DEV PURPOSES ONLY)
            </Button> */}
            </Box>
        </StateHandlerComponent>
    );
};

export default ProjectPage;
