import React, {useState} from 'react';
import Submit from './submit';
import Buy from './buy';
import Navbar from './navbar';
import Solution from './solution';
import '../css/mycss.css'

export default function Login() {
    const [buy,setBuy]=useState(false);
    const [notification, setNotiffication] = useState(false);
    const [problemsID,setProblemsID]=useState();
    const [submit,setSubmit]=useState(false);
    const [solution,setSolution]=useState(false);
    function getProblemsid(value){
        setProblemsID(value);
    }
    function handleChangeValues(value1,value2,value3){
        setBuy(value1);
        setSubmit(value2);
        setSolution(value3);
    }
    function changenotification(value){
        setNotiffication(value)
    }
    return (
        <div>
            <Navbar changeValues={handleChangeValues} notification={notification}/>
            {!buy && !submit && !solution && <div>
            <div className='h2'>
                <h1>metadata</h1>
                {Array(100).fill().map((_, index) => (
                    <h3 key={index}>hello</h3>
                ))}
            </div>
            <h1 className='h3'>metadata2</h1>
        </div>}
        {buy && <Buy/>}
        {solution && <Solution changenotification={changenotification} problemsID={problemsID}/>}
        {submit && <Submit changenotification={changenotification} getProblemsid={getProblemsid}/>}
        </div>
    )
}