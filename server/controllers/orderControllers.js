const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
var mongo = require("mongodb");

//models
const Order = require("../database/models/orderSchema");
const User = require("../database/models/userSchema");

exports.createOrder = asyncErrorHandler(async (req, res, next) => {
  const order = new Order({
    ...req.body,
    paidAt: Date.now(),
    userId: req.user._id,
  });
  
  // console.log(req.body.cartItems)

// console.log(req.user)

  await order.save();

  await sendEmail(
    {
      email: req.user.email,
      subject: "Your Order Has Been Placed!",
      username: req.user.username,
      message: "Your Order Has Been Placed!",
      orderId: req.body.orderNumber,
    },
    "order_placed"
  );

  res.status(201).json({ success: true, order });
});

exports.getUserOrders = asyncErrorHandler(async (req, res, next) => {
  const userOrders = await Order.find({ user: req.user._id });

  res.status(201).json({ success: true, userOrders });
});

exports.addFeedbackForOrderNumber = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });

  if(req.body.feedback === ""){
    order.feedback = "-"
  }else{
    order.feedback = req.body.feedback
  }

  await order.save()

  res.status(201).json({ success: true, order });
});
