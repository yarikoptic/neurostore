import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { StudysetsApiResponse } from '../../../utils/api';
import StudysetsTable from './StudysetsTable';

jest.mock('../DisplayValuesTable/DisplayValuesTable');

describe('StudysetsTable', () => {
    const mockStudysets: StudysetsApiResponse[] = [
        {
            created_at: '2021-12-14T05:05:45.722157+00:00',
            description: 'test-description-1',
            doi: null,
            id: 'test-id-1',
            name: 'test-name-1',
            pmid: null,
            publication: null,
            studies: [],
            user: 'test-user',
        },
        {
            created_at: '2021-12-14T05:05:45.722157+00:00',
            description: 'test-description-2',
            doi: null,
            id: 'test-id-2',
            name: 'test-name-2',
            pmid: null,
            publication: null,
            studies: [],
            user: 'test-user',
        },
    ];

    const mockStudysetsNoInfo: StudysetsApiResponse[] = [
        {
            created_at: '2021-12-14T05:05:45.722157+00:00',
            description: null,
            doi: null,
            id: 'test-id-1',
            name: null,
            pmid: null,
            publication: null,
            studies: [],
            user: 'test-user',
        },
    ];

    const historyMock = {
        push: jest.fn(),
        location: {},
        listen: jest.fn(),
    };

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should render', () => {
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockStudysets} />
            </Router>
        );
        const table = screen.getByText('mock table');
        expect(table).toBeInTheDocument();
    });

    it('should show no name message when there is no name', () => {
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockStudysetsNoInfo} />
            </Router>
        );
        const noNameMessage = screen.getByText('Name: No name');
        expect(noNameMessage).toBeInTheDocument();
    });

    it('should show no description message when there is no description', () => {
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockStudysetsNoInfo} />
            </Router>
        );
        const noDescriptionMessage = screen.getByText('Description: No description');
        expect(noDescriptionMessage).toBeInTheDocument();
    });

    it('should show 0 studies', () => {
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockStudysetsNoInfo} />
            </Router>
        );
        const noStudies = screen.getByText('# of Studies: 0 studies');
        expect(noStudies).toBeInTheDocument();
    });

    it('should show 1 study', () => {
        const mockDataWithOneStudy: StudysetsApiResponse[] = [
            {
                created_at: '2021-12-14T05:05:45.722157+00:00',
                description: null,
                doi: null,
                id: 'test-id-1',
                name: null,
                pmid: null,
                publication: null,
                studies: ['test-study-id-1'],
                user: 'test-user',
            },
        ];
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockDataWithOneStudy} />
            </Router>
        );

        const studyMessage = screen.getByText('# of Studies: 1 study');
        expect(studyMessage).toBeInTheDocument();
    });

    it('should show multiple studies', () => {
        const mockDataWithOneStudy: StudysetsApiResponse[] = [
            {
                created_at: '2021-12-14T05:05:45.722157+00:00',
                description: null,
                doi: null,
                id: 'test-id-1',
                name: null,
                pmid: null,
                publication: null,
                studies: ['test-study-id-1', 'test-study-id-2'],
                user: 'test-user',
            },
        ];
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockDataWithOneStudy} />
            </Router>
        );

        const studyMessage = screen.getByText('# of Studies: 2 studies');
        expect(studyMessage).toBeInTheDocument();
    });

    it('should handle the selection on row select', () => {
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockStudysets} />
            </Router>
        );

        const row = screen.getByTestId('simulate-row-click');
        userEvent.click(row);

        expect(historyMock.push).toBeCalledWith('/studysets/some-selected-id');
    });

    it('should format the data correctly', () => {
        render(
            <Router history={historyMock as any}>
                <StudysetsTable studysets={mockStudysets} />
            </Router>
        );

        mockStudysets.forEach((res) => {
            const uniqueKey = screen.getByText(`unique key: ${res.id}`);
            const name = screen.getByText(`Name: ${res.name}`);
            const description = screen.getByText(`Description: ${res.description}`);
            expect(uniqueKey).toBeInTheDocument();
            expect(name).toBeInTheDocument();
            expect(description).toBeInTheDocument();
        });
    });
});