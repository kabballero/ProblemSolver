import React,{useState,useEffect} from 'react';

export default function Buy() {
    const [credits,setCredits]=useState();
    const [id,setId]=useState();
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
    async function handleClick(amount){
        console.log(amount);
        await fetch(`http://localhost:9103/sell/${id}/${amount}`).then((response) => response.json());
    }
    return(
        <div className='container'>
        <h1>you have: {credits} credits</h1>
        <button onClick={handleClick.bind(null,10)} className='button'>buy 10</button>
        <button onClick={handleClick.bind(null,20)} className='button'>buy 20</button>
        </div>
    )
}