import express from "express";
import pgclient from "../db/db.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();


// localhost:5000/api/organizations/2
// GET
// Get organization profile
router.get("/:id", async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            u.user_id,
            u.email,
            u.role,
            u.created_at,
            o.*
         FROM users u
         JOIN organization_profiles o
         ON u.user_id = o.organization_id
         WHERE u.user_id = $1`,
        [req.params.id]
    );


    if (result.rows.length === 0) {

        return res.status(404).json({
            message: "Organization not found"
        });

    }


    res.json(result.rows[0]);

});


// localhost:5000/api/organizations/2
// PUT
// Update organization profile
router.put("/:id", organizationAuth, async (req, res) => {

    const {
        organization_name,
        organization_type_id,
        logo_url,
        tagline,
        organization_size,
        about_organization,
        contact_person,
        contact_job_title,
        contact_email,
        phone,
        website,
        office_street_address,
        office_city,
        office_area
    } = req.body;


    try {

        const result = await pgclient.query(
            `UPDATE organization_profiles
             SET organization_name = $1,
                 organization_type_id = $2,
                 logo_url = $3,
                 tagline = $4,
                 organization_size = $5,
                 about_organization = $6,
                 contact_person = $7,
                 contact_job_title = $8,
                 contact_email = $9,
                 phone = $10,
                 website = $11,
                 office_street_address = $12,
                 office_city = $13,
                 office_area = $14
             WHERE organization_id = $15
             RETURNING *`,
            [
                organization_name,
                organization_type_id,
                logo_url,
                tagline,
                organization_size,
                about_organization,
                contact_person,
                contact_job_title,
                contact_email,
                phone,
                website,
                office_street_address,
                office_city,
                office_area,
                req.params.id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Organization not found"
            });

        }


        res.json({
            organization: result.rows[0]
        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not update organization profile"
        });

    }

});


// localhost:5000/api/organizations/2
// DELETE
// Delete organization account
router.delete("/:id", organizationAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `DELETE FROM users
             WHERE user_id = $1
             AND role = 'organization'
             RETURNING user_id`,
            [req.params.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Organization not found"
            });

        }


        res.json({
            message: "Organization account deleted successfully"
        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not delete organization account"
        });

    }

});


export default router;