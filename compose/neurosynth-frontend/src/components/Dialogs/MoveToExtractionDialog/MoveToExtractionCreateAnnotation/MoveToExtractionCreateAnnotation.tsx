import {
    Box,
    Button,
    Chip,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
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
import MoveToExtractionCreateAnnotationStyles from './MoveToExtractionCreateAnnotation.styles';
import CancelIcon from '@mui/icons-material/Cancel';

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
                This data will be used to include or exclude studies from a meta-analysis when you
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
                <Chip
                    onDelete={() => {}}
                    sx={{ margin: '4px' }}
                    label="included: boolean"
                    color="success"
                />
                <Chip
                    onDelete={() => {}}
                    sx={{ margin: '4px' }}
                    label="modality: string"
                    color="secondary"
                />
                <Chip
                    onDelete={() => {}}
                    sx={{ margin: '4px' }}
                    label="threshold: number"
                    color="primary"
                />
            </Box>
            {/* <Box sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {annotationColumns.map((annotationCol) => (
                                <TableCell
                                    key={annotationCol.value}
                                    sx={[
                                        MoveToExtractionCreateAnnotationStyles[annotationCol.type],
                                        { fontWeight: 'bold' },
                                    ]}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box>
                                            {annotationCol.value !== 'included' && (
                                                <IconButton
                                                    onClick={() =>
                                                        handleRemoveColumn(annotationCol)
                                                    }
                                                    size="small"
                                                >
                                                    <CancelIcon color="error" />
                                                </IconButton>
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography sx={{ whiteSpace: 'nowrap' }}>
                                                {annotationCol.value}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                example analysis 1 ...
                            </TableCell>
                            {annotationColumns.map((annotationCol, index) => (
                                <TableCell
                                    key={index}
                                    sx={[
                                        MoveToExtractionCreateAnnotationStyles[annotationCol.type],
                                        MoveToExtractionCreateAnnotationStyles[
                                            `${annotationCol.type}-type`
                                        ],
                                        MoveToExtractionCreateAnnotationStyles['value-cell'],
                                    ]}
                                >
                                    {annotationCol.type}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                example analysis 2 ...
                            </TableCell>
                            {annotationColumns.map((annotationCol, index) => (
                                <TableCell
                                    key={index}
                                    sx={[
                                        MoveToExtractionCreateAnnotationStyles[annotationCol.type],
                                        MoveToExtractionCreateAnnotationStyles[
                                            `${annotationCol.type}-type`
                                        ],
                                        MoveToExtractionCreateAnnotationStyles['value-cell'],
                                    ]}
                                >
                                    {annotationCol.type}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell>...</TableCell>
                            {annotationColumns.map((annotationCol, index) => (
                                <TableCell
                                    key={index}
                                    sx={[
                                        MoveToExtractionCreateAnnotationStyles[annotationCol.type],
                                        MoveToExtractionCreateAnnotationStyles[
                                            `${annotationCol.type}-type`
                                        ],
                                        MoveToExtractionCreateAnnotationStyles['value-cell'],
                                    ]}
                                >
                                    {annotationCol.type}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </Box> */}
            <Box sx={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <LoadingButton
                    variant="contained"
                    onClick={handleCreateAnnotation}
                    text="Create Annotation"
                    isLoading={createAnnotationIsLoading}
                    sx={{ width: '178px' }}
                />
            </Box>
        </Box>
    );
};

export default MoveToExtractionCreateAnnotation;
