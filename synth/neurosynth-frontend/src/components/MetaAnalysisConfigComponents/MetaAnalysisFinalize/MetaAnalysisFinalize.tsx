import { Box, Typography, Paper, Button } from '@mui/material';
import { NavigationButtons, LoadingButton } from '../..';
import {
    EAnalysisType,
    IMetaAnalysisComponents,
    IEstimatorCorrectorArgs,
} from 'pages/MetaAnalyses/MetaAnalysisBuilderPage/MetaAnalysisBuilderPage';
import {
    ENavigationButton,
    INavigationButtonFn,
} from '../../Buttons/NavigationButtons/NavigationButtons';
import DynamicInputDisplay from './DynamicInputDisplay/DynamicInputDisplay';
import MetaAnalysisSummaryRow from './MetaAnalysisSummaryRow/MetaAnalysisSummaryRow';
import MetaAnalysisFinalizeStyles from './MetaAnalysisFinalize.styles';
import { useCreateMetaAnalysis } from 'hooks';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useContext } from 'react';
import { GlobalContext, SnackbarType } from 'contexts/GlobalContext';

interface IMetaAnalysisFinalize extends IMetaAnalysisComponents, IEstimatorCorrectorArgs {
    onNext: INavigationButtonFn;
}

const MetaAnalysisFinalize: React.FC<IMetaAnalysisFinalize> = (props) => {
    const { createMetaAnalysis, isLoading } = useCreateMetaAnalysis();
    const history = useHistory();
    const hasCorrector = !!props.corrector;
    const { showSnackbar } = useContext(GlobalContext);

    const handleCreateMetaAnalysis = async () => {
        createMetaAnalysis(
            {
                analysisType: props.analysisType,
                estimator: props.estimator,
                corrector: props.corrector,
                studyset: props.studyset,
                annotation: props.annotation,
                inclusionColumn: props.inclusionColumn,
                metaAnalysisName: props.metaAnalysisName,
                metaAnalysisDescription: props.metaAnalysisDescription,
            },
            {
                estimatorArgs: props.estimatorArgs,
                correctorArgs: props.correctorArgs,
            }
        )
            .then((res) => {
                showSnackbar('new meta-analysis successfully created', SnackbarType.SUCCESS);
                history.push('/usermeta-analyses');
            })
            .catch((err) => {
                showSnackbar('there was an error', SnackbarType.ERROR);
            });
    };

    return (
        <Box sx={{ marginBottom: '2em' }}>
            <Typography variant="h5" sx={{ marginBottom: '1rem' }}>
                Meta-Analysis summary
            </Typography>

            <Paper elevation={2} sx={MetaAnalysisFinalizeStyles.stepContainer}>
                <Typography variant="h5" sx={MetaAnalysisFinalizeStyles.title}>
                    Details
                </Typography>

                <MetaAnalysisSummaryRow
                    title="meta-analysis name"
                    value={props.metaAnalysisName || ''}
                    caption={props.metaAnalysisDescription || ''}
                />
            </Paper>

            <Paper elevation={2} sx={MetaAnalysisFinalizeStyles.stepContainer}>
                <Typography variant="h5" sx={MetaAnalysisFinalizeStyles.title}>
                    Data
                </Typography>

                <MetaAnalysisSummaryRow
                    title="analysis type"
                    value={props.analysisType || ''}
                    caption={
                        props.analysisType === EAnalysisType.IBMA
                            ? 'Image Based Meta-Analysis'
                            : 'Coordinate Based Meta-Analysis'
                    }
                />

                <MetaAnalysisSummaryRow
                    title="studyset"
                    value={props.studyset?.name || ''}
                    caption={props.studyset?.description || ''}
                />

                <MetaAnalysisSummaryRow
                    title="annotation"
                    value={props.annotation?.name || ''}
                    caption={props.annotation?.description || ''}
                />

                <MetaAnalysisSummaryRow
                    title="inclusion column"
                    value={props.inclusionColumn || ''}
                />
            </Paper>

            <Paper elevation={2} sx={MetaAnalysisFinalizeStyles.stepContainer}>
                <Typography variant="h5" sx={MetaAnalysisFinalizeStyles.title}>
                    Algorithm
                </Typography>

                <MetaAnalysisSummaryRow
                    title="algorithm"
                    value={props.estimator?.label || ''}
                    caption={props.estimator?.description || ''}
                >
                    <DynamicInputDisplay dynamicArg={props.estimatorArgs} />
                </MetaAnalysisSummaryRow>

                {hasCorrector && (
                    <MetaAnalysisSummaryRow
                        title="corrector"
                        value={props.corrector?.label || ''}
                        caption={props.corrector?.description || ''}
                    >
                        <DynamicInputDisplay dynamicArg={props.correctorArgs} />
                    </MetaAnalysisSummaryRow>
                )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    sx={{ fontSize: '1rem' }}
                    onClick={() => props.onNext(ENavigationButton.PREV)}
                    variant="outlined"
                >
                    back
                </Button>
                <LoadingButton
                    sx={{ fontSize: '1rem', width: '250px' }}
                    loaderColor="secondary"
                    isLoading={isLoading}
                    text="create meta-analysis"
                    variant="contained"
                    onClick={() => handleCreateMetaAnalysis()}
                />
            </Box>
        </Box>
    );
};

export default MetaAnalysisFinalize;
