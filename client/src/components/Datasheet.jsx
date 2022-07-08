import React, { useState, useEffect } from "react";
import part_img from "../assets/part_img.png";
import "../styles/datasheet.css";
import { Modal } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarComp from "./NavbarComp";
import axios from "axios";
import { changeToIndianFormat } from "../utils/changeToIndianFormat";

const MyVerticallyCenteredModal = (props) => {
  const navigate = useNavigate();

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Basket</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="modal_body_left">
          <div className="modal_body_left_top">
            <h5>ADDED TO SHOPPING BASKET</h5>
          </div>
          <div className="modal_body_left_bottom">
            <div>
              <div>Mfr. Part No. :</div>{" "}
              <div>{props.partDetails.part_number}</div>{" "}
            </div>
            <div>
              <div>Mfr. :</div> <div>{props.partDetails.manufacturer}</div>{" "}
            </div>
            <div>
              <div>Description :</div>
              <div>{props.partDetails.description}</div>{" "}
            </div>
            <div>
              <div>Qty :</div> <div>{props.quantity}</div>{" "}
            </div>
          </div>
        </div>
        <div className="modal_body_right">
          <div className="mbr_1">
            <div>
              Shopping Basket Items : &nbsp; {props.totalCartItems} items
            </div>
          </div>
          <div className="mbr_2">
            <div>
              Shopping Basket Subtotal : &nbsp; ₹
              {changeToIndianFormat(Number(props.totalCartAmount).toFixed(2))}
            </div>
          </div>
          <div className="mbr_btn">
            <button onClick={props.onHide}>Continue Shopping</button>
            <button onClick={() => navigate("/basket")}>
              View Basket / Checkout
            </button>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button onClick={props.onHide}>Close</button>
      </Modal.Footer>
    </Modal>
  );
};

const Datasheet = () => {
  const [modalShow, setModalShow] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [partDetails, setPartDetails] = useState();
  const [dataTableLS, setDataTableLS] = useState();
  const [unitPrices, setUnitPrices] = useState();
  const [storedUnitPrices, setStoredUnitPrices] = useState();
  const [stockAvailability, setStockAvailability] = useState();
  const [totalStocksForQTY, setTotalStocksForQTY] = useState();
  const [inputQTYMatchesValue, setInputQTYMatchesValue] = useState();
  const [extraChargesInPercent, setExtraChargesInPercent] = useState(1);
  const [showQTYDist, setShowQTYDist] = useState(false);
  const [checkDistStocksEmpty, setCheckDistStocksEmpty] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [totalCartItems, setTotalCartItems] = useState(0);
  const [totalCartAmount, setTotalCartAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  //query string parameter will be stored here i.e our part number & table id
  // searchParams.get("partNo");
  // searchParams.get("tableId");

  // console.log(Number(searchParams.get("tableId")));

  //searching & setting for part details from the dataTable value in LS
  useEffect(() => {
    if (searchParams.get("basketItem")) {
      // console.log(searchParams.get("basketItem"));

      var tempData = JSON.parse(sessionStorage.getItem("basketItems"));
      setDataTableLS(JSON.parse(sessionStorage.getItem("basketItems")));

      //subtracting 1 because at 0th index in dataTable array tableId : 1 resides ,
      //so to access the tableId : 1 , the tableId coming from the query parameter
      //should be subtracted by 1 to properly map to it
      var basket_id = Number(searchParams.get("basketItem"));

      // that object on which we clicked in the search results table
      // console.log(tempData[`${table_id}`]);

      setPartDetails(tempData[basket_id].itemDetails);
      setStockAvailability(
        tempData[basket_id].itemDetails.distributorStocksForThatPart
      );
      // setUnitPrices(tempData[`${table_id}`].prices.INR);
      setTotalCartItems(
        sessionStorage.getItem("basketItems") &&
          JSON.parse(sessionStorage.getItem("basketItems")).length
      );
      handleUnitPricesPerMOQ(tempData[basket_id].itemDetails);
    } else if (sessionStorage.getItem("dataTable")) {
      var tempData = JSON.parse(sessionStorage.getItem("dataTable"));
      setDataTableLS(JSON.parse(sessionStorage.getItem("dataTable")));

      //subtracting 1 because at 0th index in dataTable array tableId : 1 resides ,
      //so to access the tableId : 1 , the tableId coming from the query parameter
      //should be subtracted by 1 to properly map to it
      var table_id = Number(searchParams.get("tableId")) - 1;

      // that object on which we clicked in the search results table
      // console.log(tempData[`${table_id}`]);

      setPartDetails(tempData[`${table_id}`]);
      setStockAvailability(
        tempData[`${table_id}`].distributorStocksForThatPart
      );
      // setUnitPrices(tempData[`${table_id}`].prices.INR);
      setTotalCartItems(
        sessionStorage.getItem("basketItems") &&
          JSON.parse(sessionStorage.getItem("basketItems")).length
      );
      handleUnitPricesPerMOQ(tempData[`${table_id}`]);
    } else {
      Swal.fire({
        title: "Please Search For A Part",
        icon: "info",
        confirmButtonText: "Close",
      }).then(() => navigate("/"));
    }
  }, [sessionStorage.getItem("dataTable")]);

  const imgDesc = String.raw`
    Images are for 
    reference only. 
    See product 
    Specifications 
    for more details`;

  // const handleQTYMatches = () => {
  //   // console.log(inputQTYMatchesValue)
  //   setCheckDistStocksEmpty(false);

  //   let inputQTYValue = Number(inputQTYMatchesValue);
  //   console.log(inputQTYValue);

  //   if (inputQTYValue < 0 || inputQTYValue > totalStocksForQTY) {
  //     Swal.fire({
  //       title: `Quantity cant exceed the stock value`,
  //       icon: "info",
  //       confirmButtonText: "Close",
  //     });
  //     setInputQTYMatchesValue("");
  //   } else if (inputQTYValue >= 1) {
  //     setShowQTYDist(true);

  //     let distributorNames = JSON.parse(sessionStorage.getItem("searchResults"))
  //       .results[searchParams.get("partNo").replace(/[^a-zA-Z0-9 ]/g, "")];

  //     // console.log(distributorNames);

  //     const priorityDist = [
  //       "Mouser Electronics India",
  //       "Digi-Key India",
  //       "element14 India",
  //       "Arrow Electronics",
  //       "RS Components UK",
  //       "SOS electronic",
  //       "Symmetry Electronics",
  //       "Verical",
  //     ];

  //     let distributorStocks = [];
  //     let totalStocks = 0;
  //     let valuePart;

  //     priorityDist.map((curr, priorityId) => {
  //       if (distributorNames[curr]) {
  //         let keyValuePair = distributorNames[curr];
  //         let maxQuantity = 0;
  //         let reqMOQ = 0;

  //         for (const obj in keyValuePair) {
  //           //this loop will provide us that object containing the part details i.e value part of key-value part again of '5 : {...part details}'

  //           valuePart = keyValuePair[obj];
  //           let tempMOQ = 0;

  //           //calculating MOQ
  //           if (valuePart.moq === "") {
  //             tempMOQ = valuePart.prices.INR[0].unit_break;
  //           } else {
  //             tempMOQ = Number(valuePart.moq);
  //           }

  //           //checking if inputQTYValue >= MOQ , then only display the distributor name with the stock value will be shown in UI
  //           if (
  //             inputQTYValue >= tempMOQ &&
  //             Number(valuePart.quantity_in_stock) > maxQuantity
  //           ) {
  //             reqMOQ = tempMOQ;
  //             maxQuantity = Number(valuePart.quantity_in_stock);
  //           }
  //         }

  //         // console.log(reqMOQ, maxQuantity);

  //         if (reqMOQ > 0 && maxQuantity > 0) {
  //           distributorStocks.push({
  //             priorityNum: priorityId,
  //             distributorName: curr,
  //             inputQTYValue,
  //             MOQ: reqMOQ,
  //             stockValueAsPerQTY: maxQuantity,
  //             objectDetails: valuePart,
  //           });

  //           totalStocks += maxQuantity;
  //         }
  //       }
  //     });

  //     // console.log(distributorStocks);

  //     if (distributorStocks.length === 0) {
  //       setCheckDistStocksEmpty(true);
  //     } else {
  //       setCheckDistStocksEmpty(false);
  //     }

  //     setStockAvailability(distributorStocks);
  //     setTotalStocksForQTY(totalStocks);

  //     // let showingPriceObj = toCalculatePriceForMinMOQ(
  //     //   distributorStocks,
  //     //   priorityDist,
  //     //   inputQTYValue
  //     // );

  //     // setUnitPrices(showingPriceObj);

  //     // let newUnitPrices = [];
  //     // let index;

  //     // storedUnitPrices.map((curr, id) => {
  //     //   if (curr.moq <= inputQTYValue) {
  //     //     newUnitPrices.push(curr);
  //     //     index = id;
  //     //   }
  //     // });

  //     // if (index < storedUnitPrices.length - 1) {
  //     //   newUnitPrices.push(storedUnitPrices[index + 1]);
  //     // }

  //     // console.log(newUnitPrices);

  //     // setUnitPrices(newUnitPrices);
  //   } else {
  //     var tempData = JSON.parse(sessionStorage.getItem("dataTable"));

  //     var table_id = Number(searchParams.get("tableId")) - 1;

  //     setPartDetails(tempData[`${table_id}`]);

  //     setStockAvailability(
  //       tempData[`${table_id}`].distributorStocksForThatPart
  //     );

  //     handleUnitPricesPerMOQ(tempData[`${table_id}`].part_number);
  //     // setUnitPrices(tempData[`${table_id}`].prices.INR);

  //     setShowQTYDist(false);
  //   }
  // };

  // const toCalculatePriceForMinMOQ = (distributorStocks) => {
  //   //calculating min MOQ with highest priority
  //   let minMOQ = Infinity;
  //   let priorNum = Infinity;
  //   let showingPricesDetails;

  //   distributorStocks.map((dist, id) => {
  //     if (minMOQ > dist.MOQ && priorNum > dist.priorityNum) {
  //       minMOQ = dist.MOQ;
  //       priorNum = dist.priorityNum;
  //       showingPricesDetails = dist.objectDetails.prices.INR;
  //     }
  //   });

  //   return showingPricesDetails;
  // };

  // const handleEnter = (e) => {
  //   if (e.key === "Enter") {
  //     handleQTYMatches();
  //   }
  // };

  const handleUnitPricesPerMOQ = async (partDetails) => {
    // console.log(partNum);
    // console.log(partDetails);

    let partNum = partDetails.part_number;
    let stocksForThatPart = partDetails.distributorStocksForThatPart;
    let distributorListProvidingThatPart;

    if (searchParams.get("basketItem")) {
      let countryCode = "IN";
      let currency = "INR";
      let groupBy1 = "part_number";
      let groupBy2 = "distributor_name";
      let searchItem = searchParams.get("partNo");

      const res = await axios.get(
        `https://beta.api.oemsecrets.com/partsearch?apiKey=xbeask7e254jys4hb6rykgqf0hxvcigs8h53sgdie21s42wet8w3n2ay42pofcm7&searchTerm=${searchItem}&countryCode=${countryCode}&currency=${currency}&groupBy[]=${groupBy1}&groupBy[]=${groupBy2}`
      );

      if (res.data.stock) {
        setLoading(false);
        distributorListProvidingThatPart = res.data.stock[partNum];
      }
    } else {
      distributorListProvidingThatPart = JSON.parse(
        sessionStorage.getItem("searchResults")
      ).results[partNum];
    }

    // console.log(distributorListProvidingThatPart)

    const priorityDist = [
      "Mouser Electronics India",
      "Digi-Key India",
      "element14 India",
      "Arrow Electronics",
      "RS Components UK",
      "SOS electronic",
      "Symmetry Electronics",
      "Verical",
    ];

    //calculating which distributors have the stock for that part i.e stock !== NA
    let newPriorityDistAsPerStockAvailbility = [];

    stocksForThatPart.map((value, id) => {
      if (value !== "NA") {
        newPriorityDistAsPerStockAvailbility.push({
          dist: priorityDist[id],
          stock: value,
        });
      }
    });

    // console.log(newPriorityDistAsPerStockAvailbility)

    const priorityDistributorsPricing = [
      "element14 India",
      "Mouser Electronics India",
      "Digi-Key India",
      "Arrow Electronics",
      "SOS electronic",
      "Symmetry Electronics",
      "Verical",
    ];

    //now we will update our priority dist pricing array with the one which have stock values
    let newPriorityDistributorsPricing = [];

    priorityDistributorsPricing.map((provider) => {
      newPriorityDistAsPerStockAvailbility.map((curr) => {
        if (provider === curr.dist) {
          newPriorityDistributorsPricing.push(curr);
          return 0;
        }
      });
    });

    // console.log(newPriorityDistributorsPricing)

    //storing all the unit prices,distributor name & it's stock value for the distributors that are
    //providing that part by checking the availability from newPriorityDistributorsPricing array
    let allUnitPrices = [];
    let uniqueMOQ = new Set();

    newPriorityDistributorsPricing.map((priorityDist, ind) => {
      for (let providerDist in distributorListProvidingThatPart) {
        if (providerDist === priorityDist.dist) {
          // console.log(priorityDist)
          // console.log(distributorListProvidingThatPart[providerDist])

          for (let index in distributorListProvidingThatPart[providerDist]) {
            // console.log(distributorListProvidingThatPart[providerDist][index].source_part_number)

            //to avoid cases where there are two dots after the source_part_name that means that part is not distributed anymore
            //for example search for fdll4148 and under element14 India , under "32" object there will be a source_part_number like "FDLL4148.."
            //so we will strictly check if the source_part_number matches with what the user entered , that way "FDLL4148.." will not be considered as user searched for "FDLL4148"
            if (
              partDetails &&
              partDetails.source_part_number ===
                distributorListProvidingThatPart[providerDist][index]
                  .source_part_number
            ) {
              // console.log(distributorListProvidingThatPart[providerDist][index].source_part_number)
              distributorListProvidingThatPart[providerDist][
                index
              ].prices.INR.map((unitPrice, id) => {
                // console.log(unitPrice);

                //we will only store those moqs which are lesser or equal to the stock of the distributor providing it
                // console.log(unitPrice.unit_break)
                // console.log(priorityDist.stock)
                if (unitPrice.unit_break <= Number(priorityDist.stock)) {
                  allUnitPrices.push({
                    unit_break: unitPrice.unit_break,
                    unit_price: Number(unitPrice.unit_price),
                    distributor: providerDist,
                    stocks: Number(priorityDist.stock),
                    partName:
                      distributorListProvidingThatPart[providerDist][index]
                        .source_part_number,
                  });

                  uniqueMOQ.add(unitPrice.unit_break);
                }
              });
            }
          }
        }
      }
    });

    console.log("without overheads",allUnitPrices);

    //changing all the unit prices in allUnitPrices array with taxed values
    allUnitPrices.map((curr, id) => {
      let newTaxValue = addingTaxToUnitPrices(
        curr.unit_price,
        curr.distributor
      );

      curr.taxed_unit_price = Number(newTaxValue.toFixed(2));
    });

    console.log("added overheads",allUnitPrices);

    //now we will push all the unique moqs present in set into an temp array
    let temp = [];

    for (let moq of uniqueMOQ) {
      // console.log(moq)
      temp.push(moq);
    }

    // console.log(temp)
    //   console.log(temp.sort( function( a , b){
    //     if(a > b) return 1;
    //     if(a < b) return -1;
    //     return 0;
    // }))

    //as temp array contained all the unique moqs , now we will sort it in ascending order and again store it
    let sortedMOQs = temp.sort((a, b) => {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });

    // console.log(sortedMOQs)

    //now that we have got our moqs in sorted order , we will iterate over allUnitPrices array to get
    //highest/lowest unit price ,distributor name/stock providing the highesh/lowest unit price
    let pricingDetails = [];

    sortedMOQs.map((moq, id) => {
      let maxPrice;
      let minPrice;
      let maxPriceDistName;
      let minPriceDistName;
      let maxPriceDistStock;
      let minPriceDistStock;
      let maxTaxedPrice = 0;
      let minTaxedPrice = Infinity;
      let partName;

      allUnitPrices.map((curr, ind) => {
        if (moq === curr.unit_break) {
          if (curr.taxed_unit_price > maxTaxedPrice) {
            maxTaxedPrice = curr.taxed_unit_price;
            maxPriceDistName = curr.distributor;
            maxPriceDistStock = curr.stocks;
            maxPrice = curr.unit_price;
            partName = curr.partName;
          }

          if (curr.taxed_unit_price < minTaxedPrice) {
            minTaxedPrice = curr.taxed_unit_price;
            minPriceDistName = curr.distributor;
            minPriceDistStock = curr.stocks;
            minPrice = curr.unit_price;
            partName = curr.partName;
          }
        }
      });

      // console.log(
      //   "MOQ =",
      //   moq,
      //   "maxPrice =",
      //   maxPrice,
      //   "maxPriceDistName =",
      //   maxPriceDistName,
      //   "maxPriceDistStock =",
      //   maxPriceDistStock
      // );
      // console.log(
      //   "MOQ =",
      //   moq,
      //   "minPrice =",
      //   minPrice,
      //   "minPriceDistName =",
      //   minPriceDistName,
      //   "minPriceDistStock =",
      //   minPriceDistStock
      // );
      // console.log("\n");

      pricingDetails.push({
        moq,
        maxUnitPrice: maxPrice,
        maxUnitPriceDistributor: maxPriceDistName,
        maxUnitPriceWithTax: maxTaxedPrice,
        maxUnitPriceDistributorStocks: maxPriceDistStock,
        minUnitPrice: minPrice,
        minUnitPriceWithTax: minTaxedPrice,
        minUnitPriceDistributor: minPriceDistName,
        minUnitPriceDistributorStocks: minPriceDistStock,
        partName,
      });
    });

    // console.log(pricingDetails);

    //to calculate discount values , we will store minTaxedUnitPrice, dist name & dist stocks
    let discountCalcArr = [];

    sortedMOQs.map((moq, id) => {
      let taxedPriceArr = [];
      let partName;

      allUnitPrices.map((curr, ind) => {
        if (moq === curr.unit_break) {
          taxedPriceArr.push({
            taxedPrice: curr.taxed_unit_price,
            DistName: curr.distributor,
            DistStock: curr.stocks,
          });
        }

        partName = curr.partName;
      });

      //sorting maxTaxedPriceArr & minTaxedPriceArr in ascending order
      taxedPriceArr.sort((a, b) =>
        a.taxedPrice < b.taxedPrice ? -1 : Number(a.taxedPrice > b.taxedPrice)
      );

      discountCalcArr.push({
        moq,
        partName,
        taxedPriceArr,
      });
    });

    // console.log(discountCalcArr);

    if (sessionStorage.getItem("pricingDetails")) {
      let temp = JSON.parse(sessionStorage.getItem("pricingDetails"));

      sessionStorage.setItem(
        "pricingDetails",
        JSON.stringify([...temp, ...pricingDetails])
      );
    } else {
      sessionStorage.setItem("pricingDetails", JSON.stringify(pricingDetails));
    }

    if (sessionStorage.getItem("discountCalcArr")) {
      let temp = JSON.parse(sessionStorage.getItem("discountCalcArr"));

      sessionStorage.setItem(
        "discountCalcArr",
        JSON.stringify([...temp, ...discountCalcArr])
      );
    } else {
      sessionStorage.setItem(
        "discountCalcArr",
        JSON.stringify(discountCalcArr)
      );
    }

    setUnitPrices(pricingDetails);

    // let unitPricesAsPerPrior = [];

    // newPriorityDistributorsPricing.map((priorDist, id) => {
    //   for (let dist in distributorListProvidingThatPart) {
    //     //if current distributor matches with the priority distributor , we will get it's MOQ & unit price
    //     if (dist === priorDist) {
    //       // console.log(dist)

    //       let distMOQ = Infinity;
    //       let distUnitPrice = Infinity;
    //       let currentMOQ = 0;
    //       let prevMatchedMOQ;

    //       for (let parts in distributorListProvidingThatPart[dist]) {
    //         // console.log(dist,parts,distributorListProvidingThatPart[dist])
    //         // console.log(distributorListProvidingThatPart[dist][parts])

    //         let distPartDetails = distributorListProvidingThatPart[dist][parts];

    //         if (distPartDetails.moq === "") {
    //           currentMOQ = distPartDetails.prices.INR[0].unit_break;
    //         } else {
    //           currentMOQ = Number(distPartDetails.moq);
    //         }

    //         //will only update distMOQ if currentMOQ of different subobjects in distributor are larger
    //         if (currentMOQ <= distMOQ) {
    //           prevMatchedMOQ = distMOQ;
    //           distMOQ = currentMOQ;

    //           for (let units in distPartDetails.prices.INR) {
    //             // console.log(distPartDetails.prices.INR[units]);

    //             let distUnit = distPartDetails.prices.INR[units];

    //             // console.log(
    //             //   'dist =', dist,
    //             //   '\ndist unit break =',distUnit.unit_break,
    //             //   "\nprevMatchedMOQ =",prevMatchedMOQ,
    //             //   "\ndistMOQ =",distMOQ,
    //             //   "\ndistMOQ unit break price =",Number(distUnit.unit_price).toFixed(2),
    //             //   "\ndistUnitPrice =",distUnitPrice
    //             // );

    //             //will only save that unit price of distMOQ
    //             //prevMatchedMOQ stores the previous matched(i.e currentMOQ <= distMOQ) distMOQ so that
    //             //we could store unit price of the least matched MOQ out of all the subobjects inside a distributor
    //             if (
    //               distUnit.unit_break === distMOQ &&
    //               prevMatchedMOQ >= distMOQ
    //             ) {
    //               distUnitPrice = Number(distUnit.unit_price).toFixed(2);
    //             }
    //           }
    //           // console.log("new object");
    //         }
    //       }

    //       // console.log(distMOQ,distUnitPrice,dist)

    //       unitPricesAsPerPrior.push({
    //         moq: distMOQ,
    //         unitPrice: Number(distUnitPrice),
    //         distributor: dist,
    //       });
    //     }
    //   }
    // });

    // // console.log("before sort", unitPricesAsPerPrior);

    // //sorting acc to moq value
    // unitPricesAsPerPrior.sort((a, b) =>
    //   a.moq < b.moq ? -1 : a.moq > b.moq ? 1 : 0
    // );

    // console.log("after sort", unitPricesAsPerPrior);

    // //this array will contain unique moq values
    // let newUniqueUnitPrices = [];

    // //in this array if the moq are same for two values then we are only pushing that value whose unitprice is lesser
    // if (unitPricesAsPerPrior.length > 1) {
    //   for (let i = 0; i < unitPricesAsPerPrior.length - 1; i++) {
    //     if (unitPricesAsPerPrior[i].moq === unitPricesAsPerPrior[i + 1].moq) {
    //       if (
    //         unitPricesAsPerPrior[i].unitPrice >
    //         unitPricesAsPerPrior[i + 1].unitPrice
    //       ) {
    //         newUniqueUnitPrices.push(unitPricesAsPerPrior[i + 1]);
    //       } else {
    //         newUniqueUnitPrices.push(unitPricesAsPerPrior[i]);
    //       }
    //       i++;
    //     } else {
    //       newUniqueUnitPrices.push(unitPricesAsPerPrior[i]);
    //     }
    //   }
    // } else {
    //   newUniqueUnitPrices = unitPricesAsPerPrior;
    // }

    // // console.log(newUniqueUnitPrices)

    // setUnitPrices(newUniqueUnitPrices);
    // setStoredUnitPrices(newUniqueUnitPrices);
  };

  //to add taxes to unit prices
  const addingTaxToUnitPrices = (price, dist) => {
    let finalTaxedUnitPrice;

    if (dist === "element14 India") {
      let CFMargin = price * 0.2;
      finalTaxedUnitPrice = price + CFMargin;
    } else {
      let freight = price * 0.2; //20% of unit price
      let insurance = price * 0.01125; //1.125% of unit price

      let assessableValue = price + freight + insurance;

      let BCD = assessableValue * 0.1; //10% of assessableValue
      let SWSrchrg = BCD * 0.1; //10% of BCD

      let assessableValueBCDSW = assessableValue + BCD + SWSrchrg;

      let IGST = assessableValueBCDSW * 0.18;

      let totalTax = BCD + SWSrchrg + IGST;

      let CFMargins = assessableValueBCDSW * 0.2;

      finalTaxedUnitPrice = assessableValueBCDSW + CFMargins;
    }

    // if (minPriceDistName === "element14 India") {
    //   finalTaxedMinUnitPrice = minPrice + minPrice * 0.18;
    // } else {
    //   let freight = minPrice * 0.2; //20% of unit price
    //   let insurance = minPrice * 0.01125; //1.125% of unit price

    //   let assessableValue = minPrice + freight + insurance;

    //   let BCD = assessableValue * 0.1; //10% of assessableValue
    //   let SWSrchrg = BCD * 0.1; //10% of BCD

    //   let assessableValueBCDSW = assessableValue + BCD + SWSrchrg;

    //   let IGST = assessableValueBCDSW * 0.18;

    //   let totalTax = BCD + SWSrchrg + IGST;

    //   let CFMargins = assessableValueBCDSW * 0.2;

    //   finalTaxedMinUnitPrice = assessableValueBCDSW + CFMargins;
    // }

    // console.log(finalTaxedMaxUnitPrice,finalTaxedMinUnitPrice)

    return finalTaxedUnitPrice;
  };

  const handleAddToCart = async () => {
    // console.log(quantity);

    // console.log(dataTableLS[searchParams.get("tableId")-1].totalCumulativeDistributorsStocks)

    // let sumOfStocks =
    //   dataTableLS[searchParams.get("tableId") - 1]
    //     .totalCumulativeDistributorsStocks;

    let sumOfStocks;

    //if coming from basket page
    if (searchParams.get("basketItem")) {
      let basketItems = JSON.parse(sessionStorage.getItem("basketItems"));

      sumOfStocks =
        basketItems[Number(searchParams.get("basketItem"))].itemDetails
          .totalCumulativeDistributorsStocks;
    } else {
      sumOfStocks =
        dataTableLS[searchParams.get("tableId") - 1]
          .totalCumulativeDistributorsStocks;
    }

    if (quantity > 0 && quantity <= sumOfStocks) {
      if (quantity % (unitPrices && unitPrices[0].moq) === 0) {
        //calculating basket items
        let basketItems;

        let totalBasketAmount = 0;

        let ifAlreadyPresent = false;

        basketItems = sessionStorage.getItem("basketItems")
          ? JSON.parse(sessionStorage.getItem("basketItems"))
          : [];

        //calculating moq & unit price for the basket item
        let unitPriceBasket = 0;
        // let moqBasket = 0
        let moqBasket = unitPrices[0].moq;

        for (let i = 0; i < unitPrices.length; i++) {
          let currMOQ = unitPrices[i].moq;
          let currUnitPrice = unitPrices[i].maxUnitPriceWithTax;

          if (quantity >= currMOQ) {
            // moqBasket = currMOQ
            unitPriceBasket = currUnitPrice;
          } else {
            break;
          }
        }

        //calculating circuit flare purchase price
        let circuitFlarePurchasePrice = CircuitFlarePurchasePrice(quantity);

        // console.log(moqBasket,unitPriceBasket)

        let basketItem = {
          quantity: Number(quantity),
          itemDetails: partDetails,
          price: Number(Number(quantity) * Number(unitPriceBasket)).toFixed(2),
          unitPrice: Number(unitPriceBasket.toFixed(2)),
          moq: moqBasket,
          circuitFlarePurchasePrice,
          discount:
            Number(
              (
                Number(quantity) * Number(unitPriceBasket) -
                circuitFlarePurchasePrice
              ).toFixed(2)
            ) > 0
              ? Number(
                  (
                    Number(quantity) * Number(unitPriceBasket) -
                    circuitFlarePurchasePrice
                  ).toFixed(2)
                )
              : 0,
        };

        // console.log(basketItem);

        //checking if the item to be added is already present in the cart or not
        basketItems.map((curr) => {
          if (curr.itemDetails.part_number === partDetails.part_number) {
            ifAlreadyPresent = true;
            return 0;
          }
        });

        //if the item is already present then we will update the quantity & price
        if (ifAlreadyPresent) {
          basketItems.map((curr) => {
            if (curr.itemDetails.part_number === partDetails.part_number) {
              curr.quantity = curr.quantity + Number(quantity);

              //calculating new circuit flare purchase price
              let circuitFlarePurchasePrice = CircuitFlarePurchasePrice(
                curr.quantity + Number(quantity)
              );

              curr.price =
                curr.price + Number(quantity) * Number(curr.unitPrice);

              curr.discount = Number(
                (
                  curr.price +
                  Number(quantity) * Number(curr.unitPrice) -
                  circuitFlarePurchasePrice
                ).toFixed(2)
              );
            }
          });
        } else {
          //else we will simply push that item
          basketItems.push(basketItem);
        }

        //setting total basket amount & total discount amount
        let totalDiscountAmount = 0;
        basketItems.map((curr) => {
          totalBasketAmount += Number(curr.circuitFlarePurchasePrice);
          totalDiscountAmount += Number(curr.discount);
        });

        //setting data to LS so that even if a user logs out they will see these items in basket page
        sessionStorage.setItem("basketItems", JSON.stringify(basketItems));
        sessionStorage.setItem("totalBasketAmount", Number(totalBasketAmount));
        sessionStorage.setItem(
          "totalDiscountAmount",
          Number(totalDiscountAmount)
        );
        sessionStorage.setItem("totalBasketItems", Number(basketItems.length));

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

        //setting total cart items & amount to show them in modal
        setTotalCartItems(Number(basketItems.length));
        setTotalCartAmount(Number(totalBasketAmount));

        //will make the modal open
        setModalShow(true);
      } else {
        Swal.fire({
          title: "Quantity must be in the multiples of MOQ",
          icon: "info",
          confirmButtonText: "Close",
        }).then(() => setQuantity(0));
      }
    } else {
      setQuantity(0);
      Swal.fire({
        title: "Please Enter A Valid Quantity",
        icon: "info",
        confirmButtonText: "Close",
      });
    }
  };

  const CircuitFlarePurchasePrice = (quantity) => {
    let discountCalcArr = JSON.parse(sessionStorage.getItem("discountCalcArr"));

    // console.log(discountCalcArr);

    //extracting discountCalcArr for a particular part name
    let partWiseDiscountCalcArr = [];

    // console.log(partDetails);

    discountCalcArr.map((item, id) => {
      if (partDetails.source_part_number === item.partName) {
        partWiseDiscountCalcArr.push(item);
      }
    });

    // console.log(partWiseDiscountCalcArr);

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

        console.log(circuitFlarePurchasePrice);

        qtyStock -= discountTaxedPriceArr[i].DistStock;
      }
    }

    // console.log(circuitFlarePurchasePrice);
    // console.log(qtyStock);

    return circuitFlarePurchasePrice;
  };

  return (
    <>
      <NavbarComp ItemsInBasket={totalCartItems && totalCartItems} />
      {dataTableLS && dataTableLS ? (
        <>
          <div className="ds_container">
            <div className="ds_left_side">
              <div className="ds_left_side_top">
                <div className="ds_image">
                  <img src={partDetails && partDetails.image_url} alt="part" />
                </div>
                <div className="ds_image_desc">
                  <pre>{imgDesc}</pre>
                </div>
              </div>
              <div className="ds_left_side_bottom">
                <div>
                  <div>Mfr. No :</div>{" "}
                  <div>{partDetails && partDetails.part_number}</div>{" "}
                </div>
                <div style={{ borderTop: "1px solid #c4c4c4" }}>
                  <div>Mfr. :</div>{" "}
                  <div>{partDetails && partDetails.manufacturer}</div>{" "}
                </div>
                <div style={{ borderTop: "1px solid #c4c4c4" }}>
                  <div>Description :</div>
                  <div>{partDetails && partDetails.description}</div>{" "}
                </div>
                <div
                  style={{
                    borderTop: "1px solid #c4c4c4",
                    marginBottom: "10px",
                  }}
                >
                  <div>Datasheet :</div>{" "}
                  <div
                    style={{
                      color: "#4984F6",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    <a
                      style={{ cursor: "pointer" }}
                      href={partDetails && partDetails.datasheet_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {partDetails && partDetails.part_number} (PDF)
                    </a>
                  </div>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #c4c4c4",
                    marginBottom: "10px",
                  }}
                >
                  <div>Product Category :</div>{" "}
                  <div>{partDetails && partDetails.category}</div>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #c4c4c4",
                    marginBottom: "10px",
                  }}
                >
                  <div>RoHS Status :</div>{" "}
                  <div>{partDetails && partDetails.compliance.rohs}</div>
                </div>
              </div>
            </div>
            <div className="ds_right_side">
              {/* <div className="ds_right_side_top">
                <p>Filter Stock and Price according to your Req. Qty.</p>
                <div className="ds_l_b_fields">
                  <div>Enter Req. Qty:</div>
                  <input
                    type="number"
                    value={inputQTYMatchesValue}
                    onChange={(e) => setInputQTYMatchesValue(e.target.value)}
                    onKeyDown={(e) => handleEnter(e)}
                  />
                  <button onClick={handleQTYMatches}>Filter</button>
                </div>
              </div> */}

              <div className="ds_right_side_top">
                <h1>
                  {partDetails && partDetails.source_part_number} Stock and
                  Pricing
                </h1>
                <p>
                  All the prices include Customs Duty. <br />
                  Some components are eligible for discounts and are calculated
                  at Checkout.
                </p>
              </div>

              <div
                className="ds_right_side_middle"
                style={
                  checkDistStocksEmpty ? { opacity: "0" } : { opacity: "1" }
                }
              >
                <div className="ds_r_s_m_left">
                  <div className="dsrsml_1">Stock Availability :</div>
                  <div className="dsrsml_2">
                    {showQTYDist ? (
                      <>
                        {stockAvailability &&
                          stockAvailability.map((curr, id) => (
                            <>
                              <div>
                                <div>
                                  {curr.priorityNum === 0
                                    ? "Mouser :"
                                    : curr.priorityNum === 1
                                    ? "Digikey :"
                                    : curr.priorityNum === 2
                                    ? "element14 :"
                                    : curr.priorityNum === 3
                                    ? "Arrow :"
                                    : curr.priorityNum === 4
                                    ? "RS Components :"
                                    : curr.priorityNum === 5
                                    ? "SOS electronic :"
                                    : curr.priorityNum === 6
                                    ? "Symmetry :"
                                    : "Verical :"}
                                </div>{" "}
                                <div>{curr.stockValueAsPerQTY}</div>{" "}
                              </div>
                            </>
                          ))}
                      </>
                    ) : (
                      <>
                        <div>
                          <div>Mouser :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[0]
                              )}
                          </div>{" "}
                        </div>
                        <div>
                          <div>Digikey :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[1]
                              )}
                          </div>{" "}
                        </div>
                        <div>
                          <div>element14 :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[2]
                              )}
                          </div>{" "}
                        </div>
                        <div>
                          <div>Arrow :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[3]
                              )}
                          </div>{" "}
                        </div>
                        <div>
                          <div>RS Components :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[4]
                              )}
                          </div>{" "}
                        </div>
                        <div>
                          <div>SOS electronic :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[5]
                              )}
                          </div>{" "}
                        </div>
                        <div>
                          <div>Symmetry :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[6]
                              )}
                          </div>{" "}
                        </div>
                        <div>
                          <div>Verical :</div>{" "}
                          <div>
                            {partDetails &&
                              changeToIndianFormat(
                                partDetails.distributorStocksForThatPart[7]
                              )}
                          </div>{" "}
                        </div>
                      </>
                    )}

                    <div className="total_stock">
                      <div style={{ fontWeight: "800" }}>Total Stock :</div>{" "}
                      <div style={{ fontWeight: "800" }}>
                        {partDetails && showQTYDist
                          ? changeToIndianFormat(totalStocksForQTY)
                          : changeToIndianFormat(
                              partDetails.totalCumulativeDistributorsStocks
                            )}
                      </div>{" "}
                    </div>
                  </div>
                </div>

                <div className="ds_r_s_m_right">
                  <h2>Pricing :</h2>
                  {searchParams.get("basketItem") && loading ? (
                    <div
                      className="d-flex justify-content-center"
                      style={{ overflow: "hidden" }}
                    >
                      <div className="spinner-border mt-5" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="ds_r_s_m_right_table">
                      <div className="headingRow">
                        <h1>Qty.</h1>
                        <h1>Unit Price</h1>
                        <h1>Ext. Price</h1>
                      </div>
                      <div className="valuesRow">
                        <div className="firstCol">
                          {partDetails &&
                            unitPrices &&
                            unitPrices.map((curr, id) => (
                              <div>{curr && curr.moq}</div>
                            ))}
                        </div>
                        <div className="secondCol">
                          {partDetails &&
                            unitPrices &&
                            unitPrices.map((curr, id) => (
                              <div>
                                ₹{" "}
                                {/* {Number(curr && curr.unitPrice).toFixed(2) *
                                extraChargesInPercent} */}
                                {changeToIndianFormat(
                                  Number(
                                    curr && curr.maxUnitPriceWithTax
                                  ).toFixed(2) * extraChargesInPercent
                                )}
                              </div>
                            ))}
                        </div>
                        <div className="thirdCol">
                          {partDetails &&
                            unitPrices &&
                            unitPrices.map((curr, id) => (
                              <div>
                                ₹{" "}
                                {changeToIndianFormat(
                                  Number(
                                    Number(curr && curr.moq) *
                                      (Number(curr.maxUnitPriceWithTax) *
                                        extraChargesInPercent)
                                  ).toFixed(2)
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* <table>
                    <tr
                      style={{
                        borderRight: "1px solid #c4c4c4",
                      }}
                    >
                      <th
                        style={{
                          borderRight: "1px solid #c4c4c4",
                          padding: "1%",
                        }}
                      >
                        Qty.
                      </th>
                      <th style={{ borderRight: "1px solid #c4c4c4" }}>
                        Unit Price
                      </th>
                      <th>Ext. Price</th>
                    </tr>
                    {partDetails &&
                      unitPrices &&
                      unitPrices.map((curr, id) => (
                        <tr key={id}>
                          <td
                            style={{
                              borderRight: "1px solid #c4c4c4",
                              padding: "2%",
                            }}
                          >
                            {curr && curr.moq}
                          </td>
                          <td style={{ borderRight: "1px solid #c4c4c4" }}>
                            ₹{" "}
                            {Number(curr && curr.unitPrice).toFixed(2) *
                              extraChargesInPercent}
                          </td>
                          <td style={{ borderRight: "none" }}>
                            ₹{" "}
                            {Number(
                              Number(curr && curr.moq) *
                                (Number(curr.unitPrice) * extraChargesInPercent)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </table> */}
                </div>
              </div>

              <div className="ds_right_side_bottom">
                <div>
                  <div style={{ marginRight: "-100px" }}>
                    MOQ: {unitPrices && unitPrices[0] && unitPrices[0].moq}
                  </div>{" "}
                  <div>
                    Multiple: {unitPrices && unitPrices[0] && unitPrices[0].moq}
                  </div>
                </div>
                <div>
                  Enter Quantity:{" "}
                  <input
                    type="number"
                    value={quantity === 0 ? null : quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />{" "}
                  <button
                    variant="primary"
                    onClick={() => {
                      handleAddToCart();
                    }}
                  >
                    Buy
                  </button>
                  <MyVerticallyCenteredModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    partDetails={partDetails && partDetails}
                    quantity={quantity > 0 && quantity}
                    totalCartItems={totalCartItems}
                    totalCartAmount={totalCartAmount}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="ds_bottom_side">
            <h1>COMING SOON!</h1>
            <h2>
              Download free symbols, footprints, & 3D models for millions of
              electronic components
            </h2>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Datasheet;
