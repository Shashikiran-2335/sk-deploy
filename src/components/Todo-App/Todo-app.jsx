import {BrowserRouter,Navigate,Route,Routes} from 'react-router-dom'
import LogoutComponent from "./Logout";
import LoginComponent from "./login";
import WelcomeComponent from "./welcome";
import HeaderComponent from "./Header";
import FotterComponent from "./Fotter";
import TodoComponent from "./Todo";
import AuthProvider, { useAuth } from './security/AuthContect';

function AuthenticationRouter({children})
{
    const auth=useAuth();
    console.log(auth)
    if(auth.isAuthenicated)
    return children
   return <Navigate to="/"/>;
}
export default function TodoApp()
{   return (

        <div className="TodoApp">
            <AuthProvider>
            <HeaderComponent/>
            <BrowserRouter>
            <Routes>
                <Route path='/' element={<LoginComponent/>}>  </Route>
                <Route path='/login' element={<LoginComponent/>}>  </Route>
                <Route path='/welcome' element={
                    <AuthenticationRouter>

                    <WelcomeComponent/>
                    </AuthenticationRouter>
                    }>  </Route>
                <Route path='/todos' element={
                    <AuthenticationRouter>
                    <TodoComponent/>
                    </AuthenticationRouter>
                    }>  </Route>
                <Route path='/logout' element={<LogoutComponent/>}>  </Route>
            </Routes>
            </BrowserRouter>
            </AuthProvider>
            <FotterComponent/>
                </div>
    );
}

// function TodoComponent()
// {
//     const today =new Date();
//     const targerDate=new Date(today.getFullYear()+12,today.getMonth(),today.getDay());
//     const todos = [

//         {
//             id: 1,
//             description: "hahahha",
//             done: false,
//             targerdate : targerDate
//         },
//         {
//             id: 2,
//             description: "Finish the report",
//             done: false,
//             targerdate : targerDate
//         },
//         {
//             id: 3,
//             description: "Call John",
//             done: false,
//             targerdate : targerDate
//         }
//     ];

//     return (
//         <div className="TodoComponent">
//             <h2>To-Do List</h2>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>Description</th>
//                         <th>Isdone</th>
//                         <th>TargetDate</th>
                    
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {todos.map(todo => (
//                         <tr key={todo.id}>
//                             <td>{todo.id}</td>
//                             <td>{todo.description}</td>
//                             <td>{todo.done.toString()}</td>
//                             <td>{todo.targerdate.toString()}</td>
//                             <td>
//                                 <button className="update-button">Update</button>
//                                 <button className="done-button">Done</button>
//                                 <button className="delete-button">Delete</button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }
// function FotterComponent()
// {
   
//     return(
//         <div className="Fotter">
//           <hr />
//             <h1>

//            FOTTER
            
//             </h1>
//         </div>
//     );
// }
