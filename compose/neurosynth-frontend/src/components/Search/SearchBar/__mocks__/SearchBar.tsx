import { SearchBy } from 'pages/Studies/PublicStudiesPage/PublicStudiesPage';
import { ISearchBar } from '../SearchBar';

const mockSearchBar: React.FC<ISearchBar> = (props) => {
    return (
        <button
            style={{ backgroundColor: props.searchButtonColor || 'primary.main' }}
            data-testid="trigger-search"
            onClick={() => props.onSearch('searchedstring', SearchBy.ALL)}
        ></button>
    );
};

export default mockSearchBar;
