import { StorageManager } from './storage.js';
import { AuthManager } from './auth.js';
import { NotesManager } from './notes.js';
import { TasksManager } from './tasks.js';
import { updateDashboard } from './dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthManager();

    // View Management
    const views = ['authView', 'homeView', 'notesView', 'tasksView', 'timetableView'];

    window.showView = function(viewId) {
        views.forEach(view => {
            const viewElement = document.getElementById(view);
            if (viewElement) {
                viewElement.classList.add('hidden');
            }
        });

        const selectedView = document.getElementById(viewId);
        if (selectedView) {
            selectedView.classList.remove('hidden');
        }
    }

    // Navigation Setup
    const navigationMap = {
        'homeBtn': 'homeView',
        'notesBtn': 'notesView',
        'tasksBtn': 'tasksView',
        'timetableBtn': 'timetableView'
    };

    Object.entries(navigationMap).forEach(([btnId, viewId]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => showView(viewId));
        }
    });

    // Auth Form Handler
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const user = auth.login(email, password);

                // Initialize managers
                window.notes = new NotesManager(user.id);
                window.tasks = new TasksManager(user.id);

                // Update UI
                const userDisplayName = document.getElementById('userDisplayName');
                if (userDisplayName) {
                    userDisplayName.textContent = user.displayName;
                }

                showView('homeView');
                updateDashboard(window.notes, window.tasks, window.timetable);
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
            showView('authView');
        });
    }

    // Initialize Date
    const currentDate = document.getElementById('currentDate');
    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Show auth view by default
    showView('authView');
});