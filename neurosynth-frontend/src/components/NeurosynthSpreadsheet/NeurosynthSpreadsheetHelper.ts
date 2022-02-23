import { EPropertyType, getType } from '..';
import { AnnotationNote } from '../../gen/api';
import styles from './NeurosynthSpreadsheet.module.css';

export class NeurosynthSpreadsheetHelper {
    public static readonly ROW_HEADER_WIDTH = 200;
    public static readonly ROW_HEIGHTS = 25;

    public static IsSpreadsheetBoolType(value: any): boolean {
        return (
            value === 't' ||
            value === 'f' ||
            value === 'true' ||
            value === 'false' ||
            value === null ||
            value === true ||
            value === false ||
            value === ''
        );
    }

    public static GetTypeForColumn(columnKey: string, notes: AnnotationNote[]): EPropertyType {
        for (let i = 0; i < notes.length; i++) {
            const currentNote = notes[i].note as {
                [key: string]: string | boolean | number | null;
            };
            const value = currentNote[columnKey];
            if (value !== null) {
                // typescript complains here that string cannot be used to index type {} so we must cast it
                return getType(value);
            }
        }
        return EPropertyType.STRING;
    }

    public static GetVisibleStudyTitleWidth(): number {
        const screenWidth = window.innerWidth;
        const parentPadding = 20;
        const scrollbarAdjustment = 20;

        // all page content is 80% of parent
        return Math.floor(
            screenWidth * 0.8 -
                parentPadding -
                NeurosynthSpreadsheetHelper.ROW_HEADER_WIDTH -
                scrollbarAdjustment
        );
    }

    public static BuildStudyDisplayText(
        studyName: string,
        studyYear: number | undefined,
        authors: string,
        journalName: string,
        isHTML: boolean
    ): string {
        let authorText = '';
        authorText = authors.split(', ')[0];
        if (authors.split(', ').length > 1) authorText += ' et al.,';
        const studyNameText = studyYear ? `(${studyYear}) ${studyName}` : studyName;
        const visibleWidth = NeurosynthSpreadsheetHelper.GetVisibleStudyTitleWidth();
        return isHTML
            ? `<div style="width: ${visibleWidth}px; display: flex; position: absolute !important; z-index: 9">` +
                  `<span class="${styles.authors} ${styles['study-details-text']}">${authorText}</span>` +
                  `<span class="${styles['study-name']} ${styles['study-details-text']}">${studyNameText}</span>` +
                  `<span class="${styles.publication} ${styles['study-details-text']}">${journalName}</span>` +
                  `</div>`
            : `${authorText} | ${studyNameText} | ${journalName}`;
    }
}

/**
 * `<div style="width: ${visibleWidth}px; display: flex; position: absolute !important; z-index: 9">` +
                  `<span class="${styles.authors} ${styles['study-details-text']}">${authorText}</span>` +
                  `<span class="${styles['study-name']} ${styles['study-details-text']}">${studyNameText}</span>` +
                  `<span class="${styles.publication} ${styles['study-details-text']}">${journalName}</span>` +
                  `</div>`
 */
