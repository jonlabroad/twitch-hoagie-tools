export function isOfflineMode() {
    return process.env["IS_OFFLINE"] === 'true';
}
