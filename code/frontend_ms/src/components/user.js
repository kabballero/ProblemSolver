import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Submit from './submit';
import Buy from './buy';
import Navbar from './navbar';
import Solution from './solution';
import Statistics from './statistics';
import History from './history';
import '../css/mycss.css'

export default function User() {
    const [buy, setBuy] = useState(false);
    const [notification, setNotiffication] = useState(false);
    const [problemsID, setProblemsID] = useState();
    const [submit, setSubmit] = useState(false);
    const [solution, setSolution] = useState(false);
    const [statistics, setStatistics] = useState(false);
    const [history, setHistory] = useState(true);

    function getProblemsid(value) {
        setProblemsID(value);
    }
    function handleChangeValues(value1, value2, value3, value4, value5) {
        setBuy(value1);
        setSubmit(value2);
        setSolution(value3);
        setStatistics(value4);
        setHistory(value5);
    }
    function changenotification(value) {
        setNotiffication(value)
    }
    return (
        <div>
            <Navbar changeValues={handleChangeValues} notification={notification} />
            {history && <History />}
            {buy && <Buy />}
            {solution && <Solution changenotification={changenotification} problemsID={problemsID} />}
            {submit && <Submit changenotification={changenotification} getProblemsid={getProblemsid} />}
            {statistics && <Statistics />}
        </div>
    )
}

