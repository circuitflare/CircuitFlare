import React, { useState, useEffect } from "react";
import "../styles/orderConfirmed.css";
import Navbar from "./NavbarComp";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OrderConfirmed = () => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [paidAmount, setPaidAmount] = useState();
  const [feedback, setFeedBack] = useState("");
  const [orderNumber, setOrderNumber] = useState();

  useEffect(() => {
    if (
      !sessionStorage.getItem("loggedInUser") ||
      !sessionStorage.getItem("IsPreviousPaymentDone")
    ) {
      Swal.fire({
        title: "Invalid Page",
        icon: "info",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
      setLoggedInUser(false);
    } else {
      setLoggedInUser(true);
      if (sessionStorage.getItem("totalBasketAmount")) {
        setOrderNumber(JSON.parse(sessionStorage.getItem("orderNumber")));
        setLoggedInUser(JSON.parse(sessionStorage.getItem("loggedInUser")));
        setPaidAmount(JSON.parse(sessionStorage.getItem("totalBasketAmount")));
      }
    }

    sessionStorage.removeItem("IsPreviousPaymentDone");
  }, []);

  const tyText = String.raw`Thank you for placing an order with us. Our team will review your order and send you a confirmation email. 
We'll also keep you updated on the order status via email.
  
In the meanwhile, can you tell us how was your experience shopping with us?

`;

  const handleShareFeed = async () => {
    if (feedback === "") {
      Swal.fire({
        title: "Please enter your feedback",
        icon: "info",
        confirmButtonText: "Close",
      });
    } else {
      let response = await axios.put(
        `/api/order/add/feedback/${orderNumber}`,
        { feedback },
        {
          "Content-Type": "application/json",
        }
      );

      if (response.status === 201) {
        sessionStorage.removeItem("totalBasketAmount");
        sessionStorage.removeItem("orderNumber");

        Swal.fire({
          title: "Thank you for your valuable feedback!",
          icon: "success",
          confirmButtonText: "Close",
        }).then(() => navigate("/"));
      } else {
        Swal.fire({
          title: "Failed To Save Feedback , Please try Again",
          icon: "info",
          confirmButtonText: "Close",
        });
      }
    }
  };

  const handleBackHome = () => {
    sessionStorage.removeItem("totalBasketAmount");
    sessionStorage.removeItem("orderNumber");

    navigate("/");
  };

  return (
    <>
      <Navbar hideSearchCart={true} />
      <div
        className="oc_container"
        style={loggedInUser ? { opacity: "1" } : { opacity: "0" }}
      >
        <div className="oc_heading">
          <div>
            <h2 style={{ color: "#41C363" }}>
              Yay! Your order was placed successfully!
            </h2>
            <h1>How was your experience?</h1>
          </div>
          <div className="och_sub">
            Hey {loggedInUser && loggedInUser.firstname}
          </div>
          <pre className="ty_text">
            {tyText}
            <p>
              Want to get in touch with us? Check out our{" "}
              <span
                style={{
                  color: "#0053F2",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                contact page
              </span>
              .
            </p>
          </pre>

          <p className="oc_h_goodday">Have a good day!</p>
        </div>
        {/* <div className="oc_summary">
          <h3>Order Summary</h3>
          <div className="oc_s_box">
            <div>
              <p>Merchandise :</p> <p>₹ {paidAmount && paidAmount}</p>
            </div>
            <div>
              <p>Shipping :</p> <p>₹ 200.00</p>
            </div>
            <div>
              <p>GST (18%) :</p>{" "}
              <p>
                ₹ {paidAmount && ((Number(paidAmount) + 200) * 0.18).toFixed(2)}
              </p>
            </div>
            <div>
              <p>Sub Total :</p>{" "}
              <p>
                ₹{" "}
                {paidAmount &&
                  Number(paidAmount) +
                    200 +
                    (Number(paidAmount) + 200) * (0.18).toFixed(2)}
              </p>
            </div>
          </div>
        </div> */}
        <div className="oc_feedback">
          {/* <h3>
            We are a startup working hard to improve, your feedback matters to
            us.
          </h3> */}
          <textarea
            className="oc_f_textarea"
            cols="50"
            rows="4"
            placeholder="Type your feedback here..."
            value={feedback}
            onChange={(e) => setFeedBack(e.target.value)}
          ></textarea>
          <button onClick={handleShareFeed}>Share feedback</button>
        </div>
        <div className="oc_c_home" onClick={handleBackHome}>
          Back to Home
        </div>
      </div>
    </>
  );
};

export default OrderConfirmed;
