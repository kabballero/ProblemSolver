import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/statistics.css';

export default function Statistics() {
    const [data, setData] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setMessage('No user ID found. Please log in.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`http://localhost:4000/problems_time/${userId}`);
                const result = await response.json();
                setData(result);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    return (
        <div>
            {message && <p>{message}</p>}
            {loading ? (
                <h1>Loading...</h1>
            ) : data.length > 0 ? (
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>Time Taken</th>
                            <th>Number of Locations</th>
                            <th>Number of Vehicles</th>
                            <th>Depot</th>
                            <th>Max Distance</th>
                            <th>Locations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry, index) => (
                            <TableRow key={index} entry={entry} />
                        ))}
                    </tbody>
                </table>
            ) : (
                <h1>No data available</h1>
            )}
        </div>
    );
}

function TableRow({ entry }) {
    const [showGraph, setShowGraph] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const [graphImage, setGraphImage] = useState(null);
    const [chartData, setChartData] = useState(null);

    const toggleGraph = async () => {
        if (showGraph) {
            setShowGraph(false);
        } else {
            setShowGraph(true);
            if (!graphImage) {
                try {
                    const problemId = entry.problem_id;
                    const response = await fetch(`http://localhost:4000/chart/${problemId}`);
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    setGraphImage(imageUrl);
                } catch (error) {
                    console.error('Error fetching graph:', error);
                }
            }
        }
    };

    const toggleChart = async () => {
        if (showChart) {
            setShowChart(false);
        } else {
            setShowChart(true);
            if (!chartData) {
                try {
                    const response = await fetch(`http://localhost:4000/problem-details/${entry.problem_id}`);
                    const result = await response.json();
                    setChartData(result);
                } catch (error) {
                    console.error('Error fetching chart data:', error);
                }
            }
        }
    };

    return (
        <>
            <tr>
                <td>
                    <button
                        className={`graph-button ${showGraph ? 'active' : ''}`}
                        onClick={toggleGraph}
                    >
                        Graph
                    </button>
                    <button
                        className={`chart-button ${showChart ? 'active' : ''}`}
                        onClick={toggleChart}
                    >
                        Chart
                    </button>
                </td>
                <td>{parseFloat(entry.time_taken).toFixed(4)} seconds</td>
                <td>{entry.num_locations}</td>
                <td>{entry.num_vehicles}</td>
                <td>{entry.depot}</td>
                <td>{entry.max_distance} meters</td>
                <td>
                    <LocationDropdown locations={entry.locations} />
                </td>
            </tr>

            {showGraph && graphImage && (
                <tr>
                    <td colSpan="7">
                        <img src={graphImage} alt="Graph" style={{ maxWidth: '100%' }} />
                    </td>
                </tr>
            )}

            {showChart && chartData && (
                <tr>
                    <td colSpan="7">
                        <div className="chart-container">
                            <h3>Chart Data</h3>
                            <p>Time Taken: {chartData.timeTaken.join(', ')} seconds</p>
                            <div className="chart-wrapper">
                                <ul className="chart-list">
                                    {chartData.chartData.map((point, i) => (
                                        <li key={i}>X: {point.x}, Y: {point.y}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function LocationDropdown({ locations }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <button onClick={toggleDropdown}>Locations</button>
            {isOpen && (
                <ul>
                    {locations.map((location, index) => (
                        <li key={index}>
                            Latitude: {location.Latitude}, Longitude: {location.Longitude}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
