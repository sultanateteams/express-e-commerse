import { Router } from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";
import userMiddleware from "../middleware/user.js";

const router = Router();

router.get("/products", async (req, res) => {
  if (res.locals.token) {
    res.redirect("/");
  }
  // console.log("REQ=========:  ", req.userId);
  let products = await Product.find().lean().sort({ createdAt: -1 });
  // products = products.map((el) => {
    // console.log(el.created_by, req.userId);
    // console.log(el.created_by.toString() == req.userId.toString());
    // return {
    //   ...el,
    //   editable: el.created_by.toString() == req.userId.toString(),
    // };
  // });
  await res.render("products", {
    title: "Products | Title",
    isProducts: true,
    products: products,
    userId: req.userId ? req.userId.toString() : "no userId",
  });
  // console.log(products);
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

router.post("/add", async (req, res) => {
  if (!req.cookies.token) {
    res.redirect("/");
    return;
  }
  console.log("req: ", req.body);
  const { title, description, image, price } = req.body;
  if (!title || !description || !image || !price) {
    req.flash("addError", "All field is required!");
    res.redirect("/add");
    return;
  }
  const addedProduct = await Product.create({
    ...req.body,
    created_by: req.userId,
  });
  console.log("addedProduct: ", addedProduct);
  res.redirect("/products");
});

export default router;
