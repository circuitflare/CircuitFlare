import React from "react";
import "../../styles/adminNavbar.css";
import {useNavigate,useLocation} from 'react-router-dom'
import Swal from "sweetalert2";
import {logoutUser} from '../../APIcalls'

const AdminNavbar = () => {

  const location = useLocation()

  // console.log(location.pathname)

  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("loggedInUser");
      await logoutUser();
      Swal.fire({
        title: "Admin Logged Out",
        icon: "success",
        confirmButtonText: "Close",
        timer: 1500,
      }).then(() => navigate("/admin_login"));
      
    } catch (err) {
      Swal.fire({
        title: "Oops!",
        text: "Something Went Wrong, Please Try Again",
        icon: "error",
        confirmButtonText: "Close",
        timer: 1500,
      });
    }
  };

  return (
    <div className="admin_navbar">
      <div onClick={() => navigate('/admin_orders')}>Circuit Flare Order Management</div>
      <ul className={location.pathname=== '/admin_orders' || location.pathname === '/admin_feedback' ? "reduceLinksWidth" : "defaultLinksWidth"}>
        <li onClick={() => navigate('/admin_orders')} style={location.pathname === '/admin_orders' ? {display:'none'} : {}}>Home</li>
        <li onClick={() => navigate('/admin_feedback')} style={location.pathname === '/admin_feedback' ? {display:'none'} : {}}>Feedbacks</li>
        <li onClick={() => handleLogout()}>Logout</li>
      </ul>
    </div>
  );
};

export default AdminNavbar;
