import { Typography, IconButton, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import { FlexCol, FlexRow } from "../util/FlexBox"

import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import { Expandable } from "../util/Expandable";

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

    const badWords = Object.keys(badWordCounts).filter(w => !badWordCounts[w].isWhitelisted).sort((a, b) => badWordCounts[b]?.count - badWordCounts[a]?.count);
    const whitelisted = Object.keys(badWordCounts).filter(w => badWordCounts[w].isWhitelisted).sort((a, b) => badWordCounts[b]?.count - badWordCounts[a]?.count);

    return <>
        <FlexCol>
            <Typography style={{ fontWeight: 600, marginBottom: 10 }}>{`Bad Words (${badWords.length})`}</Typography>
            <Typography>{badWords.map(word => (
                <FlexRow alignItems="center">
                    <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word].count})`}</div>
                    <IconButton onClick={() => props.onWordWhitelistChange(word, "add")} size="large"><CheckIcon fontSize="small" color="primary" /></IconButton>
                </FlexRow>
            ))}
            </Typography>
            {whitelisted.length > 0 &&
                <Expandable
                    style={{
                        maxWidth: 130
                    }}
                    showExpand={whitelisted.length > 0}
                    summary={
                        <Typography style={{ fontWeight: 600 }} variant="body2">{`Whitelisted (${whitelisted.length})`}</Typography>
                    }
                >
                    <Typography variant="body2">{whitelisted.map(word => (
                        <FlexRow alignItems="center">
                            <div style={{ marginRight: 5 }}>{`${word}(${badWordCounts[word].count})`}</div>
                            <IconButton onClick={() => props.onWordWhitelistChange(word, "remove")} size="large"><BlockIcon fontSize="small" color="primary" /></IconButton>
                        </FlexRow>
                    ))}
                    </Typography>
                </Expandable>
            }
        </FlexCol>
    </>;
}