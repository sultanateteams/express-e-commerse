import { Router } from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.get("/products", async (req, res) => {
  if (res.locals.token) {
    res.redirect("/");
  }
  // console.log("REQ=========:  ", req.userId);
  const products = await Product.find({ created_by: req.userId })
    .lean()
    .sort({ createdAt: -1 });
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

router.get("/product/:id", async (req, res) => {
  if (res.locals.token) {
    res.redirect("/");
  }
  console.log("REQ=========:  ", req.params.id);

  let product = await Product.findById(req.params.id).lean();

  await res.render("product", {
    title: "Product | Title",
    isOwner: product.created_by.toString() == req.userId.toString(),
    product: product,
    userId: req.userId ? req.userId.toString() : "no userId",
    isUpdated: product.createdAt == product.updatedAt ? true : false,
  });
  console.log(product);
});

router.get("/add/:id", authMiddleware, async (req, res) => {
  let product = null;

  if (!!req.params.id) {
    product = await Product.findById(req.params.id).lean();
  }
  console.log("product:  ", product);
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

router.post("/edit/:id", async (req, res) => {
  // Token orqali foydalanuvchini tekshirish
  if (!req.cookies.token) {
    res.redirect("/");
    return;
  }

  const { title, description, image, price } = req.body;

  // Har bir maydon to‘ldirilganligini tekshirish
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
        updated_by: req.userId, // Bu yerda req.userId token orqali aniqlangan bo‘lishi kerak
      },
      { new: true } // Yangi yangilangan hujjatni qaytaradi
    );

    if (!updatedProduct) {
      req.flash("addError", "Product not found!");
      res.redirect("/products");
      return;
    }

    console.log("Updated Product: ", updatedProduct);
    req.flash("success", "Product updated successfully!");
    res.redirect("/products");
  } catch (error) {
    console.error("Update Error: ", error);
    req.flash("addError", "An error occurred while updating the product.");
    res.redirect("/products");
  }
});

export default router;
