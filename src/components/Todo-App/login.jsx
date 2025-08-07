import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./security/AuthContect";
function LoginComponent()
{
    const authContext=useAuth ();
    const [password,SetPassword] = useState("");
    const [username,SetUsername] = useState("");
    const [showSuccessmsg,setSuccessmsg] = useState(false);
    const [showErrormsg,setErrormsg] = useState(false);
    function HandleUsername(event){
       SetUsername(event.target.value);
    }
    function HandlePassword(event){
        SetPassword(event.target.value);
    }
    const navigate=useNavigate();
    function LoginSubmit()
    {
       // console.log(username,password);
        if(authContext.login(username,password))
            {
                navigate(`/welcome`);
            }
            else
            {
                setErrormsg(true);
              //  ErrorMsg();
            }
       

        
    }
    return(
        <div className="LoginComponent">
            {showErrormsg && <div className="ShowErrorMsg">Login failed</div>}
            <h2>Login</h2>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required value={username} onChange={HandleUsername}></input>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required value={password} onChange={HandlePassword}></input>
            <button type="submit" onClick={LoginSubmit}>Login</button>
        </div>
    );
}
export default LoginComponent;