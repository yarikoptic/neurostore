import {
    AnalysisRequest,
    AnalysisReturn,
    ConditionRequest,
    ConditionReturn,
    PointReturn,
    PointValue,
} from 'neurostore-typescript-sdk';

import { IMetadataRowModel } from 'components/EditMetadata';
import { StudyReturn } from 'neurostore-typescript-sdk';

export interface MapOrSpaceType {
    value: string;
    label: string;
}

export const DefaultMapTypes: {
    [key: string]: MapOrSpaceType;
} = {
    T: {
        value: 'T',
        label: 'T Map',
    },
    Z: {
        value: 'Z',
        label: 'Z Map',
    },
    F: {
        value: 'F',
        label: 'F Map',
    },
    X2: {
        value: 'X2',
        label: 'Chi Squared Map',
    },
    P: {
        value: 'P',
        label: 'P Map (given null hypothesis)',
    },
    IP: {
        value: 'IP',
        label: '1-P Map ("inverted" probability)',
    },
    M: {
        value: 'M',
        label: 'Multivariate-Beta Map',
    },
    U: {
        value: 'U',
        label: 'Univariate-Beta Map',
    },
    R: {
        value: 'R',
        label: 'ROI/Mask',
    },
    Pa: {
        value: 'Pa',
        label: 'Parcellation',
    },
    A: {
        value: 'A',
        label: 'Anatomical',
    },
    V: {
        value: 'V',
        label: 'Variance',
    },
    OTHER: {
        value: 'OTHER',
        label: 'Other',
    },
};

export const DefaultSpaceTypes: {
    [key: string]: MapOrSpaceType;
} = {
    MNI: {
        value: 'MNI',
        label: 'MNI',
    },
    TAL: {
        value: 'TAL',
        label: 'Talairach',
    },
    OTHER: {
        value: 'OTHER',
        label: 'Other',
    },
};

export interface IStorePoint extends Omit<PointReturn, 'space' | 'kind' | 'entities' | 'value'> {
    value: number | undefined | null;
    isNew: boolean;
}

export interface IStoreAnalysis extends Omit<AnalysisReturn, 'conditions' | 'points'> {
    isNew: boolean;
    conditions: IStoreCondition[];
    points: IStorePoint[];
    pointSpace: MapOrSpaceType | undefined;
    pointStatistic: MapOrSpaceType | undefined;
}

export interface IStoreCondition extends ConditionReturn {
    isNew: boolean;
}

export interface IStoreStudy extends Omit<StudyReturn, 'metadata' | 'analyses'> {
    metadata: IMetadataRowModel[];
    analyses: IStoreAnalysis[];
}

export type StudyDetails = Pick<
    StudyReturn,
    'name' | 'description' | 'publication' | 'authors' | 'doi' | 'pmid' | 'year'
>;

export const studyPointsToStorePoints = (
    points: PointReturn[]
): {
    analysisSpace: MapOrSpaceType | undefined;
    analysisMap: MapOrSpaceType | undefined;
    points: IStorePoint[];
} => {
    let analysisSpace: MapOrSpaceType | undefined;
    let analysisMap: MapOrSpaceType | undefined;
    const parsedPoints: IStorePoint[] = ((points || []) as Array<PointReturn>)
        .map(({ entities, space, subpeak, cluster_size, values, ...args }) => {
            const typedValues = values as Array<PointValue> | undefined;
            if (!analysisSpace && !!space) {
                analysisSpace = {
                    ...(DefaultSpaceTypes[space]
                        ? DefaultSpaceTypes[space]
                        : DefaultSpaceTypes.OTHER),
                };
            }

            if (!analysisMap && typedValues && typedValues.length > 0 && typedValues[0].kind) {
                const kind = typedValues[0].kind || '';
                analysisMap = {
                    ...(DefaultMapTypes[kind] ? DefaultMapTypes[kind] : DefaultMapTypes.OTHER),
                };
            }

            return {
                ...args,
                subpeak: subpeak === null ? undefined : subpeak,
                cluster_size: cluster_size === null ? undefined : cluster_size,
                value:
                    typedValues && typedValues[0] && typedValues.length > 0
                        ? typedValues[0].value === null // have to add this check instead of checking if falsy as the value could be 0
                            ? undefined
                            : typedValues[0].value
                        : undefined,
                x: (args.coordinates || [])[0],
                y: (args.coordinates || [])[1],
                z: (args.coordinates || [])[2],
                isNew: false,
            };
        })
        .sort((a, b) => {
            return (a.order as number) - (b.order as number);
        });

    return {
        points: parsedPoints,
        analysisMap,
        analysisSpace,
    };
};

export const studyAnalysesToStoreAnalyses = (analyses?: AnalysisReturn[]): IStoreAnalysis[] => {
    const studyAnalyses: IStoreAnalysis[] = (analyses || []).map((analysis) => {
        const { entities, ...analysisProps } = analysis;
        const parsedAnalysis = {
            ...analysisProps,
        };

        const parsedConditions: IStoreCondition[] = (
            (parsedAnalysis.conditions || []) as ConditionReturn[]
        ).map((condition) => ({
            ...condition,
            isNew: false,
        }));

        const { analysisMap, analysisSpace, points } = studyPointsToStorePoints(
            (analysis.points || []) as PointReturn[]
        );

        return {
            ...parsedAnalysis,
            pointSpace: analysisSpace,
            pointStatistic: analysisMap,
            conditions: parsedConditions,
            points: points,
            isNew: false,
        };
    });

    return (studyAnalyses || []).sort((a, b) => {
        return (a.name || '').localeCompare(b.name || '');

        // previously sorted by date: may want this again in the future
        // const dateA = Date.parse(a.created_at || '');
        // const dateB = Date.parse(b.created_at || '');
        // if (isNaN(dateA) || isNaN(dateB)) return 0;
        // return dateB - dateA;
    });
};

export const storeAnalysesToStudyAnalyses = (analyses?: IStoreAnalysis[]): AnalysisReturn[] => {
    // the backend API complains when we give an analysis ID that does not exist.
    // we therefore need to scrub the id from the analysis if it was newly created by us.
    // we also need to remove the readonly attributes and any attributes we added
    const updatedAnalyses: AnalysisRequest[] = (analyses || []).map(
        ({
            isNew,
            updated_at,
            created_at,
            user,
            conditions,
            points,
            pointSpace,
            pointStatistic,
            ...analysisArgs
        }) => {
            const scrubbedConditions: ConditionRequest[] = conditions.map(
                ({ isNew, updated_at, created_at, user, ...args }) => ({
                    ...args,
                    id: isNew ? undefined : args.id, // if the condition was created by us in the FE, make undefined so the BE gives it an ID
                })
            );

            const scrubbedPoints: any[] = points.map(
                (
                    { isNew, created_at, updated_at, user, coordinates, value, ...pointArgs },
                    index
                ) => ({
                    ...pointArgs,
                    values: [
                        {
                            value: value,
                            kind: pointStatistic?.value,
                        },
                    ],
                    space: pointSpace?.value,
                    id: isNew ? undefined : pointArgs.id, // if the point was created by us in the FE, make undefined so the BE gives it an ID
                    order: index,
                })
            );
            return {
                ...analysisArgs,
                conditions: scrubbedConditions,
                points: scrubbedPoints,
                id: isNew ? undefined : analysisArgs.id,
            };
        }
    );

    return updatedAnalyses;
};
