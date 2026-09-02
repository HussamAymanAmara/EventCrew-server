import express from "express";
import pgclient from "../db/db.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();


// localhost:5000/api/organizations/4/categories
// GET
// Get organization categories
router.get("/:id/categories", organizationAuth, async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            oc.organization_id,
            oc.category_id,
            oc.is_primary,
            c.category_name
         FROM organization_categories oc
         JOIN categories c
         ON oc.category_id = c.category_id
         WHERE oc.organization_id = $1
         ORDER BY oc.is_primary DESC, c.category_name`,
        [req.params.id]
    );

    res.json(result.rows);

});


// localhost:5000/api/organizations/4/categories
// PUT
// Update organization categories
router.put("/:id/categories", organizationAuth, async (req, res) => {

    const {
        category_ids,
        primary_category_id
    } = req.body;


    // Primary category must be one of the selected categories
    if (!category_ids.includes(primary_category_id)) {
        return res.status(400).json({
            message: "Primary category must be one of the selected categories"
        });
    }


    // Remove previous categories
    await pgclient.query(
        `DELETE FROM organization_categories
         WHERE organization_id = $1`,
        [req.params.id]
    );


    // Add selected categories
    for (const category_id of category_ids) {

        const is_primary = category_id === primary_category_id;

        await pgclient.query(
            `INSERT INTO organization_categories
            (
                organization_id,
                category_id,
                is_primary
            )
            VALUES ($1, $2, $3)`,
            [
                req.params.id,
                category_id,
                is_primary
            ]
        );

    }


    const result = await pgclient.query(
        `SELECT
            oc.organization_id,
            oc.category_id,
            oc.is_primary,
            c.category_name
         FROM organization_categories oc
         JOIN categories c
         ON oc.category_id = c.category_id
         WHERE oc.organization_id = $1
         ORDER BY oc.is_primary DESC, c.category_name`,
        [req.params.id]
    );


    res.json({
        categories: result.rows
    });

});


export default router;