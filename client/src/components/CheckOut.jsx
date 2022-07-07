import React, { useState, useEffect } from "react";
import "../styles/checkOut.css";
import { useNavigate } from "react-router-dom";
import { HiArrowNarrowLeft } from "react-icons/hi";
import Swal from "sweetalert2";

const CheckOut = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [useBillingInfo, setUseBillingInfo] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);
  const [savedAddr, setSavedAddr] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    company: "",
    attention: "",
    address1: "",
    address2: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
    gstin: "",
    purchase_order_no: "",
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    company: "",
    attention: "",
    address1: "",
    address2: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [savedBillingInfo, setSavedBillingInfo] = useState([]);
  const [savedDeliveryInfo, setSavedDeliveryInfo] = useState();
  const [useSavedBilling1, setUseSavedBilling1] = useState(false);
  const [useSavedBilling2, setUseSavedBilling2] = useState(false);
  const [useSavedDelivery, setUseSavedDelivery] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("loggedInUser")) {
      setLoggedIn(false);
      Swal.fire({
        title: "User Is Not Authorized",
        icon: "info",
        confirmButtonText: "Close",
      }).then(() => navigate("/login"));
    } else {
      //whenever checkout page loads , we will make this value true so that user wont be able to route directly to payment page
      //and in handleContinue func , we are making this value to false which means we will allow user to route to /payment page only when they fill all the fields properly
      sessionStorage.setItem("IsPreviousPaymentDone", true);

      if (!sessionStorage.getItem("basketItems") || sessionStorage.getItem("totalBasketItems") === 0 || JSON.parse(sessionStorage.getItem("basketItems")).length === 0) {
        setLoggedIn(false);
        Swal.fire({
          title: "Cart Is Empty",
          icon: "info",
          confirmButtonText: "Close",
        }).then(() => navigate("/"));
      } else {
        setLoggedIn(true);

        if (
          sessionStorage.getItem("billingInfo") &&
          sessionStorage.getItem("deliveryInfo")
        ) {
          setSavedAddr(true);
          setSavedBillingInfo(JSON.parse(sessionStorage.getItem("billingInfo")));
          setSavedDeliveryInfo(
            JSON.parse(sessionStorage.getItem("deliveryInfo"))
          );
        } else {
          setSavedAddr(false);
        }
      }
    }
  }, []);

  const handleOnChangeBilling = (e) => {
    const { name, value } = e.target;

    setBillingInfo({ ...billingInfo, [name]: value });

    // sessionStorage.setItem("billingInfo", JSON.stringify({ ...billingInfo, [name]: value }));
  };

  const handleOnChangeDelivery = (e) => {
    const { name, value } = e.target;

    setDeliveryInfo({ ...deliveryInfo, [name]: value });

    // sessionStorage.setItem("deliveryInfo", JSON.stringify({ ...deliveryInfo, [name]: value }));
  };

  const handleSaveInfo = () => {
    if (!saveInfo) {
      // console.log('to save')
      let billingInfoArr = savedBillingInfo && savedBillingInfo.length > 0 ? savedBillingInfo: [];

      console.log(billingInfoArr)

      if(savedBillingInfo && savedBillingInfo.length === 2){
        billingInfoArr.pop()
      }
      
      billingInfoArr.unshift(billingInfo)      

      sessionStorage.setItem("billingInfo", JSON.stringify(billingInfoArr));
      sessionStorage.setItem("deliveryInfo", JSON.stringify(deliveryInfo));
    } else {
      // console.log('to not save')
      // sessionStorage.removeItem("billingInfo");
      // sessionStorage.removeItem("deliveryInfo");
    }
  };

  const handleUseBillingInfo = () => {
    if (!useBillingInfo) {
      // console.log('to use billing info')
      setDeliveryInfo({
        firstname: billingInfo.firstname,
        lastname: billingInfo.lastname,
        email: billingInfo.email,
        phone: billingInfo.phone,
        company: billingInfo.company,
        attention: billingInfo.attention,
        address1: billingInfo.address1,
        address2: billingInfo.address2,
        landmark: billingInfo.landmark,
        city: billingInfo.city,
        state: billingInfo.state,
        zipCode: billingInfo.zipCode,
      });
    } else {
      // console.log('to not use billing info')
      if (!useSavedDelivery) {
        setDeliveryInfo({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          company: "",
          attention: "",
          address1: "",
          address2: "",
          landmark: "",
          city: "",
          state: "",
          zipCode: "",
        });
      }
    }
  };

  const handleUseSavedBilling = (radioBtn) => {
    if(radioBtn === 1){
      if (!useSavedBilling1) {
        // console.log('to use saved billing info')
        setBillingInfo(savedBillingInfo[0]);
      } else {
        // console.log('to not use saved billing info')
        setBillingInfo({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          company: "",
          attention: "",
          address1: "",
          address2: "",
          landmark: "",
          city: "",
          state: "",
          zipCode: "",
          gstin: "",
          purchase_order_no: "",
        });
      }
    }else{
      if (!useSavedBilling2) {
        // console.log('to use saved billing info')
        setBillingInfo(savedBillingInfo[1]);
      } else {
        // console.log('to not use saved billing info')
        setBillingInfo({
          firstname: "",
          lastname: "",
          email: "",
          phone: "",
          company: "",
          attention: "",
          address1: "",
          address2: "",
          landmark: "",
          city: "",
          state: "",
          zipCode: "",
          gstin: "",
          purchase_order_no: "",
        });
      }
    }
    
  };

  const handleUseSavedDelivery = () => {
    if (!useSavedDelivery) {
      // console.log('to use saved delivery info')
      setDeliveryInfo(savedDeliveryInfo);
    } else {
      // console.log('to not use saved delivery info')
      setDeliveryInfo({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        company: "",
        attention: "",
        address1: "",
        address2: "",
        landmark: "",
        city: "",
        state: "",
        zipCode: "",
      });
    }
  };

  const handleContinue = () => {
    console.log(billingInfo);
    console.log(deliveryInfo);

    if (
      billingInfo.firstname === "" ||
      billingInfo.lastname === "" ||
      billingInfo.address1 === "" ||
      billingInfo.address2 === "" ||
      billingInfo.email === "" ||
      billingInfo.phone === "" ||
      billingInfo.city === "" ||
      billingInfo.state === "" ||
      billingInfo.state === "" ||
      billingInfo.zipCode === "" ||
      deliveryInfo.firstname === "" ||
      deliveryInfo.lastname === "" ||
      deliveryInfo.address1 === "" ||
      deliveryInfo.address2 === "" ||
      deliveryInfo.city === "" ||
      deliveryInfo.state === "" ||
      deliveryInfo.zipCode === "" ||
      deliveryInfo.email === "" ||
      deliveryInfo.phone === ""
    ) {
      Swal.fire({
        title: "Please Fill All The Fields",
        icon: "info",
        confirmButtonText: "Close",
      });
      sessionStorage.setItem("IsPreviousPaymentDone", true);
    } else {
      
        //to allow route to /payment page
        sessionStorage.setItem("IsPreviousPaymentDone", false);
      

      navigate("/payment");
    }
  };

  return (
    <div
      className="co_container"
      style={
        loggedIn ? { display: "block" } : { display: "none" }
      }
    >
      <div className="back_arrow" onClick={() => navigate("/basket")} style={{marginLeft:'230px'}}>
        {" "}
        <HiArrowNarrowLeft className="arrowIcon" /> <span>Back to basket</span>{" "}
      </div>
      {savedAddr && (
        <div className="co_savedaddr">
          <h2>Saved Address</h2>
          <div className="co_sa_box">
            <div className="co_sa_box_left">
              <input
                type="radio"
                id="select_addr"
                value={useSavedBilling1}
                onClick={() => {
                  setUseSavedBilling1(!useSavedBilling1);
                  setUseSavedBilling2(false);
                  handleUseSavedBilling(1);
                }}
                checked={useSavedBilling1}
                name="billing addr"
              />
              <div className="co_sa_row1">
                To <br />
                {savedBillingInfo && savedBillingInfo[0].firstname}{" "}
                {savedBillingInfo && savedBillingInfo[0].lastname} <br />
                {savedBillingInfo && savedBillingInfo[0].address1},{" "}
                {savedBillingInfo && savedBillingInfo[0].address2}, <br />
                {savedBillingInfo && savedBillingInfo[0].landmark}, <br />
                {savedBillingInfo && savedBillingInfo[0].city},{" "}
                {savedBillingInfo && savedBillingInfo[0].state} <br />
                {savedBillingInfo && savedBillingInfo[0].zipCode} <br />
                +91 {savedBillingInfo && savedBillingInfo[0].phone} <br />
                {savedBillingInfo && savedBillingInfo[0].email}
              </div>
            </div>
            {
              savedBillingInfo.length>1 && savedBillingInfo[1]
              && <div className="co_sa_box_right">
              <input
                type="radio"
                id="select_addr"
                value={useSavedBilling2}
                onClick={() => {
                  setUseSavedBilling1(false);
                  setUseSavedBilling2(!useSavedBilling2);
                  handleUseSavedBilling(2);
                }}
                checked={useSavedBilling2}
                name="billing addr"
              />
              <div className="co_sa_row1">
              To <br />
                {savedBillingInfo && savedBillingInfo[1].firstname}{" "}
                {savedBillingInfo && savedBillingInfo[1].lastname} <br />
                {savedBillingInfo && savedBillingInfo[1].address1},{" "}
                {savedBillingInfo && savedBillingInfo[1].address2}, <br />
                {savedBillingInfo && savedBillingInfo[1].landmark}, <br />
                {savedBillingInfo && savedBillingInfo[1].city},{" "}
                {savedBillingInfo && savedBillingInfo[1].state} <br />
                {savedBillingInfo && savedBillingInfo[1].zipCode} <br />
                +91 {savedBillingInfo && savedBillingInfo[1].phone} <br />
                {savedBillingInfo && savedBillingInfo[1].email}
              </div>
            </div>
            }
            
          </div>
          <h3>OR</h3>
        </div>
      )}
      <div className="co_billing">
        <h2>Billing Information</h2>
        <div className="co_b_1">
          <div>
            <label>
              First Name<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="firstname"
              value={billingInfo.firstname}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              Last Name<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="lastname"
              value={billingInfo.lastname}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              Email Address<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="email"
              required
              name="email"
              value={billingInfo.email}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              Phone Number<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="number"
              required
              name="phone"
              value={billingInfo.phone}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>

          <div>
            <label>Company Name</label>
            <input
              type="text"
              required
              name="company"
              value={billingInfo.company}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>Attention</label>
            <input
              type="text"
              required
              name="attention"
              value={billingInfo.attention}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              Address Line 1<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="address1"
              value={billingInfo.address1}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              Address Line 2<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="address2"
              value={billingInfo.address2}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>Landmark</label>
            <input
              type="text"
              required
              name="landmark"
              value={billingInfo.landmark}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
        </div>
        <div className="co_b_1 co_b_2">
          <div>
            <label>
              City<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="city"
              value={billingInfo.city}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              State<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="state"
              value={billingInfo.state}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div className="zipCodeInput">
            <label>
              Zip Code<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="zipCode"
              value={billingInfo.zipCode}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              GSTIN
            </label>
            <input
              type="text"
              name="gstin"
              value={billingInfo.gstin}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
          <div>
            <label>
              Purchase Order No.
            </label>
            <input
              type="text"
              name="purchase_order_no"
              value={billingInfo.purchase_order_no}
              onChange={(e) => handleOnChangeBilling(e)}
            />
          </div>
        </div>
      </div>
      <div className="co_billing co_delivery">
        <h2>Delivery Information</h2>
        <div className="co_d_checbox">
          <input
            type="checkbox"
            value={useBillingInfo}
            onClick={() => {
              setUseBillingInfo(!useBillingInfo);
              handleUseBillingInfo();
            }}
          />
          <label>Billing information is same as Delivery information</label>
        </div>
        <div className="co_b_1">
          <div>
            <label>
              First Name<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="firstname"
              value={deliveryInfo.firstname}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>
              Last Name<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="lastname"
              value={deliveryInfo.lastname}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>
              Email Address<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="email"
              required
              name="email"
              value={deliveryInfo.email}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>
              Phone Number<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="number"
              required
              name="phone"
              value={deliveryInfo.phone}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>

          <div>
            <label>Company Name</label>
            <input
              type="text"
              required
              name="company"
              value={deliveryInfo.company}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>Attention</label>
            <input
              type="text"
              required
              name="attention"
              value={deliveryInfo.attention}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>
              Address Line 1<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="address1"
              value={deliveryInfo.address1}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>
              Address Line 2<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="address2"
              value={deliveryInfo.address2}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>Landmark</label>
            <input
              type="text"
              required
              name="landmark"
              value={deliveryInfo.landmark}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
        </div>
        <div className="co_b_1 co_b_2">
          <div>
            <label>
              City<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="city"
              value={deliveryInfo.city}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div>
            <label>
              State<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="state"
              value={deliveryInfo.state}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
          <div className="zipCodeInput">
            <label>
              Zip Code<span style={{ color: "#F90909" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="zipCode"
              value={deliveryInfo.zipCode}
              onChange={(e) => handleOnChangeDelivery(e)}
            />
          </div>
        </div>
      </div>
      <div className="co_lastrow">
        <div className="co_l_arrow" onClick={() => navigate("/basket")}>
          {" "}
          <HiArrowNarrowLeft className="arrowIcon" />{" "}
          <span>Back to basket</span>{" "}
        </div>
        <div className="co_d_checbox">
          <input
            type="checkbox"
            value={saveInfo}
            onClick={() => {
              setSaveInfo(!saveInfo);
              handleSaveInfo();
            }}
          />
          <label>Save this information for faster checkout in the future</label>
        </div>
        <button className="co_btn" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default CheckOut;
