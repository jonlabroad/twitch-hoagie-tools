export default class ChromeRuntime {
    public static sendMessage(message: any) {
        if (typeof chrome !== 'undefined' && chrome?.runtime) {
            try {
                chrome.runtime.sendMessage(message);
            } catch (err) {
                console.error(err);
            }
        }
    }
};