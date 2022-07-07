import React, { useState, useEffect } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { forgotUnP } from "../APIcalls";
import Swal from "sweetalert2";

const ForgotUnP = ({ forgotValue }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [disableBtn, setDisableBtn] = useState(false);

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

  const handleSendEmail = async () => {
    try {
      if (email === "") {
        setError("Please Provide With An Email");
      } else {
        const res = await forgotUnP(email, forgotValue);

        if (res.status === 200) {
          setDisableBtn(true);
          Swal.fire({
            title: `Email Sent!`,
            icon: "success",
            confirmButtonText: "Close",
            timer: 2000,
          });

          navigate("/");
        }
      }
    } catch (error) {
      if (error.response.data.success === false) {
        Swal.fire({
          title: "User Does Not Exist!",
          text: "Please Try Signing In",
          icon: "error",
          confirmButtonText: "Close",
          timer: 2000,
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

      setDisableBtn(true);
      navigate("/");
    }
  };

  return (
    <div className="container">
      <div className="text-center mt-5 pt-3 ">
        <div className="loginHeader" style={{ textTransform: "capitalize" }}>
          Forgot {forgotValue}
        </div>
        <div className="d-inline-block w-25 text-left inputHeader m-2 p-1">
          <div>
            Email<span className="text-danger">*</span>
            <span className="text-danger ms-2">{error !== "" && error}</span>
          </div>
          <div className="">
            <input
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              type="email"
              className="p-2 inputInput w-100"
            />
          </div>
        </div>
        <br />
        <br />
        <button
          className="btn btn-light loginButton px-5 py-2"
          onClick={handleSendEmail}
          disabled={disableBtn}
        >
          Send Email
        </button>
      </div>
    </div>
  );
};

export default ForgotUnP;
