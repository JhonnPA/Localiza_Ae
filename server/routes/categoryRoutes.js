import { Router } from "express";

import { findAllCategories } from "../repositories/categoryRepository.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", async (req, res) => {
  res.json(await findAllCategories());
});
