import { Box, Button, TextField } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { IAddMetadataRowModel, EPropertyType, IMetadataRowModel } from '..';
import EditMetadataValue from '../EditMetadataValue/EditMetadataValue';
import EditMetadataRowStyles from './EditMetadataRow.styles';
import ToggleType from './ToggleType/ToggleType';

export const getStartValFromType = (type: EPropertyType): boolean | number | string | null => {
    switch (type) {
        case EPropertyType.BOOLEAN:
            return false;
        case EPropertyType.NUMBER:
            return 0;
        case EPropertyType.STRING:
            return '';
        default:
            return null;
    }
};

const AddMetadataRow: React.FC<IAddMetadataRowModel> = (props) => {
    const {
        onAddMetadataRow,
        keyPlaceholderText,
        errorMessage,
        valuePlaceholderText,
        showToggleType = true,
        allowNoneOption = true,
        showMetadataValueInput = true,
    } = props;

    const [currType, setCurrType] = useState(EPropertyType.STRING);
    const [isValid, setIsValid] = useState(true);
    const [metadataRow, setMetadataRow] = useState<IMetadataRowModel>({
        metadataKey: '',
        metadataValue: '',
    });

    const handleToggle = useCallback((newType: EPropertyType) => {
        setMetadataRow((prevRow) => {
            return {
                metadataKey: prevRow.metadataKey,
                metadataValue: getStartValFromType(newType),
            };
        });
        setCurrType(newType);
    }, []);

    const handleAdd = (event: React.MouseEvent) => {
        if (metadataRow.metadataKey.length > 0) {
            const wasAdded = onAddMetadataRow(metadataRow);

            if (wasAdded) {
                setMetadataRow({
                    metadataKey: '',
                    metadataValue: getStartValFromType(currType),
                });
                setIsValid(true);
            } else {
                setIsValid(false);
            }
        }
    };

    const handleMetadataKeyChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setIsValid(true);
        setMetadataRow((prevVal) => {
            return {
                ...prevVal,
                metadataKey: event.target.value,
            };
        });
    };

    const handleMetadataValueChange = (newVal: boolean | string | number) => {
        setMetadataRow((prevVal) => {
            return {
                ...prevVal,
                metadataValue: newVal,
            };
        });
    };

    return (
        <Box sx={EditMetadataRowStyles.tableRow}>
            {showToggleType && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: showMetadataValueInput ? '' : 'flex-end',
                    }}
                >
                    <ToggleType
                        type={currType}
                        onToggle={handleToggle}
                        allowNoneType={allowNoneOption}
                    />
                </Box>
            )}
            <Box
                sx={[
                    EditMetadataRowStyles.tableCell,
                    EditMetadataRowStyles.key,
                    { verticalAlign: 'baseline' },
                ]}
            >
                <TextField
                    size="small"
                    sx={EditMetadataRowStyles.addMetadataTextfield}
                    onChange={handleMetadataKeyChange}
                    variant="outlined"
                    placeholder={keyPlaceholderText || 'New metadata key'}
                    fullWidth
                    helperText={!isValid ? errorMessage || 'All metadata keys must be unique' : ''}
                    error={!isValid}
                    value={metadataRow.metadataKey}
                />
                {/* This component is added so that the error message doesn't mess up the row alignment */}
                {/* {isValid && <Box sx={{ height: '22px' }}></Box>} */}
            </Box>
            {showMetadataValueInput && (
                <Box
                    sx={[
                        EditMetadataRowStyles.tableCell,
                        EditMetadataRowStyles.key,
                        { width: '100%' },
                    ]}
                >
                    <EditMetadataValue
                        placeholderText={valuePlaceholderText}
                        onEditMetadataValue={handleMetadataValueChange}
                        value={metadataRow.metadataValue}
                        type={currType}
                    />
                    {/* This component is added so that the error message doesn't mess up the row alignment */}
                    {/* <Box sx={{ height: '22px' }}></Box> */}
                </Box>
            )}
            <Box sx={EditMetadataRowStyles.tableCell}>
                <Button
                    sx={EditMetadataRowStyles.updateButton}
                    disabled={!(metadataRow.metadataKey.length > 0)}
                    onClick={handleAdd}
                    variant="contained"
                    color="primary"
                >
                    ADD
                </Button>
                {/* This component is added so that the error message doesn't mess up the row alignment */}
                {/* <Box sx={{ height: '22px' }}></Box> */}
            </Box>
        </Box>
    );
};

export default AddMetadataRow;
