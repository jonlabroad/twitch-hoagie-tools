import { Typography, IconButton, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core"
import { FlexCol, FlexRow } from "../util/FlexBox"

import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';

export type BadWordInfos = Record<string, BadWordInfo>

export interface BadWordInfo {
    isWhitelisted: boolean
    count: number
}

interface BadWordsDetailsProps {
    badWordCounts: BadWordInfos

    onWordWhitelistChange: (word: string, type: "add" | "remove") => void
}

export const BadWordsDetails = (props: BadWordsDetailsProps) => {
    const { badWordCounts } = props;

    return <>
        <FlexCol>
            <Typography style={{ fontWeight: 600 }}>Bad Words</Typography>
            <Typography>{Object.keys(badWordCounts).filter(w => !badWordCounts[w].isWhitelisted).sort((a, b) => badWordCounts[b]?.count - badWordCounts[a]?.count).map(word => (
                <FlexRow alignItems="center">
                    <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word].count})`}</div>
                    <IconButton onClick={() => props.onWordWhitelistChange(word, "add")}><CheckIcon fontSize="small" color="primary" /></IconButton>
                </FlexRow>
            ))}
            </Typography>
            <Accordion>
                <AccordionSummary>
                    <Typography style={{ fontWeight: 600 }} variant="body2">Whitelisted</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body2">{Object.keys(badWordCounts).filter(w => badWordCounts[w].isWhitelisted).sort((a, b) => badWordCounts[b]?.count - badWordCounts[a]?.count).map(word => (
                        <FlexRow alignItems="center">
                            <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word].count})`}</div>
                            <IconButton onClick={() => props.onWordWhitelistChange(word, "remove")}><BlockIcon fontSize="small" color="primary" /></IconButton>
                        </FlexRow>
                    ))}
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </FlexCol>
    </>
}