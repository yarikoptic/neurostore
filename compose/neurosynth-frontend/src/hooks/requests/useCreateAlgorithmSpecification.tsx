import { AxiosError, AxiosResponse } from 'axios';
import { useMutation } from 'react-query';
import {
    AnnotationPostBody,
    MetaAnalysis,
    MetaAnalysisPostBody,
    MetaAnalysisReturn,
    SpecificationPostBody,
    SpecificationReturn,
    StudysetPostBody,
    StudysetReturn,
} from 'neurosynth-compose-typescript-sdk';
import API, { NeurostoreAnnotation } from 'utils/api';
import { IAutocompleteObject } from 'components/NeurosynthAutocomplete/NeurosynthAutocomplete';
import { IDynamicValueType } from 'components/MetaAnalysisConfigComponents';

export enum EAnalysisType {
    CBMA = 'CBMA',
    IBMA = 'IBMA',
}

const useCreateAlgorithmSpecification = () => {
    const createSpecificationMutation = useMutation<
        AxiosResponse<SpecificationReturn>,
        AxiosError,
        SpecificationPostBody,
        unknown
    >((spec: SpecificationPostBody) =>
        API.NeurosynthServices.SpecificationsService.specificationsPost(spec)
    );
    const createSynthStudysetMutation = useMutation<
        AxiosResponse<StudysetReturn>,
        AxiosError,
        StudysetPostBody,
        unknown
    >((studyset) => API.NeurosynthServices.StudysetsService.studysetsPost(studyset));
    const createSynthAnnotationMutation = useMutation<
        AxiosResponse<NeurostoreAnnotation>,
        AxiosError,
        AnnotationPostBody,
        unknown
    >((annotation) => API.NeurosynthServices.AnnotationsService.annotationsPost(annotation));
    const createMetaAnalysisMutation = useMutation<
        AxiosResponse<MetaAnalysisReturn>,
        AxiosError,
        MetaAnalysisPostBody,
        unknown
    >((metaAnalysis: MetaAnalysisPostBody) =>
        API.NeurosynthServices.MetaAnalysisService.metaAnalysesPost(metaAnalysis)
    );

    const createMetaAnalysis = async (
        projectId: string | undefined,
        analysisType: EAnalysisType | undefined,
        estimator: IAutocompleteObject | undefined | null,
        corrector: IAutocompleteObject | undefined | null,
        studysetId: string | undefined | null,
        annotationId: string | undefined | null,
        inclusionColumn: string | undefined | null,
        metaAnalysisName: string | undefined,
        metaAnalysisDescription: string | undefined,
        estimatorArgs: IDynamicValueType | undefined,
        correctorArgs: IDynamicValueType | undefined
    ) => {
        try {
            if (!projectId) throw new Error('no id from project');
            if (!studysetId) throw new Error('no id from studyset');
            if (!annotationId) throw new Error('no id from annotation');

            const createdSpec = await createSpecificationMutation.mutateAsync({
                type: analysisType as EAnalysisType,
                estimator: {
                    type: estimator?.label,
                    args: estimatorArgs,
                },
                mask: '', // TODO: handle these cases
                contrast: '', // TODO: handle these cases
                transformer: '', // TODO: handle these cases
                corrector: corrector
                    ? {
                          type: corrector?.label,
                          args: correctorArgs,
                      }
                    : null,
                filter: inclusionColumn,
            });
            if (!createdSpec.data.id) throw new Error('no id from created spec');

            const createdSynthStudyset = await createSynthStudysetMutation.mutateAsync({
                neurostore_id: studysetId,
            });
            if (!createdSynthStudyset.data.id) throw new Error('no id from created synth studyset');

            const createdSynthAnnotation = await createSynthAnnotationMutation.mutateAsync({
                neurostore_id: annotationId,
                internal_studyset_id: createdSynthStudyset.data.id,
            });
            if (!createdSynthAnnotation.data.id)
                throw new Error('no id from created synth annotation');

            const createdMetaAnalysis = await createMetaAnalysisMutation.mutateAsync({
                name: metaAnalysisName,
                description: metaAnalysisDescription,
                internal_studyset_id: createdSynthStudyset.data.id,
                internal_annotation_id: createdSynthAnnotation.data.id,
                specification: createdSpec.data.id,
                project: projectId,
            });

            return createdMetaAnalysis;
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const isLoading =
        createSpecificationMutation.isLoading ||
        createSynthStudysetMutation.isLoading ||
        createSynthAnnotationMutation.isLoading ||
        createMetaAnalysisMutation.isLoading;

    const isError =
        createSpecificationMutation.isError ||
        createSynthStudysetMutation.isError ||
        createSynthAnnotationMutation.isError ||
        createMetaAnalysisMutation.isError;

    const error =
        createSpecificationMutation.error ||
        createSynthStudysetMutation.error ||
        createSynthAnnotationMutation.error ||
        createMetaAnalysisMutation.error;

    return {
        error,
        isLoading,
        isError,
        createMetaAnalysis,
    };
};

export default useCreateAlgorithmSpecification;
