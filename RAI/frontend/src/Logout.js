import { useEffect, useContext } from 'react';
import { UserContext } from './userContext';
import { Navigate } from 'react-router-dom';

function Logout(){
    const { setUserContext } = useContext(UserContext); 

    useEffect(function(){
        const logout = async function(){
            setUserContext(null);
            const res = await fetch("http://localhost:3001/uporabnik/logout", {
                method: 'GET', 
                credentials: 'include'
            });
        }
        logout();
    }, [setUserContext]);

    return (
        <Navigate replace to="/" />
    );
}

export default Logout;