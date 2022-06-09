import { useAuth0 } from '@auth0/auth0-react';
import { Button, Tooltip, Typography, Tab, Tabs, Box, Divider, IconButton } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect, SyntheticEvent } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import DisplayValuesTable from 'components/Tables/DisplayValuesTable/DisplayValuesTable';
import TextExpansion from 'components/TextExpansion/TextExpansion';
import DisplayAnalysis from 'components/DisplayAnalysis/DisplayAnalysis';
import NeurosynthLoader from 'components/NeurosynthLoader/NeurosynthLoader';
import NeurosynthAccordion from 'components/NeurosynthAccordion/NeurosynthAccordion';
import { IDisplayValuesTableModel } from 'components/Tables/DisplayValuesTable';
import useIsMounted from '../../../hooks/useIsMounted';
import API, { StudyApiResponse, AnalysisApiResponse } from '../../../utils/api';
import StudyPageStyles from './StudyPage.styles';
import useGetTour from 'hooks/useGetTour';
import HelpIcon from '@mui/icons-material/Help';

const StudyPage: React.FC = (props) => {
    const { startTour } = useGetTour('StudyPage', false);
    const { enqueueSnackbar } = useSnackbar();
    const [study, setStudy] = useState<StudyApiResponse>();
    const [selectedAnalysis, setSelectedAnalysis] = useState<{
        analysisIndex: number;
        analysis: AnalysisApiResponse | undefined;
    }>({
        analysisIndex: 0,
        analysis: undefined,
    });

    const [editDisabled, setEditDisabled] = useState(false);
    const history = useHistory();
    const { isAuthenticated, user } = useAuth0();
    const isMountedRef = useIsMounted();
    const params: { studyId: string } = useParams();

    const handleCloneStudy = async () => {
        API.NeurostoreServices.StudiesService.studiesPost(undefined, params.studyId, {})
            .then((res) => {
                enqueueSnackbar('study cloned successfully', { variant: 'success' });
                history.push(`/studies/${(res.data as StudyApiResponse).id}`);
            })
            .catch((err: Error | AxiosError) => {
                enqueueSnackbar('there was an error cloning the study', { variant: 'error' });
            });
    };

    const handleEditStudy = (event: React.MouseEvent) => {
        history.push(`/studies/${params.studyId}/edit`);
    };

    const handleSelectAnalysis = (event: SyntheticEvent, newVal: number) => {
        setSelectedAnalysis({
            analysisIndex: newVal,
            analysis: (study?.analyses as AnalysisApiResponse[])[newVal],
        });
    };

    useEffect(() => {
        const getStudy = (id: string) => {
            API.NeurostoreServices.StudiesService.studiesIdGet(id, true)
                .then((res) => {
                    if (isMountedRef.current) {
                        const resUpdated = res as AxiosResponse<StudyApiResponse>;

                        let sortedAnalyses = resUpdated.data.analyses as
                            | AnalysisApiResponse[]
                            | undefined;
                        if (sortedAnalyses && sortedAnalyses.length > 0) {
                            sortedAnalyses.sort((a, b) => {
                                const aId = a.id as string;
                                const bId = b.id as string;
                                if (aId < bId) {
                                    return -1;
                                }
                                if (aId > bId) {
                                    return 1;
                                }
                                return 0;
                            });
                        }

                        setStudy(resUpdated.data);

                        // check if the analyses array exists and is non zero in the response
                        if (sortedAnalyses && sortedAnalyses.length > 0) {
                            setSelectedAnalysis({
                                analysisIndex: 0,
                                analysis: sortedAnalyses[0],
                            });
                        }

                        startTour();
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        };

        if (params.studyId) {
            getStudy(params.studyId);
        }
    }, [params.studyId, isMountedRef]);

    useEffect(() => {
        const userIDAndStudyIDExist = !!user?.sub && !!study?.user;
        const disable = !isAuthenticated || !userIDAndStudyIDExist || user?.sub !== study?.user;

        setEditDisabled(disable);
    }, [isAuthenticated, user?.sub, study?.user]);

    const metadataForTable: IDisplayValuesTableModel = {
        columnHeaders: [
            {
                value: 'Name',
                center: false,
                bold: false,
            },
            {
                value: 'Value',
                center: false,
                bold: false,
            },
        ],
        rowData: Object.entries(study?.metadata || {}).map(([key, value]) => ({
            uniqueKey: key,
            columnValues: [
                {
                    value: key,
                    colorByType: false,
                    center: false,
                    bold: true,
                },
                {
                    value: value,
                    colorByType: true,
                    center: false,
                    bold: true,
                },
            ],
        })),
    };

    return (
        <NeurosynthLoader loaded={!!study}>
            <Box sx={[StudyPageStyles.buttonContainer, StudyPageStyles.spaceBelow]}>
                <Tooltip
                    placement="top"
                    title={
                        !isAuthenticated ? 'log in to clone study' : 'clone a study to edit details'
                    }
                >
                    <Box sx={{ display: 'inline' }}>
                        <Button
                            onClick={handleCloneStudy}
                            disabled={!isAuthenticated}
                            variant={editDisabled ? 'outlined' : 'text'}
                            color="primary"
                        >
                            Clone Study
                        </Button>
                    </Box>
                </Tooltip>
                <Tooltip
                    placement="top"
                    title={editDisabled ? 'you can only edit studies you have cloned' : ''}
                >
                    <Box sx={{ display: 'inline' }}>
                        <Button
                            disabled={editDisabled}
                            onClick={handleEditStudy}
                            variant="outlined"
                            color="secondary"
                        >
                            Edit Study
                        </Button>
                    </Box>
                </Tooltip>
                <IconButton onClick={() => startTour()} color="primary">
                    <HelpIcon />
                </IconButton>
            </Box>
            <Box data-tour="StudyPage-1">
                <Typography sx={StudyPageStyles.spaceBelow} variant="h6">
                    <b>{study?.name}</b>
                </Typography>
                <Typography sx={StudyPageStyles.spaceBelow} variant="h6">
                    {study?.authors}
                </Typography>
                <Box sx={StudyPageStyles.spaceBelow}>
                    <Typography variant="h6">{study?.publication}</Typography>
                    {study?.doi && <Typography variant="h6">DOI: {study?.doi}</Typography>}
                </Box>
                <TextExpansion
                    text={study?.description || ''}
                    sx={{ ...StudyPageStyles.spaceBelow, whiteSpace: 'pre-wrap' }}
                />
            </Box>
            <Box data-tour="StudyPage-2" sx={{ margin: '15px 0' }}>
                <NeurosynthAccordion
                    accordionSummarySx={StudyPageStyles.accordionSummary}
                    elevation={2}
                    TitleElement={
                        <Typography variant="h6">
                            <b>Metadata</b>
                        </Typography>
                    }
                >
                    <Box sx={StudyPageStyles.metadataContainer}>
                        {study && <DisplayValuesTable {...metadataForTable} />}
                    </Box>
                </NeurosynthAccordion>
            </Box>

            <Box>
                <Typography
                    data-tour="StudyPage-3"
                    variant="h6"
                    sx={[
                        {
                            marginLeft: '15px',
                            fontWeight: 'bold',
                        },
                        StudyPageStyles.spaceBelow,
                    ]}
                >
                    Analyses
                </Typography>
                <Divider />
                {study?.analyses?.length === 0 ? (
                    <Box component="span" sx={{ color: 'warning.dark' }}>
                        No analyses
                    </Box>
                ) : (
                    /** * The following CSS is applied to make sure that the tab height grows based on
                    the height * of the analysis. * The tab height should expand and match the height if the
                    analysis accordions are expanded */
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <Box sx={StudyPageStyles.matchingSibling}>
                            {/* apply flex basis 0 to analyses tabs to make sure it matches sibling */}
                            <Tabs
                                sx={StudyPageStyles.analysesTabs}
                                scrollButtons
                                value={selectedAnalysis.analysisIndex}
                                TabScrollButtonProps={{
                                    sx: {
                                        color: 'primary.main',
                                    },
                                }}
                                onChange={handleSelectAnalysis}
                                orientation="vertical"
                                variant="scrollable"
                            >
                                {/* manually override analysis type as we know study will be nested and analysis will not be a string */}
                                {(study?.analyses as AnalysisApiResponse[])?.map((analysis) => (
                                    <Tab
                                        sx={StudyPageStyles.analysisTab}
                                        key={analysis.id}
                                        label={analysis.name}
                                    />
                                ))}
                            </Tabs>
                        </Box>
                        <Box sx={StudyPageStyles.heightDefiningSibling}>
                            <DisplayAnalysis {...selectedAnalysis.analysis} />
                        </Box>
                    </Box>
                )}
            </Box>
        </NeurosynthLoader>
    );
};

export default StudyPage;
