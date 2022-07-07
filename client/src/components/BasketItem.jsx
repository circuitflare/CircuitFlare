import React, { useState, useEffect } from "react";
import { HiTrash } from "react-icons/hi";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { changeToIndianFormat } from "../utils/changeToIndianFormat";

const BasketItem = ({
  id,
  curr,
  handleDeleteItem,
  basketItems,
  setTotalBasketAmount,
  setDisableBtn,
}) => {
  const [quantity, setQuantity] = useState(Number(curr.quantity));
  const [incorrectQty, setIncorrectQty] = useState(false);
  const [displayUnitPrice, setDisplayUnitPrice] = useState(curr.unitPrice);

  const navigate = useNavigate();

  useEffect(() => {
    if (Number(curr.quantity) % curr.moq !== 0) {
      setIncorrectQty(true);
      setDisableBtn(true);
    }

    // console.log(curr);
  }, []);

  const handleChangeQty = (id, qty) => {
    //  console.log(id,qty)
    // console.log(curr.itemDetails.totalCumulativeDistributorsStocks);

    let totalBasketAmount = 0;

    if (qty > curr.itemDetails.totalCumulativeDistributorsStocks) {
      Swal.fire({
        title: `${curr.itemDetails.source_part_number}'s quantity cant exceed it's stock`,
        icon: "info",
        confirmButtonText: "Close",
      });
    }else{

    if (qty > 0) {
      setQuantity(qty);
    } else {
      setQuantity(1);
      qty = 1;
    }

    //change unit price according to the quantity from pricingDetails
    let pricingDetails = JSON.parse(sessionStorage.getItem("pricingDetails"));
    // console.log(pricingDetails)

    let unitPriceBasket = curr.unitPrice;

    for (let i = 0; i < pricingDetails.length; i++) {
      let currMOQ = pricingDetails[i].moq;
      let currUnitPrice = pricingDetails[i].maxUnitPriceWithTax;

      // console.log(currMOQ,currUnitPrice)

      if (qty >= currMOQ) {
        // moqBasket = currMOQ
        unitPriceBasket = currUnitPrice;
      } else {
        break;
      }
    }

    //calculating circuit flare purchase price
    let circuitFlarePurchasePrice = CircuitFlarePurchasePrice(qty);

    console.log(circuitFlarePurchasePrice)

    // console.log(unitPriceBasket)

    setDisplayUnitPrice(unitPriceBasket);

    curr.quantity = qty;
    curr.unitPrice = unitPriceBasket;
    curr.price = Number((qty * unitPriceBasket).toFixed(2));
    curr.circuitFlarePurchasePrice = circuitFlarePurchasePrice;
    curr.discount = Number((qty * unitPriceBasket - circuitFlarePurchasePrice).toFixed(2)) > 0 ? Number((qty * unitPriceBasket - circuitFlarePurchasePrice).toFixed(2)) : 0

    let totalDiscountAmount = 0;
    basketItems.map((item) => {
      totalBasketAmount += Number(item.price);
      totalDiscountAmount += Number(item.discount);
    });

    setTotalBasketAmount(totalBasketAmount);

    sessionStorage.setItem("totalBasketAmount", totalBasketAmount);
    sessionStorage.setItem("totalDiscountAmount", Number(totalDiscountAmount));
    sessionStorage.setItem("basketItems", JSON.stringify(basketItems));

    //updating values in DB too for that user
    if (sessionStorage.getItem("loggedInUser")) {
      let user = JSON.parse(sessionStorage.getItem("loggedInUser"));

      axios
        .post(
          `/api/user/store/basket/items/${user.email}`,
          {
            basketItems: basketItems,
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

    if (qty % curr.moq !== 0) {
      setIncorrectQty(true);
      setDisableBtn(true);
    } else {
      setIncorrectQty(false);
      setDisableBtn(false);
    }
  }
  };

  const CircuitFlarePurchasePrice = (quantity) => {
    let discountCalcArr = JSON.parse(sessionStorage.getItem("discountCalcArr"));

    console.log(discountCalcArr)

    //extracting discountCalcArr for a particular part name 
    let partWiseDiscountCalcArr = []

// console.log(curr)

    discountCalcArr.map((item,id) =>{
      if(curr.itemDetails.source_part_number === item.partName){
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
    <tr>
      <td>{id + 1}</td>
      <td style={{ textAlign: "center" }}>
        <span
          style={{
            color: "#0053f2",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(
              `/datasheet?partNo=${curr.itemDetails.source_part_number}&basketItem=${id}`
            )
          }
        >
          Mfr. No : &nbsp;&nbsp;{" "}
        </span>
        <span
          style={{
            color: "#0053f2",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(
              `/datasheet?partNo=${curr.itemDetails.source_part_number}&basketItem=${id}`
            )
          }
        >
          {curr.itemDetails.source_part_number}
        </span>{" "}
        <br />
        Mfr. : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {curr.itemDetails.manufacturer}
      </td>
      <td>{curr.itemDetails.description}</td>
      <td>
        {" "}
        <span>
          {" "}
          <span
            style={{ color: "#0066F4", fontSize: "13px" }}
          >{`(MOQ : ${curr.moq})`}</span>
          <input
            className="basket_qty"
            type="number"
            value={quantity}
            onChange={(e) => handleChangeQty(id, Number(e.target.value))}
            style={incorrectQty ? { color: "red" } : null}
          />
        </span>{" "}
      </td>
      <td>₹ {changeToIndianFormat(displayUnitPrice)}</td>
      <td>₹ {changeToIndianFormat(Number(curr.price).toFixed(2))}</td>
      <td>₹ {changeToIndianFormat(curr.discount)}</td>
      <td>₹ {changeToIndianFormat(Number(curr.price - curr.discount).toFixed(2))}</td>
      <td style={{ color: "#0053F2" }}>
        <HiTrash
          className="trashIcon"
          style={{ cursor: "pointer" }}
          onClick={() => handleDeleteItem(id)}
        />
      </td>
    </tr>
  );
};

export default BasketItem;
