import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";

const router = express.Router();


// localhost:5000/api/volunteers/3/interests
// GET
// Get volunteer interests
router.get("/:id/interests", volunteerAuth, async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            vi.volunteer_id,
            vi.category_id,
            c.category_name
         FROM volunteer_interests vi
         JOIN categories c
         ON vi.category_id = c.category_id
         WHERE vi.volunteer_id = $1
         ORDER BY c.category_name`,
        [req.params.id]
    );

    res.json(result.rows);

});


// localhost:5000/api/volunteers/3/interests
// PUT
// Update volunteer interests
router.put("/:id/interests", volunteerAuth, async (req, res) => {

    const { category_ids } = req.body;


    // Remove previous interests
    await pgclient.query(
        `DELETE FROM volunteer_interests
         WHERE volunteer_id = $1`,
        [req.params.id]
    );


    // Add new selected interests
    for (const category_id of category_ids) {

        await pgclient.query(
            `INSERT INTO volunteer_interests
            (
                volunteer_id,
                category_id
            )
            VALUES ($1, $2)`,
            [
                req.params.id,
                category_id
            ]
        );

    }


    const result = await pgclient.query(
        `SELECT
            vi.volunteer_id,
            vi.category_id,
            c.category_name
         FROM volunteer_interests vi
         JOIN categories c
         ON vi.category_id = c.category_id
         WHERE vi.volunteer_id = $1
         ORDER BY c.category_name`,
        [req.params.id]
    );


    res.json({
        interests: result.rows
    });

});

// localhost:5000/api/volunteers/3/skills
// GET
// Get volunteer skills
router.get("/:id/skills", volunteerAuth, async (req, res) => {

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

});


// localhost:5000/api/volunteers/3/skills
// PUT
// Update volunteer skills
router.put("/:id/skills", volunteerAuth, async (req, res) => {

    const { skill_ids } = req.body;


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

});

// localhost:5000/api/volunteers/3/availability
// GET
// Get volunteer availability
router.get("/:id/availability", volunteerAuth, async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            volunteer_id,
            day_of_week
         FROM volunteer_availability
         WHERE volunteer_id = $1
         ORDER BY day_of_week`,
        [req.params.id]
    );

    res.json(result.rows);

});


// localhost:5000/api/volunteers/3/availability
// PUT
// Update volunteer availability
router.put("/:id/availability", volunteerAuth, async (req, res) => {

    const { days } = req.body;


    // Remove previous availability
    await pgclient.query(
        `DELETE FROM volunteer_availability
         WHERE volunteer_id = $1`,
        [req.params.id]
    );


    // Add selected days
    for (const day of days) {

        await pgclient.query(
            `INSERT INTO volunteer_availability
            (
                volunteer_id,
                day_of_week
            )
            VALUES ($1, $2)`,
            [
                req.params.id,
                day
            ]
        );

    }


    const result = await pgclient.query(
        `SELECT
            volunteer_id,
            day_of_week
         FROM volunteer_availability
         WHERE volunteer_id = $1
         ORDER BY day_of_week`,
        [req.params.id]
    );


    res.json({
        availability: result.rows
    });

});

export default router;