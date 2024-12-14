import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Detailed Login Function
async function loginUser(email, password) {
    try {
        console.log('Attempting login with:', email);

        // Basic validation
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('Login successful for user:', user.email);

        // Verify email verification (optional)
        if (!user.emailVerified) {
            console.warn('User email not verified');
        }

        // Redirect to home page
        window.location.href = '../index.html';
    } catch (error) {
        const errorMessage = document.getElementById('errorMessage');

        // Detailed error logging
        console.error('Full error object:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        // Specific error handling
        switch(error.code) {
            case 'auth/invalid-credential':
                errorMessage.textContent = 'Invalid email or password. Please check and try again.';
                break;
            case 'auth/user-disabled':
                errorMessage.textContent = 'This user account has been disabled.';
                break;
            case 'auth/user-not-found':
                errorMessage.textContent = 'No user found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage.textContent = 'Incorrect password. Please try again.';
                break;
            case 'auth/too-many-requests':
                errorMessage.textContent = 'Too many login attempts. Please try again later.';
                break;
            default:
                errorMessage.textContent = 'Login failed. Please try again.';
        }
    }
}

// Authentication State Listener (for debugging)
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Current user:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
        });
    } else {
        console.log('No user is signed in');
    }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Clear previous error messages on input
    const emailInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            errorMessage.textContent = '';
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Reset error message
        errorMessage.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        loginUser(email, password);
    });
});

// Export for potential use in other modules
export { loginUser };