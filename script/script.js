document.addEventListener('DOMContentLoaded', () => {
    const userSection = document.getElementById('userSection');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutButton = document.getElementById('logoutButton');

    // Check login status
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const username = localStorage.getItem('username');
        welcomeMessage.textContent = `Welcome, ${username}!`;
        userSection.style.display = 'block';
    } else {
        // If not logged in, redirect to login page
        window.location.href = './pages/login.html';
    }

    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = './pages/login.html';
        });
    }
});