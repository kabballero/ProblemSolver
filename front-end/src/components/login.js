import React, {useState} from 'react';
import Submit from './submit';
import Buy from './buy';
import Navbar from './navbar';
import '../css/mycss.css'

export default function Login() {
    const [buy,setBuy]=useState(false);
    const [submit,setSubmit]=useState(false);
    function handleChangeValues(value1,value2){
        setBuy(value1);
        setSubmit(value2);
    }
    return (
        <div>
            <Navbar changeValues={handleChangeValues}/>
            {!buy && !submit && <div>
            <div className='h2'>
                <h1>metadata</h1>
                {Array(100).fill().map((_, index) => (
                    <h3 key={index}>hello</h3>
                ))}
            </div>
            <h1 className='h3'>metadata2</h1>
        </div>}
        {buy && <Buy/>}
        {submit && <Submit/>}
        </div>
    )
}