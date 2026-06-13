import { useNavigate,useParams} from "react-router-dom";
import { useAuth } from "./security/AuthContect";
function WelcomeComponent()
{
    const navigate=useNavigate();
    const params=useParams();
    const authContext=useAuth ();
    return(
        <div className="WelcomeComponent">
            <h1>

            Welcome {authContext.username}
            
            </h1>
            Manage Your Todos - <button onClick={() => {
                 navigate(`/todos`);
            }}> click here</button>
        </div>
    );
}
export default WelcomeComponent;