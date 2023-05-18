import { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { AxiosResponse } from 'axios';
import {
    IExtractionMetadata,
    INeurosynthProjectReturn,
    IPRISMAConfig,
    ISource,
    ITag,
} from 'hooks/requests/useGetProjects';
import API from 'utils/api';
import { create } from 'zustand';
import {
    addNewStubsHelper,
    handleDragEndHelper,
    initCurationHelper,
    updateStubFieldHelper,
    promoteStubHelper,
    addTagToStubHelper,
    createNewExclusionHelper,
    removeTagFromStubHelper,
    setExclusionForStubHelper,
    apiDebouncedUpdaterImplMiddleware,
    addOrUpdateStudyListStatusHelper,
    deleteStubHelper,
    setGivenStudyStatusesAsCompleteHelper,
} from './ProjectStore.helpers';
import { persist } from 'zustand/middleware';
import { ICurationColumn } from 'components/CurationComponents/CurationColumn/CurationColumn';
import { ICurationStubStudy } from 'components/CurationComponents/CurationStubStudy/CurationStubStudyDraggableContainer';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export type ProjectStoreMetadata = {
    metadata: {
        shouldUpdate: boolean; // this flag is for the debouncer
    };
};

export type ProjectStoreActions = {
    updateProjectName: (name: string) => void;
    updateProjectDescription: (description: string) => void;
    initProjectStore: (projectId: string | undefined) => void;
    clearProjectStore: () => void;
    initCuration: (cols: string[], isPrisma: boolean) => void;
    handleDrag: (result: DropResult, provided: ResponderProvided) => void;
    createNewExclusion: (
        newExclusion: ITag,
        arg: keyof Omit<IPRISMAConfig, 'isPrisma'> | undefined
    ) => void;
    createNewInfoTag: (newTag: ITag) => void;
    createNewIdentificationSource: (newSource: ISource) => void;
    addNewStubs: (stubs: ICurationStubStudy[]) => void;
    updateCurationColumns: (columns: ICurationColumn[]) => void;
    clearProvenance: () => void;
    updateStubField: (
        columnIndex: number,
        stubId: string,
        field: keyof ICurationStubStudy,
        updatedValue: string | number | ISource
    ) => void;
    addTagToStub: (columnIndex: number, stubId: string, newTag: ITag) => void;
    removeTagFromStub: (columnIndex: number, stubId: string, tagId: string) => void;
    setExclusionForStub: (columnIndex: number, stubId: string, exclusion: ITag | null) => void;
    promoteStub: (columnIndex: number, stubId: string) => void;
    updateExtractionMetadata: (metadata: Partial<IExtractionMetadata>) => void;
    addOrUpdateStudyListStatus: (id: string, status: 'COMPLETE' | 'SAVEFORLATER') => void;
    setGivenStudyStatusesAsComplete: (studyIdList: string[]) => void;
    deleteStub: (columnIndex: number, stubId: string) => void;
    allowEditMetaAnalyses: () => void;
};

const useProjectStore = create<
    INeurosynthProjectReturn & ProjectStoreActions & ProjectStoreMetadata
>()(
    apiDebouncedUpdaterImplMiddleware(
        persist(
            (set) => {
                return {
                    // project
                    name: '',
                    id: undefined,
                    meta_analyses: [],
                    description: '',
                    provenance: {
                        curationMetadata: {
                            columns: [],
                            prismaConfig: {
                                isPrisma: false,
                                identification: {
                                    exclusionTags: [],
                                },
                                screening: {
                                    exclusionTags: [],
                                },
                                eligibility: {
                                    exclusionTags: [],
                                },
                            },
                            infoTags: [],
                            exclusionTags: [],
                            identificationSources: [],
                        },
                        extractionMetadata: {
                            studysetId: undefined,
                            annotationId: undefined,
                            studyStatusList: [],
                        },
                        metaAnalysisMetadata: {
                            canEditMetaAnalyses: false,
                        },
                    },

                    metadata: {
                        shouldUpdate: false,
                    },

                    // just for testing purposes
                    clearProvenance: async () => {
                        const emptyProvenance = {
                            curationMetadata: {
                                columns: [],
                                prismaConfig: {
                                    isPrisma: false,
                                    identification: {
                                        exclusionTags: [],
                                    },
                                    screening: {
                                        exclusionTags: [],
                                    },
                                    eligibility: {
                                        exclusionTags: [],
                                    },
                                },
                                infoTags: [],
                                exclusionTags: [],
                                identificationSources: [],
                            },
                            extractionMetadata: {
                                studysetId: undefined,
                                annotationId: undefined,
                                studyStatusList: [],
                            },
                            metaAnalysisMetadata: {
                                canEditMetaAnalyses: false,
                            },
                        };
                        const id = useProjectStore.getState().id;

                        await API.NeurosynthServices.ProjectsService.projectsIdPut(id || '', {
                            provenance: emptyProvenance,
                        });
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...emptyProvenance,
                            },
                        }));
                    },
                    initProjectStore: async (projectId?: string) => {
                        if (!projectId) return;

                        const currId = useProjectStore.getState().id;
                        if (currId !== projectId) {
                            const res = (await API.NeurosynthServices.ProjectsService.projectsIdGet(
                                projectId
                            )) as AxiosResponse<INeurosynthProjectReturn>;
                            set((state) => ({
                                ...state,
                                ...res.data,
                                metadata: {
                                    ...state.metadata,
                                    shouldUpdate: true,
                                },
                            }));
                        }
                    },
                    clearProjectStore: () => {
                        set((state) => ({
                            name: '',
                            id: undefined,
                            meta_analyses: [],
                            description: '',
                            provenance: {
                                curationMetadata: {
                                    columns: [],
                                    prismaConfig: {
                                        isPrisma: false,
                                        identification: {
                                            exclusionTags: [],
                                        },
                                        screening: {
                                            exclusionTags: [],
                                        },
                                        eligibility: {
                                            exclusionTags: [],
                                        },
                                    },
                                    infoTags: [],
                                    exclusionTags: [],
                                    identificationSources: [],
                                },
                                extractionMetadata: {
                                    studysetId: undefined,
                                    annotationId: undefined,
                                    studyStatusList: [],
                                },
                                metaAnalysisMetadata: {
                                    canEditMetaAnalyses: false,
                                },
                            },
                            metadata: {
                                shouldUpdate: false,
                            },
                        }));
                    },
                    initCuration: (cols: string[], isPrisma: boolean) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    ...initCurationHelper(cols, isPrisma),
                                },
                            },
                            metadata: {
                                ...state.metadata,
                                shouldUpdate: true,
                            },
                        }));
                    },
                    updateProjectName: (name: string) => {
                        set((state) => ({
                            ...state,
                            name: name,
                        }));
                    },
                    updateProjectDescription: (description: string) => {
                        set((state) => ({
                            ...state,
                            description: description,
                        }));
                    },
                    allowEditMetaAnalyses: () => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                metaAnalysisMetadata: {
                                    ...state.provenance.metaAnalysisMetadata,
                                    canEditMetaAnalyses: true,
                                },
                            },
                        }));
                    },
                    handleDrag: (result, provided) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: handleDragEndHelper(
                                        state.provenance.curationMetadata.columns,
                                        result,
                                        provided
                                    ),
                                },
                            },
                        }));
                    },
                    createNewExclusion: (newExclusion, phase) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...createNewExclusionHelper(
                                        state.provenance.curationMetadata,
                                        newExclusion,
                                        phase
                                    ),
                                },
                            },
                        }));
                    },
                    createNewInfoTag: (newTag: ITag) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    infoTags: [
                                        ...state.provenance.curationMetadata.infoTags,
                                        { ...newTag },
                                    ],
                                },
                            },
                        }));
                    },
                    addTagToStub: (columnIndex, stubId, newTag) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: addTagToStubHelper(
                                        state.provenance.curationMetadata.columns,
                                        columnIndex,
                                        stubId,
                                        newTag
                                    ),
                                },
                            },
                        }));
                    },
                    createNewIdentificationSource: (newSource: ISource) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    identificationSources: [
                                        ...state.provenance.curationMetadata.identificationSources,
                                        { ...newSource },
                                    ],
                                },
                            },
                        }));
                    },
                    addNewStubs: (stubs) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: addNewStubsHelper(
                                        state.provenance.curationMetadata.columns,
                                        stubs
                                    ),
                                },
                            },
                        }));
                    },
                    deleteStub: (columnIndex, stubId) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: deleteStubHelper(
                                        state.provenance.curationMetadata.columns,
                                        columnIndex,
                                        stubId
                                    ),
                                },
                            },
                        }));
                    },
                    updateCurationColumns(columns) {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: columns,
                                },
                            },
                        }));
                    },
                    updateStubField: (columnIndex, stubId, field, value) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: updateStubFieldHelper(
                                        state.provenance.curationMetadata.columns,
                                        columnIndex,
                                        stubId,
                                        field,
                                        value
                                    ),
                                },
                            },
                        }));
                    },
                    removeTagFromStub: (columnIndex, stubId, tagId) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: removeTagFromStubHelper(
                                        state.provenance.curationMetadata.columns,
                                        columnIndex,
                                        stubId,
                                        tagId
                                    ),
                                },
                            },
                        }));
                    },
                    setExclusionForStub: (columnIndex, stubId, exclusion) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: setExclusionForStubHelper(
                                        state.provenance.curationMetadata.columns,
                                        columnIndex,
                                        stubId,
                                        exclusion
                                    ),
                                },
                            },
                        }));
                    },
                    promoteStub: (columnIndex, stubId) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                curationMetadata: {
                                    ...state.provenance.curationMetadata,
                                    columns: promoteStubHelper(
                                        state.provenance.curationMetadata.columns,
                                        columnIndex,
                                        stubId
                                    ),
                                },
                            },
                        }));
                    },
                    updateExtractionMetadata: (metadata) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                extractionMetadata: {
                                    ...state.provenance.extractionMetadata,
                                    ...metadata,
                                },
                            },
                        }));
                    },
                    addOrUpdateStudyListStatus: (id, status) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                extractionMetadata: {
                                    ...state.provenance.extractionMetadata,
                                    studyStatusList: [
                                        ...addOrUpdateStudyListStatusHelper(
                                            state.provenance.extractionMetadata.studyStatusList,
                                            id,
                                            status
                                        ),
                                    ],
                                },
                            },
                        }));
                    },
                    setGivenStudyStatusesAsComplete: (studyIdList: string[]) => {
                        set((state) => ({
                            ...state,
                            provenance: {
                                ...state.provenance,
                                extractionMetadata: {
                                    ...state.provenance.extractionMetadata,
                                    studyStatusList: [
                                        ...setGivenStudyStatusesAsCompleteHelper(studyIdList),
                                    ],
                                },
                            },
                        }));
                    },
                };
            },
            {
                name: 'neurosynth-project',
            }
        ),
        'neurosynth-store'
    )
);

// higher level project retrieval hooks
export const useProjectName = () => useProjectStore((state) => state.name);
export const useProjectDescription = () => useProjectStore((state) => state.description);
export const useProjectProvenance = () => useProjectStore((state) => state.provenance);

// curation retrieval hooks
export const useProjectCurationColumns = () =>
    useProjectStore((state) => state.provenance.curationMetadata.columns);
export const useProjectCurationIsLastColumn = (columnIndex: number) =>
    useProjectStore((state) => state.provenance.curationMetadata.columns.length <= columnIndex + 1);
export const useProjectNumCurationColumns = () =>
    useProjectStore((state) => state.provenance.curationMetadata.columns.length);
export const useProjectCurationColumn = (columnIndex: number) =>
    useProjectStore((state) => state.provenance.curationMetadata.columns[columnIndex]);
export const useProjectCurationSources = () =>
    useProjectStore((state) => state.provenance.curationMetadata.identificationSources);
export const useProjectExtractionMetadata = () =>
    useProjectStore((state) => state.provenance.extractionMetadata);
export const useProjectId = () => useProjectStore((state) => state.id);
export const useProjectCurationIsPrisma = () =>
    useProjectStore((state) => state.provenance.curationMetadata.prismaConfig.isPrisma);
export const useProjectCurationPrismaConfig = () =>
    useProjectStore((state) => state.provenance.curationMetadata.prismaConfig);
export const useProjectCurationInfoTags = () =>
    useProjectStore((state) => state.provenance.curationMetadata.infoTags);
export const useProjectCurationExclusionTags = () =>
    useProjectStore((state) => state.provenance.curationMetadata.exclusionTags);

// curation updater hooks
export const useUpdateProjectName = () => useProjectStore((state) => state.updateProjectName);
export const useUpdateProjectDescription = () =>
    useProjectStore((state) => state.updateProjectDescription);
export const useInitProjectStore = () => useProjectStore((state) => state.initProjectStore);
export const useClearProjectStore = () => useProjectStore((state) => state.clearProjectStore);
export const useClearProvenance = () => useProjectStore((state) => state.clearProvenance);
export const useHandleCurationDrag = () => useProjectStore((state) => state.handleDrag);
export const useCreateNewCurationInfoTag = () => useProjectStore((state) => state.createNewInfoTag);
export const useUpdateCurationColumns = () =>
    useProjectStore((state) => state.updateCurationColumns);
export const useAddNewCurationStubs = () => useProjectStore((state) => state.addNewStubs);
export const useInitCuration = () => useProjectStore((state) => state.initCuration);
export const useUpdateStubField = () => useProjectStore((state) => state.updateStubField);
export const usePromoteStub = () => useProjectStore((state) => state.promoteStub);
export const useCreateCurationSource = () =>
    useProjectStore((state) => state.createNewIdentificationSource);
export const useAddTagToStub = () => useProjectStore((state) => state.addTagToStub);
export const useRemoveTagFromStub = () => useProjectStore((state) => state.removeTagFromStub);
export const useSetExclusionFromStub = () => useProjectStore((state) => state.setExclusionForStub);
export const useCreateNewExclusion = () => useProjectStore((state) => state.createNewExclusion);
export const useDeleteStub = () => useProjectStore((state) => state.deleteStub);
export const useInitProjectStoreIfRequired = () => {
    const clearStudyStore = useClearProjectStore();
    const initStudyStore = useInitProjectStore();

    const { projectId } = useParams<{ projectId: string; studyId: string }>();
    const projectIdFromProject = useProjectId();

    useEffect(() => {
        if (projectId !== projectIdFromProject) {
            clearStudyStore();
            initStudyStore(projectId);
        }
    }, [clearStudyStore, initStudyStore, projectId, projectIdFromProject]);
};

// extraction updater hooks
export const useUpdateExtractionMetadata = () =>
    useProjectStore((state) => state.updateExtractionMetadata);

// extraction retrieval hooks
export const useProjectExtractionStudysetId = () =>
    useProjectStore((state) => state.provenance.extractionMetadata.studysetId);
export const useProjectExtractionAnnotationId = () =>
    useProjectStore((state) => state.provenance.extractionMetadata.annotationId);
export const useProjectExtractionStudyStatusList = () =>
    useProjectStore((state) => state.provenance.extractionMetadata.studyStatusList);
export const useProjectExtractionStudyStatus = (studyId: string) =>
    useProjectStore((state) =>
        state.provenance.extractionMetadata.studyStatusList.find((x) => x.id === studyId)
    );
export const useProjectExtractionAddOrUpdateStudyListStatus = () =>
    useProjectStore((state) => state.addOrUpdateStudyListStatus);
export const useProjectExtractionSetGivenStudyStatusesAsComplete = () =>
    useProjectStore((state) => state.setGivenStudyStatusesAsComplete);

// metaAnalysisAlgorithm updater hooks
export const useAllowEditMetaAnalyses = () =>
    useProjectStore((state) => state.allowEditMetaAnalyses);

// metaAnalysisAlgorithm retrieval hooks
export const useProjectMetaAnalysisCanEdit = () =>
    useProjectStore((state) => state?.provenance?.metaAnalysisMetadata?.canEditMetaAnalyses);