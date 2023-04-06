import { useProjectExtractionAnnotationId } from 'pages/Projects/ProjectPage/ProjectStore';
import { Box } from '@mui/material';
import { useGetAnnotationById, useUpdateAnnotationById } from 'hooks';
import AnnotationsHotTable from './AnnotationsHotTable/AnnotationsHotTable';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    AnnotationNoteValue,
    NoteKeyType,
    annotationNotesToHotData,
    hotDataToAnnotationNotes,
    noteKeyArrToObj,
    noteKeyObjToArr,
} from './helpers/utils';
import { NoteCollectionReturn } from 'neurostore-typescript-sdk';
import StateHandlerComponent from 'components/StateHandlerComponent/StateHandlerComponent';
import LoadingButton from 'components/Buttons/LoadingButton/LoadingButton';
import { ColumnSettings } from 'handsontable/settings';
import { DetailedSettings as MergeCellsSettings } from 'handsontable/plugins/mergeCells';

const EditAnnotations: React.FC = (props) => {
    const annotationId = useProjectExtractionAnnotationId();
    const { mutate, isLoading: updateAnnotationIsLoading } = useUpdateAnnotationById(annotationId);
    const { data, isLoading: getAnnotationIsLoading, isError } = useGetAnnotationById(annotationId);

    // tracks the changes made to hot table
    const hotTableDataUpdatesRef = useRef<{
        hotData: (string | number | boolean | null)[][];
        noteKeys: NoteKeyType[];
    }>({
        hotData: [],
        noteKeys: [],
    });
    const [annotationIsEdited, setAnnotationIsEdited] = useState(false);
    const [initialAnnotationHotState, setInitialAnnotationHotState] = useState<{
        hotDataToStudyMapping: Map<number, { studyId: string; analysisId: string }>;
        noteKeys: NoteKeyType[];

        initialHotData: AnnotationNoteValue[][];
        initialHotColumns: ColumnSettings[];
        intialHotColumnHeaders: string[];
        initialMergeCells: MergeCellsSettings[];
    }>({
        hotDataToStudyMapping: new Map<number, { studyId: string; analysisId: string }>(),
        noteKeys: [],

        initialHotData: [],
        initialHotColumns: [],
        intialHotColumnHeaders: [],
        initialMergeCells: [],
    });

    useEffect(() => {
        if (data) {
            const noteKeys = noteKeyObjToArr(data.note_keys);
            const { hotData, hotDataToStudyMapping } = annotationNotesToHotData(
                noteKeys,
                data.notes as NoteCollectionReturn[] | undefined
            );

            setInitialAnnotationHotState({
                hotDataToStudyMapping,
                noteKeys,
                initialHotColumns: createColumns(noteKeys),
            });
        }
    }, [data]);

    useEffect(() => {
        setInitialHotState((state) => {
            const mergeCells: MergeCellsSettings[] = [];

            let studyId: string;
            let mergeCellObj: MergeCellsSettings = {
                row: 0,
                col: 0,
                rowspan: 1,
                colspan: 1,
            };
            hotDataToStudyMapping.forEach((value, key) => {
                if (value.studyId === studyId) {
                    mergeCellObj.rowspan++;
                    if (key === hotDataToStudyMapping.size - 1 && mergeCellObj.rowspan > 1) {
                        mergeCells.push(mergeCellObj);
                    }
                } else {
                    if (mergeCellObj.rowspan > 1) mergeCells.push(mergeCellObj);
                    studyId = value.studyId;
                    mergeCellObj = {
                        row: key,
                        col: 0,
                        rowspan: 1,
                        colspan: 1,
                    };
                }
            });

            return {
                initialHotData: JSON.parse(JSON.stringify(hotData)),
                initialHotColumns: createColumns(initialNoteKeys),
                initialMergeCells: mergeCells,
                intialHotColumnHeaders: [
                    'Study',
                    'Analysis',
                    ...initialNoteKeys.map((col) =>
                        createColumnHeader(
                            col.key,
                            col.type,
                            props.allowRemoveColumns ? handleRemoveHotColumn : undefined
                        )
                    ),
                ],
            };
        });
    }, [
        hotData,
        initialNoteKeys,
        hotDataToStudyMapping,
        handleRemoveHotColumn,
        props.allowRemoveColumns,
    ]);

    const handleClickSave = () => {
        if (!annotationId) return;

        const { hotData, noteKeys } = hotTableDataUpdatesRef.current;

        const updatedAnnotationNotes = hotDataToAnnotationNotes(
            hotData,
            initialAnnotationHotState.hotDataToStudyMapping,
            noteKeys
        );
        const updatedNoteKeyObj = noteKeyArrToObj(noteKeys);

        mutate(
            {
                argAnnotationId: annotationId,
                annotation: {
                    notes: updatedAnnotationNotes.map((annotationNote) => ({
                        note: annotationNote.note,
                        analysis: annotationNote.analysis,
                        study: annotationNote.study,
                    })),
                    note_keys: updatedNoteKeyObj,
                },
            },
            {
                onSuccess: () => {
                    setAnnotationIsEdited(false);
                },
            }
        );
    };

    const handleChange = useCallback(
        (hotData: AnnotationNoteValue[][], noteKeys: NoteKeyType[]) => {
            setAnnotationIsEdited(true);
            hotTableDataUpdatesRef.current = {
                hotData,
                noteKeys,
            };
        },
        []
    );

    return (
        <StateHandlerComponent isLoading={getAnnotationIsLoading} isError={isError}>
            <Box>
                <AnnotationsHotTable {...initialAnnotationHotState} onChange={handleChange} />
            </Box>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    zIndex: 999,
                    width: {
                        xs: '90%',
                        md: '80%',
                    },
                    padding: '1rem 0 1.5rem 0',
                    backgroundColor: 'white',
                    textAlign: 'end',
                }}
            >
                <LoadingButton
                    size="large"
                    text="save"
                    disabled={!annotationIsEdited}
                    isLoading={updateAnnotationIsLoading}
                    loaderColor="secondary"
                    color="primary"
                    variant="contained"
                    sx={{ width: '300px' }}
                    onClick={handleClickSave}
                />
            </Box>
        </StateHandlerComponent>
    );
};

export default EditAnnotations;
