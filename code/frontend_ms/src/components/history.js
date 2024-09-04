import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/history.css';


function UserHistory() {
    const [problems, setProblems] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setMessage('No user ID found. Please log in.');
            setTimeout(() => {
                navigate('/login');  // Redirect to login if no user ID found
            }, 2000);
            return;
        }

        const fetchUserHistory = async () => {
            try {
                const response = await fetch(`http://localhost:3010/user_history/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setProblems(data);
                } else {
                    setMessage(data.message || 'Failed to fetch user history');
                }
            } catch (error) {
                console.error('Error fetching user history:', error);
                setMessage('Error fetching user history');
            }
        };

        fetchUserHistory();
    }, [navigate]);

    return (
        <div className="user-history-container">
            <h2>User History</h2>
            
            {message && <div className="message">{message}</div>}
            
            {problems.length > 0 ? (
                <ul className="problems-list">
                    {problems.map((problem) => (
                        <li key={problem._id} className="problem-item">
                            <div><strong>Date:</strong> {new Date(problem.date).toLocaleString()}</div>
                            <div><strong>Input (locations):</strong> {JSON.stringify(problem.problemsinput)}</div>
                            <div><strong>Solution:</strong> {JSON.stringify(problem.solution)}</div>
                        </li>
                    ))}
                </ul>
            ) : (
                !message && <div>LOADING...</div>
            )}
        </div>
    );
    
}

export default UserHistory;
