import NodeCache from "node-cache";

export default class CacheManager {
    caches: Record<string, NodeCache> = {};

    public get(key: string) {
        let cache = this.caches[key];
        if (!cache) {
            cache = new NodeCache();
            this.caches[key] = cache;
        }
        return cache;
    }
}