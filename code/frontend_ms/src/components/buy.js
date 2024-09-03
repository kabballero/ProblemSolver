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
            const data = await fetchData(`http://localhost:3001/user/${localStorage.getItem('userId')}`)
            setCredits(data[0].credit);
        }
        getData();
    }, [])
    useEffect(() => {
        //const storedCredits = localStorage.getItem('credits');
        const storedId = localStorage.getItem('userId');

        /*if (storedCredits) {
            setCredits(parseInt(storedCredits, 10));
        }*/
        if (storedId) {
            setId(storedId);
        }
    }, []);
    async function handleClick(e) {
        e.preventDefault();
        await fetch(`http://localhost:9103/sell/${id}/${number}`) //!!!!!!!!!!!! localhost to see on browser, micro-buy-credit else
            .then((response) => response.json())
            .then((data) => {
                const updatedCredits = credits + parseInt(number, 10);
                //localStorage.setItem('credits', updatedCredits);
                setCredits(updatedCredits);
            });
    }
    return (
        <div>
            {credits?.length > 0 ? (
                <div className='container'>
                    <form className='container1' onSubmit={handleClick}>
                        <h1>you have {credits} credits</h1>
                        <input required type="text" className="input1" onChange={(e) => setNumber(e.target.value)} placeholder='number of credits' />
                        <button className='button'>buy</button>
                    </form>
                </div>) : (
                <h1>wait dawg</h1>
            )
            }
        </div>
    )
}