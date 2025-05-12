import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateJWTToken } from "../services/token.js";

const router = Router();

router.get("/logout", (req, res) => {
  if (res.locals.token) {
    res.redirect("/");
  }
  res.clearCookie("token");
  res.redirect("/");
});

router.get("/register", (req, res) => {
  if (!res.locals.token) {
    res.redirect("/");
  }
  res.render("register", {
    title: "Register | Title",
    isRegister: true,
    registerError: req.flash("registerError"),
  });
});

router.get("/login", (req, res) => {
  if (!res.locals.token) {
    res.redirect("/");
  }
  res.render("login", {
    title: "Login | Title",
    isLogin: true,
    loginError: req.flash("loginError"),
  });
});

router.post("/register", async (req, res) => {
  const { email, password, name, surname } = req.body;
  if (!email || !password || !name || !surname) {
    req.flash("registerError", "Every fields is required!");
    res.redirect("/register");
    return;
  }
  const isExist = await User.findOne({ email });
  if (!isExist) {
    const passwordS = await bcrypt.hash(password, 10);
    const userData = {
      first_name: req.body.name,
      last_name: req.body.surname,
      email: req.body.email,
      password: passwordS,
    };
    const result = await User.create(userData);
    const token = generateJWTToken(result._id);
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.redirect("/");
  }
  if (!!isExist) {
    req.flash("registerError", "Email already exist!");
    res.redirect("/register");
    return;
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("loginError", "Every fields is required!");
    res.redirect("/login");
    return;
  }
  const isExist = await User.findOne({ email });
  if (!isExist) {
    req.flash("loginError", "Email not found!");
    res.redirect("/login");
    return;
  }

  const isPasswordTrue = await bcrypt.compare(password, isExist.password);
  if (!isPasswordTrue) {
    req.flash("loginError", "Password incorrect!");
    res.redirect("/login");
    return;
  }

  if (isExist && isPasswordTrue) {
    const token = generateJWTToken(isExist._id);
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.redirect("/");
  }
});

export default router;
