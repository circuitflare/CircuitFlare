import React, { useState, useEffect } from "react";
import "../styles/accountSettings.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { changePw, logoutUser } from "../APIcalls";
import validator from "validator";

const AccountSettings = () => {
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [user, setUser] = useState();

  const [cpw, setcpw] = useState('');
  const [npw, setnpw] = useState('');
  const [copw, setcopw] = useState('');
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("loggedInUser")) {
      setLoggedInUser(false);
      Swal.fire({
        title: "User Is Not Authorized",
        icon: "info",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    } else {
      setLoggedInUser(true);
      setUser(JSON.parse(sessionStorage.getItem("loggedInUser")));
    }
  }, []);

  const handleLogout = async () => {
    try {
      Swal.fire({
        title: "User Logged Out",
        icon: "success",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));

      sessionStorage.removeItem("loggedInUser");
      await logoutUser();
      setLoggedInUser(false);
    } catch (err) {
      Swal.fire({
        title: "Oops!",
        text: "Something Went Wrong, Please Try Again",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  const handleChangePW = async () => {
    try {
      if (npw === "" || cpw === "" || copw === "") {
        Swal.fire({
          title: `Please Fill All The Fields`,
          icon: "info",
          confirmButtonText: "Close",
        });
      } else if (npw.length < 6) {
        setError("(Password Must Be Of Atleast 6 Characters)");
      } else if (validator.isAlpha(npw)) {
        setError("(Password Must Contain a Digit or a Character)");
      } else if (npw !== copw) {
        setError("(Passwords Do Not Match)");
      } else {
        let passwords = {
          currPassword: cpw,
          newPassword: npw,
          confirmPassword: copw,
        };

        const res = await changePw(passwords);

        if (res.status === 200) {
          Swal.fire({
            title: "Password Changed Successfully!",
            icon: "success",
            confirmButtonText: "Close",
          }).then(() => navigate("/"));
        }
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: `${error.response.data.message}`,
        icon: "info",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <div
      className="as_container"
      style={loggedInUser ? { opacity: 1 } : { opacity: 0 }}
    >
      <div className="as_head">
        <div>Account Settings</div>
        <div>
          {user && user.registerLoginWithGoogle
            ? `Logged in with Google - ${user && user.email}`
            : `Logged in - ${user && user.username}`}
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div
        className="as_fields"
        style={
          user && user.registerLoginWithGoogle
            ? { display: "none" }
            : { display: "block" }
        }
      >
        <h4>Change Password</h4>        

        <div>        
          <label>
            Current Password<span style={{ color: "#F90909" }}>*</span>
          </label>
          <input
            type="password"
            required
            value={cpw}
            onChange={(e) => {
              setcpw(e.target.value);
              setError("");
            }}
          />
        </div>
        <div>
          <label>
            New Password<span style={{ color: "#F90909" }}>*</span>
            <br/>
            {error !== "" && <span className="text-danger mb-2" style={{fontSize:'14px'}}>{error}</span>}
          </label>
          <input
            type="password"
            required
            value={npw}
            onChange={(e) => {
              setnpw(e.target.value);
              setError("");
            }}
          />
        </div>
        <div>
          <label>
            Confirm New Password<span style={{ color: "#F90909" }}>*</span>
            <br/>
            {error !== "" && error === "(Passwords Do Not Match)" && <span className="text-danger mb-2" style={{fontSize:'14px'}}>{error}</span>}
          </label>
          <input
            type="password"
            required
            value={copw}
            onChange={(e) => {
              setcopw(e.target.value);
              setError("");
            }}
          />
        </div>
      </div>
      <button
        className="as_changepw_btn"
        style={
          user && user.registerLoginWithGoogle
            ? { display: "none" }
            : { display: "block" }
        }
        onClick={handleChangePW}
      >
        Change Password
      </button>
    </div>
  );
};

export default AccountSettings;
