document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Simulated user data (in a real app, this would come from a backend)
    const validUsers = [
        { username: 'student1', password: 'password123' },
        { username: 'student2', password: 'securePwd456' }
    ];

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Validate credentials
        const user = validUsers.find(
            u => u.username === username && u.password === password
        );

        if (user) {
            // Successful login
            errorMessage.textContent = '';
            // In a real app, you'd use secure authentication methods
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);

            // Redirect to home or dashboard
            window.location.href = '../index.html';
        } else {
            // Failed login
            errorMessage.textContent = 'Invalid username or password';
        }
    });

    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = '../index.html';
    }
});