import { StreamData } from "../service/TwitchClientTypes";

export default class StreamSorter {
    private static viewerRange = [10, 500];

    public static sort(s1: StreamData, s2: StreamData) {
        const r1 = StreamSorter.getSortRank(s1);
        const r2 = StreamSorter.getSortRank(s2);
        if (r1 === r2) {
            return s1.user_login.localeCompare(s2.user_login);
        }
        return r2 - r1;
    }

    public static getSortRank(stream: StreamData) {
        const viewerRank = stream.viewer_count >= StreamSorter.viewerRange[0] && stream.viewer_count <= StreamSorter.viewerRange[1] ? 1.0 : 0.5;

        const startDate = new Date(stream.started_at);
        const upTimeMin = (new Date().getTime() - startDate.getTime()) / 1000 / 60;
        let streamTimeRank = 0.25;
        if (upTimeMin > 5 && upTimeMin < 60 * 3) {
            streamTimeRank = 1.0;
        } else if (upTimeMin >= 60 * 3 && upTimeMin < 60 * 4) {
            streamTimeRank = 0.5;
        }

        return (viewerRank + streamTimeRank) / 2;
    }
}