import { MetaAnalysisReturn } from 'neurosynth-compose-typescript-sdk';
import {
    StudysetReturn,
    StudyReturn,
    PointReturn,
    ConditionReturn,
    AnalysisReturn,
    Annotation,
    ReadOnly,
} from 'neurostore-typescript-sdk';

const mockConditions: () => ConditionReturn[] = () => [
    {
        name: 'mock-condition-name-1',
        description: 'mock-condition-description-1',
        id: 'mock-condition-id-1',
        created_at: '',
        user: 'github|user-1',
    },
    {
        name: 'mock-condition-name-2',
        description: 'mock-condition-description-2',
        id: 'mock-condition-id-2',
        created_at: '',
        user: 'github|user-1',
    },
];

const mockWeights: () => number[] = () => [1, 1];

const mockPoints: () => PointReturn[] = () => [
    {
        analysis: '3MXg8tfRq2sh',
        coordinates: [12.0, -18.0, 22.0],
        created_at: '2021-11-10T19:46:43.510565+00:00',
        id: '7vVqmHtGtnkQ',
        image: null,
        kind: 'unknown',
        label_id: null,
        space: 'MNI',
        user: 'some-user',
        value: [],
        entities: [],
    },
    {
        analysis: '3MXg8tfRq2sh',
        coordinates: [-40.0, -68.0, -20.0],
        created_at: '2021-11-10T19:46:43.510565+00:00',
        id: '3fZJuzbqti5v',
        image: null,
        kind: 'unknown',
        label_id: null,
        space: 'MNI',
        user: 'some-user',
        value: [],
        entities: [],
    },
    {
        analysis: '3MXg8tfRq2sh',
        coordinates: [-10.0, -60.0, 18.0],
        created_at: '2021-11-10T19:46:43.510565+00:00',
        id: '47aqyStcBEsC',
        image: null,
        kind: 'unknown',
        label_id: null,
        space: 'MNI',
        user: 'some-user',
        value: [],
        entities: [],
    },
];

const mockAnalyses: () => AnalysisReturn[] = () => [
    {
        conditions: mockConditions(),
        created_at: '2021-11-10T19:46:43.510565+00:00',
        description: null,
        id: '3MXg8tfRq2sh',
        images: [],
        name: '41544',
        points: mockPoints(),
        study: '4nz6aH7M59k2',
        user: 'some-user',
        weights: mockWeights(),
    },
    {
        conditions: [],
        created_at: '2021-11-10T19:46:43.510565+00:00',
        description: null,
        id: '6iaKVRHx8F9i',
        images: [],
        name: '41545',
        points: [],
        study: '4nz6aH7M59k2',
        user: 'some-user',
        weights: [],
    },
];

const mockStudysets: () => StudysetReturn[] = () => [
    {
        created_at: '2022-04-28T16:39:36.134359+00:00',
        id: '4eTAChpnL3Tg',
        neurostore_id: '4gUL3Zj2Kb7S',
        snapshot: null,
        updated_at: null,
        user: null,
        name: 'studyset-name-1',
        description: 'studyset-description-1',
        studies: ['4ZhkLTH8k2P6'],
    },
    {
        created_at: '2022-04-28T16:39:36.134359+00:00',
        id: '3JRewi4ND7rq',
        neurostore_id: 'wXQ9Fxw3mPz3',
        snapshot: null,
        updated_at: null,
        user: null,
        name: 'studyset-name-2',
        description: 'studyset-description-2',
        studies: [],
    },
    {
        created_at: '2022-04-28T16:39:36.134359+00:00',
        id: '88oi5AKK8aJN',
        neurostore_id: 'M8VRV2ZKMHh2',
        snapshot: null,
        updated_at: null,
        user: null,
        name: 'studyset-name-3',
        description: 'studyset-description-3',
        studies: [],
    },
];

const mockAnnotations: () => (Annotation & ReadOnly)[] = () => [
    {
        description: 'this is an annotation',
        user: 'github|26612023',
        name: 'choose this annotation',
        studyset: '7RWXkc9DHraB',
        updated_at: '2022-04-28T16:26:00.629711+00:00',
        source: null,
        source_id: null,
        note_keys: {
            inclusion_col: 'boolean',
            aergegr: 'number',
            aberg: 'string',
        },
        metadata: null,
        id: '62RUsQpwdouU',
        source_updated_at: null,
        created_at: '2022-04-28T16:25:16.431054+00:00',
        notes: [
            {
                authors:
                    'Dierks T, Linden DE, Jandl M, Formisano E, Goebel R, Lanfermann H, Singer W',
                analysis: '7eEjbzRmX6wv',
                study_name: "Activation of Heschl's gyrus during auditory hallucinations.",
                note: {
                    inclusion_col: true,
                    aergegr: 1234634,
                    aberg: 'aeraerg',
                },
                study_year: 1999,
                study: '4PBKSMmuUmu6',
                publication: 'Neuron',
                analysis_name: '35712',
            },
            {
                authors:
                    'Dierks T, Linden DE, Jandl M, Formisano E, Goebel R, Lanfermann H, Singer W',
                analysis: '5V3pSFxGqYFm',
                study_name: "Activation of Heschl's gyrus during auditory hallucinations.",
                note: {
                    inclusion_col: true,
                    aergegr: 1234634,
                    aberg: 'aeraerg',
                },
                study_year: 1999,
                study: '4PBKSMmuUmu6',
                publication: 'Neuron',
                analysis_name: '35713',
            },
            {
                authors:
                    'Jueptner M, Stephan KM, Frith CD, Brooks DJ, Frackowiak RS, Passingham RE',
                analysis: '5CUdzgAYKk5h',
                study_name: 'Anatomy of motor learning. I. Frontal cortex and attention to action.',
                note: {
                    inclusion_col: true,
                    aergegr: 1234634,
                    aberg: 'aeraerg',
                },
                study_year: 1997,
                study: '6be2ke4duJvg',
                publication: 'Journal of neurophysiology',
                analysis_name: '26997',
            },
            {
                authors:
                    'Jueptner M, Stephan KM, Frith CD, Brooks DJ, Frackowiak RS, Passingham RE',
                analysis: '3eoGBDLj43ih',
                study_name: 'Anatomy of motor learning. I. Frontal cortex and attention to action.',
                note: {
                    inclusion_col: true,
                    aergegr: 1234634,
                    aberg: 'aeraerg',
                },
                study_year: 1997,
                study: '6be2ke4duJvg',
                publication: 'Journal of neurophysiology',
                analysis_name: '26998',
            },
            {
                authors: 'Peterson BS, Skudlarski P, Gatenby JC, Zhang H, Anderson AW, Gore JC',
                analysis: '6fCoexBvSu2m',
                study_name:
                    'An fMRI study of Stroop word-color interference: evidence for cingulate subregions subserving multiple distributed attentional systems.',
                note: {
                    inclusion_col: true,
                    aergegr: 1234634,
                    aberg: 'aeraerg',
                },
                study_year: 1999,
                study: 'DcRHerjPxKYb',
                publication: 'Biological psychiatry',
                analysis_name: '14646',
            },
        ],
    },
];

const mockStudy: (studyPropOverride?: Partial<StudyReturn>) => StudyReturn = (
    studyPropOverride
) => ({
    source: 'neurostore',
    source_id: '7f66YLxzjPKk',
    doi: 'NaN',
    name: 'Amygdala-hippocampal involvement in human aversive trace conditioning revealed through event-related functional magnetic resonance imaging.',
    authors: 'Buchel C, Dolan RJ, Armony JL, Friston KJ',
    id: '4ZhkLTH8k2P6',
    user: 'github|26612023',
    updated_at: null,
    source_updated_at: '2022-04-28T16:23:11.548030+00:00',
    publication:
        'The Journal of neuroscience : the official journal of the Society for Neuroscience',
    created_at: '2022-05-18T19:38:15.262996+00:00',
    analyses: mockAnalyses(),
    description: null,
    year: 1999,
    metadata: null,
    pmid: '10594068',
    ...(studyPropOverride || {}),
});

const mockMetaAnalyses: () => MetaAnalysisReturn[] = () => [
    {
        annotation: '6M3PvaWEmcWf',
        created_at: '2022-08-12T00:47:12.259280+00:00',
        description: 'description 1',
        id: 'iBcMmTBvr7Zh',
        name: 'name 1',
        specification: '6ovxxkKiy7Sw',
        studyset: '5ATjENA3VVyE',
        updated_at: '2022-08-12T00:48:08.734923+00:00',
        user: 'auth0|62e0e6c9dd47048572613b4d',
    },
    {
        annotation: '6M3PvaWEmcWf',
        created_at: '2022-08-11T22:32:50.176873+00:00',
        description: 'description 2',
        id: '3VQe7vJUADSH',
        name: 'name 2',
        specification: '3BXYLbPGgrfw',
        studyset: '5ATjENA3VVyE',
        updated_at: '2022-08-11T22:33:14.152328+00:00',
        user: 'github|26612023',
    },
    {
        annotation: '6M3PvaWEmcWf',
        created_at: '2022-07-25T11:10:16.112671+00:00',
        description: 'description 3',
        id: '3Mr2VPLJhptt',
        name: 'name 3',
        specification: '7zSZM9FiVGke',
        studyset: '5ATjENA3VVyE',
        updated_at: null,
        user: 'auth0|62de78bc11222b208cd022c8',
    },
];

const mockStudies: () => StudyReturn[] = () => [
    {
        updated_at: null,
        description: 'description 1',
        id: '5cLR4qwokFqV',
        source_updated_at: '2022-07-22T08:26:40.465069+00:00',
        source_id: 'AvFAAdAZ4yCw',
        publication: 'publication 1',
        year: 1999,
        metadata: null,
        source: 'neurostore',
        authors: 'list of authors 1',
        pmid: 'pmid 1',
        created_at: '2022-08-12T22:42:44.246896+00:00',
        analyses: ['4MadtF5K8Yw2', '7oQ5gRe6nWHe'],
        name: 'name 1',
        doi: 'doi 1',
        user: 'github|26612023',
    },
    {
        updated_at: null,
        description: 'description 2',
        id: '6cbdeyacHieR',
        source_updated_at: '2022-07-22T08:31:05.214847+00:00',
        source_id: '3zutS8kyg2sy',
        publication: 'publication 2',
        year: null,
        metadata: {
            url: 'https://neurovault.org/collections/2411/',
            download_url: 'https://neurovault.org/collections/2411/download',
            owner: 1274,
            contributors: 'ehtelzer',
            owner_name: 'emccormick20',
            number_of_images: 1,
            paper_url: 'http://journal.frontiersin.org/article/10.3389/fnhum.2017.00141/full',
            full_dataset_url: '',
            private: false,
            add_date: '2017-04-04T17:47:16.863092Z',
            modify_date: '2019-11-10T20:39:12.916636Z',
            doi_add_date: '2019-11-10T20:39:12.911623Z',
            type_of_design: null,
            number_of_imaging_runs: null,
            number_of_experimental_units: null,
            length_of_runs: null,
            length_of_blocks: null,
            length_of_trials: '',
            optimization: null,
            optimization_method: '',
            subject_age_mean: null,
            subject_age_min: null,
            subject_age_max: null,
            handedness: null,
            proportion_male_subjects: null,
            inclusion_exclusion_criteria: '',
            number_of_rejected_subjects: null,
            group_comparison: null,
            group_description: '',
            scanner_make: '',
            scanner_model: '',
            field_strength: null,
            pulse_sequence: '',
            parallel_imaging: '',
            field_of_view: null,
            matrix_size: null,
            slice_thickness: null,
            skip_distance: null,
            acquisition_orientation: '',
            order_of_acquisition: null,
            repetition_time: null,
            echo_time: null,
            flip_angle: null,
            software_package: '',
            software_version: '',
            order_of_preprocessing_operations: '',
            quality_control: '',
            used_b0_unwarping: null,
            b0_unwarping_software: '',
            used_slice_timing_correction: null,
            slice_timing_correction_software: '',
            used_motion_correction: null,
            motion_correction_software: '',
            motion_correction_reference: '',
            motion_correction_metric: '',
            motion_correction_interpolation: '',
            used_motion_susceptibiity_correction: null,
            used_intersubject_registration: null,
            intersubject_registration_software: '',
            intersubject_transformation_type: null,
            nonlinear_transform_type: '',
            transform_similarity_metric: '',
            interpolation_method: '',
            object_image_type: '',
            functional_coregistered_to_structural: null,
            functional_coregistration_method: '',
            coordinate_space: null,
            target_template_image: '',
            target_resolution: null,
            used_smoothing: null,
            smoothing_type: '',
            smoothing_fwhm: null,
            resampled_voxel_size: null,
            intrasubject_model_type: '',
            intrasubject_estimation_type: '',
            intrasubject_modeling_software: '',
            hemodynamic_response_function: '',
            used_temporal_derivatives: null,
            used_dispersion_derivatives: null,
            used_motion_regressors: null,
            used_reaction_time_regressor: null,
            used_orthogonalization: null,
            orthogonalization_description: '',
            used_high_pass_filter: null,
            high_pass_filter_method: '',
            autocorrelation_model: '',
            group_model_type: '',
            group_estimation_type: '',
            group_modeling_software: '',
            group_inference_type: null,
            group_model_multilevel: '',
            group_repeated_measures: null,
            group_repeated_measures_method: '',
            nutbrain_hunger_state: null,
            nutbrain_food_viewing_conditions: '',
            nutbrain_food_choice_type: '',
            nutbrain_taste_conditions: '',
            nutbrain_odor_conditions: '',
            communities: [],
        },
        source: 'neurostore',
        authors: 'list of authors 2',
        pmid: null,
        created_at: '2022-08-04T23:56:20.441846+00:00',
        analyses: ['5VFpbNNukvoY'],
        name: 'name 2',
        doi: 'doi 2',
        user: 'github|26612023',
    },
];

export {
    mockConditions,
    mockWeights,
    mockAnalyses,
    mockStudysets,
    mockAnnotations,
    mockStudy,
    mockPoints,
    mockMetaAnalyses,
    mockStudies,
};
