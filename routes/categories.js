import express from "express";
import pgclient from "../db/db.js";

const router = express.Router();


// localhost:5000/api/categories
router.get("/", async (req, res) => {

    const result = await pgclient.query(
        "SELECT * FROM categories ORDER BY category_id"
    );

    res.json(result.rows);
});


export default router;