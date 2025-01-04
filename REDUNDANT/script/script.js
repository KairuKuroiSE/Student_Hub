import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const userSection = document.getElementById('userSection');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutButton = document.getElementById('logoutButton');

    // Check authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            welcomeMessage.textContent = `Welcome, ${user.displayName || user.email}!`;
            userSection.style.display = 'block';
        } else {
            // No user is signed in, redirect to login
            window.location.href = '../pages/login.html';
        }
    });

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = '../pages/login.html';
            } catch (error) {
                console.error('Logout error', error);
            }
        });
    }
});