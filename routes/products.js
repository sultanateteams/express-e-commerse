import { Router } from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";
import userMiddleware from "../middleware/user.js";

const router = Router();

router.get("/products", (req, res) => {
  if (res.locals.token) {
    res.redirect("/");
  }
  res.render("products", {
    title: "Products | Title",
    isProducts: true,
  });
});

router.get("/add", authMiddleware, (req, res) => {
  res.render("add", {
    title: "Add | Title",
    isAdd: true,
    addError: req.flash("addError"),
  });
});

router.get("/", (req, res) => {
  res.render("index", {
    title: "Home | Title",
    isHome: true,
  });
});

router.post("/add", userMiddleware, async (req, res) => {
  console.log("req: ", req.body);
  const { title, description, image, price } = req.body;
  if (!title || !description || !image || !price) {
    req.flash("addError", "All field is required!");
    res.redirect("/add");
    return;
  }

  const addedProduct = await Product.create({
    ...req.body,
    // created_by: process.env.TZ,
  });
  res.redirect("/");
});

export default router;
