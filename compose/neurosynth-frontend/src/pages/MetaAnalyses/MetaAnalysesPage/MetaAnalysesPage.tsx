import { Typography, Box, IconButton, TableRow, TableCell } from '@mui/material';
import { useHistory } from 'react-router-dom';
import StateHandlerComponent from 'components/StateHandlerComponent/StateHandlerComponent';
import { useGetMetaAnalyses } from 'hooks';
import useGetTour from 'hooks/useGetTour';
import Help from '@mui/icons-material/Help';
import NeurosynthTable from 'components/Tables/NeurosynthTable/NeurosynthTable';
import { useAuth0 } from '@auth0/auth0-react';
import NeurosynthTableStyles from 'components/Tables/NeurosynthTable/NeurosynthTable.styles';

const MetaAnalysesPage: React.FC = (props) => {
    const { startTour } = useGetTour('MetaAnalysesPage');
    const history = useHistory();
    const { data, isLoading, isError } = useGetMetaAnalyses();
    const { user } = useAuth0();

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    marginBottom: '1rem',
                }}
            >
                <Typography variant="h4">Meta-Analyses</Typography>
                <IconButton onClick={() => startTour()}>
                    <Help color="primary" />
                </IconButton>
            </Box>

            <StateHandlerComponent
                isError={isError}
                isLoading={false}
                errorMessage="There was an error fetching meta-analyses"
            >
                <Box data-tour="MetaAnalysesPage-1">
                    <NeurosynthTable
                        tableConfig={{
                            isLoading: isLoading,
                            loaderColor: 'secondary',
                            tableHeaderBackgroundColor: '#5C2751',
                        }}
                        headerCells={[
                            {
                                text: 'Name',
                                key: 'name',
                                styles: { fontWeight: 'bold', color: 'primary.contrastText' },
                            },
                            {
                                text: 'Description',
                                key: 'description',
                                styles: { fontWeight: 'bold', color: 'primary.contrastText' },
                            },
                            {
                                text: 'Owner',
                                key: 'owner',
                                styles: { fontWeight: 'bold', color: 'primary.contrastText' },
                            },
                        ]}
                        rows={(data || []).map((metaAnalysis, index) => (
                            <TableRow
                                onClick={() => history.push(`/meta-analyses/${metaAnalysis?.id}`)}
                                key={metaAnalysis?.id || index}
                                sx={NeurosynthTableStyles.tableRow}
                            >
                                <TableCell>
                                    {metaAnalysis?.name || (
                                        <Box sx={{ color: 'warning.dark' }}>No name</Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {metaAnalysis?.description || (
                                        <Box sx={{ color: 'warning.dark' }}>No description</Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {(metaAnalysis?.user === user?.sub
                                        ? 'Me'
                                        : metaAnalysis?.user) || 'Neurosynth-Compose'}
                                </TableCell>
                            </TableRow>
                        ))}
                    />
                </Box>
            </StateHandlerComponent>
        </>
    );
};

export default MetaAnalysesPage;
