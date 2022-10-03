import { Pagination, TablePagination } from '@mui/material';
import SearchBar from 'components/Search/SearchBar/SearchBar';
import { Style } from 'index';
import { SearchBy } from 'pages/Studies/PublicStudiesPage/PublicStudiesPage';
import { ChangeEvent } from 'react';
import SearchContainerStyles from './SearchContainer.styles';

export interface ISearchContainer {
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    onSearch: (searchedString: string, searchBy: SearchBy) => void;
    totalCount: number | undefined;
    pageSize: number;
    pageOfResults: number;
    searchButtonColor?: string;
    paginationSelectorStyles?: Style;
}

const getNumTotalPages = (totalCount: number | undefined, pageSize: number | undefined) => {
    if (!totalCount || !pageSize) {
        return 0;
    }
    const numTotalPages = Math.trunc(totalCount / pageSize);
    const remainder = totalCount % pageSize;
    return remainder > 0 ? numTotalPages + 1 : numTotalPages;
};

const SearchContainer: React.FC<ISearchContainer> = (props) => {
    const {
        onPageChange,
        onRowsPerPageChange,
        onSearch,
        pageOfResults,
        totalCount,
        pageSize,
        children,
        searchButtonColor = 'primary',
        paginationSelectorStyles = {},
    } = props;

    const handleRowsPerPageChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newRowsPerPage = parseInt(event.target.value);
        if (!isNaN(newRowsPerPage)) onRowsPerPageChange(newRowsPerPage);
    };

    const handlePaginationChange = (page: number) => {
        if (page === null) return;
        onPageChange(page);
    };

    return (
        <>
            <SearchBar searchButtonColor={searchButtonColor} onSearch={onSearch} />

            <Pagination
                siblingCount={2}
                boundaryCount={2}
                sx={[SearchContainerStyles.paginator, paginationSelectorStyles]}
                onChange={(_event, page) => handlePaginationChange(page)}
                showFirstButton
                showLastButton
                page={totalCount === undefined ? 0 : pageOfResults}
                count={getNumTotalPages(totalCount, pageSize)}
            />
            {children}
            <TablePagination
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleRowsPerPageChange}
                onPageChange={(_event, page) => handlePaginationChange(page + 1)}
                component="div"
                rowsPerPageOptions={[10, 25, 50, 99]}
                // we have to do this because MUI's pagination component starts at 0,
                // whereas 0 and 1 are the same in the backend
                page={totalCount === undefined ? 0 : pageOfResults - 1}
                count={totalCount || 0}
                sx={SearchContainerStyles.paginator}
            />
        </>
    );
};

export default SearchContainer;
