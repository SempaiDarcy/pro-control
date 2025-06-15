import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom";

import {PrivateRoute} from "./routes/private-route.jsx";

import {Login} from "./pages/auth/login.jsx";
import {SignUp} from "./pages/auth/sign-up.jsx";
import {Dashboard} from "./pages/admin/dashboard.jsx";
import {ManageTasks} from "./pages/admin/manage-tasks.jsx";
import {CreateTask} from "./pages/admin/create-task.jsx";
import {ManageUsers} from "./pages/admin/manage-users.jsx";

import {UserDashboard} from "./pages/user/user-dashboard.jsx";
import {MyTasks} from "./pages/user/my-tasks.jsx";
import {ViewTaskDetails} from "./pages/user/view-task-details.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/login' element={<Login/>}/>
                <Route path='/signUp' element={<SignUp/>}/>

                {/*Admin Routes*/}
                <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
                    <Route path="/admin/dashboard" element={<Dashboard/>}/>
                    <Route path="/admin/tasks" element={<ManageTasks/>}/>
                    <Route path="/admin/create-task" element={<CreateTask/>}/>
                    <Route path="/admin/users" element={<ManageUsers/>}/>
                </Route>

                {/*User Routes*/}
                <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
                    <Route path="/user/dashboard" element={<UserDashboard/>}/>
                    <Route path="/user/tasks" element={<MyTasks/>}/>
                    <Route path="/user/my-task-details/:id" element={<ViewTaskDetails/>}/>
                </Route>
            </Routes>
        </Router>
    )
}

export default App
