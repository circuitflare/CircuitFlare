const express = require("express");
const router = express.Router();

//controllers
const {createOrder, getUserOrders, addFeedbackForOrderNumber} = require("../controllers/orderControllers")

  //middlewares
const { authenticatedUser } = require("../middleware/authenticatedUser");
const {authorizedRole} = require("../middleware/authorizedRole");

  router.post("/create/order",authenticatedUser, createOrder);

  router.get("/get/user/orders",authenticatedUser, getUserOrders);

  router.put("/add/feedback/:orderNumber",authenticatedUser,addFeedbackForOrderNumber)

module.exports = router