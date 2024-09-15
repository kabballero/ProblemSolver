import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/history.css';
import '../css/mycss.css'

export default function UserHistory() {
    const [problems, setProblems] = useState([]);
    const [message, setMessage] = useState('');
    const [solution, setSolution]=useState(false);
    const [solutionInput,setSolutionInput]=useState('')
    const [solutionID,setSolutionID]=useState();
    const [locations,setLocations]=useState(false);

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
                    //console.log(data)
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

    function handleClick(problem){
        if(solution){
            setSolution(false)
        }
        else 
            setSolution(true)
        setSolutionInput(problem)
        setSolutionID(problem._id)
    }

    function handleClick2(problem){
        if(locations){
            setLocations(false)
        }
        else 
            setLocations(true)
        setSolutionInput(problem)
        setSolutionID(problem._id)
    }

    return (
        <div className="user-history-container">
            <h2>User History</h2>

            {message && <div className="message">{message}</div>}

            {problems.length > 0 ? (
                <div className='problems-list'>
                    {problems.map((problem) => (
                        <div key={problem._id} className="problem-item">
                            <div><strong>Date: </strong> {new Date(problem.date).toLocaleString()}</div>
                            <div><strong>number of locations: </strong>{problem.problemsinput[0].locations.length}</div>
                            <button className={`locations-button ${locations && solutionID===problem._id ? 'active' : ''}`} onClick={handleClick2.bind(null,problem)}>view locations</button>
                            {locations && solutionID===problem._id && <ViewLocations problem={solutionInput}/>}
                            <div><strong>number of vehicles: </strong>{problem.problemsinput[0].num_vehicles}</div>
                            <div><strong>max distance: </strong>{problem.problemsinput[0].max_distance}</div>
                            <button className={`solution-button ${solution && solutionID===problem._id ? 'active' : ''}`} onClick={handleClick.bind(null,problem)}>view solution</button>
                            {solution && solutionID===problem._id && <ViewSolution problem={solutionInput}/>}
                        </div>
                    ))}
                </div>
            ) : (
                !message && <div>loading...</div>
            )}
        </div>
    );

}

function ViewSolution({ problem }) {
    const [stops, setStops] = useState();
    const [noSolutionFound,setNoSolutionFound]=useState(false);
    const [noSolutionYet,setNoSolutionYet]=useState(false);

    console.log(problem)

    function getRoutes(routes) {
        const maxRouteLength = Math.max(...routes.map(r => r.route.length));
        const transposed = Array.from({ length: maxRouteLength }, () => []);

        routes.forEach(route => {
            route.route.forEach((value, index) => {
                if (value === undefined) { transposed[index].push(-1) }
                transposed[index].push(value);
            });
            for (let i = route.route.length; i < maxRouteLength; i++) {
                transposed[i].push(-1);
            }
        });

        return transposed;
    }
    useEffect(() => {
        if (problem?.solution.length>0) {
            const param = problem.solution[0].routes || [];
            console.log(param)
            const s = getRoutes(param);
            setStops(s);
            //console.log(stops)
        }
        if(problem.solution[0]==='No solution found. Try different parameters.')
            setNoSolutionFound(true)
        if(problem?.solution.length===0)
            setNoSolutionYet(true)
    }, [problem]);
    
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            {problem && !noSolutionFound && !noSolutionYet && stops?.length > 0 && (
                <div className='container' style={{top: '0'}}>
                        <strong>Max Route Distance: {problem.solution[0].max_route_distance}</strong>
                        <div className='solution-container'>
                            <table border="1">
                                <thead>
                                    <tr>
                                        {problem.solution[0].routes?.map((car) => (
                                            <th key={car.vehicle_id}>routes car {car.vehicle_id} followed</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {stops?.map((row, rowindex) => (
                                        <tr key={rowindex}>
                                            {row?.map((stop, colindex) => {
                                                if (stop !== -1) {
                                                    return <td key={colindex}>{stop}</td>;
                                                } else {
                                                    return <td key={colindex}>-</td>;
                                                }
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='solution-container'>
                            <table border="1">
                                <thead>
                                    <tr>
                                        {problem.solution[0].routes?.map((car) => (
                                            <th key={car.vehicle_id}>max distance car {car.vehicle_id} made</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {problem.solution[0].routes?.map((distance, index) => (
                                            <td key={index}>{distance.distance}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                </div>
            )}
            {!noSolutionFound && !noSolutionYet && !stops &&
                (
                <h1>loading...</h1>
            )}
            {noSolutionFound &&(
                <h1>No solution found. Try different parameters.</h1>
            )}
            {noSolutionYet  &&
            <h1>the problem is not solved yet</h1>}
        </div>
    )
}

function ViewLocations({ problem }) {
    console.log(problem.problemsinput[0].locations)
    return(
        <table border="1">
            <thead>
                <th>Latitude</th>
                <th>Longitude</th>
            </thead>
            <tbody>
                {problem.problemsinput[0].locations.map((row,rowindex)=> (
                    <tr key={row.index}>
                        <td>{row.Latitude}</td>
                        <td>{row.Longitude}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}