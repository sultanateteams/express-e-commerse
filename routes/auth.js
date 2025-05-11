import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = Router();

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register | Title",
    isRegister: true,
    registerError: req.flash("registerError"),
  });
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login | Title",
    isLogin: true,
    loginError: req.flash("loginError"),
  });
});

router.post("/register", async (req, res) => {
  const { email, password, name, surname } = req.body;
  //   console.log("response : ", res);
  //   console.log("register: ", req);
  if (!email || !password || !name || !surname) {
    await req.flash("registerError", "Every fields is required!");
    await res.redirect("/register");
    await console.log("Every fields is required!");
    return;
  }
  const isExist = await User.findOne({ email });
  console.log("isExist:  ", isExist);
  if (!isExist) {
    console.log("!!isExist:  ", !!isExist);
    const passwordS = await bcrypt.hash(password, 10);
    const userData = {
      first_name: req.body.name,
      last_name: req.body.surname,
      email: req.body.email,
      password: passwordS,
    };
    const result = await User.create(userData);
    console.log("result mongo DB: ", result);
    res.redirect("/");
  }
  if (!!isExist) {
    await req.flash("registerError", "Email already exist!");
    await res.redirect("/register");
    await console.log("!isExist:  ", !isExist);
    return;
  }
});

router.post("/login", async (req, res) => {
  console.log("request: ", req.body);
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
    console.log("Email not found");
    return;
  }

  const isPasswordTrue = await bcrypt.compare(password, isExist.password);
  if (!isPasswordTrue) {
    req.flash("loginError", "Password incorrect!");
    console.log("Password incorrect");
    res.redirect("/login");
    // throw new Error("Password incorrect");
    return;
  }

  if (isExist && isPasswordTrue) {
    console.log("user login: ", isExist);
    res.redirect("/");
  }
});

export default router;
