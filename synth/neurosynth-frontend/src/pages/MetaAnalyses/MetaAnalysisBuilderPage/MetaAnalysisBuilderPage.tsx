import { Step, StepLabel, Stepper } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { IDynamicInputType } from '../../../components/MetaAnalysisConfigComponents';
import MetaAnalysisAlgorithm from '../../../components/MetaAnalysisConfigComponents/MetaAnalysisAlgorithm/MetaAnalysisAlgorithm';
import MetaAnalysisData from '../../../components/MetaAnalysisConfigComponents/MetaAnalysisData/MetaAnalysisData';
import MetaAnalysisFinalize from '../../../components/MetaAnalysisConfigComponents/MetaAnalysisFinalize/MetaAnalysisFinalize';
import { ENavigationButton } from '../../../components/Buttons/NavigationButtons/NavigationButtons';
import { IAutocompleteObject } from '../../../components/NeurosynthAutocomplete/NeurosynthAutocomplete';
import useIsMounted from '../../../hooks/useIsMounted';
import API, { AnnotationsApiResponse, StudysetsApiResponse } from '../../../utils/api';
import { BackButton } from '../../../components';
import MetaAnalysisDetails from '../../../components/MetaAnalysisConfigComponents/MetaAnalysisDetails/MetaAnalysisDetails';
import MetaAnalysisBuilderPageStyles from './MetaAnalysisBuilderPage.styles';
import useCreateMetaAnalysis from '../../../hooks/requests/useCreateMetaAnalysis';
import { AxiosError } from 'axios';
import { useHistory } from 'react-router-dom';
import { GlobalContext, SnackbarType } from '../../../contexts/GlobalContext';

export enum EAnalysisType {
    CBMA = 'CBMA',
    IBMA = 'IBMA',
}

export interface IMetaAnalysisComponents {
    analysisType: EAnalysisType | undefined;
    estimator: IAutocompleteObject | undefined | null;
    corrector: IAutocompleteObject | undefined | null;
    studyset: StudysetsApiResponse | undefined | null;
    annotation: AnnotationsApiResponse | undefined | null;
    inclusionColumn: string | undefined | null;
    metaAnalysisName: string;
    metaAnalysisDescription: string;
}

export interface IEstimatorCorrectorArgs {
    estimatorArgs: IDynamicInputType;
    correctorArgs: IDynamicInputType;
}

const MetaAnalysisBuilderPage: React.FC = (props) => {
    const { createMetaAnalysis, isError, isLoading } = useCreateMetaAnalysis();
    const { showSnackbar } = useContext(GlobalContext);
    const history = useHistory();
    const { current } = useIsMounted();
    const [activeStep, setActiveStep] = useState(0);
    const [studysets, setStudysets] = useState<StudysetsApiResponse[]>();
    const [metaAnalysisComponents, setMetaAnalysisComponents] = useState<IMetaAnalysisComponents>({
        metaAnalysisName: '',
        metaAnalysisDescription: '',
        // data step
        analysisType: undefined,
        studyset: undefined,
        annotation: undefined,
        // algorithm step
        estimator: undefined,
        corrector: undefined,
        inclusionColumn: undefined,
    });

    /**
     * these args are dynamically generated by metadata and their values set later on when rendered
     */
    const [estimatorCorrectorArgs, setEstimatorCorrectorArgs] = useState<IEstimatorCorrectorArgs>({
        estimatorArgs: {},
        correctorArgs: {},
    });

    /**
     * reset estimator args when estimator is null
     */
    useEffect(() => {
        if (!metaAnalysisComponents.estimator) {
            setEstimatorCorrectorArgs((prevState) => ({
                ...prevState,
                estimatorArgs: {},
            }));
        }
    }, [metaAnalysisComponents.estimator]);

    /**
     * reset corrector args when corrector is null
     */
    useEffect(() => {
        if (!metaAnalysisComponents.corrector) {
            setEstimatorCorrectorArgs((prevState) => ({
                ...prevState,
                correctorArgs: {},
            }));
        }
    }, [metaAnalysisComponents.corrector]);

    useEffect(() => {
        const getStudySets = async () => {
            API.NeurostoreServices.StudySetsService.studysetsGet(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                false,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                ''
            )
                .then((res) => {
                    if (current) {
                        setStudysets(res.data.results);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        };

        getStudySets();
    }, [current]);

    const handleUpdate = (arg: Partial<IMetaAnalysisComponents>) => {
        setMetaAnalysisComponents((prevStep) => ({
            ...prevStep,
            ...arg,
        }));
    };

    const handleArgsUpdate = (arg: Partial<IEstimatorCorrectorArgs>) => {
        setEstimatorCorrectorArgs((prevState) => {
            // only one of correctorArgs or estimatorArgs will be updated at any given time
            const key = arg.correctorArgs ? 'correctorArgs' : 'estimatorArgs';
            return {
                ...prevState,
                [key]: {
                    ...prevState[key],
                    ...arg[key],
                },
            };
        });
    };

    const handleCreateMetaAnalysis = async () => {
        let tempCorrector = null;
        if (metaAnalysisComponents.corrector) {
            tempCorrector = {
                type: metaAnalysisComponents.corrector?.label,
                args: {},
            };
            tempCorrector.args = estimatorCorrectorArgs.correctorArgs;
        }

        createMetaAnalysis(metaAnalysisComponents, estimatorCorrectorArgs)
            .then((res) => {
                showSnackbar('new meta-analysis successfully created', SnackbarType.SUCCESS);
                history.push('/usermeta-analyses');
            })
            .catch((err: AxiosError) => {
                console.log(err.toJSON());
            });
    };

    const handleNavigation = (button: ENavigationButton) => {
        setActiveStep((prev) => (button === ENavigationButton.NEXT ? ++prev : --prev));
    };

    if (isLoading) {
        return <>...loading</>;
    }
    return (
        <>
            <BackButton
                sx={{ marginBottom: '1.5rem' }}
                text="Return to my meta-analyses"
                path="/usermeta-analyses"
            />
            <Stepper sx={{ marginBottom: '1.5rem' }} activeStep={activeStep}>
                <Step>
                    <StepLabel sx={MetaAnalysisBuilderPageStyles.step}>Details</StepLabel>
                </Step>
                <Step>
                    <StepLabel sx={MetaAnalysisBuilderPageStyles.step}>Data</StepLabel>
                </Step>
                <Step>
                    <StepLabel sx={MetaAnalysisBuilderPageStyles.step}>Algorithm</StepLabel>
                </Step>
                <Step>
                    <StepLabel sx={MetaAnalysisBuilderPageStyles.step}>Finalize</StepLabel>
                </Step>
            </Stepper>

            {activeStep === 0 && (
                <MetaAnalysisDetails
                    metaAnalysisName={metaAnalysisComponents.metaAnalysisName}
                    metaAnalysisDescription={metaAnalysisComponents.metaAnalysisDescription}
                    onUpdate={handleUpdate}
                    onNext={handleNavigation}
                />
            )}

            {activeStep === 1 && (
                <MetaAnalysisData
                    onUpdate={handleUpdate}
                    metaAnalysisType={metaAnalysisComponents.analysisType}
                    studyset={metaAnalysisComponents.studyset}
                    annotation={metaAnalysisComponents.annotation}
                    inclusionColumn={metaAnalysisComponents.inclusionColumn}
                    onNext={handleNavigation}
                    studysets={studysets || []}
                />
            )}

            {activeStep === 2 && (
                <MetaAnalysisAlgorithm
                    metaAnalysisType={metaAnalysisComponents.analysisType as EAnalysisType}
                    estimator={metaAnalysisComponents.estimator}
                    estimatorArgs={estimatorCorrectorArgs.estimatorArgs}
                    corrector={metaAnalysisComponents.corrector}
                    correctorArgs={estimatorCorrectorArgs.correctorArgs}
                    onUpdate={handleUpdate}
                    onArgsUpdate={handleArgsUpdate}
                    onNext={handleNavigation}
                />
            )}

            {activeStep === 3 && (
                <MetaAnalysisFinalize
                    onNext={(button) => {
                        button === ENavigationButton.NEXT
                            ? handleCreateMetaAnalysis()
                            : setActiveStep((prev) => --prev);
                    }}
                    {...metaAnalysisComponents}
                    {...estimatorCorrectorArgs}
                />
            )}
        </>
    );
};

export default MetaAnalysisBuilderPage;
