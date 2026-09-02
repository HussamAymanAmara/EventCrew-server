import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";

const router = express.Router();


// localhost:5000/api/volunteers/1
// GET
// Get volunteer profile
router.get("/:id", async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            u.user_id,
            u.email,
            u.role,
            u.created_at,
            v.*
         FROM users u
         JOIN volunteer_profiles v
         ON u.user_id = v.volunteer_id
         WHERE u.user_id = $1`,
        [req.params.id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Volunteer not found"
        });
    }

    res.json(result.rows[0]);

});


// localhost:5000/api/volunteers/1
// PUT
// Update volunteer profile
// router.put("/:id", async (req, res) => {
router.put("/:id", volunteerAuth, async (req, res) => {
    const {
        first_name,
        last_name,
        phone,
        date_of_birth,
        area,
        city,
        state,
        about_me
    } = req.body;

    const result = await pgclient.query(
        `UPDATE volunteer_profiles
         SET first_name = $1,
             last_name = $2,
             phone = $3,
             date_of_birth = $4,
             area = $5,
             city = $6,
             state = $7,
             about_me = $8
         WHERE volunteer_id = $9
         RETURNING *`,
        [
            first_name,
            last_name,
            phone,
            date_of_birth,
            area,
            city,
            state,
            about_me,
            req.params.id
        ]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Volunteer not found"
        });
    }

    res.json({
        volunteer: result.rows[0]
    });

});


export default router;