import IChromeStorage from "./IChromeStorage";

export default class ChromeStorage implements IChromeStorage {
    public async getSync(keys: string[] | null): Promise<{[key: string]: any}> {
        if (chrome?.storage?.sync) {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.get(keys, (result: {[key: string]: any}) => {
                    resolve(result);
                })
            });
        }
        return Promise.resolve({});
    }

    public async setSync(data: {[key: string]: any}): Promise<void> {
        if (chrome?.storage?.sync) {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.set(data, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve();
    }

    public async removeSync(keys: string[]): Promise<void> {
        if (chrome?.storage?.sync) {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.remove(keys, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve();
    }

    public async getLocal(keys: string[] | null): Promise<{[key: string]: any}> {
        if (chrome?.storage?.local) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(keys, (result: {[key: string]: any}) => {
                    resolve(result);
                })
            });
        }
    return Promise.resolve({});
    }

    public async setLocal(data: {[key: string]: any}): Promise<void> {
        if (chrome?.storage?.local) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set(data, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve();
    }

    public async removeLocal(keys?: string[]): Promise<void> {
        if (chrome?.storage?.local) {
            if (keys) {
                return new Promise((resolve, reject) => {
                    chrome.storage.local.remove(keys, () => {
                        resolve();
                    })
                });
            } else {
                return new Promise((resolve, reject) => {
                    chrome.storage.local.clear(() => {
                        resolve();
                    })
                });
            }
        }
        return Promise.resolve();
    }
}