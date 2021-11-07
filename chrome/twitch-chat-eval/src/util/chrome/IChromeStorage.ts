export default interface IChromeStorage {
    getSync(keys: string[] | null): Promise<{[key: string]: any}>
    setSync(data: {[key: string]: any}): Promise<void>
    removeSync(keys: string[]): Promise<void>
    getLocal(keys: string[] | null): Promise<{[key: string]: any}>
    setLocal(data: {[key: string]: any}): Promise<void>
    removeLocal(keys?: string[]): Promise<void>
}