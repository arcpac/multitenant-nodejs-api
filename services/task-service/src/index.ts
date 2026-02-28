import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { pool } from "./db.js";
import { requireAuth } from "./authMiddleware.js";
import { requireMembership } from "./requireMembership.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", async (_req, res) => {
    const r = await pool.query("select 1 as ok");
    res.json({ ok: true, service: "task-service", db: r.rows[0].ok === 1 });
});

app.use(requireAuth, requireMembership);
