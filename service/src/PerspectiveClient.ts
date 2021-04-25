import * as Perspective from 'perspective-api-client';

export default class PerspectiveClient {
    client: Perspective;

    readonly DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';

    constructor(apiKey: string) {
        console.log({Perspective});
        this.client = new Perspective(
            {
                apiKey
            }
        );
    }

    async analyze(text: string): Promise<Record<string, number> | undefined> {
        let result: Record<string, number> | undefined = undefined;
        try {
            const response = await this.client.analyze(text, {
                attributes: ["TOXICITY", "SEVERE_TOXICITY", "IDENTITY_ATTACK", "INSULT", "PROFANITY", "THREAT", "SEXUALLY_EXPLICIT", "FLIRTATION"]
            });
            if (response) {
                result = {
                    tox: response.attributeScores.TOXICITY.summaryScore.value,
                    severeTox: response.attributeScores.SEVERE_TOXICITY.summaryScore.value,
                    identityAttack: response.attributeScores.IDENTITY_ATTACK.summaryScore.value,
                    insult: response.attributeScores.INSULT.summaryScore.value,
                    profanity: response.attributeScores.PROFANITY.summaryScore.value,
                    threat: response.attributeScores.THREAT.summaryScore.value,
                    sexuallyExpl: response.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value,
                    // flirtation: response.attributeScores.FLIRTATION.summaryScore.value,
                };
            }
        } catch (err) {
            console.error(err);
        }
        return result;
    }
}
