import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/statistics.css';

export default function Statistics() {
    const [data, setData] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chartImage, setChartImage] = useState(null); // For storing the chart image
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
                console.log(result)
                setData(result);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        // Fetch the chart image for average solution time based on userId
        const fetchChartImage = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const response = await fetch(`http://localhost:4000/user-solutions-chart/${userId}`);
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    setChartImage(imageUrl); // Set the image URL for the chart
                } catch (error) {
                    console.error('Error fetching chart image:', error);
                }
            }
        };

        fetchData();
        fetchChartImage(); // Fetch the chart image on component mount
    }, [navigate]);

    return (
        <div>
            {message && <p>{message}</p>}

            {loading ? (
                <h1>Loading...</h1>
            ) : (
                <>
                    {/* Display the chart image and heading */}
                    {chartImage && (
                        <>
                            <h2>Average solution time for number of vehicles</h2>
                            <img
                                src={chartImage}
                                alt="Chart showing average solution time"
                                style={{ width: '40%', height: 'auto', display: 'block', margin: '0 auto' }}
                            />
                        </>
                    )}

                    {data.length > 0 && <h2>Problem Table (for solved problems only)</h2>}  {/* Here is the new header */}

                    {/* Problems table */}
                    {data.length > 0 ? (
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
                </>
            )}
        </div>
    );
}

function TableRow({ entry }) {
    const [showGraph, setShowGraph] = useState(false);
    const [graphImage, setGraphImage] = useState(null);

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
                </td>
                <td>{new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(entry.time_taken)} seconds</td>
                <td>{entry.num_locations}</td>
                <td>{new Intl.NumberFormat('de-DE').format(entry.num_vehicles)}</td>
                <td>{entry.depot}</td>
                <td>{new Intl.NumberFormat('de-DE').format(entry.max_distance)} meters</td>
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
