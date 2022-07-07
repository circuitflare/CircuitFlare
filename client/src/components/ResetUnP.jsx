import React, { useState, useEffect } from "react";
import "../styles/login.css";
import { useNavigate,useParams } from "react-router-dom";
import { resetUnP } from "../APIcalls";
import Swal from "sweetalert2";
import validator from "validator";

const ResetUnP = ({ forgotValue }) => {
  const navigate = useNavigate();
  const params = useParams();

  const [inputVal, setInputVal] = useState("");
  const [confirmInputVal, setConfirmInputVal] = useState("");

  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");

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

  const handleUpdate = async () => {
    try {
      if (inputVal === "" || confirmInputVal === "") {
        setError1("(Please Fill All The Fields)");
      } else {
        if (forgotValue === "password") {
          if (inputVal.length < 6) {
            setError1("(Password Must Be Of Atleast 6 Characters)");
          } else if (validator.isAlpha(inputVal)) {
            setError1("(Password Must Contain A Digit or A Special Character)");
          } else if (inputVal !== confirmInputVal) {
            setError2("(Password Do Not Match)");
          } else {
            const res = await resetUnP(inputVal, confirmInputVal, "password",params.token);

            if (res.status === 200) {
              setDisableBtn(true);
              Swal.fire({
                title: 'Password Was Successfully Resetted!',
                text:'Please Login',
                icon: "success",
                confirmButtonText: "Close",
                timer: 2000,
              });
            }
          }
        } else {
          if (inputVal.length < 3) {
            setError1("(UserName Should Be Of Minimum 3 Characters)");
          } else if (inputVal !== confirmInputVal) {
            setError2("(Username Do Not Match)");
          } else {
            const res = await resetUnP(inputVal, confirmInputVal, "username",params.token);

            if (res.status === 200) {
              setDisableBtn(true);
              Swal.fire({
                title: 'Username Was Successfully Resetted!',
                text:'Please Login',
                icon: "success",
                confirmButtonText: "Close",
                timer: 2000,
              });

              navigate('/login')
            }
          }
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: "Something Went Wrong, Please Try Again",
        icon: "error",
        confirmButtonText: "Close",
        timer: 2000,
      });
      navigate('/')
    }
  };

  return (
    <div className="container">
      <div className="text-center mt-5 pt-3 ">
        <div className="loginHeader" style={{ textTransform: "capitalize" }}>
          Reset {forgotValue}
        </div>
        <div className="d-inline-block w-25 text-left inputHeader m-2 p-1">
          <div style={{ textTransform: "capitalize" }}>
            {forgotValue}
            <span className="text-danger">*</span>
            <span className="text-danger ms-2">{error1 !== "" && error1}</span>
          </div>
          <div className="">
            <input
              name={forgotValue === "password" ? "password" : "username"}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError1("");
              }}
              type={forgotValue === "password" ? "password" : "text"}
              className="p-2 inputInput w-100"
            />
          </div>
        </div>
        <br />
        <div className="d-inline-block w-25 text-left inputHeader m-2 p-1">
          <div style={{ textTransform: "capitalize" }}>
            Confirm {forgotValue}
            <span className="text-danger">*</span>
            <span className="text-danger ms-2">{error2 !== "" && error2}</span>
          </div>
          <div className="">
            <input
              name={forgotValue === "password" ? "password" : "username"}
              value={confirmInputVal}
              onChange={(e) => {
                setConfirmInputVal(e.target.value);
                setError2("");
              }}
              type={forgotValue === "password" ? "password" : "text"}
              className="p-2 inputInput w-100"
            />
          </div>
        </div>
        <br />
        <br />
        <button
          className="btn btn-light loginButton mt-3 px-5 py-2"
          onClick={handleUpdate}
          disabled={disableBtn}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ResetUnP;
