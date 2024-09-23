import React, { useEffect, useState } from 'react';
import Solution from './solution'

export default function Submit({ changenotification, getProblemsid, setProblemCounter, problemCounter }) {
    const [select, setSelect] = useState('cars');
    console.log(select)
    return (
        <div className='container'>
            <div className='container1' style={{ flexDirection: 'row' }}>
                <label style={{ fontSize: '20px' }}>Select a problem category</label>
                <select value={select} onChange={(e) => setSelect(e.target.value)} className='select-container'>
                    <option key={'cars'} value={'cars'}>Car routes</option>
                    <option key={'graphs'} value={'graphs'}>Graphs</option>
                </select>
            </div>
            {select === 'cars' && <Cars changenotification={changenotification} getProblemsid={getProblemsid} setProblemCounter={setProblemCounter} problemCounter={problemCounter}/>}
            {select === 'graphs' && <Graphs />}
        </div>
    )
}

function Cars({ changenotification, getProblemsid, setProblemCounter, problemCounter}) {
    const [number, setNumber] = useState();
    const [depo, setDepo] = useState();
    const [max, setMax] = useState();
    const [file, setFile] = useState();
    const [problemsid, setProblemsid] = useState();
    const [success, setSuccess] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    //const [problemCounter, setProblemCounter] = useState(0);

    console.log(problemCounter)

    useEffect(()=>{
        setProblemCounter(parseInt(localStorage.getItem('submitedCounter')));
    },[])

    useEffect(()=>{
        console.log(problemCounter)
    },[problemCounter])

    async function handleClick(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('locationsFile', file);
        formData.append('num_vehicles', number);
        formData.append('depot', depo);
        formData.append('max_distance', max);
        formData.append('userID', localStorage.getItem('userId'));
        const data = await fetch(`http://localhost:3100/submit`, { //!!!!!! localhost or submit_ms
            method: 'Post',
            body: formData
        }).then((response) => response.text()).catch((e) => { console.log(e.message) })
        if (data !== undefined) {
            setSuccess(true);
            setProblemsid(data);
            const currentCounter = parseInt(localStorage.getItem('submitedCounter'), 10) || 0;
            localStorage.setItem('submitedCounter', currentCounter + 1);
            setProblemCounter(problemCounter=>problemCounter+1);
        }
        console.log(localStorage.getItem('userId'));
    }
    async function handleClick2() {
        setSuccess(false)
        const data = await fetch(`http://localhost:3100/solution/${problemsid}`) //!!!!!!!!
            .then((response) => response.json()).catch((e) => { console.log(e.message) })
        console.log(data)
        if (data !== undefined) {
            changenotification(true);
            getProblemsid(problemsid);
            const currentCounter = parseInt(localStorage.getItem('counter'), 10) || 0;
            localStorage.setItem('counter', currentCounter + 1);
            const currentCounter1 = parseInt(localStorage.getItem('submitedCounter'), 10) || 0;
            localStorage.setItem('submitedCounter', currentCounter1 - 1);
            //setProblemCounter(problemCounter=>problemCounter-1);
        }
        console.log(problemsid)
    }

    async function handleDelete(){
        try {
            const response = await fetch('http://localhost:3100/deleteQueue', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log('Queues deleted:', data);
                setProblemCounter(0)
                changenotification(false);
            } else {
                console.error('Error deleting queues:', data.message);
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
        localStorage.setItem('submitedCounter', 0);
        localStorage.setItem('counter', 0);
        //setProblemCounter(0);
        //setProblemCounter(0)
    }


    return (
        <div>
            <form onSubmit={handleClick} className='container1'>
                <h3>Please submit your problem's input</h3>
                <input required type="file" onChange={(e) => setFile(e.target.files[0])} accept=".json,application/json" />
                <input required type="text" className="input1" onChange={(e) => setNumber(e.target.value)} placeholder='number of vechiles' />
                <input required type="text" className="input1" onChange={(e) => setDepo(e.target.value)} placeholder='starting point' />
                <input required type="text" className="input1" onChange={(e) => setMax(e.target.value)} placeholder='maximum distance' />
                <button type="submit" disabled={problemCounter !== 0} className={`button ${problemCounter!==0 ? 'inactive' : ''}`}>SUBMIT</button>
                {problemCounter !== 0 &&
                    <div style={{display: 'flex',flexDirection: 'column', alignItems: 'center'}}>
                        <p className='text'>You can delete your submission (payment is automatic and non-refundable once you read your solution)
                        </p>
                        <button type="button" onClick={handleDelete} className='deleteButton'>DELETE</button>
                    </div>
                }
            </form>
            {success &&
                <div className='popup'>
                    <h1>Problem Submited</h1>
                    <button className='button' onClick={handleClick2}>OK</button>
                </div>}

        </div>
    )
}
function Graphs() {
    return (
        <img
            src="/image1.jpg"
            alt="Graph"
            style={{
                height: '65vh',     // Set height to 100% of the viewport height
                width: 'auto',       // Set width to 100% to cover the page width
                objectFit: 'cover',  // Cover the entire area while preserving the aspect ratio
                display: 'block',
                margin: '0',         // Remove any default margin
                borderRadius: '0',   // Remove border-radius if you want it fully extended
                backgroundColor: 'transparent'
            }}
        />
    );
}





