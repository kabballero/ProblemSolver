import React, {useState,useEffect} from 'react';
import '../css/mycss.css'

export default function Statistics(){
    const [data,setData]=useState();
    useEffect(()=>{
        async function prefetch(){
            const d =  await fetch (`http://localhost:4000/problems/663a2ce8a01fadc8147bd2eb`).then((response) => response.json())
            console.log(d.message)
            setData(d.message)
        }
        prefetch();
    },[])
    return(
        <div>
            {data?.length>0 ? (
            <h1>{data}</h1>):(
                <h1>loading...</h1>
            )}
        </div>
    )
}