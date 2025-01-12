class StorageManager {
    static getItem(key, defaultValue = []) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    static setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export { StorageManager };