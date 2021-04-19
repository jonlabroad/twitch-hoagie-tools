export default class LocalStorage {
    public static get(key: string): any {
        try {
            return window.localStorage.getItem(key);
        } catch (err) {
            // nothing
            console.warn(err);
        }
    }

    public static set(key: string, value: Object) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value, null, 2));
        } catch (err) {
            // nothing
            console.warn(err);
        }        
    }
}