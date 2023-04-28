import { Box, Typography, Paper, Button, Link, IconButton, Divider } from '@mui/material';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import TextEdit from 'components/TextEdit/TextEdit';
import StateHandlerComponent from 'components/StateHandlerComponent/StateHandlerComponent';
import CodeSnippet from 'components/CodeSnippet/CodeSnippet';
import { useGetMetaAnalysisById } from 'hooks';
import useUpdateMetaAnalysis from 'hooks/requests/useUpdateMetaAnalysis';
import {
    Annotation,
    ReadOnly,
    Specification,
    SpecificationReturn,
    Studyset,
    StudysetReturn,
} from 'neurosynth-compose-typescript-sdk';
import MetaAnalysisPageStyles from './MetaAnalysisPage.styles';
import Help from '@mui/icons-material/Help';
import useGetTour from 'hooks/useGetTour';
import { useAuth0 } from '@auth0/auth0-react';
import MetaAnalysisSummaryRow from 'components/MetaAnalysisConfigComponents/MetaAnalysisSummaryRow/MetaAnalysisSummaryRow';
import { getAnalysisTypeDescription } from 'legacy/MetaAnalysis/MetaAnalysisFinalize/MetaAnalysisFinalize';
import NeurosynthAccordion from 'components/NeurosynthAccordion/NeurosynthAccordion';
import DynamicInputDisplay from 'components/MetaAnalysisConfigComponents/DynamicInputDisplay/DynamicInputDisplay';
import { IDynamicValueType } from 'components/MetaAnalysisConfigComponents';
import { NeurostoreAnnotation } from 'utils/api';
import NeurosynthBreadcrumbs from 'components/NeurosynthBreadcrumbs/NeurosynthBreadcrumbs';
import { useProjectName } from 'pages/Projects/ProjectPage/ProjectStore';

const MetaAnalysisPage: React.FC = (props) => {
    const { startTour } = useGetTour('MetaAnalysisPage');
    const { projectId, metaAnalysisId } = useParams<{
        projectId: string;
        metaAnalysisId: string;
    }>();
    const { user } = useAuth0();

    const projectName = useProjectName();

    /**
     * We need to use two separate instances of the same hook so that it only shows
     * the name loading when we update the name, and only the description loading when
     * we update the description
     */
    const { mutate: updateMetaAnalysisName, isLoading: updateMetaAnalysisNameIsLoading } =
        useUpdateMetaAnalysis();

    const {
        mutate: updateMetaAnalysisDescription,
        isLoading: updateMetaAnalysisDescriptionIsLoading,
    } = useUpdateMetaAnalysis();

    const {
        data,
        isError: getMetaAnalysisIsError,
        isLoading: getMetaAnalysisIsLoading,
    } = useGetMetaAnalysisById(metaAnalysisId);

    // get request is set to nested: true so below casting is safe
    const specification = data?.specification as SpecificationReturn;
    const studyset = data?.studyset as StudysetReturn;
    const annotation = data?.annotation as NeurostoreAnnotation;

    const thisUserOwnsThisMetaAnalysis = (data?.user || undefined) === (user?.sub || null);
    const viewingThisPageFromProject = !!projectId;

    const updateName = (updatedName: string, _label: string) => {
        if (data?.id && specification?.id && studyset?.id && annotation?.id) {
            updateMetaAnalysisName({
                metaAnalysisId: data.id,
                metaAnalysis: {
                    name: updatedName,
                },
            });
        }
    };

    const updateDescription = (updatedDescription: string, _label: string) => {
        if (data?.id && specification?.id && studyset?.id && annotation?.id) {
            updateMetaAnalysisDescription({
                metaAnalysisId: data.id,
                metaAnalysis: {
                    description: updatedDescription,
                },
            });
        }
    };

    const metaAnalysisDisplayObj = {
        name: data?.name || '',
        description: data?.description || '',
        analysisType: (data?.specification as Specification)?.type || '',
        analysisTypeDescription: getAnalysisTypeDescription(
            (data?.specification as Specification)?.type
        ),
        studyset: (data?.studyset as Studyset & ReadOnly)?.id || '',
        annotation: (data?.annotation as Annotation & ReadOnly)?.id || '',
        inclusionColumn: specification?.filter || '',
        estimator: specification?.estimator?.type || '',
        estimatorArgs: (specification?.estimator?.args || {}) as IDynamicValueType,
        corrector: specification?.corrector?.type || '',
        correctorArgs: (specification?.corrector?.args || {}) as IDynamicValueType,
    };

    return (
        <>
            <StateHandlerComponent
                isLoading={getMetaAnalysisIsLoading}
                isError={getMetaAnalysisIsError}
                errorMessage="There was an error getting your meta-analysis"
            >
                {viewingThisPageFromProject && (
                    <Box sx={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                        <NeurosynthBreadcrumbs
                            breadcrumbItems={[
                                {
                                    link: '/projects',
                                    text: 'Projects',
                                    isCurrentPage: false,
                                },
                                {
                                    link: `/projects/${projectId}/meta-analyses`,
                                    text: `${projectName}`,
                                    isCurrentPage: false,
                                },
                                {
                                    link: '',
                                    text: data?.name || '',
                                    isCurrentPage: true,
                                },
                            ]}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', marginBottom: '1rem' }}>
                    <Box sx={{ flexGrow: 1, marginLeft: '1rem' }}>
                        <TextEdit
                            editIconIsVisible={thisUserOwnsThisMetaAnalysis}
                            isLoading={updateMetaAnalysisNameIsLoading}
                            onSave={updateName}
                            sx={{ input: { fontSize: '1.5rem' } }}
                            label="name"
                            textToEdit={data?.name || ''}
                        >
                            <Box sx={MetaAnalysisPageStyles.displayedText}>
                                <Typography
                                    sx={[
                                        MetaAnalysisPageStyles.displayedText,
                                        !data?.name ? MetaAnalysisPageStyles.noData : {},
                                    ]}
                                    variant="h5"
                                >
                                    {data?.name || 'No name'}
                                </Typography>
                            </Box>
                        </TextEdit>

                        <TextEdit
                            editIconIsVisible={thisUserOwnsThisMetaAnalysis}
                            isLoading={updateMetaAnalysisDescriptionIsLoading}
                            onSave={updateDescription}
                            label="description"
                            sx={{ input: { fontSize: '1rem' } }}
                            textToEdit={data?.description || ''}
                        >
                            <Box sx={MetaAnalysisPageStyles.displayedText}>
                                <Typography
                                    sx={[
                                        MetaAnalysisPageStyles.displayedText,
                                        MetaAnalysisPageStyles.description,
                                        !data?.description ? MetaAnalysisPageStyles.noData : {},
                                    ]}
                                >
                                    {data?.description || 'No description'}
                                </Typography>
                            </Box>
                        </TextEdit>
                    </Box>
                    <Box>
                        <IconButton onClick={() => startTour()}>
                            <Help color="primary" />
                        </IconButton>
                    </Box>
                </Box>

                <Box data-tour="MetaAnalysisPage-1" sx={{ margin: '1rem 0' }}>
                    <NeurosynthAccordion
                        elevation={0}
                        accordionSummarySx={{
                            ':hover': { backgroundColor: 'primary.dark' },
                            backgroundColor: 'primary.main',
                            color: 'white',
                        }}
                        TitleElement={
                            <Typography variant="h6">View Meta-Analysis Specification</Typography>
                        }
                    >
                        <Box>
                            <Button
                                onClick={() => alert('EDITING SPECIFICATION')}
                                color="secondary"
                                variant="outlined"
                                sx={{ margin: '1rem 0' }}
                            >
                                Edit Specification
                            </Button>

                            <Typography variant="h6">Details</Typography>

                            <MetaAnalysisSummaryRow
                                title="meta-analysis name"
                                value={metaAnalysisDisplayObj.name || ''}
                                caption={metaAnalysisDisplayObj.description || ''}
                            />
                        </Box>

                        <Box>
                            <Typography variant="h6">Data</Typography>

                            <MetaAnalysisSummaryRow
                                title="analysis type"
                                value={metaAnalysisDisplayObj.analysisType}
                                caption={metaAnalysisDisplayObj.analysisTypeDescription}
                            />

                            <MetaAnalysisSummaryRow
                                title="studyset id"
                                value={metaAnalysisDisplayObj.studyset}
                            />

                            {metaAnalysisDisplayObj.annotation && (
                                <MetaAnalysisSummaryRow
                                    title="annotation id"
                                    value={metaAnalysisDisplayObj?.annotation}
                                />
                            )}

                            <MetaAnalysisSummaryRow
                                title="inclusion column"
                                value={metaAnalysisDisplayObj.inclusionColumn}
                            />
                        </Box>

                        <Box>
                            <Typography variant="h6">Algorithm</Typography>

                            <MetaAnalysisSummaryRow
                                title="algorithm and optional arguments"
                                value={metaAnalysisDisplayObj?.estimator}
                            >
                                <DynamicInputDisplay
                                    dynamicArg={metaAnalysisDisplayObj?.estimatorArgs}
                                />
                            </MetaAnalysisSummaryRow>

                            {metaAnalysisDisplayObj.corrector && (
                                <MetaAnalysisSummaryRow
                                    title="corrector and optional arguments"
                                    value={metaAnalysisDisplayObj?.corrector}
                                >
                                    <DynamicInputDisplay
                                        dynamicArg={metaAnalysisDisplayObj?.correctorArgs}
                                    />
                                </MetaAnalysisSummaryRow>
                            )}
                        </Box>
                    </NeurosynthAccordion>
                </Box>

                <Paper
                    sx={{
                        marginBottom: '2rem',
                        padding: '1rem',
                        backgroundColor: 'secondary.main',
                    }}
                >
                    <Box sx={{ margin: '0rem 0 1rem 1rem' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                            Run your meta-analysis via one of the following methods.
                        </Typography>
                        <Typography sx={{ color: 'white' }}>
                            Once neurosynth-compose has detected the status of your run, it will
                            appear on this page.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box
                            sx={[
                                MetaAnalysisPageStyles.runMethodContainer,
                                { marginRight: '1rem' },
                            ]}
                            data-tour="MetaAnalysisPage-2"
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 'bold', marginBottom: '1rem' }}
                            >
                                Online via google colab
                            </Typography>
                            <Typography sx={{ marginBottom: '0.5rem' }}>
                                copy the meta-analysis id below and then click the button to open
                                google collab
                            </Typography>
                            <Box>
                                <CodeSnippet linesOfCode={[`${data?.id}`]} />
                            </Box>
                            <Box>
                                <Button
                                    sx={{ marginTop: '1rem' }}
                                    variant="contained"
                                    component={Link}
                                    target="_blank"
                                    rel="noopener"
                                    href="https://githubtocolab.com/neurostuff/neurosynth-compose-notebook/blob/main/run_and_explore.ipynb"
                                >
                                    open google collab
                                </Button>
                            </Box>
                        </Box>
                        <Box
                            sx={[MetaAnalysisPageStyles.runMethodContainer, { marginLeft: '1rem' }]}
                            data-tour="MetaAnalysisPage-3"
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 'bold', marginBottom: '1rem' }}
                            >
                                Locally via docker
                            </Typography>
                            <Typography>
                                Click the "Help" button in the navigation panel at the top to learn
                                more about this in the documentation
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </StateHandlerComponent>
        </>
    );
};

export default MetaAnalysisPage;
