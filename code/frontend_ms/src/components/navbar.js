import React from 'react';
import '../css/mycss.css'

export default function Navbar({changeValues,notification=false}) {
    const values1 = ()=>{
        changeValues(true,false,false,false,false)
    }
    const values2 = ()=>{
        changeValues(false,true,false,false,false)
    }
    const values3 = ()=>{
        if(notification==true){
            changeValues(false,false,true,false,false)
        }
    }
    const values4 = ()=>{
        changeValues(false,false,false,true,false)
        
    }
    const values5 = ()=>{
        changeValues(false,false,false,false,true)
        
    }
    return (
            <div className='navbar'>
                <h1 style={{cursor: 'pointer'}} onClick={values1}>buy credits</h1>
                <h1 style={{cursor: 'pointer'}} onClick={values2}>submit problem</h1>
                <h1 style={{cursor: 'pointer'}} onClick={values4}>statistics</h1>
                <h1 style={{cursor: 'pointer'}} onClick={values5}>history</h1>
                <div className='bell' >
                    <span onClick={values3} style={!notification ? {cursor: 'not-allowed'}:{}}>🔔</span>
                    {notification && <span className="badge"></span>}
                </div>
                <h1 className='solveme'>SOLVEME</h1>
            </div>
            )
        }