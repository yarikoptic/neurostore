import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditStudyDetails, { IEditStudyDetails } from './EditStudyDetails';
import API from 'utils/api';
import { SnackbarProvider } from 'notistack';

jest.mock('utils/api');
jest.mock('hooks');

describe('EditStudyDetails Component', () => {
    let mockStudyDetails: IEditStudyDetails;

    beforeEach(() => {
        mockStudyDetails = {
            studyId: 'some-test-id',
            name: 'some-test-name',
            description: 'some-test-description',
            authors: 'some-test-authors',
            doi: 'some-test-doi',
            publication: 'some-test-publication',
        };

        render(
            <SnackbarProvider>
                <EditStudyDetails {...mockStudyDetails} />
            </SnackbarProvider>
        );

        // open accordion
        const title = screen.getByText('Edit Study Details');
        userEvent.click(title);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should render', () => {
        const title = screen.getByText('Edit Study Details');
        expect(title).toBeInTheDocument();
    });

    describe('inputs', () => {
        beforeEach(() => {
            // open accordion
            const title = screen.getByText('Edit Study Details');
            userEvent.click(title);
        });

        it('should work for name', () => {
            const nameTextbox = screen.getByDisplayValue(mockStudyDetails.name);
            userEvent.type(nameTextbox, 'A');

            expect(screen.getByDisplayValue(mockStudyDetails.name + 'A')).toBeInTheDocument();
        });
        it('should work for authors', () => {
            const authorsTextbox = screen.getByDisplayValue(mockStudyDetails.authors);
            userEvent.type(authorsTextbox, 'B');

            expect(screen.getByDisplayValue(mockStudyDetails.authors + 'B')).toBeInTheDocument();
        });
        it('should work for publication', () => {
            const publicationTextbox = screen.getByDisplayValue(mockStudyDetails.publication);
            userEvent.type(publicationTextbox, 'C');

            expect(
                screen.getByDisplayValue(mockStudyDetails.publication + 'C')
            ).toBeInTheDocument();
        });
        it('should work for DOI', () => {
            const doiTextbox = screen.getByDisplayValue(mockStudyDetails.doi);
            userEvent.type(doiTextbox, 'D');

            expect(screen.getByDisplayValue(mockStudyDetails.doi + 'D')).toBeInTheDocument();
        });
        it('should work for description', () => {
            const descriptionTextbox = screen.getByDisplayValue(mockStudyDetails.description);
            userEvent.type(descriptionTextbox, 'E');

            expect(
                screen.getByDisplayValue(mockStudyDetails.description + 'E')
            ).toBeInTheDocument();
        });
    });

    it('should disable the save button initially', () => {
        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).toBeDisabled();
    });

    it('should disable the cancel button initally', () => {
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        expect(cancelButton).toBeDisabled();
    });

    it('should indicate changes need to be saved when the textboxes are modified', () => {
        const descriptionTextbox = screen.getByDisplayValue(mockStudyDetails.description);
        userEvent.type(descriptionTextbox, 'E');

        const saveChangesText = screen.getByText('unsaved changes');
        expect(saveChangesText).toBeInTheDocument();
    });

    it('should call the API when the save button is clicked', async () => {
        const descriptionTextbox = screen.getByDisplayValue(mockStudyDetails.description);
        userEvent.type(descriptionTextbox, 'E');

        const saveButton = screen.getByRole('button', { name: 'Save' });

        await act(async () => {
            userEvent.click(saveButton);
        });

        expect(API.NeurostoreServices.StudiesService.studiesIdPut).toHaveBeenCalledWith(
            'some-test-id',
            {
                name: mockStudyDetails.name,
                description: mockStudyDetails.description + 'E',
                authors: mockStudyDetails.authors,
                publication: mockStudyDetails.publication,
                doi: mockStudyDetails.doi,
            }
        );
    });

    it('should revert to the original data when the cancel button is clicked', () => {
        // mock a type event in order to enable the cancel button and update the state
        let nameTextbox = screen.getByDisplayValue(mockStudyDetails.name);
        let descriptionTextbox = screen.getByDisplayValue(mockStudyDetails.description);
        let doiTextbox = screen.getByDisplayValue(mockStudyDetails.doi);
        let publicationTextbox = screen.getByDisplayValue(mockStudyDetails.publication);
        let authorsTextbox = screen.getByDisplayValue(mockStudyDetails.authors);
        userEvent.type(nameTextbox, 'A');
        userEvent.type(descriptionTextbox, 'B');
        userEvent.type(doiTextbox, 'C');
        userEvent.type(publicationTextbox, 'D');
        userEvent.type(authorsTextbox, '');

        // cancel button should now be enabled
        const revertChangesButton = screen.getByRole('button', { name: 'Cancel' });
        userEvent.click(revertChangesButton);

        expect(screen.getByDisplayValue(mockStudyDetails.name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockStudyDetails.description)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockStudyDetails.doi)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockStudyDetails.publication)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockStudyDetails.authors)).toBeInTheDocument();
    });

    it('should not indicate save changes after we call the API and update', async () => {
        const descriptionTextbox = screen.getByDisplayValue(mockStudyDetails.description);
        userEvent.type(descriptionTextbox, 'E');

        const saveButton = screen.getByRole('button', { name: 'Save' });

        await act(async () => {
            userEvent.click(saveButton);
        });

        const saveChangesText = screen.queryByText('unsaved changes');
        expect(saveChangesText).not.toBeInTheDocument();
    });

    it('should not indicate unsaved changes when the Cancel button is clicked', () => {
        // mock a type event in order to enable the cancel button
        let descriptionTextbox = screen.getByDisplayValue(mockStudyDetails.description);
        userEvent.type(descriptionTextbox, 'E');

        const revertChangesButton = screen.getByRole('button', { name: 'Cancel' });
        userEvent.click(revertChangesButton);

        const unsavedChangesText = screen.queryByText('unsaved changes');
        expect(unsavedChangesText).not.toBeInTheDocument();
    });
});
