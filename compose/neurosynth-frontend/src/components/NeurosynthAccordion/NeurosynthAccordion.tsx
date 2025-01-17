import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { useEffect, useState } from 'react';

interface INeurosynthAccordion {
    defaultExpanded?: boolean;
    elevation?: number;
    sx?: SystemStyleObject;
    accordionSummarySx?: SystemStyleObject;
    accordionDetailsSx?: SystemStyleObject;
    TitleElement?: JSX.Element;
    expandIconColor?: string;
}

const NeurosynthAccordion: React.FC<INeurosynthAccordion> = (props) => {
    const {
        defaultExpanded = false,
        elevation = 1,
        sx = {},
        accordionSummarySx = {},
        accordionDetailsSx = {},
        TitleElement = <b></b>,
        expandIconColor = 'white',
    } = props;

    const [expanded, setExpanded] = useState(defaultExpanded);

    useEffect(() => {
        setExpanded(defaultExpanded);
    }, [defaultExpanded]);

    return (
        <Accordion sx={sx} expanded={expanded} elevation={elevation}>
            <AccordionSummary
                onClick={() => setExpanded((prev) => !prev)}
                sx={{
                    ...accordionSummarySx,
                    '.MuiAccordionSummary-expandIconWrapper': { color: expandIconColor },
                }}
                expandIcon={<ExpandMoreOutlined />}
            >
                {TitleElement}
            </AccordionSummary>
            <AccordionDetails sx={accordionDetailsSx}>{props.children}</AccordionDetails>
        </Accordion>
    );
};

export default NeurosynthAccordion;
