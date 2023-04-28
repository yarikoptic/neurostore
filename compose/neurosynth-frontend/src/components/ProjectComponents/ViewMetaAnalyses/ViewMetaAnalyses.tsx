import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useGetMetaAnalyses } from 'hooks';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';

const ViewMetaAnalyses: React.FC = () => {
    const path = useRouteMatch();
    const history = useHistory();
    const { projectId }: { projectId: string } = useParams();
    const { data } = useGetMetaAnalyses(projectId);

    const handleUpdate = (id?: string) => {
        if (!id) return;
        history.push(`${path.url}/${id}`);
    };

    return (
        <Box sx={{ padding: '0.5rem 0', display: 'flex' }}>
            {(data || []).map((metaAnalysis, index) => (
                <Card
                    key={metaAnalysis.id || index}
                    sx={{
                        flex: '0 0 400px',
                        margin: '0 15px 15px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >
                    <CardContent>
                        <Box>
                            <Typography variant="h6">{metaAnalysis.name || ''}</Typography>
                            <Typography>{metaAnalysis.description || ''}</Typography>
                        </Box>
                    </CardContent>
                    <CardActions>
                        <Button onClick={() => handleUpdate(metaAnalysis.id)}>view</Button>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
};

export default ViewMetaAnalyses;
