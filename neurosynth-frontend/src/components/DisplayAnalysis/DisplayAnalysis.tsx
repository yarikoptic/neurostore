import { ExpandMoreOutlined } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import {
    DisplayValuesTable,
    IDisplayValuesTableModel,
    TextExpansion,
    DisplayImagesTable,
    Visualizer,
} from '..';
import { Condition, Point, ReadOnly, Image } from '../../gen/api';
import { AnalysisApiResponse } from '../../utils/api';
import DisplayAnalysisStyles from './DisplayAnalysis.styles';

const DisplayAnalysis: React.FC<AnalysisApiResponse | undefined> = (props) => {
    const [selectedImage, setSelectedImage] = useState<(Image & ReadOnly) | undefined>(undefined);

    useEffect(() => {
        const images = props.images as (Image & ReadOnly)[];
        if (!images || images.length === 0) {
            // images does not exist or is empty
            setSelectedImage(undefined);
        } else if (images.length === 1) {
            // only one image
            setSelectedImage(images[0]);
        } else {
            // multiple images.
            // loop through and find the first image that has a T value type.
            // if none found, just display the first image
            let currentImage = images[0];
            for (let i = 0; i < images.length; i++) {
                if (images[i].value_type === 'T') {
                    currentImage = images[i];
                    break;
                }
            }
            setSelectedImage(currentImage);
        }
    }, [props.images]);

    if (!props || Object.keys(props).length === 0) {
        return (
            <Box component="span" sx={{ color: 'warning.dark' }}>
                No analysis
            </Box>
        );
    }

    const coordinateDataForTable: IDisplayValuesTableModel = {
        columnHeaders: [
            {
                value: 'X',
                center: false,
                bold: false,
            },
            {
                value: 'Y',
                center: false,
                bold: false,
            },
            {
                value: 'Z',
                center: false,
                bold: false,
            },
            {
                value: 'Kind',
                center: false,
                bold: false,
            },
            {
                value: 'Space',
                center: false,
                bold: false,
            },
        ],
        rowData: (props?.points as (Point & ReadOnly)[]).map((point) => ({
            uniqueKey: point.id as string,
            columnValues: [
                {
                    value: point.coordinates ? point?.coordinates[0] : undefined,
                    colorByType: false,
                    center: false,
                    bold: false,
                },
                {
                    value: point.coordinates ? point?.coordinates[1] : undefined,
                    colorByType: true,
                    center: false,
                    bold: false,
                },
                {
                    value: point.coordinates ? point?.coordinates[2] : undefined,
                    colorByType: true,
                    center: false,
                    bold: false,
                },
                {
                    value: point.kind as string,
                    colorByType: true,
                    center: false,
                    bold: false,
                },
                {
                    value: point.space as string,
                    colorByType: true,
                    center: false,
                    bold: false,
                },
            ],
        })),
    };

    const handleSelectImage = (selectedImage: (Image & ReadOnly) | undefined) => {
        setSelectedImage(selectedImage);
    };

    const conditionsForTable: IDisplayValuesTableModel = {
        columnHeaders: [
            {
                value: 'Condition',
                bold: false,
                center: false,
            },
            {
                value: 'Weight',
                bold: false,
                center: false,
            },
        ],
        rowData: (props?.conditions as (Condition & ReadOnly)[]).map((condition, index) => ({
            uniqueKey: condition.id || index.toString(),
            columnValues: [
                {
                    value: condition.name,
                    colorByType: false,
                    center: false,
                    bold: false,
                },
                {
                    value: (props?.weights || [])[index],
                    colorByType: false,
                    center: false,
                    bold: false,
                },
            ],
        })),
    };

    return (
        <Box sx={DisplayAnalysisStyles.analysisContainer}>
            <Box
                sx={{
                    ...DisplayAnalysisStyles.section,
                    ...DisplayAnalysisStyles.leftSection,
                }}
            >
                <Typography sx={DisplayAnalysisStyles.spaceBelow} variant="h5">
                    {props.name}
                </Typography>
                <TextExpansion
                    sx={DisplayAnalysisStyles.spaceBelow}
                    text={props.description || ''}
                />
                <Box sx={{ ...DisplayAnalysisStyles.spaceBelow, width: '100%' }}>
                    <Accordion
                        defaultExpanded={conditionsForTable.rowData.length > 0}
                        elevation={4}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                            Conditions
                        </AccordionSummary>
                        <AccordionDetails>
                            {(props?.conditions || []).length > 0 && (
                                <DisplayValuesTable {...conditionsForTable} />
                            )}
                            {(props.conditions || []).length === 0 && (
                                <Box component="span" sx={{ color: 'warning.dark' }}>
                                    No conditions
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Box>
                <Box
                    sx={{
                        ...DisplayAnalysisStyles.spaceBelow,
                        ...DisplayAnalysisStyles.removeTablePadding,
                        width: '100%',
                    }}
                >
                    <Accordion
                        defaultExpanded={coordinateDataForTable.rowData.length > 0}
                        elevation={4}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                            Coordinates
                        </AccordionSummary>
                        <AccordionDetails>
                            {(props?.points || []).length > 0 && (
                                <DisplayValuesTable {...coordinateDataForTable} />
                            )}
                            {(props.points || []).length === 0 && (
                                <Box component="span" sx={{ color: 'warning.dark' }}>
                                    No coordinates
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Box>
                <Box sx={{ ...DisplayAnalysisStyles.spaceBelow }}>
                    <Accordion
                        defaultExpanded={props.images && props.images.length > 0}
                        elevation={4}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                            Images
                        </AccordionSummary>
                        <AccordionDetails>
                            <DisplayImagesTable
                                initialSelectedImage={selectedImage}
                                onSelectImage={handleSelectImage}
                                images={props.images as (Image & ReadOnly)[]}
                            />
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
            {selectedImage && (
                <Box
                    sx={{ ...DisplayAnalysisStyles.section, ...DisplayAnalysisStyles.rightSection }}
                >
                    <Box sx={DisplayAnalysisStyles.visualizerContainer}>
                        <Visualizer
                            sx={DisplayAnalysisStyles.visualizer}
                            imageURL={selectedImage.url || ''}
                            fileName={selectedImage.filename || ''}
                            template={(selectedImage?.metadata as any)?.target_template_image || ''}
                            index={0}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default DisplayAnalysis;
