import express from "express";
import pgclient from "../db/db.js";

const router = express.Router();


// localhost:5000/api/organization-types
router.get("/", async (req, res) => {

    const result = await pgclient.query(
        "SELECT * FROM organization_types ORDER BY organization_type_id"
    );

    res.json(result.rows);
});


export default router;