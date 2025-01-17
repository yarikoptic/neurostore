import { ENavigationButton } from 'components/Buttons/NavigationButtons/NavigationButtons';
import { ICurationStubStudy } from 'components/CurationComponents/CurationStubStudy/CurationStubStudyDraggableContainer';
import CreateStubStudy from './CreateStubStudy/CreateStubStudy';
import BaseImportFromNeurostore from './ImportFromNeurostore/BaseImportFromNeurostore';
import BaseImportPMIDs from './ImportPMIDs/BaseImportPMIDs';
import BaseImportStandardFormat from './ImportStandardFormat/BaseImportStandardFormat';

export enum EImportMode {
    NEUROSTORE_IMPORT = 'NEUROSTORE_IMPORT',
    PUBMED_IMPORT = 'PUBMED_IMPORT',
    MANUAL_CREATE = 'MANUAL_CREATE',
    FILE_IMPORT = 'FILE_IMPORT',
}

export interface IImportArgs {
    onNavigate: (button: ENavigationButton) => void;
    onImportStubs: (stubs: ICurationStubStudy[], unimportedStubs?: string[]) => void;
}

const CurationImport: React.FC<{
    mode: EImportMode;
    onImportStubs: (stubs: ICurationStubStudy[], unimportedStubs?: string[]) => void;
    onNavigate: (button: ENavigationButton) => void;
}> = (props) => {
    if (props.mode === EImportMode.NEUROSTORE_IMPORT) {
        return (
            <BaseImportFromNeurostore
                onImportStubs={props.onImportStubs}
                onNavigate={props.onNavigate}
            />
        );
    } else if (props.mode === EImportMode.PUBMED_IMPORT) {
        return (
            <BaseImportPMIDs onImportStubs={props.onImportStubs} onNavigate={props.onNavigate} />
        );
    } else if (props.mode === EImportMode.MANUAL_CREATE) {
        return (
            <CreateStubStudy onImportStubs={props.onImportStubs} onNavigate={props.onNavigate} />
        );
    } else {
        return (
            <BaseImportStandardFormat
                onImportStubs={props.onImportStubs}
                onNavigate={props.onNavigate}
            />
        );
    }
};

export default CurationImport;
