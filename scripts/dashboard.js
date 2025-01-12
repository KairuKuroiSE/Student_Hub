export function updateDashboard(notes, tasks, timetable) {
    // Update Recent Notes
    const recentNotesContainer = document.getElementById('recentNotes');
    if (recentNotesContainer && notes) {
        recentNotesContainer.innerHTML = '';
        const displayNotes = notes.notes.slice(0, 3);
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
    if (upcomingTasksContainer && tasks) {
        upcomingTasksContainer.innerHTML = '';
        const today = new Date();
        const upcomingTasks = tasks.tasks
            .filter(task => !task.completed && new Date(task.dueDate) >= today)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);

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
    if (todayClassesContainer && timetable) {
        todayClassesContainer.innerHTML = '';
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayClasses = timetable.classes
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