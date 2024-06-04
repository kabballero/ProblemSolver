import React, { useState } from 'react';
import Solution from './solution'

export default function Submit({ changenotification, getProblemsid }) {
    const [select, setSelect] = useState('cars');
    console.log(select)
    return (
        <div className='container'>
            <div className='container1' style={{ flexDirection: 'row' }}>
                <label style={{ fontSize: '20px' }}>select your problen's category</label>
                <select value={select} onChange={(e) => setSelect(e.target.value)} className='select-container'>
                    <option key={'cars'} value={'cars'}>cars</option>
                    <option key={'graphs'} value={'graphs'}>graphs</option>
                </select>
            </div>
            {select === 'cars' && <Cars changenotification={changenotification} getProblemsid={getProblemsid} />}
        </div>
    )
}

function Cars({ changenotification, getProblemsid }) {
    const [number, setNumber] = useState();
    const [depo, setDepo] = useState();
    const [max, setMax] = useState();
    const [file, setFile] = useState();
    const [problemsid, setProblemsid] = useState();
    const [success, setSuccess] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    async function handleClick(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('locationsFile', file);
        formData.append('num_vehicles', number);
        formData.append('depot', depo);
        formData.append('max_distance', max);
        const data = await fetch(`http://localhost:3100/submit`, {
            method: 'Post',
            body: formData
        }).then((response) => response.text()).catch((e) => { console.log(e.message) })
        if (data !== undefined) { setSuccess(true); setProblemsid(data) }
        //console.log(data);
    }
    async function handleClick2() {
        setSuccess(false)
        const data = await fetch(`http://localhost:3100/solution/${problemsid}`)
            .then((response) => response.json()).catch((e) => { console.log(e.message) })
        console.log(data)
        if (data !== undefined) {
            changenotification(true);
            getProblemsid(problemsid);
        }
        else {
            console.log('no')
        }
        console.log(problemsid)
    }

    return (
        <div>
            <form onSubmit={handleClick} className='container1'>
                <h3>Please submit your problem's input</h3>
                <input required type="file" onChange={(e) => setFile(e.target.files[0])} accept=".json,application/json" />
                <input required type="text" className="input1" onChange={(e) => setNumber(e.target.value)} placeholder='number of vechiles' />
                <input required type="text" className="input1" onChange={(e) => setDepo(e.target.value)} placeholder='deposite' />
                <input required type="text" className="input1" onChange={(e) => setMax(e.target.value)} placeholder='maximum distance' />
                <button className='button'>submit</button>
            </form>
            {success &&
                <div className='popup'>
                    <h1>Problem Submited</h1>
                    <button className='button' onClick={handleClick2}>okay</button>
                </div>}

        </div>
    )
}

