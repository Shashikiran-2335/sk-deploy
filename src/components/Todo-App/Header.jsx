import { useAuth } from "./security/AuthContect";

function HeaderComponent()
{
    // const navigate=useNavigate();
    const authContext=useAuth ();
    const isAuthenicated=authContext.isAuthenicated;
    return(
        <div className="header">
            <h1>
            HEADER 
            
            </h1>
            {isAuthenicated &&<a href="/welcome">Home</a>}
            {isAuthenicated &&<a href="/todos">Todo</a>}
            {!isAuthenicated &&<a href="/login">login</a>}
            {isAuthenicated &&<a href="/logout" onClick={()=>authContext.logout()}>logout</a>}
            
            
          <hr />
        </div>
    );
}
export default HeaderComponent;