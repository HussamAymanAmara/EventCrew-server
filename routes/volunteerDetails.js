import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";

const router = express.Router();


// localhost:5000/api/volunteers/3/skills
// GET
// Get volunteer skills
router.get("/:id/skills", volunteerAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `SELECT
                vs.volunteer_id,
                vs.skill_id,
                s.skill_name
             FROM volunteer_skills vs
             JOIN skills s
             ON vs.skill_id = s.skill_id
             WHERE vs.volunteer_id = $1
             ORDER BY s.skill_name`,
            [req.params.id]
        );


        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not load volunteer skills"
        });

    }

});


// localhost:5000/api/volunteers/3/skills
// PUT
// Update volunteer skills
router.put("/:id/skills", volunteerAuth, async (req, res) => {

    const { skill_ids } = req.body;


    if (!Array.isArray(skill_ids)) {

        return res.status(400).json({
            message: "skill_ids must be an array"
        });

    }


    try {

        // Remove previous skills
        await pgclient.query(
            `DELETE FROM volunteer_skills
             WHERE volunteer_id = $1`,
            [req.params.id]
        );


        // Add selected skills
        for (const skill_id of skill_ids) {

            await pgclient.query(
                `INSERT INTO volunteer_skills
                (
                    volunteer_id,
                    skill_id
                )
                VALUES ($1, $2)`,
                [
                    req.params.id,
                    skill_id
                ]
            );

        }


        const result = await pgclient.query(
            `SELECT
                vs.volunteer_id,
                vs.skill_id,
                s.skill_name
             FROM volunteer_skills vs
             JOIN skills s
             ON vs.skill_id = s.skill_id
             WHERE vs.volunteer_id = $1
             ORDER BY s.skill_name`,
            [req.params.id]
        );


        res.json({
            skills: result.rows
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not update volunteer skills"
        });

    }

});


export default router;