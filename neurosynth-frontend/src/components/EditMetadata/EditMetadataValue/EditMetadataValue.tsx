import { TextField, FormGroup, FormControlLabel, Switch, Typography, Box } from '@mui/material';
import { EPropertyType, IEditMetadataValue } from '..';
import EditMetadataValueStyles from './EditMetadata.styles';

const EditMetadataValue: React.FC<IEditMetadataValue> = (props) => {
    const { onEditMetadataValue: handleEditMetadataValue, value, type } = props;

    const map = {
        [EPropertyType.NUMBER]: (
            <TextField
                sx={EditMetadataValueStyles.numberfield}
                onChange={(event) => {
                    const num = parseInt(event.target.value);
                    if (!isNaN(num)) {
                        handleEditMetadataValue(num);
                    }
                }}
                value={value}
                type="number"
                variant="outlined"
            />
        ),
        [EPropertyType.BOOLEAN]: (
            <FormGroup>
                <FormControlLabel
                    sx={
                        value
                            ? EditMetadataValueStyles.checkedTrue
                            : EditMetadataValueStyles.checkedFalse
                    }
                    control={
                        <Switch
                            onChange={(event, checked) => {
                                handleEditMetadataValue(checked);
                            }}
                            color="primary"
                            size="medium"
                            checked={!!value}
                        />
                    }
                    label={<Typography variant="caption">{(value || false).toString()}</Typography>}
                />
            </FormGroup>
        ),
        [EPropertyType.STRING]: (
            <TextField
                multiline
                placeholder="New metadata value"
                onChange={(event) => {
                    handleEditMetadataValue(event.target.value);
                }}
                value={value}
                variant="outlined"
                sx={EditMetadataValueStyles.textfield}
            />
        ),
        [EPropertyType.NONE]: (
            <Box component="span" sx={{ color: 'warning.dark' }}>
                null
            </Box>
        ),
    };

    return <>{map[type]}</>;
};

export default EditMetadataValue;
