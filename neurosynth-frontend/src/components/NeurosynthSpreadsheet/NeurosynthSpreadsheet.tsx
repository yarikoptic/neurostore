import { Box } from '@mui/system';
import { EPropertyType } from '..';
import { Paper } from '@mui/material';
import React, { useLayoutEffect, useRef, useState } from 'react';
import HotTable from '@handsontable/react';
import { CellProperties, GridSettings } from 'handsontable/settings';
import DeleteIcon from '@mui/icons-material/Delete';
import { renderToString } from 'react-dom/server';
import CellCoords from 'handsontable/3rdparty/walkontable/src/cell/coords';
import styles from './NeurosynthSpreadsheet.module.css';
import { numericValidator } from 'handsontable/validators';
import { CellChange, CellValue } from 'handsontable/common';
import { textRenderer, numericRenderer } from 'handsontable/renderers';
import Core from 'handsontable/core';
import { getType } from '../EditMetadata/EditMetadata';

export interface INeurosynthCell {
    value: string;
    type: EPropertyType;
}

export const isSpreadsheetBoolType = (value: any): boolean => {
    return (
        value === 't' ||
        value === 'f' ||
        value === 'true' ||
        value === true ||
        value === false ||
        value === 'false' ||
        value === '' || // case where user presses enter after deleting cell contents
        value === null // case where user deletes the cell
    );
};

export interface INeurosynthSpreadsheetData {
    rowHeaderValues: string[];
    columnHeaderValues: INeurosynthCell[];
    data: (string | number | boolean | null)[][];
    onColumnDelete: (colDeleted: number) => void;
    onCellUpdates: (changes: CellChange[]) => void;
}

const NeurosynthSpreadsheet: React.FC<INeurosynthSpreadsheetData> = (props) => {
    const HOT_LICENSE_KEY = 'non-commercial-and-evaluation';
    const ROW_HEIGHTS = 25;

    const messageRef = useRef<HTMLElement>(null);
    const hotTableRef = useRef<HotTable>(null);
    const [messageHeight, setMessageHeight] = useState(0);

    const getValidator = (type: EPropertyType) => {
        switch (type) {
            case EPropertyType.NUMBER:
                return numericValidator;
            case EPropertyType.BOOLEAN:
                return (value: CellValue, callback: (valid: boolean) => void) => {
                    const isValid = isSpreadsheetBoolType(value);
                    return callback(isValid);
                };
            default:
                return undefined;
        }
    };

    const getRenderer = (type: EPropertyType) => {
        switch (type) {
            case EPropertyType.NUMBER:
                return numericRenderer;
            case EPropertyType.NONE:
                return (
                    instance: Core,
                    td: HTMLTableCellElement,
                    row: number,
                    col: number,
                    prop: string | number,
                    value: any,
                    cellProperties: CellProperties
                ) => {
                    td.innerHTML = 'null';
                };
            default:
                return textRenderer;
        }
    };

    const getTransformedValue = (type: EPropertyType, value: any) => {
        switch (type) {
            case EPropertyType.BOOLEAN:
                if (value === 't' || value === 'true') {
                    return true;
                }
                if (value === 'f' || value === 'false' || value === null || value === '') {
                    return false;
                }
                return value;
            case EPropertyType.NUMBER:
                if (value === null) {
                    return 0;
                }
                return value;
            case EPropertyType.STRING:
                if (value === null) {
                    return '';
                }
                return value;
            default:
                return value;
        }
    };

    useLayoutEffect(() => {
        setMessageHeight(messageRef.current?.offsetHeight || 0);
    }, [messageRef, props.columnHeaderValues]);

    const handleOnHeaderClick = (
        event: MouseEvent,
        coords: CellCoords,
        TD: HTMLTableCellElement
    ) => {
        const target = event.target as HTMLButtonElement;
        if (target.tagName === 'svg' || target.tagName === 'path') props.onColumnDelete(coords.col);
    };

    const handleSetData = (changes: CellChange[]) => {
        props.onCellUpdates(changes);
    };

    const hotSettings: GridSettings = {
        data: props.data,
        licenseKey: HOT_LICENSE_KEY,
        rowHeaders: props.rowHeaderValues,
        rowHeaderWidth: 150,
        afterSetDataAtCell: handleSetData,
        autoRowSize: true,
        afterChange: (changes: CellChange[] | null) => {
            if (changes && hotTableRef.current && hotTableRef.current.hotInstance) {
                const updatedChanges: [number, number, any][] = [];

                for (let i = 0; i < changes.length; i++) {
                    const change = changes[i];

                    const oldValue = change[2];
                    const newValue = change[3];

                    if (
                        newValue === null ||
                        (getType(oldValue) === EPropertyType.BOOLEAN && // this case exists because
                            isSpreadsheetBoolType(newValue)) // we need to convert accepted values to booleans
                    ) {
                        updatedChanges.push([
                            change[0],
                            change[1] as number,
                            getTransformedValue(getType(oldValue), newValue),
                        ]);
                    }
                }

                if (updatedChanges.length > 0)
                    hotTableRef.current.hotInstance.setDataAtCell(updatedChanges);
            }
        },
        rowHeights: ROW_HEIGHTS,
        columns: props.columnHeaderValues.map((col) => {
            return {
                copyable: false,
                readOnly: col.type === EPropertyType.NONE,
                type: col.type === EPropertyType.NUMBER ? 'numeric' : 'text',
                className: styles[col.type],
                allowInvalid: false,
                validator: getValidator(col.type),
                renderer: getRenderer(col.type),
            };
        }),
        afterOnCellMouseDown: handleOnHeaderClick,
        afterGetColHeader: (column: number, TH: HTMLElement) => {
            const isBoolType = TH.querySelector(`.${styles['boolean']}`);

            if (TH && isBoolType) {
                TH.setAttribute(
                    'title',
                    'valid boolean entries include "t" or "true" for true and "f" or "false" for false.'
                );
            }
        },
        colHeaders: props.columnHeaderValues.map((col) => {
            const deleteIconStr = renderToString(<DeleteIcon className={styles['delete-icon']} />);
            return `
                <div class="${styles['column-header']}"
                >
                    <span class="${styles[col.type]}"><b>${col.value}</b></span>
                    ${deleteIconStr}
                </div>
            `;
        }),

        contextMenu: false,
    };

    const getSpreadsheetContainerHeight = (): string => {
        const extraHeaderHeight = 5;
        return `${
            (props.rowHeaderValues.length + 1) * ROW_HEIGHTS + messageHeight + extraHeaderHeight
        }px`;
    };

    return (
        <>
            <Box
                component={Paper}
                sx={{
                    paddingLeft: '10px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    height: getSpreadsheetContainerHeight(),
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                {props.columnHeaderValues.length === 0 && (
                    <Box ref={messageRef} sx={{ color: 'warning.dark', padding: '1rem 0' }}>
                        There are no notes for this annotation
                    </Box>
                )}
                <HotTable ref={hotTableRef} settings={hotSettings} />
            </Box>
        </>
    );
};

export default NeurosynthSpreadsheet;
