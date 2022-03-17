import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Box } from '@mui/system';
import React, { ReactNode } from 'react';
import { EPropertyType, IToggleTypeModel } from '../..';
import ToggleTypeStyles from './ToggleType.styles';

const ToggleType: React.FC<IToggleTypeModel> = React.memo((props) => {
    const { onToggle, type, allowNoneType = true } = props;

    const handleSetType = (event: SelectChangeEvent<EPropertyType>, child: ReactNode) => {
        const selected = event.target.value as EPropertyType;
        onToggle(selected);
    };

    const myClass: 'type_number' | 'type_boolean' | 'type_string' | 'type_none' = `type_${type}`;

    return (
        <Box sx={ToggleTypeStyles.toggleItemContainer}>
            <FormControl variant="outlined">
                <Select
                    sx={[ToggleTypeStyles[myClass], ToggleTypeStyles.toggle_item]}
                    value={type}
                    onChange={handleSetType}
                >
                    <MenuItem sx={ToggleTypeStyles.type_string} value="string">
                        STRING
                    </MenuItem>
                    <MenuItem sx={ToggleTypeStyles.type_number} value="number">
                        NUMBER
                    </MenuItem>
                    <MenuItem sx={ToggleTypeStyles.type_boolean} value="boolean">
                        BOOLEAN
                    </MenuItem>
                    {allowNoneType && (
                        <MenuItem sx={ToggleTypeStyles.type_none} value="none">
                            NONE
                        </MenuItem>
                    )}
                </Select>
            </FormControl>
        </Box>
    );
});

export default ToggleType;
