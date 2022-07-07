import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import "../../styles/adminOrderDetails.css";
import "../../styles/shoppingBasket.css";
import "../../styles/orderDetails.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import axios from "axios";
import { changeToIndianFormat } from "../../utils/changeToIndianFormat";

const AdminOrderDetails = () => {
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(true);

  const [orderDetails, setOrderDetails] = useState(
    sessionStorage.getItem("adminOrderDetails")
      ? JSON.parse(sessionStorage.getItem("adminOrderDetails"))
      : ""
  );
  const [orderStatus, setOrderStatus] = useState("");
  const [remarks, setRemarks] = useState(
    sessionStorage.getItem("adminOrderDetails")
      ? JSON.parse(sessionStorage.getItem("adminOrderDetails")).remarks
      : []
  );

  const [fieldRemarks,setFieldRemarks] = useState()

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
    }
  },[])

  const handleUpdateStatus = async () => {
    if (orderStatus === "") {
      Swal.fire({
        title: "Please enter the order status",
        icon: "info",
        confirmButtonText: "Close",
      });
    } else {
      let response = await axios.put(
        `/api/admin/update/orderStatus/${orderDetails.orderNumber}`,
        { orderStatus },
        {
          "Content-Type": "application/json",
        }
      );

      if (response.status === 201) {
        Swal.fire({
          title: "Order Status updated",
          icon: "success",
          confirmButtonText: "Close",
        });
      } else {
        Swal.fire({
          title: "Failed to update the order status",
          icon: "info",
          confirmButtonText: "Close",
        });
      }
    }
  };

  const handleOnChangeRemarks = (id,remarkValue) => {
    let test = remarks;
    
    test[id] = remarkValue

    console.log(test[id]);

    console.log(test)

    setRemarks(test);
  };

  const handleSaveRemarks = async () => {
    try {

      sessionStorage.setItem("adminOrderDetails",JSON.stringify({...orderDetails, remarks}))

      await axios.put(
        `/api/admin/add/remarks/${orderDetails && orderDetails.orderNumber}`,
        { remarks },
        {
          "Content-Type": "application/json",
        }
      );

      Swal.fire({
        title: "Remarks saved",
        icon: "success",
        confirmButtonText: "Close",
      });
    } catch (error) {
      Swal.fire({
        title: "Error Saving the remarks",
        icon: "info",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <div style={isAdmin ? { opacity: "1" } : { opacity: "0" }}>
      <AdminNavbar />
      <div className="aod_container">
        <div className="aod_c_1">
          <div>
            <div>Order Number - </div>{" "}
            <div> &nbsp;{orderDetails && orderDetails.orderNumber}</div>
          </div>
          <div>
            <div>Order Date - </div>{" "}
            <div>
              {" "}
              &nbsp;
              {moment(orderDetails && orderDetails.paidAt).format("DD/MM/YY")}
            </div>
          </div>

          <div>
            <div>Order Value - </div>{" "}
            <div>
              {" "}
              &nbsp;₹{" "}
              {orderDetails &&
                changeToIndianFormat(Number(orderDetails.totalTransactionAmount).toFixed(2))}
            </div>
          </div>
        </div>
        <div className="aod_c_addr">
          {orderDetails && orderDetails.billingInfo.firstname}{" "}
          {orderDetails && orderDetails.billingInfo.lastname} <br />{" "}
          {orderDetails && orderDetails.deliveryInfo.address1}
          <br /> {orderDetails && orderDetails.deliveryInfo.city},{" "}
          {orderDetails && orderDetails.deliveryInfo.state} <br />{" "}
          {orderDetails && orderDetails.deliveryInfo.zipCode} <br />
          +91 {orderDetails && orderDetails.deliveryInfo.phone} <br />
          {orderDetails && orderDetails.billingInfo.email}
        </div>
        <div className="aod_c_fields">
          <h4>
            Enter the details to update on the customer's order history page
          </h4>
          {/* <div>
            <label>Order Number</label>
            <input type="number" required />
          </div> */}
          <div>
            <label>Order Status</label>
            <div className="aoc_c_f_order">
              <input
                type="text"
                required
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
              />
              <button onClick={handleUpdateStatus}>Update</button>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "40px",width:'90%' }}>
          <table className="sr_table">
            <tr>
              <th style={{ width: "80px" }}>Sort</th>
              <th style={{ width: "400px" }}>Product Details</th>
              <th style={{ width: "400px" }}>Description</th>
              <th style={{ width: "100px" }}>Qty.</th>
              <th style={{ width: "400px" }}>
                Remarks{" "}
                <button
                  className="btn btn-success ms-2"
                  onClick={handleSaveRemarks}
                >
                  Save
                </button>{" "}
              </th>
            </tr>
            {orderDetails &&
              orderDetails.cartItems.map((curr, ind) => (
                <>
                <OrderCartItems curr={curr} ind={ind} remarks={remarks} handleOnChangeRemarks={handleOnChangeRemarks}/>
                 {/* <tr key={ind}>
                  <td>{ind + 1}.</td>
                  <td style={{ textAlign: "center" }}>
                    Mfr. No : &nbsp;&nbsp;{" "}
                    <span>{curr.itemDetails.source_part_number}</span> <br />
                    Mfr. :
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {curr.itemDetails.manufacturer}
                  </td>
                  <td>{curr.itemDetails.description}</td>
                  <td>
                    {" "}
                    <span>{curr.quantity}</span>{" "}
                  </td>
                  <td>
                    <textarea
                      placeholder="Remarks goes here"
                      cols="30"
                      rows="4"
                      className="textarea_remarks"
                      value={remarks && remarks[ind]}
                      onChange={(e) => handleOnChangeRemarks(ind, e)}
                    ></textarea>{" "}
                  </td>
                </tr> */}
                </>
               
              ))}
          </table>
        </div>
      </div>
    </div>
  );
};

const OrderCartItems = ({curr,ind,remarks,handleOnChangeRemarks}) => { 

  const [productRemark , setProductRemark] = useState(remarks[ind])

  const handleOnChange = (e) =>{
    // console.log(e.target.value)
      setProductRemark(e.target.value)

      handleOnChangeRemarks(ind,e.target.value)
  }

  return (
    <tr key={ind}>
                  <td>{ind + 1}.</td>
                  <td style={{ textAlign: "center" }}>
                    Mfr. No : &nbsp;&nbsp;{" "}
                    <span>{curr.itemDetails.source_part_number}</span> <br />
                    Mfr. :
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {curr.itemDetails.manufacturer}
                  </td>
                  <td>{curr.itemDetails.description}</td>
                  <td>
                    {" "}
                    <span>{curr.quantity}</span>{" "}
                  </td>
                  <td>
                    <textarea
                      placeholder="Remarks goes here"
                      cols="30"
                      rows="4"
                      className="textarea_remarks"
                      value={productRemark}
                      onChange={(e) => handleOnChange(e)}
                    ></textarea>{" "}
                  </td>
                </tr>
  )
}

export default AdminOrderDetails;
