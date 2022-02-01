/**
 * file that handles edit metadata models and enums
 */

export interface IEditMetadataModel {
    metadata: IMetadataRowModel[];
    onMetadataRowEdit: (update: IMetadataRowModel) => void;
    onMetadataRowDelete: (update: IMetadataRowModel) => void;
    onMetadataRowAdd: (update: IMetadataRowModel) => boolean;
}

export interface IAddMetadataRowModel {
    allowNoneOption?: boolean;
    errorMessage?: string;
    keyPlaceholderText?: string;
    valuePlaceholderText?: string;
    onAddMetadataRow: (row: IMetadataRowModel) => boolean;
}

export interface IEditMetadataRowModel {
    metadataValueType: EPropertyType;
    metadataRow: IMetadataRowModel;
    onMetadataRowEdit: (metadataRow: IMetadataRowModel) => void;
    onMetadataRowDelete: (metadataRow: IMetadataRowModel) => void;
}

export interface IEditMetadataValue {
    onEditMetadataValue: (newValue: string | number | boolean) => void;
    placeholderText?: string;
    type: EPropertyType;
    value: string | number | boolean;
}

export interface IToggleTypeModel {
    onToggle: (type: EPropertyType) => void;
    allowNoneType?: boolean;
    type: EPropertyType;
}

export interface IMetadataRowModel {
    metadataKey: string;
    metadataValue: any;
}

export enum EPropertyType {
    NONE = 'none',
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
}
