import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";

const router = express.Router();


// localhost:5000/api/volunteers/1
// GET
// Get volunteer profile
router.get("/:id", async (req, res) => {

    try {

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

    }
    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not load volunteer profile"
        });

    }

});


// localhost:5000/api/volunteers/1
// PUT
// Update volunteer profile
router.put("/:id", volunteerAuth, async (req, res) => {

    const {
        first_name,
        last_name,
        phone,
        date_of_birth,
        area,
        city,
        about_me
    } = req.body;


    try {

        const result = await pgclient.query(
            `UPDATE volunteer_profiles
             SET first_name = $1,
                 last_name = $2,
                 phone = $3,
                 date_of_birth = $4,
                 area = $5,
                 city = $6,
                 about_me = $7
             WHERE volunteer_id = $8
             RETURNING *`,
            [
                first_name,
                last_name,
                phone,
                date_of_birth,
                area,
                city,
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

    }
    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not update volunteer profile"
        });

    }

});


// localhost:5000/api/volunteers/1
// DELETE
// Delete volunteer account
router.delete("/:id", volunteerAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `DELETE FROM users
             WHERE user_id = $1
             AND role = 'volunteer'
             RETURNING user_id`,
            [req.params.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Volunteer not found"
            });

        }


        res.json({
            message: "Volunteer account deleted successfully"
        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not delete volunteer account"
        });

    }

});


export default router;