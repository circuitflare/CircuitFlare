import React, { useState, useEffect } from "react";
import "../styles/home.css";
import { FiShoppingCart } from "react-icons/fi";
import { AiOutlineSearch } from "react-icons/ai";
import buy from "../assets/buy.jpg";
import n_p from "../assets/network_package.jpg";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../APIcalls";
import Swal from "sweetalert2";
import axios from "axios";
import logo from "../assets/Logo@2x.png";

const Home = () => {
  const [bgDark, setBgDark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [loadingIcon, setLoadingIcon] = useState(false);
  const [basketItems, setBasketItems] = useState(0);

  const navigate = useNavigate();
  const [login, setLogin] = useState(false);
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    //to set ToExtractCartItemsFromDB value to true when a new user visits/logs in to set the cart items in sessionStorage
    if (!sessionStorage.getItem("ToExtractCartItemsFromDB")) {
      sessionStorage.setItem("ToExtractCartItemsFromDB", true);
    }

    //to set cart items
    if (
      sessionStorage.getItem("loggedInUser") &&
      sessionStorage.getItem("ToExtractCartItemsFromDB") &&
      JSON.parse(sessionStorage.getItem("ToExtractCartItemsFromDB"))
    ) {
      setLogin(true);
      setUserInfo(JSON.parse(sessionStorage.getItem("loggedInUser")));
      let user = JSON.parse(sessionStorage.getItem("loggedInUser"));

      axios.get(`/api/user/get/basket/items/${user.email}`).then((res) => {
        // console.log(res);
        // console.log(res.data);

        let DBcartItems = res.data.basketItems;
        let LocalcartItems = JSON.parse(sessionStorage.getItem("basketItems"));

        // console.log(DBcartItems)
        // console.log(LocalcartItems)

        if (DBcartItems && DBcartItems.length > 0) {
          console.log("DBcartItems present");

          //if session storage already have some basket items
          if (LocalcartItems && LocalcartItems.length > 0) {
            console.log("LocalcartItems present");

            //to avoid qty getting increased everytime a user visits the home page , we will store  a flag in session storage
            sessionStorage.setItem("ToExtractCartItemsFromDB", false);

            let finalBasketItems = [];

            DBcartItems.map((orderItem, ind) => {
              let isPresent = false;

              LocalcartItems.map((basketItem, id) => {
                if (
                  orderItem.itemDetails.source_part_number ===
                  basketItem.itemDetails.source_part_number
                ) {
                  console.log("present", basketItem);
                  basketItem.quantity += orderItem.quantity;

                  basketItem.price = Number((Number(basketItem.quantity) * Number(basketItem.unitPrice)).toFixed(2))

                  basketItem.circuitFlarePurchasePrice =
                    CircuitFlarePurchasePrice(
                      basketItem.itemDetails.source_part_number,
                      basketItem.quantity
                    );

                  basketItem.discount =
                    Number(
                      (
                        basketItem.quantity * basketItem.unitPrice -
                        basketItem.circuitFlarePurchasePrice
                      ).toFixed(2)
                    ) > 0
                      ? Number(
                          (
                            basketItem.quantity * basketItem.unitPrice -
                            basketItem.circuitFlarePurchasePrice
                          ).toFixed(2)
                        )
                      : 0;

                  finalBasketItems.push(basketItem);
                  isPresent = true;
                  LocalcartItems.splice(id, 1);
                  return 0;
                }
              });

              if (!isPresent) {
                finalBasketItems.push(orderItem);
              }
            });

            //to store left over values from local cart items
            LocalcartItems.map((curr) => finalBasketItems.push(curr));

            let totalBasketAmount = 0;
            let totalDiscountAmount = 0;

            finalBasketItems.map((curr) => {
              totalBasketAmount += curr.price;
              totalDiscountAmount += curr.discount;
            });

            sessionStorage.setItem(
              "basketItems",
              JSON.stringify(finalBasketItems)
            );
            sessionStorage.setItem("totalBasketAmount", totalBasketAmount);
            sessionStorage.setItem("totalDiscountAmount", totalDiscountAmount);
            sessionStorage.setItem("totalBasketItems", finalBasketItems.length);

            console.log("finalBasketItems", finalBasketItems);

            setBasketItems(finalBasketItems.length)

            //setting data to DB if user logged in
            axios
              .post(
                `/api/user/store/basket/items/${user.email}`,
                {
                  basketItems: finalBasketItems,
                  totalBasketAmount,
                  totalBasketItems: finalBasketItems.length,
                },
                {
                  "Content/Type": "application/json",
                }
              )
              .then((res) => console.log(res))
              .catch((err) => console.log(err));
          } else {
            console.log("LocalcartItems not present");

            setBasketItems(DBcartItems);

            console.log(DBcartItems);

            let totalBasketAmount = 0;
            let totalDiscountAmount = 0;

            DBcartItems.map((curr) => {
              totalBasketAmount += curr.price;
              totalDiscountAmount += curr.discount;
            });

            let transactionAmount =
              Number(totalBasketAmount) + 250 + Number(totalBasketAmount) * 0.18;

            sessionStorage.setItem("transactionAmount", transactionAmount);
            sessionStorage.setItem("basketItems", JSON.stringify(DBcartItems));
            sessionStorage.setItem("totalBasketAmount", totalBasketAmount);
            sessionStorage.setItem("totalDiscountAmount", totalDiscountAmount);
            sessionStorage.setItem("totalBasketItems", DBcartItems.length);

            setBasketItems(DBcartItems.length)

          }
        } else if (LocalcartItems && LocalcartItems.length > 0) {
          console.log("DBcartItems not present but LocalcartItems present");
          setBasketItems(LocalcartItems);

          console.log(LocalcartItems);

          let totalBasketAmount = 0;
          let totalDiscountAmount = 0;

          LocalcartItems.map((curr) => {
            totalBasketAmount += curr.price;
            totalDiscountAmount += curr.discount;
          });

          let transactionAmount =
            Number(totalBasketAmount) + 250 + Number(totalBasketAmount) * 0.18;

          sessionStorage.setItem("transactionAmount", transactionAmount);

          sessionStorage.setItem("basketItems", JSON.stringify(LocalcartItems));
          sessionStorage.setItem("totalBasketAmount", totalBasketAmount);
          sessionStorage.setItem("totalDiscountAmount", totalDiscountAmount);
          sessionStorage.setItem("totalBasketItems", LocalcartItems.length);

          setBasketItems(LocalcartItems.length)


          //setting data to DB if user logged in
          axios
            .post(
              `/api/user/store/basket/items/${user.email}`,
              {
                basketItems: LocalcartItems,
                totalBasketAmount,
                totalBasketItems: LocalcartItems.length,
              },
              {
                "Content/Type": "application/json",
              }
            )
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
        }
      });
    }

    if (sessionStorage.getItem("loggedInUser")) {
      setLogin(true);
      setUserInfo(JSON.parse(sessionStorage.getItem("loggedInUser")));
    } else {
      setLogin(false);
    }

    if (sessionStorage.getItem("basketItems")) {
      setBasketItems((JSON.parse(sessionStorage.getItem("basketItems"))).length);
    }
  }, []);

  const CircuitFlarePurchasePrice = (basketItemPartName, quantity) => {
    let discountCalcArr = JSON.parse(sessionStorage.getItem("discountCalcArr"));

    //extracting discountCalcArr for a particular part name
    let partWiseDiscountCalcArr = [];

    // console.log(curr)

    discountCalcArr.map((item, id) => {
      if (basketItemPartName === item.partName) {
        partWiseDiscountCalcArr.push(item);
      }
    });

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

  const handleLogout = async () => {
    try {
      Swal.fire({
        title: "User Logged Out",
        icon: "success",
        confirmButtonText: "Close",
        timer: 1500,
      });
      setLogin(false);
      setBasketItems(sessionStorage.getItem("totalBasketItems"));
      sessionStorage.removeItem("loggedInUser");
      await logoutUser();

      //indicates that when user logs in , the DB cart items will merge with already present cart items
      sessionStorage.setItem("ToExtractCartItemsFromDB", true);
    } catch (err) {
      Swal.fire({
        title: "Oops!",
        text: "Something Went Wrong, Please Try Again",
        icon: "error",
        confirmButtonText: "Close",
        timer: 1500,
      });
    }
  };

  const leftText = String.raw`We've consolidated several 
  component distributors in one place 
  so you can search and buy parts without 
  having to leave our website.`;

  const rightText = String.raw`We source components 
  from multiple distributors on     
  your behalf and ship them to you 
  as a single package.`;

  const handleSearch = async () => {
    try {
      if (searchItem !== "") {
        setLoadingIcon(true);

        let countryCode = "IN";
        let currency = "INR";
        let groupBy1 = "part_number";
        let groupBy2 = "distributor_name";

        // console.log(searchItem);

        const res = await axios.get(
          `https://beta.api.oemsecrets.com/partsearch?apiKey=xbeask7e254jys4hb6rykgqf0hxvcigs8h53sgdie21s42wet8w3n2ay42pofcm7&searchTerm=${searchItem}&countryCode=${countryCode}&currency=${currency}&groupBy[]=${groupBy1}&groupBy[]=${groupBy2}`
        );

        console.log(res.data);

        if (res && res.data.stock.length === 0) {
          Swal.fire({
            title: "No Results Found!",
            icon: "info",
            confirmButtonText: "Close",
          });
          setLoadingIcon(false);
          setSearchItem("");
        } else {
          sessionStorage.setItem(
            "searchResults",
            JSON.stringify({
              countryCode,
              currency,
              groupBy1,
              groupBy2,
              searchItem,
              results: res.data.stock,
            })
          );

          let searchData = {
            countryCode,
            currency,
            groupBy1,
            groupBy2,
            searchItem,
            results: res.data.stock,
          };

          var searchResultsCnt = 0;

          for (const resultItem in searchData && searchData.results) {
            searchResultsCnt++;
            // console.log(resultItem)
          }

          if (searchResultsCnt === 1) {
            ToCalculateTableData(searchData);
            setSearchItem("");
            sessionStorage.setItem("numberOfResults", 0);
          } else {
            navigate("/result");
            setLoadingIcon(false);
            setSearchItem("");
            sessionStorage.setItem("numberOfResults", 1);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ToCalculateTableData = (searchData) => {
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

    let tempToShowData = [];
    let cnt = 0;

    priorityDist.map((curr) => {
      var keyValuePair =
        searchData &&
        searchData.results[
          `${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`
        ][curr];

      for (const obj in keyValuePair) {
        var valuePart = keyValuePair[obj];

        const distributorStocksForThatPart = ToCalculateDistributorStocks(
          searchData.results[
            `${searchData.searchItem.replace(/[^a-zA-Z0-9 ]/g, "")}`
          ]
        );

        tempToShowData.push({
          tableId: 0,
          ...valuePart,
          distributorStocksForThatPart:
            distributorStocksForThatPart.distributorStocks,
          totalCumulativeDistributorsStocks:
            distributorStocksForThatPart.totalStocks,
        });

        break;
      }

      console.log(tempToShowData);

      sessionStorage.setItem("dataTable", JSON.stringify(tempToShowData));

      return 0;
    });

    navigate(
      `/datasheet?partNo=${tempToShowData[0].source_part_number}&tableId=1`
    );
  };

  const ToCalculateDistributorStocks = (distributorNames) => {
    // console.log(distributorNames)

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

    const distributorStocks = [];
    let totalStocks = 0;

    priorityDist.map((curr) => {
      //if the distributor is present in the list of distributors for that part
      if (distributorNames[curr]) {
        let keyValuePair = distributorNames[curr];

        let maxStockForThatDist = 0;

        for (const obj in keyValuePair) {
          //this loop will provide us that object containing the part details i.e value part of key-value part again of '5 : {...part details}'

          var valuePart = keyValuePair[obj];

          if (valuePart.quantity_in_stock >= maxStockForThatDist) {
            maxStockForThatDist = valuePart.quantity_in_stock;
          }
        }

        totalStocks += Number(maxStockForThatDist);

        distributorStocks.push(String(maxStockForThatDist));

        // console.log(curr,maxStockForThatDist)
      } else {
        //else we will just make the stock number "-"
        distributorStocks.push("NA");
      }
    });

    return { distributorStocks, totalStocks };
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="homepage">
      <div
        className="header_links"
        onMouseLeave={() => {
          setShowMenu(false);
        }}
      >
        <ul
          className="container"
          onMouseEnter={() => setBgDark(true)}
          onMouseLeave={() => setBgDark(false)}
        >
          <li onClick={() => navigate("/about")}>About</li>
          <li
            onMouseEnter={() => setShowMenu(false)}
            onClick={() => navigate("/help")}
          >
            Help
          </li>
          <div
            className="dropdown"
            onMouseEnter={() => {
              setShowMenu(true);
            }}
          >
            <li>Account & Orders</li>
            {showMenu && login ? (
              <div
                className="dropdown-content dropdown-content_width"
                style={
                  showMenu ? { display: "block", transition: "all 300ms" } : {}
                }
                onMouseLeave={() => setShowMenu(false)}
              >
                <li
                  className="mt-2"
                  style={{ color: "black", opacity: "0.6", cursor: "default" }}
                >
                  {userInfo.registerLoginWithGoogle
                    ? `${userInfo.email}`
                    : `${userInfo.username}`}
                </li>
                <li className="mt-2" onClick={() => navigate("/account")}>
                  Account Settings
                </li>
                <li className="mt-2" onClick={() => navigate("/order_history")}>
                  Order History
                </li>
                <li className="mt-2" onClick={handleLogout}>
                  Logout
                </li>
              </div>
            ) : (
              showMenu &&
              !login && (
                <div
                  className="dropdown-content"
                  style={
                    setShowMenu
                      ? { display: "block", transition: "all 300ms" }
                      : {}
                  }
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <li className="mt-2" onClick={() => navigate("/login")}>
                    <button>Login</button>
                  </li>
                  <li className="mt-2">
                    New Customer?{" "}
                    <span
                      style={{ color: "#0053F2" }}
                      onClick={() => navigate("/signup")}
                    >
                      Sign up
                    </span>{" "}
                  </li>
                  <li
                    className="mt-1"
                    style={{ color: "#0053F2" }}
                    onClick={() => navigate("/order_history")}
                  >
                    Order History
                  </li>
                </div>
              )
            )}
          </div>
          <li
            onMouseEnter={() => setShowMenu(false)}
            onClick={() => navigate("/basket")}
          >
            <FiShoppingCart style={{ fontSize: "25px" }} />{" "}
            <span>{basketItems > 0 ? basketItems : 0}</span>{" "}
          </li>
        </ul>
      </div>

      <div
        className="headerTop"
        style={
          bgDark
            ? {
                filter: "brightness(50%)",
                backdropFilter: "brightness(50%)",
                transition: "all 300ms",
              }
            : {}
        }
      >
        <div className="header_hero">
          <img src={logo} alt="logo" className="header_hero-logo" />
          <p className="header_hero-caption">
            Buy electronic components from the inventories of several
            distributors in a single order
          </p>
          <div className="header_hero_field">
            {/* <span
              style={{
                fontSize: "20px",
                position: "absolute",
                bottom: "12px",
                left: "4px",
                color: "grey",
              }}
            >
              <AiOutlineSearch />
            </span> */}

            <input
              type="text"
              placeholder="Search by entering full part number or partial part number"
              id="search_items"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              onKeyDown={(e) => handleEnter(e)}
            />
            <button onClick={() => handleSearch()} disabled={loadingIcon}>
              {loadingIcon ? (
                <div
                  className="text-center"
                  style={{ transform: "scale(1.4)", color: "#000" }}
                >
                  <div class="spinner-border spinner-border-sm" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                "Search"
              )}
            </button>
          </div>

          <button>
            Upload BoM <br />
            (Coming soon)
          </button>
        </div>
      </div>

      <div
        className="headerBottom"
        style={
          bgDark
            ? {
                filter: "brightness(50%)",
                backdropFilter: "brightness(50%)",
                transition: "all 300ms",
              }
            : {}
        }
      >
        <p>Why use our platform?</p>
        <div className="headerBottom_content">
          <div className="hBc_left">
            <div className="hBc_left-image">
              <img src={buy} alt="icon" />
            </div>
            <pre className="hBc_left-text">{leftText}</pre>
          </div>
          <div className="hBc_right">
            <div className="hBc_right-image">
              <img src={n_p} alt="icon" />
            </div>
            <pre className="hBc_right-text">{rightText}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
