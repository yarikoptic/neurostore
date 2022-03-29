import { AnalysisApiResponse, ConditionApiResponse, PointsApiResponse } from '../../../utils/api';

export enum EAnalysisEdit {
    ALL = 'all',
    DETAILS = 'details',
    CONDITIONS = 'conditions',
    POINTS = 'points',
    IMAGES = 'images',
}

export enum EAnalysisEditButtonType {
    UPDATE = 'update',
    CANCEL = 'cancel',
    DELETE = 'delete',
}

export interface IEditAnalysisDetailsFn {
    (field: 'name' | 'description', value: string): void;
}

export interface IEditAnalysisConditionsFn {
    (newConditions: ConditionApiResponse[], newWeights: number[]): void;
}

export interface IOnButtonPressFn {
    (editor: EAnalysisEdit, buttonType: EAnalysisEditButtonType): void;
}

export interface IDeleteAnalysisFn {
    (idToDelete: string): void;
}

// TODO: add images and points if necessary
export interface IUpdateState {
    details: {
        name: boolean;
        description: boolean;
    };
    conditions: boolean;
}

export interface IEditAnalyses {
    analyses: AnalysisApiResponse[] | undefined;
    onEditAnalysisPoints: (points: PointsApiResponse[]) => void;
    onEditAnalysisImages: () => void;
    onEditAnalysisDetails: (
        idToUpdate: string,
        field: 'name' | 'description',
        value: string
    ) => void;
    onUpdateAnalysis: (analysisId: string, analysis: AnalysisApiResponse) => void;
}

export interface IEditAnalysis {
    updateState: IUpdateState;
    analysis: AnalysisApiResponse | undefined;
    onEditAnalysisPoints: (points: PointsApiResponse[]) => void;
    onEditAnalysisDetails: IEditAnalysisDetailsFn;
    onEditAnalysisConditions: IEditAnalysisConditionsFn;
    onEditAnalysisButtonPress: IOnButtonPressFn;
}

export interface IEditAnalysisDetails {
    name: string;
    description: string;
    updateEnabled: {
        name: boolean;
        description: boolean;
    };
    onEditAnalysisDetails: IEditAnalysisDetailsFn;
    onEditAnalysisButtonPress: IOnButtonPressFn;
}

export interface IEditAnalysisPoints {
    onAddPoint: (arg: { x: number; y: number; z: number }) => void;
    onRemovePoint: (pointId: string) => void;
    onUpdatePoint: (pointId: string, update: { x: number; y: number; z: number }) => void;
    points: PointsApiResponse[] | undefined;
}

export interface IEditAnalysisConditions {
    conditions: ConditionApiResponse[] | undefined;
    weights: number[] | undefined;
    updateEnabled: boolean;
    onConditionWeightChange: IEditAnalysisConditionsFn;
    onEditAnalysisButtonPress: IOnButtonPressFn;
}
