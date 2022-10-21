import { Memento } from 'vscode';

export default class LocalStorageService {
    constructor(private storage: Memento) {}

    public get<T>(key: string) {
        return this.storage.get<T>(key);
    }

    public set<T>(key: string, value: T) {
        this.storage.update(key, value);
    }
}
