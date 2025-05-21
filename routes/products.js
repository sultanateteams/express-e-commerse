import { Router } from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";
import mongoose from "mongoose";

const router = Router();

router.get("/products", async (req, res) => {
  if (res.locals.token) {
    res.redirect("/");
  }
  const products = await Product.find({ created_by: req.userId })
    .lean()
    .sort({ createdAt: -1 });
  await res.render("products", {
    title: "Products | Title",
    isProducts: true,
    products: products,
    userId: req.userId ? req.userId.toString() : "no userId",
  });
});

router.get("/product/:id", async (req, res) => {
  if (res.locals.token) {
    res.redirect("/");
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid product ID format" });
  } else {
  }

  let product = await Product.findById(req.params.id)
    .populate("created_by")
    .populate("updated_by")
    .lean();

  await res.render("product", {
    title: "Product | Title",
    isOwner: product.created_by.toString() == req.userId.toString(),
    product: product,
    userId: req.userId ? req.userId.toString() : "no userId",
    isUpdated:
      product.createdAt.toString() != product.updatedAt.toString()
        ? true
        : false,
  });
});

router.get("/add/:id", authMiddleware, async (req, res) => {
  let product = null;

  if (!!req.params.id && req.params.id != "new") {
    product = await Product.findById(req.params.id).lean();
  }
  await res.render("add", {
    title: "Add | Title",
    isAdd: true,
    isEdit: !!req.params.id,
    product: product,
    addError: req.flash("addError"),
  });
});

router.get("/", async (req, res) => {
  const products = await Product.find().lean().sort({ createdAt: -1 });
  await res.render("index", {
    title: "Home | Title",
    isHome: true,
    products: products,
    userId: req.userId ? req.userId.toString() : "no userId",
  });
});

router.post("/add", async (req, res) => {
  if (!req.cookies.token) {
    res.redirect("/");
    return;
  }
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
  res.redirect("/products");
});

router.post("/edit/:id", async (req, res) => {
  if (!req.cookies.token) {
    res.redirect("/");
    return;
  }

  const { title, description, image, price } = req.body;

  if (!title || !description || !image || !price) {
    req.flash("addError", "All fields are required!");
    res.redirect(`/edit/${req.params.id}`);
    return;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        image,
        price,
        updated_by: req.userId,
      },
      { new: true }
    );

    if (!updatedProduct) {
      req.flash("addError", "Product not found!");
      res.redirect("/products");
      return;
    }

    req.flash("success", "Product updated successfully!");
    res.redirect("/products");
  } catch (error) {
    req.flash("addError", "An error occurred while updating the product.");
    res.redirect("/products");
  }
});

router.get("/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

export default router;
