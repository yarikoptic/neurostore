import { Box, TableCell, TableRow } from '@mui/material';
import NavigationButtons, {
    ENavigationButton,
} from 'components/Buttons/NavigationButtons/NavigationButtons';
import SearchContainer from 'components/Search/SearchContainer/SearchContainer';
import NeurosynthTable from 'components/Tables/NeurosynthTable/NeurosynthTable';
import { StudyList } from 'neurostore-typescript-sdk';
import { SearchCriteria } from 'pages/Studies/StudiesPage/StudiesPage';
import { useEffect, useState } from 'react';
import { useGetStudies } from 'hooks';
import { useAuth0 } from '@auth0/auth0-react';
import NeurosynthTableStyles from 'components/Tables/NeurosynthTable/NeurosynthTable.styles';
import { useHistory, useLocation } from 'react-router-dom';
import {
    addKVPToSearch,
    getSearchCriteriaFromURL,
    getURLFromSearchCriteria,
} from 'pages/helpers/utils';
import { useProjectId } from 'pages/Projects/ProjectPage/ProjectStore';
import { IImportArgs } from '../CurationImport';
import { studiesToStubs } from './helpers/utils';
import StateHandlerComponent from 'components/StateHandlerComponent/StateHandlerComponent';

const NeurostoreSearch: React.FC<IImportArgs> = (props) => {
    const { user, isLoading: authenticationIsLoading } = useAuth0();
    const history = useHistory();
    const location = useLocation();
    const projectId = useProjectId();

    // cached data returned from the api
    const [studyData, setStudyData] = useState<StudyList>();

    // state of the current search
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
        ...new SearchCriteria(),
        ...getSearchCriteriaFromURL(location?.search),
    });

    // state of the search to the API (separated from searchCriteria to allow for debouncing)
    const [debouncedSearchCriteria, setDebouncedSearchCriteria] =
        useState<SearchCriteria>(searchCriteria);

    /**
     * This query will not be made until authentication has finished loading. The user?.sub property
     * exists before loading is complete so we are guaranteed that the first query will run
     * with the studysetOwner set (if logged in) and undefined otherwise
     */
    const { data, isLoading, isError, isFetching } = useGetStudies(
        { ...debouncedSearchCriteria, studysetOwner: user?.sub, flat: 'true' },
        !authenticationIsLoading
    );

    const {
        data: allDataForSearch,
        isLoading: allDataForSearchIsLoading,
        isError: allDataForSearchIsError,
        isFetching: allDataForSearchIsFetching,
    } = useGetStudies(
        { ...debouncedSearchCriteria, studysetOwner: user?.sub, pageSize: 29999, flat: 'true' }, // backend checks for less than 30000
        !authenticationIsLoading
    );

    /**
     * the data variable itself is undefined when refetching, so we need to save it
     * in memory to create a more stable experience when changing search criteria.
     * This is especially noticable when paginating
     */
    useEffect(() => {
        if (data) setStudyData(data);
    }, [data]);

    useEffect(() => {
        if (user?.sub) {
            setSearchCriteria((prev) => ({
                ...prev,
                studysetOwner: user.sub,
            }));
        }
    }, [user?.sub]);

    // runs every time the URL changes, to create a URL driven search.
    // this is separated from the debounce because otherwise the URL would
    // not update until the setTimeout is complete
    useEffect(() => {
        const urlSearchCriteria = getSearchCriteriaFromURL(location?.search);
        setSearchCriteria((prev) => {
            return { ...prev, ...urlSearchCriteria };
        });
    }, [location.search]);

    // runs for any change in study query
    // debounces above useEffect
    useEffect(() => {
        const timeout = setTimeout(async () => {
            setDebouncedSearchCriteria(searchCriteria);
        }, 200);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchCriteria]);

    const handleSearch = (searchArgs: Partial<SearchCriteria>) => {
        // when we search, we want to reset the search criteria as we dont know the
        // page number of number of results in advance
        const searchURL = getURLFromSearchCriteria(searchArgs);
        history.push(`/projects/${projectId}/curation/import?${searchURL}`);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        const searchURL = addKVPToSearch(
            addKVPToSearch(location.search, 'pageSize', `${newRowsPerPage}`),
            'pageOfResults',
            '1'
        );
        history.push(`/projects/${projectId}/curation/import?${searchURL}`);
    };

    const handlePageChange = (page: number) => {
        const searchURL = addKVPToSearch(location.search, 'pageOfResults', `${page}`);
        history.push(`/projects/${projectId}/curation/import?${searchURL}`);
    };

    const handleButtonClick = (button: ENavigationButton) => {
        if (button === ENavigationButton.PREV) {
            history.push(`/projects/${projectId}/curation/import`);
            props.onNavigate(button);
        } else {
            const newStubs = studiesToStubs(allDataForSearch?.results || []);
            props.onImportStubs(newStubs);
        }
    };

    const tableIsLoading =
        isLoading || isFetching || allDataForSearchIsLoading || allDataForSearchIsFetching;

    return (
        <StateHandlerComponent isLoading={false} isError={isError || allDataForSearchIsError}>
            <SearchContainer
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onSearch={handleSearch}
                totalCount={studyData?.metadata?.total_count}
                pageSize={searchCriteria.pageSize}
                pageOfResults={
                    (studyData?.results || []).length === 0 ? 1 : searchCriteria.pageOfResults
                }
                paginationSelectorStyles={{
                    '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                    },
                }}
            >
                <Box sx={{ marginBottom: '1rem' }}>
                    <NeurosynthTable
                        tableConfig={{
                            isLoading: tableIsLoading,
                            loaderColor: 'secondary',
                            noDataDisplay: (
                                <Box sx={{ color: 'warning.dark', padding: '1rem' }}>
                                    No studies found
                                </Box>
                            ),
                        }}
                        headerCells={[
                            {
                                text: 'Title',
                                key: 'title',
                                styles: { color: 'primary.contrastText', fontWeight: 'bold' },
                            },
                            {
                                text: 'Authors',
                                key: 'authors',
                                styles: { color: 'primary.contrastText', fontWeight: 'bold' },
                            },
                            {
                                text: 'Journal',
                                key: 'journal',
                                styles: { color: 'primary.contrastText', fontWeight: 'bold' },
                            },
                            {
                                text: 'Owner',
                                key: 'owner',
                                styles: { color: 'primary.contrastText', fontWeight: 'bold' },
                            },
                        ]}
                        rows={(studyData?.results || []).map((studyrow, index) => (
                            <TableRow
                                data-tour={index === 0 ? 'StudiesPage-4' : null}
                                sx={NeurosynthTableStyles.tableRow}
                                key={studyrow.id || index}
                                onClick={() => history.push(`/studies/${studyrow.id}`)}
                            >
                                <TableCell>
                                    {studyrow?.name || (
                                        <Box sx={{ color: 'warning.dark' }}>No name</Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {studyrow?.authors || (
                                        <Box sx={{ color: 'warning.dark' }}>No author(s)</Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {studyrow?.publication || (
                                        <Box sx={{ color: 'warning.dark' }}>No Journal</Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {(studyrow?.user === user?.sub ? 'Me' : studyrow?.user) ||
                                        'Neurosynth-Compose'}
                                </TableCell>
                            </TableRow>
                        ))}
                    />
                </Box>
            </SearchContainer>

            <Box>
                <NavigationButtons
                    nextButtonText={`Import ${
                        studyData?.metadata?.total_count || 0
                    } studies from neurostore`}
                    nextButtonStyle="contained"
                    nextButtonDisabled={
                        tableIsLoading ||
                        (studyData?.results || []).length === 0 ||
                        allDataForSearchIsLoading
                    }
                    onButtonClick={handleButtonClick}
                />
            </Box>
        </StateHandlerComponent>
    );
};

export default NeurostoreSearch;
