import { StorageManager } from './storage.js';

class AuthManager {
    constructor() {
        this.initializeTestAccount();
        this.currentUser = StorageManager.getItem('currentUser', null);
    }

    initializeTestAccount() {
        const testAccount = {
            id: 'test123',
            email: 'test@student.hub',
            password: 'test123',
            displayName: 'Test Student'
        };

        StorageManager.setItem('testAccount', testAccount);

        if (!localStorage.getItem(`notes_${testAccount.id}`)) {
            StorageManager.setItem(`notes_${testAccount.id}`, []);
            StorageManager.setItem(`tasks_${testAccount.id}`, []);
            StorageManager.setItem(`timetable_${testAccount.id}`, []);
        }
    }

    login(email, password) {
        const testAccount = StorageManager.getItem('testAccount');
        if (email === testAccount.email && password === testAccount.password) {
            this.currentUser = testAccount;
            StorageManager.setItem('currentUser', testAccount);
            return testAccount;
        }
        throw new Error('Invalid credentials');
    }

    logout() {
        this.currentUser = null;
        StorageManager.setItem('currentUser', null);
    }

    changePassword(currentPassword, newPassword) {
        const testAccount = StorageManager.getItem('testAccount');
        if (currentPassword !== testAccount.password) {
            throw new Error('Current password is incorrect');
        }
        testAccount.password = newPassword;
        StorageManager.setItem('testAccount', testAccount);
        this.currentUser = testAccount;
        StorageManager.setItem('currentUser', testAccount);
    }
}

export { AuthManager };