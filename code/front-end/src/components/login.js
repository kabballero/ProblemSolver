import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/login', { //!!!!!! localhost or login_micro
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                console.log(data.credits);
                localStorage.setItem('userId', data.user_id); 
                localStorage.setItem('username', data.username);
                localStorage.setItem('credits', data.credits);

                setMessage('Login successful!');
                setTimeout(() => {
                    navigate('/user');  // Redirect to dashboard
                }, 1000);
            } else {
                setMessage(data.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Error details:', error);
            setMessage('Error logging in');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form id="loginForm" onSubmit={handleSubmit}>
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
                <button type="submit">Login</button>
            </form>
            {message && <div id="message" className="message">{message}</div>}
            <div className="create-account-link">
                <Link to="/register">Create an account</Link>
            </div>
        </div>
    );
}

export default Login;