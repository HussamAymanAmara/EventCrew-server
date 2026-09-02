import express from "express";
import pgclient from "../db/db.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();


// localhost:5000/api/reports
// POST
// Report an opportunity
router.post("/", userAuth, async (req, res) => {

    const {
        user_id,
        opportunity_id,
        reason,
        details
    } = req.body;


    // Check if the user already reported this opportunity
    const exists = await pgclient.query(
        `SELECT *
         FROM opportunity_reports
         WHERE user_id = $1
         AND opportunity_id = $2`,
        [
            user_id,
            opportunity_id
        ]
    );


    if (exists.rows.length > 0) {
        return res.status(400).json({
            message: "You already reported this opportunity"
        });
    }


    const result = await pgclient.query(
        `INSERT INTO opportunity_reports
    (
        user_id,
        opportunity_id,
        reason,
        details,
        report_status
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
        [
            user_id,
            opportunity_id,
            reason,
            details,
            "open"
        ]
    );


    res.status(201).json({
        report: result.rows[0]
    });

});


export default router;