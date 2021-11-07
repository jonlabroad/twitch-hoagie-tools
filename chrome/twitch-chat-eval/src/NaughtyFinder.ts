import { AnalysisResultMessage } from "./AnalysisResultMessage";

const thresholds: Record<string, number> = {
    identityAttack: 0.9,
    insult: 0.9,
    profanity: 0.99,
    severeTox: 0.9,
    sexuallyExpl: 0.95,
    threat: 0.9,
    tox: 0.85,
}

export default class NaughtyFinder {
    public static getNaughtyScores(request: AnalysisResultMessage): [string, number][] {
        const entries = Object.entries(request.results ?? {});
        const mostNaughtyTypes = entries.sort((a, b) => b[1] - a[1]).filter(entry => entry[1] >= thresholds[entry[0]]);
        return mostNaughtyTypes;
    }
}