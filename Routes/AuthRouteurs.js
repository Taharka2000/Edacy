const express=require("express");
const router=require("express").Router();
const { signupUser, loginUser,createAccount, changePassword, userProfile}=require("../Controllers/AuthControllers");

router.post("/signup",signupUser)
router.post("/login",loginUser)
router.post("/verification",createAccount)
module.exports=router