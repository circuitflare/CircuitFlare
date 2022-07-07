import React, { useState, useEffect } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../APIcalls";
import Swal from "sweetalert2";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase-configs";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("loggedInUser")) {
      Swal.fire({
        title: "You Are Already Logged In",
        icon: "success",
        confirmButtonText: "Close",
        timer: 1500,
      });
      navigate("/");
    }
  }, []);

  const handleLogin = async () => {
    try {
      if (username === "" || password === "") {
        setError("(Please Fill All The Fields)");
      } else {
        const res = await loginUser({ username, password });

        if (res.status === 201) {
          Swal.fire({
            title: `Hello! ${username}`,
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
              username,
              registerLoginWithGoogle: false,
              role: res.data.user.role,
            })
          );
          navigate("/");
        }
      }
    } catch (err) {
      Swal.fire({
        title: `${err.response.data.message}`,
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const resGoogle = await signInWithPopup(auth, provider);

      // console.log(resGoogle.user.displayName)
      // console.log(resGoogle.user.email)
      // console.log(resGoogle.user.photoURL)

      const resApi = await loginUser({
        username: resGoogle.user.displayName,
        password: resGoogle.user.email,
      });

      Swal.fire({
        title: `Hello! ${resGoogle.user.displayName}`,
        text: "User Logged In",
        icon: "success",
        confirmButtonText: "Close",
        timer: 2000,
      });

      sessionStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          firstname: resApi.data.user.firstname,
          lastname: resApi.data.user.lastname,
          email: resApi.data.user.email,
          username:resApi.data.user.username,
          registerLoginWithGoogle: true,
          role: resApi.data.user.role,
        })
      );
      navigate("/");
    } catch (error) {
      Swal.fire({
        title: `${error.response.data.message}`,
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <div className="container">
      <div className="text-center mt-5 pt-3 ">
        <div className="loginHeader">Login</div>
        <div className="d-inline-block w-25 text-left inputHeader m-2 p-1">
          <div>
            User Name<span className="text-danger">*</span>
            <span className="text-danger ms-2">{error !== "" && error}</span>
          </div>
          <div className="">
            <input
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              type="text"
              className="p-2 inputInput w-100"
            />
          </div>
        </div>
        <br />
        <div className="d-inline-block w-25 text-left inputHeader p-1">
          <div>
            Password<span className="text-danger">*</span>
          </div>
          <div className="">
            <input
            
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              type="password"
              className="p-2 inputInput w-100"
            />
          </div>
        </div>
        <br />
        <button
          className="btn btn-light loginButton mt-3 px-5 py-2"
          onClick={handleLogin}
        >
          Login
        </button>
        <div className="forgotText mt-3">
          <div>
            Forgot{" "}
            <span
              className="text-primary"
              onClick={() => navigate("/forgot/username")}
              style={{ cursor: "pointer" }}
            >
              Username
            </span>{" "}
            or{" "}
            <span
              className="text-primary"
              onClick={() => navigate("/forgot/password")}
              style={{ cursor: "pointer" }}
            >
              Password
            </span>
          </div>
          <div className="mt-3">
            New customer?{" "}
            <span
              className="text-primary"
              onClick={() => navigate("/signup")}
              style={{ cursor: "pointer" }}
            >
              Signup
            </span>{" "}
            or{" "}
          </div>
          <div className="mt-3 OR">OR</div>
          <button class="mt-4 login-with-google-btn" onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
