import IChromeStorage from "./IChromeStorage";
//import fs from "fs";

export default class InMemoryChromeStorage implements IChromeStorage {
    protected localStorage: {[key: string]: any} = {};
    protected syncStorage: {[key: string]: any} = {};

    protected writeToFs = true;

    constructor() {
        setInterval(() => {
            //fs.writeFileSync("sync.json", JSON.stringify(this.syncStorage, null, 2));
            //fs.writeFileSync("local.json", JSON.stringify(this.localStorage, null, 2));
        }, 5000)
    }

    public async getSync(keys: string[] | null): Promise<{[key: string]: any}> {
        if (keys === null) {
            return Promise.resolve({
                ...this.syncStorage
            });
        }
        
        const result: {[key: string]: any} = {};
        keys?.forEach(key => result[key] = this.syncStorage[key]);
        return Promise.resolve(result);
    }

    public async setSync(data: {[key: string]: any}): Promise<void> {
        this.syncStorage = {
            ...this.syncStorage,
            ...data
        };
        return Promise.resolve();
    }

    public async removeSync(keys: string[]): Promise<void> {
        keys.forEach(key => delete this.syncStorage[key]);
    }

    public async getLocal(keys: string[] | null): Promise<{[key: string]: any}> {
        if (keys === null) {
            return Promise.resolve(JSON.parse(JSON.stringify(this.localStorage)));
        }
        const result: {[key: string]: any} = {};
        keys?.forEach(key => result[key] = this.localStorage[key] ? JSON.parse(JSON.stringify(this.localStorage[key])) : undefined);
        return Promise.resolve(result);
    }

    public async setLocal(data: {[key: string]: any}): Promise<void> {
        this.localStorage = {
            ...this.localStorage,
            ...data
        };
        return Promise.resolve();
    }

    public async removeLocal(keys?: string[]): Promise<void> {
        if (keys) {
            keys.forEach(key => delete this.localStorage[key]);
        } else {
            this.localStorage = {};
        }
        return Promise.resolve();
    }
}