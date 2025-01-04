import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    updatePassword
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrotI9TWKWO2-nm71J9VlIp8bHw6hjsxg",
    authDomain: "student-hub-3ba77.firebaseapp.com",
    projectId: "student-hub-3ba77",
    storageBucket: "student-hub-3ba77.firebasestorage.app",
    messagingSenderId: "915357832889",
    appId: "1:915357832889:web:f33a01e86d29f3d3106d68",
    measurementId: "G-H3YDPHXFK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global State
let currentUser = null;
let isRegistering = false;

// Authentication Functions
async function registerUser(email, password, confirmPassword, displayName) {
    if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        displayName: displayName,
        email: email,
        createdAt: new Date().toISOString()
    });
    return userCredential;
}

async function loginUser(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

async function changePassword(newPassword) {
    if (!auth.currentUser) {
        throw new Error('No user is currently logged in');
    }
    if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }
    await updatePassword(auth.currentUser, newPassword);
}

// View Management
function showView(viewId) {
    if (!currentUser && viewId !== 'authView') {
        showView('authView');
        return;
    }

    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');

    if (viewId === 'homeView') {
        loadHomeData();
    }
}

// Data Management Functions
async function saveNote(title, content) {
    try {
        await addDoc(collection(db, 'notes'), {
            userId: auth.currentUser.uid,
            title,
            content,
            timestamp: new Date().toISOString()
        });
        loadNotes();
        alert('Note saved successfully!');
    } catch (error) {
        alert('Error saving note: ' + error.message);
    }
}

async function loadNotes() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    const q = query(collection(db, 'notes'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const note = doc.data();
        const div = document.createElement('div');
        div.className = 'list-item';
        div.textContent = note.title;
        div.onclick = () => {
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').innerHTML = note.content;
        };
        notesList.appendChild(div);
    });
}

async function addTask(title, dueDate) {
    try {
        await addDoc(collection(db, 'tasks'), {
            userId: auth.currentUser.uid,
            title,
            dueDate,
            completed: false
        });
        loadTasks();
    } catch (error) {
        alert('Error adding task: ' + error.message);
    }
}

async function loadTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    const q = query(collection(db, 'tasks'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const task = doc.data();
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span>${task.title}</span>
            <span class="due-date">${task.dueDate}</span>
            <button class="delete-btn">Delete</button>
        `;

        div.querySelector('input[type="checkbox"]').onchange = async (e) => {
            await updateTaskStatus(doc.id, e.target.checked);
        };
        div.querySelector('.delete-btn').onclick = async () => {
            await deleteTask(doc.id);
        };
        tasksList.appendChild(div);
    });
}

async function updateTaskStatus(taskId, completed) {
    try {
        await updateDoc(doc(db, 'tasks', taskId), { completed });
    } catch (error) {
        alert('Error updating task: ' + error.message);
    }
}

async function deleteTask(taskId) {
    try {
        await deleteDoc(doc(db, 'tasks', taskId));
        loadTasks();
    } catch (error) {
        alert('Error deleting task: ' + error.message);
    }
}

async function loadHomeData() {
    if (!currentUser) return;

    // Update current date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', dateOptions);

    // Load recent notes
    const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(3)
    );
    const notesSnapshot = await getDocs(notesQuery);
    const recentNotesHtml = notesSnapshot.docs.map(doc => `
        <div class="list-item">
            <span>${doc.data().title}</span>
            <small>${new Date(doc.data().timestamp).toLocaleDateString()}</small>
        </div>
    `).join('');
    document.getElementById('recentNotes').innerHTML = recentNotesHtml || '<p>No recent notes</p>';

    // Load upcoming tasks
    const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('completed', '==', false),
        orderBy('dueDate'),
        limit(3)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const upcomingTasksHtml = tasksSnapshot.docs.map(doc => `
        <div class="list-item">
            <span>${doc.data().title}</span>
            <small>Due: ${doc.data().dueDate}</small>
        </div>
    `).join('');
    document.getElementById('upcomingTasks').innerHTML = upcomingTasksHtml || '<p>No upcoming tasks</p>';

    // Load today's classes
    const today = new Date();
    const today_day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
    const classesQuery = query(
        collection(db, 'timetable'),
        where('userId', '==', currentUser.uid),
        where('day', '==', today_day)
    );
    const classesSnapshot = await getDocs(classesQuery);
    const todayClassesHtml = classesSnapshot.docs.map(doc => `
        <div class="list-item">
            <span>${doc.data().subject}</span>
            <small>${doc.data().time} - Room ${doc.data().room}</small>
        </div>
    `).join('');
    document.getElementById('todayClasses').innerHTML = todayClassesHtml || '<p>No classes today</p>';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Auth form toggle
    document.getElementById('authToggle').addEventListener('click', () => {
        isRegistering = !isRegistering;
        document.getElementById('registerFields').style.display = isRegistering ? 'block' : 'none';
        document.getElementById('authTitle').textContent = isRegistering ? 'Register for Student Hub' : 'Login to Student Hub';
        document.getElementById('authSubmitBtn').textContent = isRegistering ? 'Register' : 'Login';
        document.getElementById('authToggle').textContent = isRegistering ? 'Already have an account? Login here' : 'New user? Register here';
    });

    // Auth form submission
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            if (isRegistering) {
                const confirmPassword = document.getElementById('confirmPassword').value;
                const displayName = document.getElementById('displayName').value;
                await registerUser(email, password, confirmPassword, displayName);
                alert('Registration successful! Welcome to Student Hub!');
            } else {
                await loginUser(email, password);
            }
            document.getElementById('authForm').reset();
        } catch (error) {
            alert(error.message);
        }
    });

    // Password reset
    document.getElementById('forgotPassword').addEventListener('click', async () => {
        const email = prompt('Enter your email address to reset your password:');
        if (email) {
            try {
                await resetPassword(email);
                alert('Password reset email sent! Please check your inbox.');
            } catch (error) {
                alert(error.message);
            }
        }
    });

    // Navigation
    document.getElementById('homeBtn').addEventListener('click', () => showView('homeView'));
    document.getElementById('notesBtn').addEventListener('click', () => showView('notesView'));
    document.getElementById('tasksBtn').addEventListener('click', () => showView('tasksView'));
    document.getElementById('timetableBtn').addEventListener('click', () => showView('timetableView'));

    // Profile/Password Change
    document.getElementById('profileBtn').addEventListener('click', async () => {
        if (!currentUser) return;
        const newPassword = prompt('Enter new password (leave empty to cancel):');
        if (newPassword) {
            try {
                await changePassword(newPassword);
                alert('Password successfully updated!');
            } catch (error) {
                alert(error.message);
            }
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await signOut(auth);
            showView('authView');
        } catch (error) {
            alert('Error signing out: ' + error.message);
        }
    });

    // Note management
    document.getElementById('saveNoteBtn')?.addEventListener('click', () => {
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').innerHTML;
        saveNote(title, content);
    });

    // Task management
    document.getElementById('addTaskBtn')?.addEventListener('click', () => {
        const title = document.getElementById('taskInput').value;
        const dueDate = document.getElementById('taskDueDate').value;
        if (title && dueDate) {
            addTask(title, dueDate);
            document.getElementById('taskInput').value = '';
            document.getElementById('taskDueDate').value = '';
        }
    });

    // Timetable Management (MY OLD CODE WON'T WORK ANYMORE??
    // Timetable Functionality
    const timetableGrid = document.getElementById('timetableGrid');
    document.getElementById('timetableBtn').addEventListener('click', () => {
        showView('timetableView');
        loadTimetable();
    });

    document.getElementById('addClassBtn').addEventListener('click', () => {
        const day = prompt("Enter the day:");
        const time = prompt("Enter the time:");
        const subject = prompt("Enter the subject:");
        const room = prompt("Enter the room:");
        if (day && time && subject && room) {
            addClass(day, time, subject, room);
        } else {
            alert("All fields are required!");
        }
    });

    async function addClass(day, time, subject, room) {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                alert("You must be logged in to add a class!");
                return;
            }
            await addDoc(collection(db, 'timetable'), { userId, day, time, subject, room });
            alert("Class added successfully!");
            loadTimetable();
        } catch (error) {
            console.error("Error adding class:", error);
            alert("Failed to add class. Please try again later.");
        }
    }

    async function loadTimetable() {
        try {
            timetableGrid.innerHTML = ''; // Clear grid
            const userId = auth.currentUser?.uid;
            if (!userId) {
                alert("You must be logged in to view the timetable!");
                return;
            }
            const q = query(collection(db, 'timetable'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                const { day, time, subject, room } = doc.data();
                const cell = document.createElement('div');
                cell.className = 'grid-cell has-class';
                cell.textContent = `${day} - ${time}: ${subject} (${room})`;
                timetableGrid.appendChild(cell);
            });
        } catch (error) {
            console.error("Error loading timetable:", error);
            alert("Failed to load timetable. Please check your connection.");
        }
    }
});

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            document.getElementById('userDisplayName').textContent = userData.displayName;
        }
        showView('homeView');
        loadHomeData();
    } else {
        currentUser = null;
        showView('authView');
    }
});


// Initialize theme
document.addEventListener('DOMContentLoaded', initializeTheme);