import React, {useEffect,useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Submit from './submit';
import Buy from './buy';
import Navbar from './navbar';
import Solution from './solution';
import Statistics from './statistics';
import '../css/mycss.css'
import '../css/history.css'

export default function User() {
    const [buy,setBuy]=useState(false);
    const [notification, setNotiffication] = useState(false);
    const [problemsID,setProblemsID]=useState();
    const [submit,setSubmit]=useState(false);
    const [solution,setSolution]=useState(false);
    const [statistics,setStatistics]=useState(false);
    const [history,setHistory]=useState(true);
    function getProblemsid(value){
        setProblemsID(value);
    }
    function handleChangeValues(value1,value2,value3,value4,value5){
        setBuy(value1);
        setSubmit(value2);
        setSolution(value3);
        setStatistics(value4);
        setHistory(value5);
    }
    function changenotification(value){
        setNotiffication(value)
    }
    return (
        <div>
            <Navbar changeValues={handleChangeValues} notification={notification}/>
            {history && <UserHistory/>}
        {buy && <Buy/>}
        {solution && <Solution changenotification={changenotification} problemsID={problemsID}/>}
        {submit && <Submit changenotification={changenotification} getProblemsid={getProblemsid}/>}
        {statistics && <Statistics/>}
        </div>
    )
}

function UserHistory() {
    const [problems, setProblems] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setMessage('No user ID found. Please log in.');
            setTimeout(() => {
                navigate('/login');  // Redirect to login if no user ID found
            }, 2000);
            return;
        }

        const fetchUserHistory = async () => {
            try {
                const response = await fetch(`http://localhost:3010/user_history/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setProblems(data);
                } else {
                    setMessage(data.message || 'Failed to fetch user history');
                }
            } catch (error) {
                console.error('Error fetching user history:', error);
                setMessage('Error fetching user history');
            }
        };

        fetchUserHistory();
    }, [navigate]);

    return (
        <div className="user-history-container">
            <h2>User History</h2>
            
            {message && <div className="message">{message}</div>}
            
            {problems.length > 0 ? (
                <ul className="problems-list">
                    {problems.map((problem) => (
                        <li key={problem._id} className="problem-item">
                            <div><strong>Date:</strong> {new Date(problem.date).toLocaleString()}</div>
                            <div><strong>Input (locations):</strong> {JSON.stringify(problem.problemsinput)}</div>
                            <div><strong>Solution:</strong> {JSON.stringify(problem.solution)}</div>
                        </li>
                    ))}
                </ul>
            ) : (
                !message && <div>No problems found.</div>
            )}
        </div>
    );
    
}