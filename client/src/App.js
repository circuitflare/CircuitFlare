import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NavbarComp from "./components/NavbarComp";

//route component
import Home from "./components/Home";
import About from "./components/About";
import Help from "./components/Help.jsx";
import TermsCond from "./components/TermsCond";
import Login from "./components/Login";
import Signup from "./components/Signup";
import SearchResults from "./components/SearchResults";
import Datasheet from "./components/Datasheet";
import ShoppingBasket from "./components/ShoppingBasket";
import OrderConfirmed from "./components/OrderConfirmed.jsx";
import OrderHistory from "./components/OrderHistory.jsx";
import OrderDetails from "./components/OrderDetails.jsx";
import AccountSettings from "./components/AccountSettings";
import CheckOut from "./components/CheckOut.jsx";
import ForgotUnP from "./components/ForgotUnP";
import ResetUnP from "./components/ResetUnP";

/* admin route component */
import AdminLogin from "./components/Admin/AdminLogin.jsx";
import AdminOrders from "./components/Admin/AdminOrders.jsx";
import AdminOrderDetails from "./components/Admin/AdminOrderDetails.jsx";
import Payment from "./components/Payment";
import AdminFeedback from "./components/Admin/AdminFeedback";
import AdminResetUnP from './components/Admin/AdminResetUnP'

const App = () => {
  const location = useLocation();
  return (
    <div>
      {/*Normal navbar */}
      {location.pathname !== "/" &&
        location.pathname !== "/order_confirmed" &&
        location.pathname !== "/admin_login" &&
        location.pathname !== "/admin_orders" &&
        location.pathname !== "/admin_order_details" &&
        location.pathname !== "/datasheet" &&
        location.pathname !== "/admin_feedback" &&
        location.pathname !== "/admin/reset/password" &&
        location.pathname !== "/basket" && <NavbarComp />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/T&C" element={<TermsCond />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/result" element={<SearchResults />} />
        <Route path="/datasheet" element={<Datasheet />} />
        <Route path="/basket" element={<ShoppingBasket />} />
        <Route path="/order_confirmed" element={<OrderConfirmed />} />
        <Route path="/order_history" element={<OrderHistory />} />
        <Route path="/order_details/:id" element={<OrderDetails />} />
        <Route path="/account" element={<AccountSettings />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route
          path="/forgot/username"
          element={<ForgotUnP forgotValue="username" />}
        />
        <Route
          path="/forgot/password"
          element={<ForgotUnP forgotValue="password" />}
        />
        <Route
          path="/reset/username/:token"
          element={<ResetUnP forgotValue="username" />}
        />
        <Route
          path="/reset/password/:token"
          element={<ResetUnP forgotValue="password" />}
        />
        <Route path="/payment" element={<Payment />} />

        {/* admin routes */}
        <Route path="/admin_login" element={<AdminLogin />} />
        <Route path="/admin_orders" element={<AdminOrders />} />
        <Route path="/admin_order_details" element={<AdminOrderDetails />} />
        <Route path="/admin_feedback" element={<AdminFeedback />} />
        <Route path="/admin/reset/password" element={<AdminResetUnP />} />
      </Routes>
    </div>
  );
};

export default App;
