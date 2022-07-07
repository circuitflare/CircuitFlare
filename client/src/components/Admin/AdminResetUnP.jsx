import React, { useState, useEffect } from "react";
import "../../styles/login.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { adminResetPw } from "../../APIcalls";
import Swal from "sweetalert2";
import validator from "validator";
import AdminNavbar from "./AdminNavbar";

const AdminResetUnP = ({ forgotValue }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inputVal, setInputVal] = useState("");
  const [confirmInputVal, setConfirmInputVal] = useState("");

  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");

  const [disableBtn, setDisableBtn] = useState(false);

  const [resetToken, setResetToken] = useState();

  useEffect(() => {
    // console.log(searchParams.get("token").length)

    if (searchParams.get("token") && searchParams.get("token").length === 40 ) {
      setResetToken(searchParams.get("token"));
    } else {
      Swal.fire({
        title: "Invalid token , please try again",
        icon: "success",
        confirmButtonText: "Close",
      }).then(() => navigate("/admin_login"));
    }
  }, []);

  const handleUpdate = async () => {
    try {
      if (inputVal === "" || confirmInputVal === "") {
        setError1("(Please Fill All The Fields)");
      } else {
        if (inputVal.length < 6) {
          setError1("(Password Must Be Of Atleast 6 Characters)");
        } else if (validator.isAlpha(inputVal)) {
          setError1("(Password Must Contain A Digit or A Special Character)");
        } else if (inputVal !== confirmInputVal) {
          setError2("(Password Do Not Match)");
        } else {
          //   console.log(resetToken);
          const res = await adminResetPw(inputVal, confirmInputVal, resetToken);

          if (res.status === 200) {
            setDisableBtn(true);
            Swal.fire({
              title: "Password Was Successfully Resetted!",
              icon: "success",
              confirmButtonText: "Close",
            }).then(() => {
              sessionStorage.removeItem("adminResetToken");
              navigate("/admin_login");
            });
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
      }).then(() => {
        sessionStorage.removeItem("adminResetToken");
        navigate("/admin_login");
      });
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container">
        <div className="text-center mt-5 pt-3 ">
          <div className="loginHeader" style={{ textTransform: "capitalize" }}>
            Admin Reset Password
          </div>
          <div className="d-inline-block w-25 text-left inputHeader m-2 p-1">
            <div style={{ textTransform: "capitalize" }}>
              Password
              <span className="text-danger">*</span>
              <span className="text-danger ms-2">
                {" "}
                <br />
                {error1 !== "" && error1}
              </span>
            </div>
            <div className="">
              <input
                name="password"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setError1("");
                }}
                type="password"
                className="p-2 inputInput w-100"
              />
            </div>
          </div>
          <br />
          <div className="d-inline-block w-25 text-left inputHeader m-2 p-1">
            <div style={{ textTransform: "capitalize" }}>
              Confirm Password
              <span className="text-danger">*</span>
              <span className="text-danger ms-2">
                {" "}
                <br />
                {error2 !== "" && error2}
              </span>
            </div>
            <div className="">
              <input
                name="password"
                value={confirmInputVal}
                onChange={(e) => {
                  setConfirmInputVal(e.target.value);
                  setError2("");
                }}
                type="password"
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
    </>
  );
};

export default AdminResetUnP;
