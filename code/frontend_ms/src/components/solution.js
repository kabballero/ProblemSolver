import React, { useState, useEffect } from 'react';
import '../css/mycss.css'

export default function Solution({ problemsID, changenotification }) {
    const [answers, setAnswers] = useState();
    const [stops, setStops] = useState();
    const [cost, setCost] = useState(-1);
    const [paid, setPaid] = useState(false);
    const [noSolustionFound,setNoSolustionFound]=useState(false);
    async function fetchData(url) {
        var json = await fetch(url).then((response) => response.json());
        return json;
    }
    function getRoutes(routes) {
        const maxRouteLength = Math.max(...routes.map(r => r.route.length));
        const transposed = Array.from({ length: maxRouteLength }, () => []);

        routes.forEach(route => {
            route.route.forEach((value, index) => {
                if (value == undefined) { transposed[index].push(-1) }
                transposed[index].push(value);
            });
            for (let i = route.route.length; i < maxRouteLength; i++) {
                transposed[i].push(-1);
            }
        });

        return transposed;
    }
    useEffect(() => {
        if (answers?.length > 0 && !noSolustionFound) {
            const param = answers[0]?.solution[0].routes;
            const s = getRoutes(param);
            setStops(s);
            console.log(stops);
        }
    }, [answers])
    useEffect(() => {
        fetchData(`http://localhost:3100/getsolution/${problemsID}`) //localhost or submit_new_problems_service
            .then((res) => {
                setAnswers(res)
                console.log(res[0].solution[0])
                if(res[0].solution[0]==='No solution found. Try different parameters.'){
                    setNoSolustionFound(true);
                    changenotification(false);
                    console.log('No solution found. Try different parameters.')
                }
                else{
                    const c = parseInt((res[0].solution[0].time_taken) * 10, 10);
                    setCost(c)
                    console.log(res)
                }
            })
            .catch((e) => {
                console.log(e.message)
            })
    }, [])
    /*useEffect(() => {
        if (paid) {
          play();
        }
      }, [paid, play]);*/
    async function handleClick() {
        fetchData(`http://localhost:9000/pay/${localStorage.getItem('userId')}/${cost}`) //!!!!!! localhost or pay_ms
            .then((res) => {
                if (res.error == 'Not enought credits') {
                    alert('You have not enough credits')
                }
                else {
                    setPaid(true);
                    //play();
                    const storedCredits = localStorage.getItem('credits');
                    const updatedCredits = storedCredits - parseInt(cost, 10);
                    localStorage.setItem('credits', updatedCredits);
                    changenotification(false);
                }
            })
            .catch((e) => {
                console.log(e.message)
            })
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            {!noSolustionFound && answers?.length > 0 && stops?.length > 0 && cost >= 0 && (
                <div className='container'>
                    <div style={!paid ? { WebkitFilter: 'blur(8px)' } : { display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1>Here is the solution for your problem</h1>
                        <h1>Max Route Distance: {answers[0].solution[0].max_route_distance}</h1>
                        <div className='solution-container'>
                            <table border="1">
                                <thead>
                                    <tr>
                                        {answers[0].solution[0].routes?.map((car) => (
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
                                        {answers[0].solution[0].routes?.map((car) => (
                                            <th key={car.vehicle_id}>max distance car {car.vehicle_id} made</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {answers[0].solution[0].routes?.map((distance, index) => (
                                            <td key={index}>{distance.distance}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {!paid && <div className='popup'>
                        <h1>In order to see your solution you have to pay {cost} credits</h1>
                        <button className='button' onClick={handleClick}>pay</button>
                    </div>}
                </div>
            )}
            {noSolustionFound && answers!==undefined &&
            <div>
                <h1>No solution found. Try different parameters.</h1>
            </div>
            }
            {!noSolustionFound && answers===undefined && 
            <div>
                <h1>loading...</h1>
            </div>
            }
        </div>
    )
}