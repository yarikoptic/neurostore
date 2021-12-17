import { render, screen } from '@testing-library/react';
import Visualizer from '../Visualizer/Visualizer';
import { Analysis, ReadOnly } from '../../gen/api';
import DisplayAnalysis from './DisplayAnalysis';

jest.mock('../Visualizer/Visualizer', () => {
    return {
        __esModule: true,
        default: jest.fn((props: any) => {
            return <div>Mocked Visualizer</div>;
        }),
    };
});

jest.mock('../Tables/DisplayValuesTable/DisplayValuesTable', () => {
    return {
        __esModule: true,
        default: (props: any) => {
            return <div>Mocked Values Table</div>;
        },
    };
});

jest.mock('../Tables/DisplayImagesTable/DisplayImagesTable', () => {
    return {
        __esModule: true,
        default: (props: any) => {
            return <div>Mocked Images Table</div>;
        },
    };
});

describe('DisplayAnalysis Component', () => {
    it('should render', () => {
        render(<DisplayAnalysis />);
        const noDataText = screen.getByText('No analysis');
        expect(noDataText).toBeInTheDocument();
    });

    it('should not render with the visualizer when no images are present', () => {
        const mockAnalysis: Analysis & ReadOnly = {
            conditions: [],
            created_at: '2021-10-25T10:37:20.237634+00:00',
            description: 'FSL5.0',
            id: '4HcXc4CqPvcF',
            images: [],
            name: 'model001 task001 cope001 tstat1',
            points: [],
            study: '3C29Ba6PJHcx',
            user: null,
            weights: [1],
        };

        render(<DisplayAnalysis {...mockAnalysis} />);

        const visualizerMock = screen.queryByText('Mocked Visualizer');
        expect(visualizerMock).not.toBeInTheDocument();
    });

    it('should pass the correct image in the visualizer when there is only one image', () => {
        const mockAnalysis: Analysis & ReadOnly = {
            conditions: [],
            created_at: '2021-10-25T10:37:20.237634+00:00',
            description: 'FSL5.0',
            id: '4HcXc4CqPvcF',
            images: [
                {
                    add_date: '2016-01-21T17:22:27.397856+00:00',
                    analysis: '4HcXc4CqPvcF',
                    analysis_name: 'model001 task001 cope001 tstat1',
                    created_at: '2021-10-25T10:37:20.237634+00:00',
                    filename: 'some_test_file.nii.gz',
                    id: '5asPG5P4x7F9',
                    metadata: {
                        BMI: null,
                        add_date: '2016-01-21T17:22:27.397856Z',
                        age: null,
                        analysis_level: 'group',
                        bis11_score: null,
                        target_template_image: 'some_test_template',
                    },
                    space: 'MNI',
                    url: 'some_test_image_url.nii.gz',
                    user: null,
                    value_type: 'NOT-T',
                },
            ],
            name: 'model001 task001 cope001 tstat1',
            points: [],
            study: '3C29Ba6PJHcx',
            user: null,
            weights: [1],
        };

        render(<DisplayAnalysis {...mockAnalysis} />);

        expect(Visualizer).toBeCalledWith(
            {
                fileName: 'some_test_file.nii.gz',
                imageURL: 'some_test_image_url.nii.gz',
                index: 0,
                sx: {
                    height: 'auto',
                    padding: '0 2px',
                    width: '100%',
                },
                template: 'some_test_template',
            },
            {}
        );
    });

    it('should select the first image that has a T value type when there are multiple images', () => {
        const mockAnalysis: Analysis & ReadOnly = {
            conditions: [
                {
                    created_at: '2021-10-25T10:27:54.741936+00:00',
                    description: null,
                    id: '5wLpKme6xPFG',
                    name: 'object one-back task',
                    user: null,
                },
            ],
            created_at: '2021-10-25T10:37:20.237634+00:00',
            description: 'FSL5.0',
            id: '4HcXc4CqPvcF',
            images: [
                {
                    add_date: '2016-01-21T17:22:27.397856+00:00',
                    analysis: '4HcXc4CqPvcF',
                    analysis_name: 'model001 task001 cope001 tstat1',
                    created_at: '2021-10-25T10:37:20.237634+00:00',
                    filename: 'model001_task001_cope001_tstat1.nii.gz',
                    id: '5asPG5P4x7F9',
                    metadata: {
                        BMI: null,
                        add_date: '2016-01-21T17:22:27.397856Z',
                        age: null,
                        analysis_level: 'group',
                        bis11_score: null,
                    },
                    space: 'MNI',
                    url: 'https://neurovault.org/media/images/415/model001_task001_cope001_tstat1.nii.gz',
                    user: null,
                    value_type: 'NOT-T',
                },
                {
                    add_date: '2016-01-21T17:22:27.397856+00:00',
                    analysis: '4HcXc4CqPvcF',
                    analysis_name: 'model001 task001 cope001 tstat1',
                    created_at: '2021-10-25T10:37:20.237634+00:00',
                    filename: 'some_test_file.nii.gz',
                    id: '5asPG5P4x7F9',
                    metadata: {
                        BMI: null,
                        add_date: '2016-01-21T17:22:27.397856Z',
                        age: null,
                        analysis_level: 'group',
                        bis11_score: null,
                        target_template_image: 'some_test_template',
                    },
                    space: 'MNI',
                    url: 'some_test_image_url.nii.gz',
                    user: null,
                    value_type: 'T',
                },
            ],
            name: 'model001 task001 cope001 tstat1',
            points: [],
            study: '3C29Ba6PJHcx',
            user: null,
            weights: [1],
        };

        render(<DisplayAnalysis {...mockAnalysis} />);

        expect(Visualizer).toBeCalledWith(
            {
                fileName: 'some_test_file.nii.gz',
                imageURL: 'some_test_image_url.nii.gz',
                index: 0,
                sx: {
                    height: 'auto',
                    padding: '0 2px',
                    width: '100%',
                },
                template: 'some_test_template',
            },
            {}
        );
    });
});
