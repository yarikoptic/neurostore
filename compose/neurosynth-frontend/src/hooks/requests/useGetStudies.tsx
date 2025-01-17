import { SearchCriteria, SearchDataType, Source } from 'pages/Studies/StudiesPage/StudiesPage';
import { useQuery } from 'react-query';
import API from 'utils/api';

const useGetStudies = (searchCriteria: Partial<SearchCriteria>, enabled?: boolean) => {
    return useQuery(
        ['studies', { ...searchCriteria }],
        () => {
            return API.NeurostoreServices.StudiesService.studiesGet(
                searchCriteria.genericSearchStr || undefined,
                searchCriteria.sortBy,
                searchCriteria.pageOfResults,
                searchCriteria.descOrder,
                searchCriteria.pageSize,
                searchCriteria.isNested,
                searchCriteria.nameSearch || undefined,
                searchCriteria.descriptionSearch || undefined,
                undefined,
                searchCriteria.showUnique,
                searchCriteria.source === Source.ALL ? undefined : searchCriteria.source,
                searchCriteria.authorSearch || undefined,
                searchCriteria.userId,
                searchCriteria.dataType === SearchDataType.BOTH
                    ? undefined
                    : searchCriteria.dataType,
                undefined,
                searchCriteria.level,
                searchCriteria.pmid,
                searchCriteria.doi,
                searchCriteria.flat
            );
        },
        {
            enabled,
            select: (res) => {
                const studyList = res.data;
                // sort studysets
                (studyList.results || [])?.forEach((study) => {
                    (study.studysets || []).sort((a, b) => {
                        const firstStudysetId = a.name as string;
                        const secondStudysetId = b.name as string;

                        return firstStudysetId.localeCompare(secondStudysetId);
                    });
                });

                return studyList;
            },
        }
    );
};

export default useGetStudies;
