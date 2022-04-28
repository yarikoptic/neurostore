import { AnalysisApiResponse, ConditionApiResponse } from '../utils/api';

const mockConditions: () => ConditionApiResponse[] = () => [
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

const mockAnalyses: () => AnalysisApiResponse[] = () => [
    {
        conditions: [],
        created_at: '2021-11-10T19:46:43.510565+00:00',
        description: null,
        id: '3MXg8tfRq2sh',
        images: [],
        name: '41544',
        points: [
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
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-6.0, -34.0, 34.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '6Wm3t8jE5fGg',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-14.0, -56.0, 70.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '7JpPtneWhZFU',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [20.0, -62.0, 46.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '3S6Vkfg6E9dz',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-28.0, -26.0, 14.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '7m5xNnS7HiLu',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-32.0, 0.0, -12.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '3cXiokRagkT9',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [32.0, -4.0, -4.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: 'x2uBSnaKc3Nj',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-14.0, 58.0, 20.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '63J2v5nsZfP4',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [0.0, -46.0, 56.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '3G3i3oyqHE4V',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-8.0, 48.0, 26.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '5oBfPniD2B6X',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-22.0, -60.0, 6.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '5WgpoouhBaPe',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-30.0, -80.0, 36.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '4tnbzkhP2MWc',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-16.0, -86.0, 40.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '8K8xrwe6ppiA',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [32.0, -24.0, 48.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '6pBTQmiuiSVN',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [0.0, -32.0, 60.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '7yC2Mzs3BjCg',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [10.0, -82.0, -20.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: 'ph92Dz76t9pU',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '3MXg8tfRq2sh',
                coordinates: [-26.0, 40.0, 44.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '5RFazo3Kmado',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
        ],
        study: '4nz6aH7M59k2',
        user: 'some-user',
        weights: [],
    },
    {
        conditions: [],
        created_at: '2021-11-10T19:46:43.510565+00:00',
        description: null,
        id: '6iaKVRHx8F9i',
        images: [],
        name: '41545',
        points: [
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [8.0, -38.0, 32.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '7D5DpoLzp8k8',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [30.0, -76.0, 22.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '4fSWZbFL2gKg',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [26.0, -58.0, 8.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: 'XrYVkxEsSxNe',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [-22.0, -52.0, 10.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '6qj3Z8wbPtX9',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [26.0, -34.0, 72.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '4nxKYYJ7VJYh',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [20.0, 16.0, 20.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '4fr96Y4y3bnX',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [18.0, -54.0, 48.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: 'kyVrP2Px3o2n',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '6iaKVRHx8F9i',
                coordinates: [-20.0, 26.0, 60.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: 'Zh79NTx6M37t',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
        ],
        study: '4nz6aH7M59k2',
        user: 'some-user',
        weights: [],
    },
    {
        conditions: [],
        created_at: '2021-11-10T19:46:43.510565+00:00',
        description: 'Some description I am putting here',
        id: '33qzmEbxfTjs',
        images: [],
        name: '41546',
        points: [
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [36.0, -68.0, -20.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '7ioUKxEDeZ9M',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [20.0, 30.0, 54.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '6nGWqacG26hU',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [14.0, 10.0, 62.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '5M4Lhk6ACVnd',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [12.0, 58.0, 18.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '7RgVpKCdxuBQ',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [-44.0, -28.0, 42.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '43pgKpr7peD3',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [46.0, -42.0, 50.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '5RGJMDqvBrqT',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [20.0, -76.0, -12.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '68E9A7PRqCPD',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [4.0, -56.0, -2.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '8PKo7afd4r6U',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
            {
                analysis: '33qzmEbxfTjs',
                coordinates: [4.0, 44.0, 8.0],
                created_at: '2021-11-10T19:46:43.510565+00:00',
                id: '3YgctaqLWzBu',
                image: null,
                kind: 'unknown',
                label_id: null,
                space: 'MNI',
                user: 'some-user',
                value: [],
            },
        ],
        study: '4nz6aH7M59k2',
        user: 'some-user',
        weights: [],
    },
];

export { mockConditions, mockWeights, mockAnalyses };
