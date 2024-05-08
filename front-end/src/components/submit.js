import React, { useState } from 'react';
import Solution from './solution'

export default function Submit() {
    const [select, setSelect] = useState('cars');
    console.log(select)
    return (
        <div className='container'>
            <div style={{ flexDirection: 'row' }}>
                <label style={{ fontSize: '30px' }}>select a category</label>
                <select value={select} onChange={(e) => setSelect(e.target.value)} className='button' style={{ borderRadius: '0px', fontSize: '25px' }}>
                    <option key={'cars'} value={'cars'}>cars</option>
                    <option key={'graphs'} value={'graphs'}>graphs</option>
                </select>
            </div>
            {select === 'cars' && <Cars />}
        </div>
    )
}

function Cars() {
    const [number, setNumber] = useState();
    const [depo, setDepo] = useState();
    const [max, setMax] = useState();
    const [file, setFile] = useState();
    const [problemsid, setProblemsid] = useState();
    const [success, setSuccess] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    async function handleClick() {
        const formData = new FormData();
        formData.append('locationsFile', file);
        formData.append('num_vehicles', number);
        formData.append('depot', depo);
        formData.append('max_distance', max);
        const data = await fetch(`http://localhost:3100/submit`, {
            method: 'Post',
            body: formData
        }).then((response) => response.text()).catch((e) => { console.log(e.message) })
        if(data!==undefined){setSuccess(true);setProblemsid(data)}
        //console.log(data);
    }
    async function handleClick2(){
        const data = await fetch(`http://localhost:3100/solution/${problemsid}`)
        .then((response) => response.json()).catch((e) => { console.log(e.message) })
        console.log(data)
        console.log(problemsid)
        setSuccess(false)
        //setShowSolution(true)
    }

    return (
        <div className='container'>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".json,application/json" />
            <input type="text" className="input" onChange={(e) => setNumber(e.target.value)} placeholder='number of vechiles' />
            <input type="text" className="input" onChange={(e) => setDepo(e.target.value)} placeholder='deposite' />
            <input type="text" className="input" onChange={(e) => setMax(e.target.value)} placeholder='maximum distance' />
            <button onClick={handleClick} className='button'>submit</button>
            {success && 
            <div className='popup' style={{backgroundColor: "purple"}}>
                <h1>Problem Submited</h1>
                <button className='button' onClick={handleClick2}>okay</button>
            </div>}
            
        </div>
    )
}

