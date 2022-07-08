import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/adminLogin.css";
import Swal from "sweetalert2";
import { adminLogin, adminForgotPw } from "../../APIcalls";
import "../../styles/adminNavbar.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await adminLogin({ username: name, password: password });

      if (res.status === 201) {
        Swal.fire({
          title: `Hello! ${name}`,
          text: "User Logged In",
          icon: "success",
          confirmButtonText: "Close",
          timer: 2000,
        });
        sessionStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            firstname: res.data.user.firstname,
            lastname: res.data.user.lastname,
            email: res.data.user.email,
            username: name,
            registerLoginWithGoogle: false,
            role: res.data.user.role,
          })
        );
        navigate("/admin_orders");
      }
    } catch (error) {
      Swal.fire({
        title: `${error.response.data.message}`,
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  const handleForgotPw = async () => {
    try {
      await adminForgotPw();

      // console.log(token.data.resetToken)

      Swal.fire({
        title: "Link sent!",
        icon: "success",
        confirmButtonText: "Close",
      });
    } catch (error) {
      Swal.fire({
        title: "Error Occured!",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("loggedInUser")) {
      let user = JSON.parse(sessionStorage.getItem("loggedInUser"));

      if (user.role === "admin") {
        Swal.fire({
          title: `Welcome ${user.firstname}`,
          icon: "success",
          confirmButtonText: "Close",
        }).then(() => navigate("/admin_orders"));
      } 
    }
  }, []);

  return (
    <div>
      <div className="admin_header">Circuit Flare Admin Panel</div>
      <div className="admin_login">
        <h4>Login</h4>
        <div>
          <label>
            User Name<span style={{ color: "#F90909" }}>*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => handleEnter(e)}
          />
        </div>
        <div>
          <label>
            Password<span style={{ color: "#F90909" }}>*</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => handleEnter(e)}
          />
        </div>
        <div className="admin_forgot_pw mt-1">
          <h1>
            Forgot{" "}
            <span
              className="text-primary"
              onClick={handleForgotPw}
              style={{ cursor: "pointer" }}
            >
              &nbsp;Password
            </span>
            &nbsp;?
          </h1>
        </div>
        <button className="admin_login_btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
