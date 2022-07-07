const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//models
const User = require("../database/models/userSchema");

exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  const { firstname, lastname, email, username, password } = req.body;

  const user = new User({
    firstname,
    lastname,
    email,
    username,
    password,
  });

  await user.save();

  //generate token
  const token = user.generateToken();

  res.cookie("logintoken", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
  });

  //to send email
  await sendEmail(
    {
      email,
      subject: "Welcome On Board!",
      username,
      message: "Welcome on Board!",
    },
    "register"
  );

  res.status(201).json({ message: "User Created", success: true, user, token });
});

//loging in a user
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not registered. Please sign up.", 401));
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

//to log out
exports.loggingOutUser = asyncErrorHandler(async (req, res, next) => {
  res.clearCookie("logintoken", { path: "/" });

  res.status(200).json({ success: true, message: "Logged Out!" });
});

//to get logged in user's details
exports.loggedInUser = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({ success: true, user: req.user });
});

//update user password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  const { currPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await bcrypt.compare(currPassword, user.password);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler("You Entered Your Current Password Wrong", 400)
    );
  }

  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("New Password & Confirm Password Do Not Match", 400)
    );
  }

  if (newPassword === currPassword) {
    return next(
      new ErrorHandler("New Password Cannot Be Your Previous Password", 400)
    );
  }

  user.password = newPassword;

  //password will be hashed

  await user.save();

  res.status(200).json({ success: true, message: "Password Updated" });
});

//forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    var user = await User.findOne({ email: req.body.email });

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
    )}/reset/password/${resetToken}`;

    const message = `Dear ${user.username}, \n\nYour Reset Password Url is :- ${resetPasswordUrl} 
    \n\nThis Link Will Expire In 15 Minutes.Thank you \n\nRegards, \nCircuit Flare Team`;

    await sendEmail({
      email: user.email,
      subject: "Cicuit Flare Password Recovery",
      message,
    });

    res
      .status(200)
      .json({ success: true, message: `A Reset Password Link Sent!` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(new ErrorHandler(err.message, 500));
  }
};

//forgot username
exports.forgotUsername = async (req, res, next) => {
  try {
    var user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHandler("User Does Not Exist", 404));
    }

    //will get our reset token
    var resetToken = user.generatePasswordResetToken();

    //saving the fields in DB which were set in generatePasswordResetToken method
    await user.save();

    //when testing with postman
    // var resetPasswordUrl = `${req.protocol}://${req.get("host")}/user/username/reset/${resetToken}`;

    //when testing with frontend
    // var resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/username/${resetToken}`;

    //when hosting in heroku
    var resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset/username/${resetToken}`;

    const message = `Dear ${user.username}, \n\nYour Reset Username Url is :- ${resetPasswordUrl} 
    \n\nThis Link Will Expire In 15 Minutes.Thank you \n\nRegards, \nCircuit Flare Team`;

    await sendEmail({
      email: user.email,
      subject: "Cicuit Flare Username Recovery",
      message,
    });

    res
      .status(200)
      .json({ success: true, message: `A Reset Password Link Sent!` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return next(new ErrorHandler(err.message, 500));
  }
};

//reset password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
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

//reset username
exports.resetUsername = asyncErrorHandler(async (req, res, next) => {
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

  if (req.body.username !== req.body.confirmUsername) {
    return next(new ErrorHandler("Usernames do not match", 400));
  }

  user.username = req.body.username;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Username Reseted Successfully" });
});

//to get orderCount for that user
exports.getOrderCountOfUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.id });

  if (user.orderCount === 999) {
    user.orderCount = 1;
  } else {
    user.orderCount++;
  }

  await user.save();

  res.status(200).json({ success: true, orderCount: user.orderCount - 1 });
});

//get basket items
exports.getBasketItems = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  res
    .status(200)
    .json({
      success: true,
      basketItems: user.basketItems,
      totalBasketItems: user.totalBasketItems,
      totalBasketAmount: user.totalBasketAmount,
    });
});

//store basket items
exports.storeBasketItems = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  user.basketItems = req.body.basketItems;
  user.totalBasketAmount = req.body.totalBasketAmount;
  user.totalBasketItems = req.body.totalBasketItems;

  await user.save();

  res.status(200).json({ success: true, user });
});
