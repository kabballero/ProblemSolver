import React from 'react';
import '../css/mycss.css'

export default function Navbar({changeValues,notification=false}) {
    const values1 = ()=>{
        changeValues(true,false,false)
    }
    const values2 = ()=>{
        changeValues(false,true,false)
    }
    const values3 = ()=>{
        changeValues(false,false,true)
    }
    return (
            <div className='navbar'>
                <h1 style={{cursor: 'pointer'}} onClick={values1}>buy credits</h1>
                <h1 style={{cursor: 'pointer'}} onClick={values2}>submit problem</h1>
                <div className='bell' >
                    <span onClick={values3}>🔔</span>
                    {notification && <span className="badge">1</span>}
                </div>
                <h1 style={{ position: 'absolute', left: '0px' }}>SOLVEME</h1>
            </div>
            )
        }