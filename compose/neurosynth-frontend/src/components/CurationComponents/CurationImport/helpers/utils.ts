import { ICurationStubStudy } from 'components/CurationComponents/CurationStubStudy/CurationStubStudyDraggableContainer';

// a study is defined as a duplicate if it has either a matching PMID, DOI, or title.
// We must account for the case where a study has a missing PMID, DOI, or title as well.

export const createDuplicateMap = <T extends ICurationStubStudy>(stubs: T[]) => {
    const map = new Map<string, T[]>();
    const duplicatesList: T[][] = [];

    stubs.forEach((stub) => {
        const formattedTitle = stub.title.toLocaleLowerCase().trim();
        if (stub.doi && map.has(stub.doi)) {
            const duplicatedStubs = map.get(stub.doi);
            duplicatedStubs!.push(stub);
        } else if (stub.pmid && map.has(stub.pmid)) {
            const duplicatedStubs = map.get(stub.pmid);
            duplicatedStubs!.push(stub);
        } else if (stub.title && map.has(formattedTitle)) {
            // in the future, this title search can be replaced with a fuzzier search via a string comparison algorithm
            const duplicatedStubs = map.get(formattedTitle);
            duplicatedStubs!.push(stub);
        } else {
            const newDuplicatedStubsList: T[] = [];
            newDuplicatedStubsList.push(stub);
            duplicatesList.push(newDuplicatedStubsList);
            if (stub.doi) map.set(stub.doi, newDuplicatedStubsList);
            if (stub.pmid) map.set(stub.pmid, newDuplicatedStubsList);
            if (formattedTitle) map.set(formattedTitle, newDuplicatedStubsList);
        }
    });

    return {
        duplicateMapping: map,
        duplicatesList: duplicatesList,
    };
};

export const hasDuplicates = (stubs: ICurationStubStudy[]): boolean => {
    const { duplicatesList } = createDuplicateMap(stubs);
    return duplicatesList.some((x) => x.length > 1);
};
