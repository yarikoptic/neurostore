import { Box, TextField } from '@mui/material';
import MetaAnalysisAlgorithmStyles from '../MetaAnalysisAlgorithm.styles';
import { IDynamicFormInput } from '../..';
import DynamicFormBaseTitle from './DynamicFormBaseTitle';

const DynamicFormNumericInput: React.FC<IDynamicFormInput> = (props) => {
    return (
        <Box sx={MetaAnalysisAlgorithmStyles.input}>
            <DynamicFormBaseTitle
                name={props.parameterName}
                description={props.parameter.description}
            />

            <Box sx={{ width: '50%' }}>
                <TextField
                    onChange={(event) => {
                        const parsedValue = parseFloat(event.target.value);
                        if (event.target.value === '') {
                            props.onUpdate({
                                [props.parameterName]: null,
                            });
                        } else if (isNaN(parsedValue)) {
                            return;
                        } else {
                            props.onUpdate({
                                [props.parameterName]: parsedValue,
                            });
                        }
                    }}
                    value={props.value || ''}
                    label="number"
                    sx={{ width: '100%' }}
                    type="number"
                />
            </Box>
        </Box>
    );
};

export default DynamicFormNumericInput;