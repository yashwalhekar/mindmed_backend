const express = require("express");
const { customerDetails } = require("../controller/customer.controller");
const router = express.Router();


router.post("/customer",customerDetails );


module.exports = router;
