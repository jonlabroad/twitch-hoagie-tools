export default class LocalStorage {
    storage = window.localStorage;

    public async getSync(keys: string[] | null): Promise<{[key: string]: any}> {
        if (this.storage?.sync) {
            return new Promise((resolve, reject) => {
                this.storage.sync.get(keys, (result: {[key: string]: any}) => {
                    resolve(result);
                })
            });
        }
        return Promise.resolve({});
    }

    public async setSync(data: {[key: string]: any}): Promise<void> {
        if (this?.storage?.sync) {
            return new Promise((resolve, reject) => {
                this.storage.sync.set(data, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve();
    }

    public async removeSync(keys: string[]): Promise<void> {
        if (this?.storage?.sync) {
            return new Promise((resolve, reject) => {
                this.storage.sync.remove(keys, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve();
    }

    public async getLocal(keys: string[] | null): Promise<{[key: string]: any}> {
        if (this?.storage?.local) {
            return new Promise((resolve, reject) => {
                this.storage.local.get(keys, (result: {[key: string]: any}) => {
                    resolve(result);
                })
            });
        }
    return Promise.resolve({});
    }

    public async setLocal(data: {[key: string]: any}): Promise<void> {
        if (this?.storage?.local) {
            return new Promise((resolve, reject) => {
                this.storage.local.set(data, () => {
                    resolve();
                })
            });
        }
        return Promise.resolve();
    }

    public async removeLocal(keys?: string[]): Promise<void> {
        if (this?.storage?.local) {
            if (keys) {
                return new Promise((resolve, reject) => {
                    this.storage.local.remove(keys, () => {
                        resolve();
                    })
                });
            } else {
                return new Promise((resolve, reject) => {
                    this.storage.local.clear(() => {
                        resolve();
                    })
                });
            }
        }
        return Promise.resolve();
    }
}