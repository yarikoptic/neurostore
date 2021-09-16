import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditMetadataBoolean from './EditMetadataBoolean';
import EditMetadataNumber from './EditMetadataNumber';
import EditMetadataString from './EditMetadataString';

describe('EditMetadataValue Component', () => {
    const onEditMock = jest.fn();

    describe('EditMetadataBoolean Component', () => {
        it('should render the editMetadataBoolean component', () => {
            render(<EditMetadataBoolean value={true} onEdit={onEditMock} />);

            const toggle = screen.getByRole('checkbox');
            expect(toggle).toBeInTheDocument();
        });

        it('should toggle the value when its clicked', () => {
            render(<EditMetadataBoolean value={true} onEdit={onEditMock} />);
            const toggle = screen.getByRole('checkbox');
            userEvent.click(toggle);
            expect(onEditMock).toBeCalledWith(false);
        });
    });

    describe('EditMetadataNumber Component', () => {
        it('should render the editMetadataNumber component', () => {
            render(<EditMetadataNumber value={0} onEdit={onEditMock} />);

            const numberInput = screen.getByRole('spinbutton');
            expect(numberInput).toBeInTheDocument();
        });

        it('should emit the entered numeric value', () => {
            render(<EditMetadataNumber value={0} onEdit={onEditMock} />);

            const numberInput = screen.getByRole('spinbutton');
            userEvent.type(numberInput, '12345');
            expect(onEditMock).toBeCalledWith(12345);
        });

        it('should not emit for non numeric inputs', () => {
            render(<EditMetadataNumber value={0} onEdit={onEditMock} />);

            const numberInput = screen.getByRole('spinbutton');
            userEvent.type(numberInput, 'abc');
            expect(onEditMock).not.toBeCalled();
        });
    });

    describe('EditMetadataString Component', () => {
        it('should render the editMetadataString component', () => {
            render(<EditMetadataString value={''} onEdit={onEditMock} />);

            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeInTheDocument();
        });

        it('should emit the written text', () => {
            render(<EditMetadataString value={''} onEdit={onEditMock} />);

            const textInput = screen.getByRole('textbox');
            userEvent.type(textInput, 'abc');
            expect(onEditMock).toBeCalledWith('abc');
        });
    });
});