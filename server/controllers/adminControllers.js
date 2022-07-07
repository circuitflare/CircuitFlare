const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const User = require("../database/models/userSchema");
const Order = require("../database/models/orderSchema");

exports.adminLogin = asyncErrorHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler("Admin With These Credential Do Not Exist", 401)
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Login Details", 401));
  }

  const token = user.generateToken();

  res.cookie("logintoken", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ), //days to ms
  });

  res.status(201).json({
    message: "User Logged in successfully",
    success: true,
    user,
    token,
  });
});

exports.adminOrders = asyncErrorHandler(async (req, res, next) => {
  const userOrders = await Order.find({});

  res.status(201).json({ success: true, userOrders });
});

//forgot admin password
exports.adminForgotPassword = async (req, res, next) => {
  try {
    var user = await User.findOne({ email: "admin@gmail.com" });

    if (!user) {
      return next(new ErrorHandler("User Does Not Exist", 404));
    }

    //will get our reset token
    var resetToken = user.generatePasswordResetToken();

    //saving the fields in DB which were set in generatePasswordResetToken method
    await user.save();

    //when testing with postman
    // var resetPasswordUrl = `${req.protocol}://${req.get("host")}/user/password/reset/${resetToken}`;

    //when testing with frontend
    // var resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/password/${resetToken}`;

    //when hosting in heroku
    var resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/admin/reset/password?token=${resetToken}`;

    const message = `Dear admin, \n\nYour Reset Password Url is :- ${resetPasswordUrl} 
    \n\nThis Link Will Expire In 15 Minutes.Thank you \n\nRegards, \nCircuit Flare Team`;

    await sendEmail({
      email:"deepak@circuitflare.com",
      // email:"bhaveshdamor5555@gmail.com",
      subject: "Cicuit Flare Admin Password Recovery",
      message,
    });

    res
      .status(200)
      .json({
        success: true,
        message: `A Reset Password Link Sent!`,
        resetToken,
      });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(new ErrorHandler(err.message, 500));
  }
};

//update admin password
exports.adminUpdatePassword = asyncErrorHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token Is Invalid or Has Been Expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password Reseted Successfully" });
});

//update order status
exports.updateOrderStatus = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });

  if (req.body.orderStatus === "") {
    order.orderStatus = "Processing";
  } else {
    order.orderStatus = req.body.orderStatus;
  }

  await order.save();

  res.status(201).json({ success: true, order });
});

//update remarks for products on order details page
exports.addRemarks = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });

  if (req.body.remarks.length > 0) {
    order.remarks = req.body.remarks;
  } else {
    order.remarks = [];
  }

  await order.save();

  res.status(201).json({ success: true, order });
});
