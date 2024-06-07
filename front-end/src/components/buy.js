import React, { useState, useEffect } from 'react';

export default function Buy() {
    const [credits, setCredits] = useState();
    const [id, setId] = useState();
    const [number, setNumber] = useState();
    async function fetchData(url) {
        var json = await fetch(url).then((response) => response.json());
        return json;
    }
    useEffect(() => {
        async function getData() {
            const data = await fetchData(`http://localhost:9103/users`)
            setCredits(data[0].credits);
            setId(data[0]._id)
        }
        getData();
    }, [])
    async function handleClick(e) {
        e.preventDefault();
        await fetch(`http://localhost:9103/sell/${id}/${number}`)
        .then((response) => response.json())
        .then(window.location.reload());
    }
    return (
        <div className='container'>
            <form className='container1' onSubmit={handleClick}>
                <h1>you have {credits} credits</h1>
                <input required type="text" className="input1" onChange={(e) => setNumber(e.target.value)} placeholder='number of credits' />
                <button className='button'>buy</button>
            </form>
        </div>
    )
}