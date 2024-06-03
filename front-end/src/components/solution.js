import React, { useState, useEffect } from 'react';
import '../css/mycss.css'

export default function Solution({ problemsID, changenotification }) {
    const [answers, setAnswers] = useState();
    const [stops, setStops] = useState();
    //changenotification();
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
        if (answers?.length > 0) {
            const param = answers[0]?.solution[0].routes;
            const s = getRoutes(param);
            setStops(s);
            console.log(stops);
        }
    }, [answers])
    useEffect(() => {
        fetchData(`http://localhost:3100/getsolution/${problemsID}`)
            .then((res) => {
                setAnswers(res)
                console.log(res)
            })
            .catch((e) => {
                console.log(e.message)
            })
    }, [])
    return (
        <div>
            {answers?.length > 0 && stops?.length > 0 ? (
                <div className='container'>
                    <h1>Here is the solution for your problem</h1>
                    <h1>Max Route Distance: {answers[0].solution[0].max_route_distance}</h1>
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
                    <button onClick={changenotification}>click</button>
                </div>
            ) : (
                <h1>nothing here</h1>
            )}
        </div>
    )
}