import { Router } from "express";

import { HTTP_STATUS, HttpError } from "../http.js";
import { findYearlyReport } from "../repositories/reportRepository.js";

export const reportRoutes = Router();

function parseYear(rawYear) {
  if (rawYear === undefined) return new Date().getFullYear();

  const year = Number(rawYear);
  if (!Number.isInteger(year)) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "Ano inválido.");
  }
  return year;
}

// GET /api/reports/yearly?year=2026 (só gerente, a proteção fica no index.js)
reportRoutes.get("/yearly", async (req, res) => {
  res.json(await findYearlyReport(parseYear(req.query.year)));
});
