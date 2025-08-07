import {  createContext, useContext, useState } from "react";

export const AuthContext=createContext();
export const useAuth=() =>useContext(AuthContext);
export default function AuthProvider({children})
{
    const [username,setUsername]=useState(10);
    const [isAuthenicated,setAuthenication]=useState(false);
    function login(username,password)
    {
        if(password==='2335')
            {
               setAuthenication(true);
                setUsername(username);
               return true
            }
            else
            {
                setAuthenication(false);
                return false
            }
    }
    function logout()
    {
        setAuthenication(false);
    }
    return (
        <AuthContext.Provider value={{username,isAuthenicated,logout,setUsername,login}}>
            {children}
        </AuthContext.Provider>
    );
}