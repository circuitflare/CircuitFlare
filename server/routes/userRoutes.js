const express = require("express");
const router = express.Router();

//controllers
const {
    registerUser,
    loginUser,
    loggingOutUser,
    loggedInUser,
    updatePassword,
    forgotPassword,
    resetPassword,
    forgotUsername,
    resetUsername,
    getOrderCountOfUser,
    getBasketItems,
    storeBasketItems
  } = require("../controllers/userControllers");

  //middlewares
const { authenticatedUser } = require("../middleware/authenticatedUser");
const {authorizedRole} = require("../middleware/authorizedRole");

  router.post("/register", registerUser);

  router.post("/login", loginUser);
  
  router.get("/logout", authenticatedUser, loggingOutUser);
  
  router.get("/me", authenticatedUser, loggedInUser);

  router.put("/me/update_password", authenticatedUser, updatePassword);

  //forgot password routes
router.post("/password/forgot" , forgotPassword);

router.put("/password/reset/:token" , resetPassword);

//forgot username routes
router.post("/username/forgot" , forgotUsername);

router.put("/username/reset/:token" , resetUsername);

router.get("/getOrderCount/:id",getOrderCountOfUser)

router.get("/get/basket/items/:email",getBasketItems)

router.post("/store/basket/items/:email",storeBasketItems)


module.exports = router