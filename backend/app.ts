import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import notFound from "./routes/NotFound";
import productsRouter from "./routes/products";
import errorHandlingMiddleware from "./middlewares/errorHandling";
import supplierRoutes from './routes/suppliers';
import employeeRoutes from './routes/employees';
import transactionRoutes from './routes/transactions';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandlingMiddleware);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
