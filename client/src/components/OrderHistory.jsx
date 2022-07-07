import React, { useState, useEffect } from "react";
import "../styles/shoppingBasket.css";
import "../styles/orderHistory.css";
import { useNavigate } from "react-router-dom";
import { getUserOrders } from "../APIcalls";
import Swal from "sweetalert2";
import moment from "moment";
import { changeToIndianFormat } from "../utils/changeToIndianFormat";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [tableScroll, setTableScroll] = useState(false);
  const [orderDetails, setOrderDetails] = useState();
  const [noOrders, setNoOrders] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("loggedInUser")) {
      Swal.fire({
        title: "User Is Not Authorized",
        icon: "info",
        confirmButtonText: "Close",
      }).then(() => navigate("/login"));
    } else {
      setLoggedIn(true);
      toGetUserOrders();
    }
  }, []);

  const toGetUserOrders = async () => {
    const orders = await getUserOrders();

    // console.log(orders.data.userOrders);

    if (orders.data.userOrders.length > 0) {
      setOrderDetails(orders.data.userOrders.reverse());
      sessionStorage.setItem(
        "orderHistory",
        JSON.stringify(orders.data.userOrders)
      );
      // setTableScroll(orders.data.userOrders.length > 10 ? true : false);
    } else {
      setNoOrders(true);
      // Swal.fire({
      //   title: "No Orders Found",
      //   icon: "info",
      //   confirmButtonText: "Close",
      // }).then(() => navigate("/"));
    }
  };

  return (
    <div style={!loggedIn ? { display: "none" } : { display: "block" }}>
      <div className="oh_container">
        <h2 className="oh_head">ORDER HISTORY</h2>
        {noOrders ? (
          <div>
            <table className="oh_table">
              <tr>
                <th>Sort</th>
                <th>Order Number</th>
                <th>Order Date</th>
                {/* <th>Your PO Number</th> */}
                <th>Buyer</th>
                <th>Invoice Total</th>
                <th>Status</th>
              </tr>
              <tr
                style={{
                  borderLeft: "1px solid #c4c4c4",
                  borderRight: "1px solid #c4c4c4",
                  borderBottom: "1px solid #c4c4c4",
                }}
              >
                <td colspan="6" style={{ color: "#707070" }}>
                  You have no recent orders. Go ahead and order to show up over
                  here
                </td>
              </tr>
            </table>
          </div>
        ) : (
          <>
            {orderDetails ? (
              <div>
                <table className="oh_table">
                  <tr>
                    <th>Sort</th>
                    <th>Order Number</th>
                    <th>Order Date</th>
                    {/* <th>Your PO Number</th> */}
                    <th>Buyer</th>
                    <th>Invoice Total</th>
                    <th>Status</th>
                  </tr>
                  {orderDetails &&
                    orderDetails.map((curr, index) => (
                      <tr>
                        <td>{index + 1}</td>
                        <td
                          style={{
                            color: "#0053F2",
                            textDecoration: "underline",
                            textAlign: "center",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(`/order_details/${curr.orderNumber}`)
                          }
                        >
                          {curr.orderNumber}
                        </td>
                        <td>{moment(curr.paidAt).format("DD/MM/YY")}</td>
                        {/* <td> {curr.billingInfo.zipCode} </td> */}
                        <td>{curr.billingInfo[0].firstname}</td>
                        <td>
                          ₹ {changeToIndianFormat(Number(curr.totalTransactionAmount).toFixed(2))}
                        </td>
                        <td>{curr.orderStatus}</td>
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

export default OrderHistory;
