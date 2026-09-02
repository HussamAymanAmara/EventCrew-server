import express from "express";
import pgclient from "../db/db.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();


// localhost:5000/api/opportunities/4/skills
// GET
// Get skills required for one opportunity
router.get("/:id/skills", async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            os.opportunity_id,
            os.skill_id,
            os.is_required,
            s.skill_name
         FROM opportunity_skills os
         JOIN skills s
         ON os.skill_id = s.skill_id
         WHERE os.opportunity_id = $1
         ORDER BY os.is_required DESC, s.skill_name`,
        [req.params.id]
    );

    res.json(result.rows);

});


// localhost:5000/api/opportunities/4/skills
// PUT
// Update opportunity skills
router.put("/:id/skills", organizationAuth, async (req, res) => {

    const { skills } = req.body;


    // Remove previous skills
    await pgclient.query(
        `DELETE FROM opportunity_skills
         WHERE opportunity_id = $1`,
        [req.params.id]
    );


    // Add selected skills
    for (const skill of skills) {

        await pgclient.query(
            `INSERT INTO opportunity_skills
            (
                opportunity_id,
                skill_id,
                is_required
            )
            VALUES ($1, $2, $3)`,
            [
                req.params.id,
                skill.skill_id,
                skill.is_required
            ]
        );

    }


    const result = await pgclient.query(
        `SELECT
            os.opportunity_id,
            os.skill_id,
            os.is_required,
            s.skill_name
         FROM opportunity_skills os
         JOIN skills s
         ON os.skill_id = s.skill_id
         WHERE os.opportunity_id = $1
         ORDER BY os.is_required DESC, s.skill_name`,
        [req.params.id]
    );


    res.json({
        skills: result.rows
    });

});

// localhost:5000/api/opportunities/4/images
// GET
// Get all images for one opportunity
router.get("/:id/images", async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            opportunity_id,
            image_url,
            is_primary,
            display_order
         FROM opportunity_images
         WHERE opportunity_id = $1
         ORDER BY is_primary DESC, display_order`,
        [req.params.id]
    );

    res.json(result.rows);

});


// localhost:5000/api/opportunities/4/images
// POST
// Add image to opportunity
router.post("/:id/images", organizationAuth, async (req, res) => {

    const {
        image_url,
        is_primary,
        display_order
    } = req.body;


    const result = await pgclient.query(
        `INSERT INTO opportunity_images
        (
            opportunity_id,
            image_url,
            is_primary,
            display_order
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            req.params.id,
            image_url,
            is_primary,
            display_order
        ]
    );


    res.status(201).json({
        image: result.rows[0]
    });

});


// localhost:5000/api/opportunities/4/images
// DELETE
// Remove image from opportunity
router.delete("/:id/images", organizationAuth, async (req, res) => {

    const { image_url } = req.body;


    const result = await pgclient.query(
        `DELETE FROM opportunity_images
         WHERE opportunity_id = $1
         AND image_url = $2
         RETURNING *`,
        [
            req.params.id,
            image_url
        ]
    );


    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Image not found"
        });
    }


    res.json({
        deleted: result.rows[0]
    });

});

export default router;