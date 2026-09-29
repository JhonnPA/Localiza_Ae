import express from "express";

import { config } from "./config.js";
import { requireAuth, requireManager, requirePasswordUpToDate } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { categoryRoutes } from "./routes/categoryRoutes.js";
import { clientRoutes } from "./routes/clientRoutes.js";
import { meRoutes } from "./routes/meRoutes.js";
import { reportRoutes } from "./routes/reportRoutes.js";
import { reservationRoutes } from "./routes/reservationRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

const app = express();

// logado e com a senha em dia (quem está com senha provisória só acessa /api/me)
const authenticated = [requireAuth, requirePasswordUpToDate];

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/me", requireAuth, meRoutes);
app.use("/api/users", authenticated, requireManager, userRoutes);
app.use("/api/clients", authenticated, clientRoutes);
app.use("/api/categories", authenticated, categoryRoutes);
app.use("/api/reservations", authenticated, reservationRoutes);
app.use("/api/reports", authenticated, requireManager, reportRoutes);

app.use(errorHandler);

app.listen(config.apiPort, () => {
  console.log(`API rodando em http://localhost:${config.apiPort}`);
});
