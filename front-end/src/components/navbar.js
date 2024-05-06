import React from 'react';
import '../css/mycss.css'

export default function Navbar({changeValues}) {
    const values1 = ()=>{
        changeValues(true,false)
    }
    const values2 = ()=>{
        changeValues(false,true)
    }
    return (
            <div className='navbar'>
                <h1 style={{cursor: 'pointer'}} onClick={values1}>buy credits</h1>
                <h1 style={{cursor: 'pointer'}} onClick={values2}>submit problem</h1>
                <h1 style={{ position: 'absolute', left: '0px' }}>SOLVEME</h1>
            </div>
            )
        }