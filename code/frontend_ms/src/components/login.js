import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import '../css/Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                if (data.username === 'admin') {
                    setMessage('Login successful!');
                    setTimeout(() => {
                        navigate('/admin');  // Redirect to dashboard
                    }, 1000);
                }
                else {
                    localStorage.setItem('userId', data.user_id);
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('credits', data.credits);

                    setMessage('Login successful!');
                    setTimeout(() => {
                        navigate('/user');  // Redirect to dashboard
                    }, 1000);
                }
            } else {
                setMessage(data.message || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Error details:', error);
            setMessage('Error logging in');
        }
    };

    const handleGoogleSuccess = async (response) => {
        console.log("Google login success response: ", response);

        try {
            const res = await fetch('http://localhost:3001/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: response.credential })
            });
            const data = await res.json();
            console.log("Response from backend: ", data);

            if (data.success) {
                localStorage.setItem('userId', data.user_id);
                localStorage.setItem('username', data.username);
                localStorage.setItem('credits', data.credits);

                setMessage('Login successful!');
                setTimeout(() => {
                    navigate('/user');  // Redirect to dashboard
                }, 1000);
            } else {
                setMessage(data.message || 'Google login failed');
            }
        } catch (error) {
            console.error('Error with Google login:', error);
            setMessage('Error with Google login');
        }
    };


    const handleGoogleFailure = (error) => {
        console.error('Google Sign-In Error:', error);
        setMessage('Google login failed');
    };

    return (
        <GoogleOAuthProvider clientId="344348236054-m9crl6tr7ilteh71chkbg4nkk74apl88.apps.googleusercontent.com">
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
                <div className="separator">
                    <span>or</span>
                </div>
                <div className="google-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                        useOneTap
                    />
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

export default Login;