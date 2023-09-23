export function getChannel(tmiChannel: string) {
    return tmiChannel.replace("#", "").toLowerCase();
}