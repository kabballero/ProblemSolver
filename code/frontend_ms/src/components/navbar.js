import React from 'react';
import '../css/mycss.css'

export default function Navbar({ changeValues, notification = false }) {
    const values1 = () => {
        changeValues(true, false, false, false, false)
    }
    const values2 = () => {
        changeValues(false, true, false, false, false)
    }
    const values3 = () => {
        if (notification == true) {
            changeValues(false, false, true, false, false)
        }
    }
    const values4 = () => {
        changeValues(false, false, false, true, false)

    }
    const values5 = () => {
        changeValues(false, false, false, false, true)

    }

    function handleClick(){
        localStorage.clear();
        window.location.replace('/');
    }
    
    return (
        <div className='navbar'>
            <h1 style={{ cursor: 'pointer' }} onClick={values1}>Buy Credits</h1>
            <h1 style={{ cursor: 'pointer' }} onClick={values2}>Submit New Problem</h1>
            <h1 style={{ cursor: 'pointer' }} onClick={values4}>User Statistics</h1>
            <h1 style={{ cursor: 'pointer' }} onClick={values5}>History</h1>
            <button className='logout-button' onClick={handleClick} style={{ fontWeight: 'bold' }} >Log Out</button>
            <div className='bell' >
                <span onClick={values3} style={!notification ? { cursor: 'not-allowed' } : {}}>🔔</span>
                {notification && <span className="badge"></span>}
            </div>
            <h1 className='solveme'>solveME</h1>
        </div>
    )
}