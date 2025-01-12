import { StorageManager } from './storage.js';

class TasksManager {
    constructor(userId) {
        this.userId = userId;
        this.tasks = StorageManager.getItem(`tasks_${userId}`, []);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const tasksBtn = document.getElementById('tasksBtn');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.addTaskFromForm());
        }

        if (tasksBtn) {
            tasksBtn.addEventListener('click', () => this.displayTasks());
        }
    }

    addTaskFromForm() {
        const taskInput = document.getElementById('taskInput');
        const taskDueDate = document.getElementById('taskDueDate');

        const title = taskInput.value.trim();
        const dueDate = taskDueDate.value;

        if (!title || !dueDate) {
            alert('Please enter both task title and due date');
            return;
        }

        this.addTask(title, dueDate);
        taskInput.value = '';
        taskDueDate.value = '';
        this.displayTasks();
        if (window.updateDashboard) {
            window.updateDashboard(window.notes, this);
        }
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
            this.displayTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this._save();
        this.displayTasks();
    }

    displayTasks() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;

        tasksList.innerHTML = '';
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task-item');
            taskElement.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="${task.completed ? 'completed' : ''}">${task.title}</span>
                <span class="due-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                <button class="delete-task" data-id="${task.id}">Delete</button>
            `;

            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                this.toggleTask(task.id);
                if (window.updateDashboard) {
                    window.updateDashboard(window.notes, this);
                }
            });

            const deleteBtn = taskElement.querySelector('.delete-task');
            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
                if (window.updateDashboard) {
                    window.updateDashboard(window.notes, this);
                }
            });

            tasksList.appendChild(taskElement);
        });
    }

    _save() {
        StorageManager.setItem(`tasks_${this.userId}`, this.tasks);
    }
}

export { TasksManager };