import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextEdit from './TextEdit';

describe('TextEdit', () => {
    const mockOnSave = jest.fn();
    it('should render', () => {
        render(
            <TextEdit onSave={mockOnSave} textToEdit="test-text">
                <span>test-text</span>
            </TextEdit>
        );
        const text = screen.getByText('test-text');
        expect(text).toBeInTheDocument();
    });

    it('should change to edit mode when icon is clicked', () => {
        render(
            <TextEdit onSave={mockOnSave} textToEdit="test-text">
                <span>test-text</span>
            </TextEdit>
        );

        const editIconButton = screen.getByRole('button');
        userEvent.click(editIconButton);

        const textField = screen.getByRole('textbox');
        expect(textField).toBeInTheDocument();

        const saveButton = screen.getByText('Save');
        const cancelButton = screen.getByText('Cancel');

        expect(saveButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
    });

    it('should go back to display mode when cancel is clicked', () => {
        render(
            <TextEdit onSave={mockOnSave} textToEdit="test-text">
                <span>test-text</span>
            </TextEdit>
        );

        // set to edit mode
        const editIconButton = screen.getByRole('button');
        userEvent.click(editIconButton);

        // set back to display mode
        const cancelButton = screen.getByText('Cancel');
        userEvent.click(cancelButton);

        const textField = screen.queryByRole('textbox');
        expect(textField).not.toBeInTheDocument();
    });

    it('should update the value when modified', () => {
        render(
            <TextEdit onSave={mockOnSave} textToEdit="test-text">
                <span>test-text</span>
            </TextEdit>
        );

        // set to edit mode
        const editIconButton = screen.getByRole('button');
        userEvent.click(editIconButton);

        // type the letter A
        const textField = screen.getByRole('textbox');
        userEvent.type(textField, 'A');

        const newVal = screen.getByDisplayValue('test-textA');
        expect(newVal).toBeInTheDocument();
    });

    it('should call onSave when the save button is clicked', () => {
        render(
            <TextEdit onSave={mockOnSave} textToEdit="test-text">
                <span>test-text</span>
            </TextEdit>
        );

        // set to edit mode
        const editIconButton = screen.getByRole('button');
        userEvent.click(editIconButton);

        // type the letter A
        const textField = screen.getByRole('textbox');
        userEvent.type(textField, 'A');

        const saveButton = screen.getByText('Save');
        userEvent.click(saveButton);

        expect(mockOnSave).toBeCalledWith('test-textA');
    });
});