import React, { useEffect, useState } from 'react';
import '../css/mycss.css';

export default function Statistics() {
    const [averageTimes, setAverageTimes] = useState([]);
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setMessage('No user ID found. Please log in.');
            return;
        }

        const fetchStatistics = async () => {
            try {
                const response = await fetch(`http://localhost:4000/user-solutions/${userId}`);
                const data = await response.json();
                if (response.ok) {
                    setAverageTimes(data);
                } else {
                    setMessage(data.message || 'Failed to fetch statistics');
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setMessage('Error fetching statistics');
            }
        };

        fetchStatistics();
    }, []);

    return (
        <div className="statistics-container">
            <h2>Statistics</h2>
            
            {message && <div className="message">{message}</div>}
            
            {averageTimes.length > 0 ? (
                <table className="statistics-table">
                    <thead>
                        <tr>
                            <th>Number of Vehicles</th>
                            <th>Average Time Taken (seconds)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {averageTimes.map((stat, index) => (
                            <tr key={index}>
                                <td>{stat.vehicles}</td>
                                <td>{stat.average_time_taken.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !message && <div>No statistics found.</div>
            )}
        </div>
    );
}
