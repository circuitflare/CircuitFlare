import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import "../../styles/shoppingBasket.css";
import "../../styles/orderHistory.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { adminOrders } from "../../APIcalls";
import moment from "moment";
import { changeToIndianFormat } from "../../utils/changeToIndianFormat";

const AdminFeedback = () => {
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const [noOrders, setNoOrders] = useState(false);

  useEffect(() => {
    let adminDetails = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (
      (adminDetails && adminDetails.role !== "admin") ||
      !sessionStorage.getItem("loggedInUser")
    ) {
      setIsAdmin(false);
      Swal.fire({
        title: "User Not Authorized",
        icon: "success",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    } else {
      const getOrders = async () => {
        const res = await adminOrders();

        if (res.data.userOrders.length === 0) {
          setNoOrders(true);
        } else {
          setOrderDetails(res.data.userOrders.reverse());
        }
      };

      getOrders();
    }
  }, []);

  const handleNavigation = (ind) => {
    sessionStorage.setItem(
      "adminOrderDetails",
      JSON.stringify(orderDetails[ind])
    );

    navigate("/admin_order_details");
  };

  return (
    <div style={isAdmin ? { opacity: "1" } : { opacity: "0" }}>
      <AdminNavbar />
      <div className="oh_container">
        <h2 className="oh_head">Feedbacks</h2>
        {noOrders ? (
          <div>
            <table className="oh_table">
              <tr>
                <th>Sort</th>
                <th>Order Number</th>
                <th>Order Date</th>
                <th>Customer Name</th>
                <th>Invoice Value</th>
                <th>Feedback Message</th>
              </tr>
              <tr
                style={{
                  borderLeft: "1px solid #c4c4c4",
                  borderRight: "1px solid #c4c4c4",
                  borderBottom: "1px solid #c4c4c4",
                }}
              >
                <td colspan="6" style={{ color: "#707070" }}>
                  No recent feedbacks found
                </td>
              </tr>
            </table>
          </div>
        ) : (
          <>
            {orderDetails && orderDetails.length ? (
              <div>
                <table className="oh_table">
                  <tr>
                    <th>Sort</th>
                    <th>Order Number</th>
                    <th>Order Date</th>
                    <th>Customer Name</th>
                    <th>Invoice Value</th>
                    <th>Feedback Message</th>
                  </tr>
                  {orderDetails &&
                    orderDetails.map((curr, ind) => (
                      <tr>
                        <td>{ind + 1}.</td>
                        <td
                          style={{
                            color: "#0053F2",
                            textAlign: "center",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleNavigation(ind)}
                        >
                          {curr.orderNumber}
                        </td>
                        <td>{moment(curr.paidAt).format("DD/MM/YY")}</td>
                        <td>
                          {" "}
                          {curr.billingInfo[0].firstname +
                            " " +
                            curr.billingInfo[0].lastname}
                        </td>

                        <td>₹ {changeToIndianFormat(Number(curr.totalTransactionAmount).toFixed(2))}</td>
                        <td>{curr.feedback}</td>
                      </tr>
                    ))}
                </table>
              </div>
            ) : (
              <div
                className="d-flex justify-content-center mt-4"
                style={{ overflow: "hidden" }}
              >
                <div className="spinner-border mt-5" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
