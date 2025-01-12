// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Data Management Classes
    class StorageManager {
        static getItem(key, defaultValue = []) {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        }

        static setItem(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }

    class AuthManager {
        constructor() {
            this.initializeTestAccount();
            this.currentUser = StorageManager.getItem('currentUser', null);
        }

        initializeTestAccount() {
            // Create test account
            const testAccount = {
                id: 'test123',
                email: 'test@student.hub',
                password: 'test123',
                displayName: 'Test Student'
            };

            // Store test account
            StorageManager.setItem('testAccount', testAccount);

            // Initialize empty data structures for test account if they don't exist
            if (!localStorage.getItem(`notes_${testAccount.id}`)) {
                StorageManager.setItem(`notes_${testAccount.id}`, []);
                StorageManager.setItem(`tasks_${testAccount.id}`, []);
                StorageManager.setItem(`timetable_${testAccount.id}`, []);

                // Add some sample data
                const notesManager = new NotesManager(testAccount.id);
                notesManager.addNote('Welcome Note', 'Welcome to Student Hub! This is a sample note.');

                const tasksManager = new TasksManager(testAccount.id);
                tasksManager.addTask('Complete profile', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

                const timetableManager = new TimetableManager(testAccount.id);
                timetableManager.addClass('Monday', '09:00', 'Mathematics', 'Room 101');
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

    class NotesManager {
        constructor(userId) {
            this.userId = userId;
            this.notes = StorageManager.getItem(`notes_${userId}`, []);
        }

        addNote(title, content) {
            const newNote = {
                id: Date.now().toString(),
                title,
                content,
                createdAt: new Date().toISOString()
            };
            this.notes.unshift(newNote);
            this._save();
            return newNote;
        }

        updateNote(id, title, content) {
            const note = this.notes.find(n => n.id === id);
            if (note) {
                note.title = title;
                note.content = content;
                this._save();
            }
        }

        deleteNote(id) {
            this.notes = this.notes.filter(n => n.id !== id);
            this._save();
        }

        _save() {
            StorageManager.setItem(`notes_${this.userId}`, this.notes);
        }
    }

    class TasksManager {
        constructor(userId) {
            this.userId = userId;
            this.tasks = StorageManager.getItem(`tasks_${userId}`, []);
        }

        addTask(title, dueDate) {
            const newTask = {
                id: Date.now().toString(),
                title,
                dueDate,
                completed: false
            };
            this.tasks.push(newTask);
            this._save();
            return newTask;
        }

        toggleTask(id) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                this._save();
                updateDashboard(); // Refresh dashboard after toggling
            }
        }

        deleteTask(id) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this._save();
        }

        _save() {
            StorageManager.setItem(`tasks_${this.userId}`, this.tasks);
        }
    }

    class TimetableManager {

    }

    // Initialize Managers
    const auth = new AuthManager();

    // Global variables to store managers
    window.notes = null;
    window.tasks = null;
    window.timetable = null;

    // View Management
    const views = ['authView', 'homeView', 'notesView', 'tasksView', 'timetableView'];

    window.showView = function showView(viewId) {
        // Hide all views
        views.forEach(view => {
            const viewElement = document.getElementById(view);
            if (viewElement) {
                viewElement.classList.add('hidden');
            }
        });

        // Show selected view
        const selectedView = document.getElementById(viewId);
        if (selectedView) {
            selectedView.classList.remove('hidden');
        }
    }

    // Sidebar navigation buttons
    const navigationMap = {
        'homeBtn': 'homeView',
        'notesBtn': 'notesView',
        'tasksBtn': 'tasksView',
        'timetableBtn': 'timetableView'
    };

    // Add click listeners to sidebar buttons
    Object.entries(navigationMap).forEach(([btnId, viewId]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => showView(viewId));
        }
    });

    // Fallback for existing onclick attributes
    views.forEach(view => {
        const elementsWithOnclick = document.querySelectorAll(`[onclick*="${view}"]`);
        elementsWithOnclick.forEach(el => {
            el.setAttribute('onclick', `showView('${view}')`);
        });
    });

    // Update auth title
    const authTitle = document.getElementById('authTitle');
    if (authTitle) authTitle.textContent = 'Login to Student Hub';

    // Auth Form Handler
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                auth.login(email, password);

                // Initialize feature managers after successful login
                window.notes = new NotesManager(auth.currentUser.id);
                window.tasks = new TasksManager(auth.currentUser.id);
                window.timetable = new TimetableManager(auth.currentUser.id);

                // Update UI
                const userDisplayName = document.getElementById('userDisplayName');
                if (userDisplayName) {
                    userDisplayName.textContent = auth.currentUser.displayName;
                }
                showView('homeView');
                updateDashboard();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
            showView('authView');
        });
    }

    // Initialize current date
    const currentDate = document.getElementById('currentDate');
    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function updateDashboard() {
        // Check if managers are initialized
        if (!window.notes || !window.tasks || !window.timetable) {
            console.error('Managers not initialized');
            return;
        }

        // Update Recent Notes
        const recentNotesContainer = document.getElementById('recentNotes');
        if (recentNotesContainer && window.notes) {
            recentNotesContainer.innerHTML = ''; // Clear existing notes
            const displayNotes = window.notes.notes.slice(0, 3); // Show latest 3 notes
            displayNotes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('bg-gray-100', 'p-2', 'rounded', 'mb-2');
                noteElement.innerHTML = `
                <h3 class="font-bold">${note.title}</h3>
                <p class="text-sm truncate">${note.content}</p>
                <small class="text-gray-500">${new Date(note.createdAt).toLocaleDateString()}</small>
            `;
                recentNotesContainer.appendChild(noteElement);
            });
        }

        // Update Upcoming Tasks
        const upcomingTasksContainer = document.getElementById('upcomingTasks');
        if (upcomingTasksContainer && window.tasks) {
            upcomingTasksContainer.innerHTML = ''; // Clear existing tasks
            const today = new Date();
            const upcomingTasks = window.tasks.tasks
                .filter(task => !task.completed && new Date(task.dueDate) >= today)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 3); // Show top 3 upcoming tasks

            upcomingTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('bg-gray-100', 'p-2', 'rounded', 'mb-2', 'flex', 'justify-between', 'items-center');
                taskElement.innerHTML = `
                <div>
                    <h3 class="font-bold">${task.title}</h3>
                    <small class="text-gray-500">Due: ${new Date(task.dueDate).toLocaleDateString()}</small>
                </div>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="window.tasks.toggleTask('${task.id}');">
            `;
                upcomingTasksContainer.appendChild(taskElement);
            });
        }

        // Update Today's Classes
        const todayClassesContainer = document.getElementById('todayClasses');
        if (todayClassesContainer && window.timetable) {
            todayClassesContainer.innerHTML = ''; // Clear existing classes
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const todayClasses = window.timetable.classes
                .filter(cls => cls.day === today)
                .sort((a, b) => a.time.localeCompare(b.time));

            todayClasses.forEach(cls => {
                const classElement = document.createElement('div');
                classElement.classList.add('bg-gray-100', 'p-2', 'rounded', 'mb-2');
                classElement.innerHTML = `
                <h3 class="font-bold">${cls.subject}</h3>
                <p class="text-sm">${cls.time} - ${cls.room}</p>
            `;
                todayClassesContainer.appendChild(classElement);
            });
        }
    }

    // Show auth view by default
    showView('authView');
});