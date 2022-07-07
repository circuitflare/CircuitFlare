import React, { useState, useEffect } from "react";
import "../styles/searchResults.css";
import "../styles/shoppingBasket.css";
import "../styles/orderDetails.css";
import { useNavigate } from "react-router-dom";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { HiTrash } from "react-icons/hi";
import Swal from "sweetalert2";
import BasketItem from "./BasketItem";
import axios from "axios";
import NavbarComp from "./NavbarComp";
import { changeToIndianFormat } from "../utils/changeToIndianFormat";

const Shopping_Basket = () => {
  const navigate = useNavigate();
  const [tableScroll, setTableScroll] = useState(false);
  const [basketItems, setBasketItems] = useState([]);
  const [totalBasketAmount, setTotalBasketAmount] = useState();
  const [isBasketEmpty, setIsBasketEmpty] = useState(false);
  const [disableBtn, setDisableBtn] = useState(
    sessionStorage.getItem("disableCheckoutBtn")
      ? sessionStorage.getItem("disableCheckoutBtn")
      : false
  );

  useEffect(() => {
    if (sessionStorage.getItem("basketItems")) {
      let cartItems = JSON.parse(sessionStorage.getItem("basketItems"));

      if (cartItems.length > 0) {
        setIsBasketEmpty(false);

        setBasketItems(cartItems);
        let totalBasketAmount = 0;
        let totalDiscountAmount = 0;

        cartItems.map((curr) => {
          totalBasketAmount += Number(curr.price);
          totalDiscountAmount += curr.discount;
        });

        setTotalBasketAmount(totalBasketAmount);

        let transactionAmount =
          Number(totalBasketAmount) + 250 + Number(totalBasketAmount) * 0.18;

        sessionStorage.setItem("totalBasketItems", cartItems.length);
        sessionStorage.setItem("transactionAmount", transactionAmount);
        sessionStorage.setItem("totalBasketAmount", totalBasketAmount);
        sessionStorage.setItem("totalDiscountAmount", totalDiscountAmount);
      } else {
        setIsBasketEmpty(true);

        Swal.fire({
          title: "Basket Is Empty! Please Add An Item",
          icon: "error",
          confirmButtonText: "Close",
        }).then(() => navigate("/"));
      }
    } else {
      setIsBasketEmpty(true);

      Swal.fire({
        title: "Basket Is Empty! Please Add An Item",
        icon: "error",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    }

    if (sessionStorage.getItem("loggedInUser")) {
      let user = JSON.parse(sessionStorage.getItem("loggedInUser"));
      let basketItems = JSON.parse(sessionStorage.getItem("basketItems"));

      axios
        .post(
          `/api/user/store/basket/items/${user.email}`,
          {
            basketItems: basketItems,
            totalBasketAmount,
            totalBasketItems: sessionStorage.getItem("basketItems") && basketItems.length,
          },
          {
            "Content/Type": "application/json",
          }
        )
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
  }, []);

  const handleDeleteItem = (index) => {
    // console.log(index);
    let newBasketItems = basketItems.filter((curr, id) => id !== index && curr);

    setBasketItems(newBasketItems);

    let totalBasketAmount = 0;
    let totalDiscountAmount = 0;

    newBasketItems.map((curr) => {
      totalBasketAmount += Number(curr.price);
      totalDiscountAmount += Number(curr.discount);
    });

    setTotalBasketAmount(totalBasketAmount);

    //updating values in DB too for that user
    if (sessionStorage.getItem("loggedInUser")) {
      let user = JSON.parse(sessionStorage.getItem("loggedInUser"));

      axios
        .post(
          `/api/user/store/basket/items/${user.email}`,
          {
            basketItems: newBasketItems,
            totalBasketAmount,
            totalBasketItems: newBasketItems.length,
          },
          {
            "Content/Type": "application/json",
          }
        )
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }

    //setting data to LS
    sessionStorage.setItem("basketItems", JSON.stringify(newBasketItems));
    sessionStorage.setItem("totalBasketAmount", Number(totalBasketAmount));
    sessionStorage.setItem("totalDiscountAmount", Number(totalDiscountAmount));
    sessionStorage.setItem("totalBasketItems", Number(newBasketItems.length));

    // if (newBasketItems.length > 2) {
    //   setTableScroll(true);
    // } else {
    //   setTableScroll(false);
    // }

    if (newBasketItems.length === 0) {
      setIsBasketEmpty(true);

      Swal.fire({
        title: "Basket Is Empty! Please Add An Item",
        icon: "error",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    }
  };

  const handleDeleteAll = () => {
    setIsBasketEmpty(true);
    setTotalBasketAmount();
    //setting data to LS
    sessionStorage.removeItem("basketItems");
    sessionStorage.removeItem("totalBasketAmount");
    sessionStorage.removeItem("totalBasketItems");
    sessionStorage.removeItem("totalDiscountAmount");

    //updating values in DB too for that user
    if (sessionStorage.getItem("loggedInUser")) {
      let user = JSON.parse(sessionStorage.getItem("loggedInUser"));

      axios
        .post(
          `/api/user/store/basket/items/${user.email}`,
          {
            basketItems: [],
            totalBasketAmount: 0,
            totalBasketItems: 0,
          },
          {
            "Content/Type": "application/json",
          }
        )
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }

    Swal.fire({
      title: "Basket is now empty , please add new items",
      icon: "error",
      confirmButtonText: "Close",
    }).then(() => navigate("/"));
  };

  const handleCheckout = () => {
    if (disableBtn) {
      Swal.fire({
        title: "All item quanitites must be in the multiple of their MOQs",
        icon: "error",
        confirmButtonText: "Close",
      });
    } else {
      navigate("/checkout");
    }
  };

  const CircuitFlarePurchasePrice = (basketItemPartName, quantity) => {
    let discountCalcArr = JSON.parse(sessionStorage.getItem("discountCalcArr"));

    console.log(discountCalcArr);

    //extracting discountCalcArr for a particular part name
    let partWiseDiscountCalcArr = [];

    // console.log(curr)

    discountCalcArr.map((item, id) => {
      if (basketItemPartName === item.partName) {
        partWiseDiscountCalcArr.push(item);
      }
    });

    console.log(partWiseDiscountCalcArr);

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
    <div>
      <NavbarComp
        ItemsInBasket={
          sessionStorage.getItem("totalBasketItems") ?
          JSON.parse(sessionStorage.getItem("totalBasketItems"))
          : 0
        }
      />

      <div className="sr_container">
        <div className="back_arrow">
          {" "}
          <HiArrowNarrowLeft
            className="arrowIcon"
            onClick={() => navigate("/result")}
          />{" "}
          <span
            onClick={() => {
              if (Number(sessionStorage.getItem("numberOfResults")) === 0) {
                navigate("/");
              } else {
                navigate("/result");
              }
            }}
          >
            Continue Shopping
          </span>{" "}
        </div>
        <h2 className="sr_head sb_head">SHOPPING BASKET</h2>
        <div>
          <table className="sr_table">
            <tr>
              <th style={{ width: "50px" }}>Sort</th>
              <th style={{ width: "300px" }}>Product Details</th>
              <th style={{ width: "300px" }}>Description</th>
              <th style={{ width: "120px" }}>Qty.</th>
              <th style={{ width: "100px" }}>Unit Price</th>
              <th style={{ width: "150px" }}>Ext. Price</th>
              <th style={{ width: "150px" }}>Discount</th>
              <th style={{ width: "150px" }}>Ext. Price after Discount</th>
              <th style={{ color: "#0053F2", width: "80px" }}>
                <HiTrash
                  className="trashIcon"
                  style={{ cursor: "pointer" }}
                  onClick={handleDeleteAll}
                />
              </th>
            </tr>
            {!isBasketEmpty ? (
              <>
                {basketItems.length > 0 &&
                  basketItems.map((curr, ind) => (
                    <BasketItem
                      key={ind}
                      id={ind}
                      curr={curr}
                      handleDeleteItem={() => handleDeleteItem(ind)}
                      basketItems={basketItems}
                      setTotalBasketAmount={setTotalBasketAmount}
                      setDisableBtn={setDisableBtn}
                    />
                  ))}
              </>
            ) : (
              <tr
                style={{
                  borderLeft: "1px solid #c4c4c4",
                  borderRight: "1px solid #c4c4c4",
                  borderBottom: "1px solid #c4c4c4",
                }}
              >
                <td colspan="9" style={{ color: "#707070" }}>
                  {/* You have no items in the basket. Go ahead and add items to
                  show up over here */}
                </td>
              </tr>
            )}
          </table>
        </div>
      </div>
      {!isBasketEmpty && (
        <div className="add_to_basket" style={{ marginTop: "40px" }}>
          <div>
            <p>Merchandise :</p>{" "}
            <p>₹ {changeToIndianFormat(Number(totalBasketAmount && totalBasketAmount).toFixed(2))}</p>
          </div>

          <div>
            <p>GST (18%) :</p>{" "}
            <p>
              ₹{" "}
              {totalBasketAmount &&
                changeToIndianFormat((Number(totalBasketAmount) * 0.18).toFixed(2))}
            </p>
          </div>
          <div>
            <p>Shipping :</p> <p>₹ 250.00</p>
          </div>
          <div>
            <p>Sub Total :</p>{" "}
            <p>
              ₹{" "}
              {totalBasketAmount &&
                changeToIndianFormat(Number(
                  Number(totalBasketAmount) +
                    250 +
                    Number(totalBasketAmount) * 0.18
                ).toFixed(2))}
            </p>
          </div>
          <p>
            Your total savings on this order : ₹{" "}
            {sessionStorage.getItem("totalDiscountAmount") && changeToIndianFormat(sessionStorage.getItem("totalDiscountAmount"))}
          </p>
          <button onClick={handleCheckout}>Checkout</button>
        </div>
      )}
    </div>
  );
};

export default Shopping_Basket;
