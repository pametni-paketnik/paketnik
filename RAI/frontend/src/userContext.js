import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext(); 

 export const UserProvider = (props) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("uporabnik"); 
        return savedUser ? JSON.parse(savedUser) : null; 
    }); 

    const setUserContext = (userInfo) =>{
        if(userInfo){
            localStorage.setItem("uporabnik", JSON.stringify(userInfo)); 
        }else{
            localStorage.removeItem("uporabnik"); 
            localStorage.removeItem("cart"); 
            localStorage.removeItem("final_orders"); 
        }
        setUser(userInfo); 
    };
    return (
        <UserContext.Provider value={{user, setUserContext}}>
            {props.children}
        </UserContext.Provider>
    );
};