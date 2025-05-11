import { Router } from "express";
const router = Router();

router.get("/products", (req, res) => {
  res.render("products", {
    title: "Products | Title",
    isProducts: true,
  });
});

router.get("/add", (req, res) => {
  res.render("add", {
    title: "Add | Title",
    isAdd: true,
  });
});

router.get("/", (req, res) => {
  res.render("index", {
    title: "Home | Title",
    isHome: true,
  });
});

export default router;
