import { Box, Chip, Link, Typography } from '@mui/material';
import LoadingButton from 'components/Buttons/LoadingButton/LoadingButton';
import { ENavigationButton } from 'components/Buttons/NavigationButtons/NavigationButtons';
import { EPropertyType, IMetadataRowModel } from 'components/EditMetadata';
import AddMetadataRow from 'components/EditMetadata/EditMetadataRow/AddMetadataRow';
import { useCreateAnnotation } from 'hooks';
import {
    useProjectExtractionStudysetId,
    useUpdateExtractionMetadata,
} from 'pages/Projects/ProjectPage/ProjectStore';
import { useState } from 'react';

const MoveToExtractionCreateAnnotation: React.FC<{
    onNavigate: (button: ENavigationButton) => void;
}> = (props) => {
    const { mutateAsync: createAnnotation, isLoading: createAnnotationIsLoading } =
        useCreateAnnotation();
    const updateExtractionMetadata = useUpdateExtractionMetadata();
    const studysetId = useProjectExtractionStudysetId();

    const [annotationColumns, setAnnotationColumns] = useState<
        {
            type: EPropertyType;
            value: string;
        }[]
    >([
        {
            type: EPropertyType.BOOLEAN,
            value: 'included',
        },
    ]);

    const handleCreateAnnotation = async () => {
        const noteKeys = annotationColumns.reduce((acc, curr) => {
            acc[curr.value] = curr.type;
            return acc;
        }, {} as { [key: string]: EPropertyType });

        const newAnnotation = await createAnnotation({
            source: 'neurosynth',
            sourceId: undefined,
            annotation: {
                name: `Annotation for studyset ${studysetId}`,
                description: '',
                note_keys: noteKeys,
                studyset: studysetId,
            },
        });

        const newAnnotationId = newAnnotation.data.id;
        if (!newAnnotationId) throw new Error('expected an annotation id but did not receive one');

        updateExtractionMetadata({
            annotationId: newAnnotationId,
        });

        props.onNavigate(ENavigationButton.NEXT);
    };

    const handleAddAnnotationColumn = (row: IMetadataRowModel) => {
        if (annotationColumns.findIndex((x) => x.value === row.metadataKey) >= 0) return false;

        setAnnotationColumns((state) => [
            {
                type: typeof row.metadataValue as EPropertyType,
                value: row.metadataKey,
            },
            ...state,
        ]);

        return true;
    };

    const handleRemoveColumn = (annotationCol: { type: EPropertyType; value: string }) => {
        setAnnotationColumns((state) => [...state.filter((x) => x.value !== annotationCol.value)]);
    };

    return (
        <Box>
            <Typography gutterBottom>
                Your studyset has been created - let's specify your{' '}
                <Link
                    underline="hover"
                    target="_blank"
                    href="https://neurostuff.github.io/neurostore/"
                >
                    annotations.
                </Link>
            </Typography>
            <Typography gutterBottom>
                An annotation allows you to attach data to{' '}
                <Link
                    underline="hover"
                    target="_blank"
                    href="https://neurostuff.github.io/neurostore/"
                >
                    analyses
                </Link>{' '}
                within your study. Any data that will meaningfully separate analyses into categories
                of interest should be included in annotations.
            </Typography>
            <Typography gutterBottom sx={{ fontWeight: 'bold' }}>
                Annotations will be used to include or exclude studies from a meta-analysis when you
                have reached the select phase.
            </Typography>
            <Typography gutterBottom>
                To get started specifying your annotations, enter the keys that you would like to
                add to annotate.
            </Typography>
            <Typography>
                All keys and values can be modified, added, and removed later. By default, an
                "included" key will be added.
            </Typography>

            <Box
                sx={{
                    display: 'table',
                    height: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '8px 0px',
                    margin: '1rem 0',
                }}
            >
                <AddMetadataRow
                    valuePlaceholderText=""
                    showMetadataValueInput={false}
                    allowNoneOption={false}
                    onAddMetadataRow={handleAddAnnotationColumn}
                />
            </Box>
            <Box sx={{ display: 'flex' }}>
                {annotationColumns.map((col) => (
                    <Chip
                        key={col.value}
                        onDelete={
                            col.value === 'included' ? undefined : () => handleRemoveColumn(col)
                        }
                        sx={{ margin: '4px' }}
                        label={`${col.value}: ${col.type}`}
                        color={
                            col.type === EPropertyType.BOOLEAN
                                ? 'success'
                                : col.type === EPropertyType.NUMBER
                                ? 'primary'
                                : 'secondary'
                        }
                    />
                ))}
            </Box>
            <Box sx={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <LoadingButton
                    variant="contained"
                    onClick={handleCreateAnnotation}
                    loaderColor="secondary"
                    text="Create Annotation"
                    isLoading={createAnnotationIsLoading}
                    sx={{ width: '178px' }}
                />
            </Box>
        </Box>
    );
};

export default MoveToExtractionCreateAnnotation;
