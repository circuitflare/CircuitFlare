const express = require("express");
const router = express.Router();

const { adminLogin, adminOrders, adminUpdatePassword, adminForgotPassword,updateOrderStatus,addRemarks } = require("../controllers/adminControllers");

//middlewares
const { authenticatedUser } = require("../middleware/authenticatedUser");
const { authorizedRole } = require("../middleware/authorizedRole");

router.post("/login", adminLogin);
router.get("/orders", authenticatedUser, authorizedRole("admin"), adminOrders);
router.get("/forgot/password/", adminForgotPassword);
router.put("/reset/password/:token", adminUpdatePassword);
router.put("/update/orderStatus/:orderNumber",authenticatedUser,authorizedRole("admin"),updateOrderStatus)
router.put("/add/remarks/:orderNumber",authenticatedUser,authorizedRole("admin"),addRemarks)

module.exports = router;
