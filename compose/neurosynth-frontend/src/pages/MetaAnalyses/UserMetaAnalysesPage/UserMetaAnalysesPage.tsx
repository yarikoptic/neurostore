import { useAuth0 } from '@auth0/auth0-react';
import { Button, Typography, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { DisplayValuesTable } from 'components';
import { IDisplayValuesTableModel } from 'components/Tables/DisplayValuesTable';
import StateHandlerComponent from '../../../components/StateHandlerComponent/StateHandlerComponent';
import { useGetMetaAnalyses } from '../../../hooks';

const UserMetaAnalysesPage: React.FC = (props) => {
    const history = useHistory();
    const { user } = useAuth0();
    const { data, isLoading, isError } = useGetMetaAnalyses();

    const handleMetaAnalysisSelected = (selected: string | number) => {
        history.push(`/meta-analyses/${selected}`);
    };

    const metaAnalysesTableData: IDisplayValuesTableModel = {
        isLoading: isLoading,
        paper: true,
        selectable: true,
        onValueSelected: handleMetaAnalysisSelected,
        tableHeadRowColor: '#5C2751',
        tableHeadRowTextContrastColor: 'white',
        columnHeaders: [
            {
                value: 'Name',
            },
            {
                value: 'Description',
            },
            {
                value: 'User',
            },
        ],
        rowData: (data || [])
            .filter((metaAnalysis) => metaAnalysis.user === user?.sub)
            .map((metaAnalysis, index) => ({
                uniqueKey: metaAnalysis.id || index,
                columnValues: [
                    {
                        value: metaAnalysis.name || 'no name',
                        shouldHighlightNoData: !metaAnalysis.name,
                    },
                    {
                        value: metaAnalysis.description || 'no description',
                        shouldHighlightNoData: !metaAnalysis.description,
                    },
                    {
                        value: metaAnalysis.user || 'no user',
                        shouldHighlightNoData: !metaAnalysis.user,
                    },
                ],
            })),
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                }}
            >
                <Typography variant="h4">My Meta-Analyses</Typography>

                <Button
                    variant="contained"
                    onClick={() => history.push('/meta-analyses/build')}
                    color="primary"
                >
                    New meta-analysis
                </Button>
            </Box>

            <DisplayValuesTable {...metaAnalysesTableData} />
        </>
    );
};

export default UserMetaAnalysesPage;
