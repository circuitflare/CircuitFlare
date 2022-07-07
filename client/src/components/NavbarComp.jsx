import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
import "../styles/navbarComp.css";
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { logoutUser } from "../APIcalls";
import Swal from "sweetalert2";
import axios from "axios";
import logo from "../assets/Logo@2x.png";

const NavbarComp = ({ hideSearchCart = false, ItemsInBasket = 0 }) => {
  const [bgDark, setBgDark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [searchItem, setSearchItem] = useState("");
  const [loadingIcon, setLoadingIcon] = useState(false);

  const navigate = useNavigate();
  const [login, setLogin] = useState(false);
  const [basketItems, setBasketItems] = useState(ItemsInBasket);
  const [userInfo, setUserInfo] = useState();

  var hideSearch = hideSearchCart ? true : false;
  var hideCart = hideSearchCart ? true : false;

  useEffect(() => {
    if (sessionStorage.getItem("loggedInUser")) {
      setLogin(true);
      setUserInfo(JSON.parse(sessionStorage.getItem("loggedInUser")));
    }

    if (sessionStorage.getItem("totalBasketItems")) {
      setBasketItems(sessionStorage.getItem("totalBasketItems"));
    }
  }, [
    sessionStorage.getItem("loggedInUser"),
    sessionStorage.getItem("totalBasketItems"),
  ]);

  const handleLogout = async () => {
    try {
      Swal.fire({
        title: "User Logged Out",
        icon: "success",
        confirmButtonText: "Close",
        timer: 1500,
      });

      sessionStorage.removeItem("loggedInUser");
      await logoutUser();
      setLogin(false);
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

  const handleSearch = async () => {
    try {
      if (searchItem !== "") {
        setLoadingIcon(true);

        let countryCode = "IN";
        let currency = "INR";
        let groupBy1 = "part_number";
        let groupBy2 = "distributor_name";

        console.log(searchItem);

        const res = await axios.get(
          `https://beta.api.oemsecrets.com/partsearch?apiKey=xbeask7e254jys4hb6rykgqf0hxvcigs8h53sgdie21s42wet8w3n2ay42pofcm7&searchTerm=${searchItem}&countryCode=${countryCode}&currency=${currency}&groupBy[]=${groupBy1}&groupBy[]=${groupBy2}`
        );

        console.log(res.data);

        if (res.data.stock.length === 0) {
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
            setLoadingIcon(false);
            setSearchItem("");
          } else {
            navigate("/result");
            setLoadingIcon(false);
            setSearchItem("");
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

      toBreak: for (const obj in keyValuePair) {
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

        break toBreak;
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
    <>
      <Navbar className="p-3 mb-2 navbar_comp" expand="lg">
        <Navbar.Brand
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
          className="navbar_logo"
        >
          <img src={logo} alt="logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            {!hideSearch && (
              <div className="navbar_field">
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
                      <div
                        class="spinner-border spinner-border-sm"
                        role="status"
                      >
                        <span class="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            )}

            <div
              className={
                hideSearch
                  ? "navbar_links ms-auto whenNoSearch"
                  : "navbar_links ms-auto"
              }
            >
              <ul
                onMouseEnter={() => setBgDark(true)}
                onMouseLeave={() => setBgDark(false)}
                style={hideCart ? { transform: "translateX(300px)" } : {}}
              >
                <li onClick={() => navigate("/about")}>About</li>
                <li
                  onMouseEnter={() => setShowMenu(false)}
                  onClick={() => navigate("/help")}
                >
                  Help
                </li>
                <div
                  className="navbar_dropdown"
                  onMouseEnter={() => {
                    setShowMenu(true);
                  }}
                >
                  <li>Account & Orders</li>
                </div>
                {!hideCart && (
                  <li
                    onMouseEnter={() => setShowMenu(false)}
                    onClick={() => navigate("/basket")}
                  >
                    <FiShoppingCart style={{ fontSize: "25px" }} />{" "}
                    <span>{basketItems > 0 ? basketItems : 0}</span>{" "}
                  </li>
                )}
              </ul>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {showMenu && login ? (
        <div
          className="navbar_dropdown-content navbar_dropdown-content_width"
          style={showMenu ? { display: "block", transition: "all 300ms" } : {}}
          onMouseLeave={() => setShowMenu(false)}
        >
          <li
            className="mt-1"
            style={{ color: "black", opacity: "0.6", cursor: "default" }}
          >
            {userInfo.registerLoginWithGoogle
              ? `${userInfo.email}`
              : `${userInfo.username}`}
          </li>
          <li className="mt-3" onClick={() => navigate("/account")}>
            Account Settings
          </li>
          <li className="mt-3" onClick={() => navigate("/order_history")}>
            Order History
          </li>
          <li className="mt-3" onClick={handleLogout}>
            Logout
          </li>
        </div>
      ) : (
        showMenu &&
        !login && (
          <div
            className="navbar_dropdown-content"
            style={
              setShowMenu ? { display: "block", transition: "all 300ms" } : {}
            }
            onMouseLeave={() => setShowMenu(false)}
          >
            <li>
              <button onClick={() => navigate("/login")}>Login</button>
            </li>
            <li className="navbar_dropdown-content-signup">
              New Customer?{" "}
              <span
                style={{ color: "#0053F2" }}
                onClick={() => navigate("/signup")}
              >
                &nbsp;Sign up
              </span>{" "}
            </li>
            <li
              style={{ color: "#0053F2" }}
              onClick={() => navigate("/order_history")}
            >
              Order History
            </li>
          </div>
        )
      )}
    </>
  );
};

export default NavbarComp;
