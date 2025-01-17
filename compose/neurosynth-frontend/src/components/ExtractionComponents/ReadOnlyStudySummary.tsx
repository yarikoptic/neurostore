import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { StudyReturn } from 'neurostore-typescript-sdk';
import StudyListItemStyles from './ReadOnlyStudySummary.styles';
import CheckIcon from '@mui/icons-material/Check';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useHistory, useParams } from 'react-router-dom';
import { ESelectedChip } from 'pages/ExtractionPage/ExtractionPage';
import { useProjectExtractionAddOrUpdateStudyListStatus } from 'pages/Projects/ProjectPage/ProjectStore';

const ReadOnlyStudySummaryVirtualizedItem: React.FC<
    StudyReturn & { currentSelectedChip: ESelectedChip; style: React.CSSProperties }
> = (props) => {
    const { projectId }: { projectId: string } = useParams();
    const history = useHistory();
    const addOrUpdateStudyListStatus = useProjectExtractionAddOrUpdateStudyListStatus();

    const handleClick = (_event: React.MouseEvent) => {
        if (props?.id) {
            history.push(`/projects/${projectId}/extraction/studies/${props.id}`);
        }
    };

    const handleUpdateStatus = (studyId: string, status: 'COMPLETE' | 'SAVEFORLATER') => {
        if (studyId) {
            addOrUpdateStudyListStatus(studyId, status);
        }
    };

    const showMarkAsCompleteButton =
        props.currentSelectedChip === ESelectedChip.UNCATEGORIZED ||
        props.currentSelectedChip === ESelectedChip.SAVEDFORLATER;

    const showMarkAsSaveForLaterbutton =
        props.currentSelectedChip === ESelectedChip.UNCATEGORIZED ||
        props.currentSelectedChip === ESelectedChip.COMPLETED;

    return (
        <Box style={props.style}>
            <Box onClick={handleClick} sx={StudyListItemStyles.listItem}>
                <Box sx={{ width: 'calc(100% - 70px)' }}>
                    <Typography noWrap sx={{ fontWeight: 'bold' }}>
                        {`${props.year ? `(${props.year}) ` : ''}${props.name}`}
                    </Typography>
                    <Typography noWrap>{props.authors}</Typography>
                    <Typography noWrap>Journal: {props.publication}</Typography>
                    <Box sx={{ display: 'flex' }}>
                        <Typography sx={{ width: '220px' }}>PMID: {props.pmid}</Typography>
                        <Typography>DOI: {props.doi}</Typography>
                    </Box>
                    <Typography noWrap>{props.description}</Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '70px',
                    }}
                >
                    {showMarkAsCompleteButton && (
                        <Box sx={{ marginBottom: '1rem' }}>
                            <Tooltip placement="right" title="move to complete">
                                <IconButton
                                    size="large"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUpdateStatus(props.id || '', 'COMPLETE');
                                    }}
                                >
                                    <CheckIcon color="success" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    {showMarkAsSaveForLaterbutton && (
                        <Box>
                            <Tooltip placement="right" title="move to save for later">
                                <IconButton
                                    size="large"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUpdateStatus(props.id || '', 'SAVEFORLATER');
                                    }}
                                >
                                    <BookmarkIcon color="info" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ReadOnlyStudySummaryVirtualizedItem;
