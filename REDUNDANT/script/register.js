import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous error messages
        errorMessage.textContent = '';

        // Get form values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const displayName = document.getElementById('displayName').value;

        // Validation
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters long';
            return;
        }

        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, {
                displayName: displayName
            });

            // Create additional user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                displayName: displayName,
                createdAt: new Date(),
                // You can add more user-specific fields here
            });

            // Display success message and set a timeout for redirection
            const successMessage = document.createElement('p');
            successMessage.textContent = 'Successfully Registered! Redirecting to Login page...';
            successMessage.classList.add('success-message'); // Add the success message styling
            registerForm.parentNode.insertBefore(successMessage, registerForm);

            // Hide the form after successful registration
            registerForm.style.display = 'none';

            // Redirect to login page after 5 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 5000);

        } catch (error) {
            // Handle specific Firebase authentication errors
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage.textContent = 'Email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage.textContent = 'Invalid email address';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage.textContent = 'Registration is currently disabled';
                    break;
                default:
                    errorMessage.textContent = 'Registration failed. Please try again.';
                    console.error('Registration error:', error);
            }
        }
    });
});