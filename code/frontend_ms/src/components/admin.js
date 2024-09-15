import React, { useState, useEffect } from "react";
import '../css/admin.css'
import '../css/mycss.css'

export default function Admin() {
    const [username, setUsername] = useState('')
    const [numVehicles, setNumVehicles] = useState('')
    const [maxDistance, setMaxDistance] = useState('')
    const [depot, setDepot] = useState('')
    const [num_locations, setNum_locations] = useState('')
    const [listUsernames, setListUsernames] = useState('')
    const [showList, setShowList] = useState(false)
    const [problems, setProblems] = useState('')
    const [solution, setSolution] = useState(false);
    const [solutionInput, setSolutionInput] = useState('')
    const [solutionID, setSolutionID] = useState();
    const [locations, setLocations] = useState(false);
    const [select,setSelect]=useState(-1)

    const filteredListUsernames = username
        ? listUsernames.filter(item => item.username && item.username.toLowerCase().includes(username.toLowerCase()))
        : listUsernames;

    async function handleSubmit(event) {
        event.preventDefault();
        console.log(select)
        const data = await fetch(`http://localhost:4200/problemsUsername/${username || 'undefined'}/${numVehicles || 'undefined'}/${maxDistance || 'undefined'}/${depot || 'undefined'}/${num_locations || 'undefined'}/${select}`)
            .then((response) => response.json()).catch((error) => console.log(error))
        console.log(data)
        setProblems(data)
    }

    async function usernamesDropdown() {
        const data = await fetch(`http://localhost:4200/users`)
            .then((response) => response.json()).catch((error) => console.log(error))
        setListUsernames(data)
        setShowList(true)
        console.log(listUsernames)
    }

    function handleClick(problem) {
        if (solution) {
            setSolution(false)
        }
        else
            setSolution(true)
        setSolutionInput(problem)
        setSolutionID(problem._id)
    }

    function handleClick2(problem) {
        if (locations) {
            setLocations(false)
        }
        else
            setLocations(true)
        setSolutionInput(problem)
        setSolutionID(problem._id)
    }

    return (
        <div>
            <form className="formAdminsHistory" onSubmit={handleSubmit}>
                <div className="placeholder">
                    <input type='text' placeholder='number of vehicles' onClick={() => setShowList(false)} onChange={(e) => setNumVehicles(e.target.value)} />
                </div>
                <div className="placeholder">
                    <input type='text' placeholder='username' onClick={usernamesDropdown} onChange={(e) => setUsername(e.target.value)} />
                    {showList && <span className="cancel-symbol" onClick={() => setShowList(false)}>🗙</span>}
                    {showList && filteredListUsernames?.length > 0 &&
                        <div className="listUsernames">
                            {filteredListUsernames?.map((usernameItem, index) => (
                                <div key={index}>
                                    <p>{usernameItem.username}</p>
                                </div>
                            ))}
                        </div>
                    }
                </div>
                <div className="placeholder">
                    <input type='text' placeholder='max distance' onClick={() => setShowList(false)} onChange={(e) => setMaxDistance(e.target.value)} />
                </div>
                <div className="placeholder">
                    <input type='text' placeholder='starting point' onClick={() => setShowList(false)} onChange={(e) => setDepot(e.target.value)} />
                </div>
                <div className="placeholder">
                    <input type='text' placeholder='locations' onClick={() => setShowList(false)} onChange={(e) => setNum_locations(e.target.value)} />
                </div>
                <select onChange={(e)=>setSelect(e.target.value)} className="admin-select-container">
                    <option value ="-1">anything</option>
                    <option value="1">solved</option>
                    <option value="0">unsolved</option>
                </select>
                <button className="adminsFormButton" type='submit'>submit</button>
                <button className="adminslogoutbutton" onClick={()=>window.location.replace('/')}>logout</button>
            </form>
            {problems?.length > 0 ? (
                <div className='problems-list'>
                    {problems.map((problem) => (
                        <div key={problem._id} className="problem-item">
                            <div><strong>Date: </strong> {new Date(problem.date).toLocaleString()}</div>
                            <div><strong>number of locations: </strong>{problem.problemsinput[0].locations.length}</div>
                            <button className={`locations-button ${locations && solutionID === problem._id ? 'active' : ''}`} onClick={handleClick2.bind(null, problem)}>view locations</button>
                            {locations && solutionID === problem._id && <ViewLocations problem={solutionInput} />}
                            <div><strong>number of vehicles: </strong>{problem.problemsinput[0].num_vehicles}</div>
                            <div><strong>max distance: </strong>{problem.problemsinput[0].max_distance}</div>
                            <button className={`solution-button ${solution && solutionID === problem._id ? 'active' : ''}`} onClick={handleClick.bind(null, problem)}>view solution</button>
                            {solution && solutionID === problem._id && <ViewSolution problem={solutionInput} />}
                        </div>
                    ))}
                </div>
            ) : (
                <div>here will be shown the history</div>
            )}
        </div>
    )
}

function ViewSolution({ problem }) {
    const [stops, setStops] = useState();
    const [noSolutionFound, setNoSolutionFound] = useState(false);
    const [noSolutionYet, setNoSolutionYet] = useState(false);

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
        if (problem?.solution.length > 0) {
            const param = problem.solution[0].routes || [];
            console.log(param)
            const s = getRoutes(param);
            setStops(s);
            //console.log(stops)
        }
        if (problem.solution[0] === 'No solution found. Try different parameters.')
            setNoSolutionFound(true)
        if (problem?.solution.length === 0)
            setNoSolutionYet(true)
    }, [problem]);

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            {problem && !noSolutionFound && !noSolutionYet && stops?.length > 0 && (
                <div className='container' style={{ top: '0' }}>
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
            {noSolutionFound && (
                <h1>No solution found. Try different parameters.</h1>
            )}
            {noSolutionYet &&
                <h1>the problem is not solved yet</h1>}
        </div>
    )
}

function ViewLocations({ problem }) {
    console.log(problem.problemsinput[0].locations)
    return (
        <table border="1">
            <thead>
                <th>Latitude</th>
                <th>Longitude</th>
            </thead>
            <tbody>
                {problem.problemsinput[0].locations.map((row, rowindex) => (
                    <tr key={row.index}>
                        <td>{row.Latitude}</td>
                        <td>{row.Longitude}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}