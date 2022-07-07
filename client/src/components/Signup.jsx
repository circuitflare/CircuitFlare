import React, { useState, useEffect } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { registerUser } from "../APIcalls";
import Swal from "sweetalert2";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase-configs";

const Signup = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    cpassword: "",
  });

  const [errorFN, setErrorFN] = useState("");
  const [errorLN, setErrorLN] = useState("");
  const [errorE, setErrorE] = useState("");
  const [errorUN, setErrorUN] = useState("");
  const [errorP, setErrorP] = useState("");
  const [errorCP, setErrorCP] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("loggedInUser")) {
      Swal.fire({
        title: "You Are Already Logged In",
        icon: "success",
        confirmButtonText: "Close",
      });
      navigate("/");
    }
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setUser({ ...user, [name]: value });

    setErrorFN("");
    setErrorLN("");
    setErrorE("");
    setErrorUN("");
    setErrorP("");
    setErrorCP("");

    // console.log(user)
  };

  const handleSignup = async () => {
    try {
      const { firstname, lastname, username, email, password, cpassword } =
        user;

      if (
        firstname === "" ||
        lastname === "" ||
        username === "" ||
        email === "" ||
        password === "" ||
        cpassword === ""
      ) {
        setErrorFN("(Please Fill All The Fields)");
      } else if (firstname.length < 3) {
        setErrorFN("(FirstName Should Be Of Minimum 3 Characters)");
      } else if (!validator.isAlpha(firstname)) {
        setErrorFN("(FirstName Should Only Contain Alphabets)");
      } else if (lastname.length < 3) {
        setErrorLN("(Lastname Should Be Of Minimum 3 Characters)");
      } else if (!validator.isAlpha(lastname)) {
        setErrorLN("(Lastname Should Only Contain Alphabets)");
      } else if (!validator.isEmail(email) || email.length < 13) {
        setErrorE("(Invalid Email Format)");
      } else if (username.length < 3) {
        setErrorUN("(UserName Should Be Of Minimum 3 Characters)");
      } else if (password.length < 6) {
        setErrorP("(Password Must Be Of Atleast 6 Characters)");
      } else if (validator.isAlpha(password)) {
        setErrorP("(Password Must Contain A Digit or A Special Character)");
      } else if (password !== cpassword) {
        setErrorCP("(Password Do Not Match)");
      } else {
        const res = await registerUser(user);

        // console.log(res.status);
        // console.log(res.data.user);

        if (res.status === 201) {
          Swal.fire({
            title: `Welcome! ${username}`,
            text: "User Registered Succesfully",
            icon: "success",
            confirmButtonText: "Close",
            timer: 2000,
          });
          sessionStorage.setItem(
            "loggedInUser",
            JSON.stringify({
              firstname,
              lastname,
              email,
              username,
              registerLoginWithGoogle: false,
              role: res.data.user.role,
            })
          );
          navigate("/");
        }
      }
    } catch (error) {
      // console.log(error.response.data.success)
      if (error.response.data.success === false) {
        Swal.fire({
          title:
            "User with the email ID already exists. Please use a different email ID.",
          icon: "error",
          confirmButtonText: "Close",
        });
      } else {
        Swal.fire({
          title: "Oops!",
          text: "Something Went Wrong, Please Try Again",
          icon: "error",
          confirmButtonText: "Close",
          timer: 2000,
        });
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const resGoogle = await signInWithPopup(auth, provider);
      // console.log(resGoogle.user.displayName)
      // console.log(resGoogle.user.email)
      // console.log(resGoogle.user.photoURL)

      const resApi = await registerUser({
        firstname: resGoogle.user.displayName,
        lastname: resGoogle.user.displayName,
        email: resGoogle.user.email,
        username: resGoogle.user.displayName,
        password: resGoogle.user.email,
        cpassword: resGoogle.user.email,
      });

      // console.log(resApi.status);
      // console.log(resApi.data.user);

      if (resApi.success === false) {
        Swal.fire({
          title:
            "User with the email ID already exists. Please use a different email ID.",
          icon: "error",
          confirmButtonText: "Close",
        });
      } else if (resApi.status === 201) {
        Swal.fire({
          title: `Welcome! ${resGoogle.user.displayName}`,
          text: "User Registered Succesfully",
          icon: "success",
          confirmButtonText: "Close",
          timer: 1500,
        });

        sessionStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            firstname: resGoogle.user.displayName,
            lastname: resGoogle.user.displayName,
            email: resGoogle.user.email,
            username: resGoogle.user.displayName,
            registerLoginWithGoogle: true,
            role: resApi.data.user.role,
          })
        );
        navigate("/");
      }
    } catch (error) {
      if (error.response.data.success === false) {
        Swal.fire({
          title:
            "User with the email ID already exists. Please use a different email ID.",
          icon: "error",
          confirmButtonText: "Close",
        });
      } else {
        Swal.fire({
          title: "Oops!",
          text: "Something Went Wrong, Please Try Again",
          icon: "error",
          confirmButtonText: "Close",
          timer: 1500,
        });
      }
    }
  };

  return (
    <div className="container">
      <div className="text-center mt-4 pt-3 ">
        <div className="loginHeader">Sign Up for a new account</div>
        <div className="container row w-75 mx-auto align-items-center mt-3">
          <div className="col-6">
            <div className="text-left inputHeader m-2">
              <div>
                First Name<span className="text-danger">*</span>
                <span className="text-danger ms-2">
                  {errorFN !== "" && errorFN}
                </span>
              </div>
              <div className="">
                <input
                  name="firstname"
                  value={user.firstname}
                  onChange={handleOnChange}
                  type="text"
                  className="p-2 inputInput w-100"
                />
              </div>
            </div>
            <div className="text-left inputHeader m-2">
              <div>
                Last Name<span className="text-danger">*</span>
                <span className="text-danger ms-2">
                  {errorLN !== "" && errorLN}
                </span>
              </div>
              <div className="">
                <input
                  name="lastname"
                  value={user.lastname}
                  onChange={handleOnChange}
                  type="text"
                  className="p-2 inputInput w-100"
                />
              </div>
            </div>
            <div className="text-left inputHeader m-2">
              <div>
                Email Address<span className="text-danger">*</span>
                <span className="text-danger ms-2">
                  {errorE !== "" && errorE}
                </span>
              </div>
              <div className="">
                <input
                  name="email"
                  value={user.email}
                  onChange={handleOnChange}
                  type="email"
                  className="p-2 inputInput w-100"
                />
              </div>
            </div>
            <div className="text-left inputHeader m-2">
              <div>
                User Name<span className="text-danger">*</span>
                <span className="text-danger ms-2">
                  {errorUN !== "" && errorUN}
                </span>
              </div>
              <div className="">
                <input
                  name="username"
                  value={user.username}
                  onChange={handleOnChange}
                  type="text"
                  className="p-2 inputInput w-100"
                />
              </div>
            </div>
            <div className="text-left inputHeader m-2">
              <div>
                Password<span className="text-danger">*</span>
                <br />
                <span className="text-danger">{errorP !== "" && errorP}</span>
              </div>
              <div className="">
                <input
                  name="password"
                  value={user.password}
                  onChange={handleOnChange}
                  type="password"
                  className="p-2 inputInput w-100"
                />
              </div>
            </div>
            <div className="text-left inputHeader m-2">
              <div>
                Confirm Password<span className="text-danger">*</span>
                <span className="text-danger ms-2">
                  {errorCP !== "" && errorCP}
                </span>
              </div>
              <div className="">
                <input
                  name="cpassword"
                  value={user.cpassword}
                  onChange={handleOnChange}
                  type="password"
                  className="p-2 inputInput w-100"
                />
              </div>
            </div>
            <br />
            <button
              className="btn btn-light loginButton mt-1 px-5 py-2"
              onClick={handleSignup}
            >
              Signup
            </button>
            <div className="forgotText mt-3">
              <div>
                Signed up already?{" "}
                <span
                  className="text-primary"
                  onClick={() => navigate("/login")}
                  style={{ cursor: "pointer" }}
                >
                  Login
                </span>
              </div>
            </div>
          </div>
          <div className="forgotText mt-3 col-2">
            <div className="mt-3 OR">OR</div>
          </div>
          <div className="forgotText mt-3 col-4">
            <button class="login-with-google-btn" onClick={signInWithGoogle}>
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
