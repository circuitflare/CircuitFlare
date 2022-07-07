import React, { useState, useEffect } from "react";
import "../styles/shoppingBasket.css";
import "../styles/orderDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { HiTrash } from "react-icons/hi";
import Swal from "sweetalert2";
import axios from "axios";
import { changeToIndianFormat } from "../utils/changeToIndianFormat";

const OrderDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [noOrders, setNoOrders] = useState(false);
  const [singleOrder, setSingleOrder] = useState();
  const [tableScroll, setTableScroll] = useState(false);
  const [orderItems, setOrderItems] = useState();

  useEffect(() => {
    if (sessionStorage.getItem("orderHistory")) {
      const orderHistory = JSON.parse(sessionStorage.getItem("orderHistory"));

      orderHistory.map((curr, id) => {
        if (curr.orderNumber === params.id) {
          console.log(curr);
          setSingleOrder(curr);
          // setTableScroll(curr.cartItems.length > 2 ? true : false);
          setOrderItems(curr.cartItems);
          return 0;
        }
      });
    } else {
      setNoOrders(true);

      Swal.fire({
        title: "No Orders Found",
        icon: "info",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    }
  }, []);

  const handleAddToBasket = () => {
    if (sessionStorage.getItem("basketItems")) {
      let basketItems = JSON.parse(sessionStorage.getItem("basketItems"));

      orderItems.map((orderItem, ind) => {
        let isPresent = false;

        basketItems.map((basketItem, id) => {
          if (
            orderItem.itemDetails.source_part_number ===
            basketItem.itemDetails.source_part_number
          ) {
            basketItem.quantity += orderItem.quantity;

            basketItem.circuitFlarePurchasePrice = CircuitFlarePurchasePrice(basketItem.itemDetails.source_part_number,basketItem.quantity);

            basketItem.discount = Number(((basketItem.quantity * basketItem.unitPrice) - basketItem.circuitFlarePurchasePrice).toFixed(2)) > 0 ? Number(((basketItem.quantity * basketItem.unitPrice) - basketItem.circuitFlarePurchasePrice).toFixed(2)) : 0

            isPresent = true;
            return 0;
          }
        });

        if (!isPresent) {
          basketItems.push(orderItem);
        }
      });

      let totalBasketAmount = 0;
      let totalDiscountAmount = 0

      basketItems.map((curr) => {
        totalBasketAmount += curr.circuitFlarePurchasePrice
        totalDiscountAmount += curr.discount
      });

      sessionStorage.setItem("basketItems", JSON.stringify(basketItems));
      sessionStorage.setItem("totalBasketAmount", totalBasketAmount);
      sessionStorage.setItem("totalDiscountAmount", totalDiscountAmount);
      sessionStorage.setItem("totalBasketItems", basketItems.length);

      //setting data to DB if user logged in
      if (sessionStorage.getItem("loggedInUser")) {
        let user = JSON.parse(sessionStorage.getItem("loggedInUser"));

        axios
          .post(
            `/api/user/store/basket/items/${user.email}`,
            {
              basketItems,
              totalBasketAmount,
              totalBasketItems: basketItems.length,
            },
            {
              "Content/Type": "application/json",
            }
          )
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }
    } else {
      let totalBasketAmount = 0;
      let totalDiscountAmount = 0

      orderItems.map((curr) => {
        totalBasketAmount += curr.circuitFlarePurchasePrice
        totalDiscountAmount += curr.discount
      });

      sessionStorage.setItem("basketItems", JSON.stringify(orderItems));
      sessionStorage.setItem("totalBasketAmount", totalBasketAmount);
      sessionStorage.setItem("totalDiscountAmount", totalDiscountAmount);
      sessionStorage.setItem("totalBasketItems", orderItems.length);

      //setting data to DB if user logged in
      if (sessionStorage.getItem("loggedInUser")) {
        let user = JSON.parse(sessionStorage.getItem("loggedInUser"));

        axios
          .post(
            `/api/user/store/basket/items/${user.email}`,
            {
              basketItems: orderItems,
              totalBasketAmount,
              totalBasketItems: orderItems.length,
            },
            {
              "Content/Type": "application/json",
            }
          )
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }
    }

    navigate("/basket");
  };

  const CircuitFlarePurchasePrice = (basketItemPartName,quantity) => {
    let discountCalcArr = JSON.parse(sessionStorage.getItem("discountCalcArr"));

    console.log(discountCalcArr)

    //extracting discountCalcArr for a particular part name 
    let partWiseDiscountCalcArr = []

// console.log(curr)

    discountCalcArr.map((item,id) =>{
      if(basketItemPartName === item.partName){
        partWiseDiscountCalcArr.push(item)
      }
    })

    console.log(partWiseDiscountCalcArr)

    //finding which taxedPriceArr to compute on from quantity & moq
    let discountTaxedPriceArr = [];

    partWiseDiscountCalcArr.map((curr, id) => {
      if (quantity >= curr.moq) {
        discountTaxedPriceArr = curr.taxedPriceArr;
        // console.log(curr.taxedPriceArr)
      } else {
        return 0;
      }
    });

    // console.log(discountTaxedPriceArr);

    //calculating discount price as per the quantity
    let circuitFlarePurchasePrice = 0;
    let qtyStock = Number(quantity);

    for (let i = 0; i < discountTaxedPriceArr.length; i++) {
      if (qtyStock <= discountTaxedPriceArr[i].DistStock) {
        // console.log(discountTaxedPriceArr[i].taxedPrice, qtyStock);

        // console.log(circuitFlarePurchasePrice);

        circuitFlarePurchasePrice += Number(
          qtyStock * Number(discountTaxedPriceArr[i].taxedPrice)
        );

        break;
      } else {
        // console.log(discountTaxedPriceArr[i].taxedPrice, qtyStock);

        // console.log(circuitFlarePurchasePrice);

        circuitFlarePurchasePrice += Number(
          Number(discountTaxedPriceArr[i].DistStock) *
            Number(discountTaxedPriceArr[i].taxedPrice)
        );

        // console.log(circuitFlarePurchasePrice);

        qtyStock -= discountTaxedPriceArr[i].DistStock;
      }
    }

    // console.log(circuitFlarePurchasePrice);
    // console.log(qtyStock);

    return circuitFlarePurchasePrice;
  };

  return (
    <div style={noOrders ? { display: "none" } : { display: "block" }}>
      <div className="sr_container">
        <h2 className="sr_head">
          ORDER NUMBER {singleOrder && singleOrder.orderNumber}
        </h2>
        <div>
          <table className="sr_table mx-auto">
            <tr>
            <th style={{ width: "50px" }}>Sort</th>
              <th style={{ width: "300px" }}>Product Details</th>
              <th style={{ width: "300px" }}>Description</th>
              <th style={{ width: "120px" }}>Qty.</th>
              <th style={{ width: "100px" }}>Unit Price</th>
              <th style={{ width: "150px" }}>Ext. Price</th>
              <th style={{ width: "150px" }}>Discount</th>
              <th style={{ width: "150px" }}>Ext. Price after Discount</th>
              {/* <th style={{ color: "#0053F2", width: "80px" }}>
                <HiTrash className="trashIcon" />
              </th> */}
            </tr>
            {singleOrder &&
              singleOrder.cartItems.map((curr, ind) => (
                <tr>
                  <td>{ind + 1}</td>
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
                    <span>
                      {/* <input
                        className="basket_qty"
                        type="number"
                        value={curr.quantity}
                      /> */}
                      {curr.quantity}
                    </span>{" "}
                  </td>
                  <td>₹ {changeToIndianFormat(curr.unitPrice)}</td>
                  <td>₹ {changeToIndianFormat(Number(curr.price).toFixed(2))}</td>
                  <td>₹ {changeToIndianFormat(curr.discount)}</td>
                  <td>₹ {changeToIndianFormat(Number(curr.price - curr.discount).toFixed(2))}</td>
                  {/* <td style={{ color: "#0053F2" }}>
                    <HiTrash
                      className="trashIcon"
                      style={{ cursor: "pointer" }}
                    />
                  </td> */}
                </tr>
              ))}
          </table>
        </div>
        <div
          className="add_to_basket"
          style={{ marginTop: "75px" }}
        >
          <div>
            <p>Merchandise :</p>{" "}
            <p>
              ₹{" "}
              {singleOrder && changeToIndianFormat(Number(singleOrder.totalBasketAmount).toFixed(2))}
            </p>
          </div>

          <div>
            <p>GST (18%) :</p>{" "}
            <p>
              ₹{" "}
              {singleOrder &&
                changeToIndianFormat(Number(Number(singleOrder.totalBasketAmount) * 0.18).toFixed(2))}
            </p>
          </div>
          <div>
            <p>Shipping :</p> <p>₹ 250.00</p>
          </div>
          <div>
            <p>Sub Total :</p>{" "}
            <p>
              ₹{" "}
              {singleOrder &&
                changeToIndianFormat(Number(singleOrder.totalTransactionAmount).toFixed(2))}
            </p>
          </div>
          <p>Your total savings on this order : ₹ {singleOrder && changeToIndianFormat(Number(singleOrder.totalDiscountAmount).toFixed(2))}</p>
          <button onClick={handleAddToBasket}>Add to Basket</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
