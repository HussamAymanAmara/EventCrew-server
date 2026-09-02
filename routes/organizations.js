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
// router.put("/:id", async (req, res) => {
router.put("/:id", organizationAuth, async (req, res) => {

    const {
        organization_name,
        organization_type_id,
        logo_url,
        tagline,
        year_established,
        organization_size,
        about_organization,
        contact_person,
        contact_job_title,
        contact_email,
        phone,
        website,
        office_street_address,
        office_city,
        office_state,
        office_postcode,
        latitude,
        longitude,
        facebook_url,
        instagram_url,
        linkedin_url
    } = req.body;

    const result = await pgclient.query(
        `UPDATE organization_profiles
         SET organization_name = $1,
             organization_type_id = $2,
             logo_url = $3,
             tagline = $4,
             year_established = $5,
             organization_size = $6,
             about_organization = $7,
             contact_person = $8,
             contact_job_title = $9,
             contact_email = $10,
             phone = $11,
             website = $12,
             office_street_address = $13,
             office_city = $14,
             office_state = $15,
             office_postcode = $16,
             latitude = $17,
             longitude = $18,
             facebook_url = $19,
             instagram_url = $20,
             linkedin_url = $21
         WHERE organization_id = $22
         RETURNING *`,
        [
            organization_name,
            organization_type_id,
            logo_url,
            tagline,
            year_established,
            organization_size,
            about_organization,
            contact_person,
            contact_job_title,
            contact_email,
            phone,
            website,
            office_street_address,
            office_city,
            office_state,
            office_postcode,
            latitude,
            longitude,
            facebook_url,
            instagram_url,
            linkedin_url,
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

});


export default router;