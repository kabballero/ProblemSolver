import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Registration.css'; // Ensure you create and use this CSS file for styling

function Registration() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const registrationUrl = 'http://localhost:3001/register'; // Update with your backend server URL

    const register = async (event) => {
        event.preventDefault();
        if (!username || !email || !password) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        try {
            const response = await fetch(registrationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showMessage("Registration successful! You can now login.", "success");
                setTimeout(() => navigate('/'), 2000); // Redirect to login after 2 seconds
            } else {
                showMessage(data.message || "Registration failed.", "error");
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage("Something went wrong. Please try again later.", "error");
        }
    };

    const showMessage = (message, type) => {
        setMessage(message);
        document.getElementById('message').className = type; // Set the class for styling
    };

    return (
        <div className="registration-container">
            <h2>Register</h2>
            <form id="registrationForm" onSubmit={register}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            <div id="message" className="message">{message}</div>
            <div className="create-account-link">
                <a href="/login">Already have an account? Login here</a>
            </div>
        </div>
    );
}

export default Registration;