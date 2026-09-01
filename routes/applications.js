import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();


// localhost:5000/api/applications
// POST
// Volunteer applies to an opportunity
router.post("/", volunteerAuth, async (req, res) => {

    const {
        volunteer_id,
        opportunity_id,
        application_message
    } = req.body;


    // Check if volunteer already applied
    const exists = await pgclient.query(
        `SELECT *
         FROM applications
         WHERE volunteer_id = $1
         AND opportunity_id = $2`,
        [volunteer_id, opportunity_id]
    );


    if (exists.rows.length > 0) {
        return res.status(400).json({
            message: "You already applied to this opportunity"
        });
    }


    const result = await pgclient.query(
        `INSERT INTO applications
        (
            volunteer_id,
            opportunity_id,
            application_message,
            status
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            volunteer_id,
            opportunity_id,
            application_message,
            "pending"
        ]
    );


    res.status(201).json({
        application: result.rows[0]
    });

});

// localhost:5000/api/applications/volunteer/3
// GET
// Get all applications for one volunteer
router.get("/volunteer/:volunteerId", volunteerAuth, async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            a.*,
            o.title,
            o.event_date,
            o.start_time,
            o.city,
            o.venue_name,
            o.compensation_type
         FROM applications a
         JOIN opportunities o
         ON a.opportunity_id = o.opportunity_id
         WHERE a.volunteer_id = $1
         ORDER BY a.applied_at DESC`,
        [req.params.volunteerId]
    );

    res.json(result.rows);

});

// localhost:5000/api/applications/opportunity/4
// GET
// Get all applications for one opportunity
router.get("/opportunity/:opportunityId", organizationAuth, async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            a.*,
            v.first_name,
            v.last_name,
            v.phone,
            u.email
         FROM applications a
         JOIN volunteer_profiles v
         ON a.volunteer_id = v.volunteer_id
         JOIN users u
         ON v.volunteer_id = u.user_id
         WHERE a.opportunity_id = $1
         ORDER BY a.applied_at DESC`,
        [req.params.opportunityId]
    );

    res.json(result.rows);

});


// localhost:5000/api/applications/3/4/status
// PUT
// Organization updates application status
router.put("/:volunteerId/:opportunityId/status", organizationAuth, async (req, res) => {

    const { status } = req.body;

    const allowedStatuses = [
        "pending",
        "under_review",
        "approved",
        "confirmed",
        "rejected"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid application status"
        });
    }

    const result = await pgclient.query(
        `UPDATE applications
         SET status = $1,
             reviewed_at = CURRENT_TIMESTAMP
         WHERE volunteer_id = $2
         AND opportunity_id = $3
         RETURNING *`,
        [
            status,
            req.params.volunteerId,
            req.params.opportunityId
        ]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Application not found"
        });
    }

    res.json({
        application: result.rows[0]
    });

});

// localhost:5000/api/applications/3/4/withdraw
// PUT
// Volunteer withdraws an application
router.put("/:volunteerId/:opportunityId/withdraw", volunteerAuth, async (req, res) => {

    const result = await pgclient.query(
        `UPDATE applications
         SET status = $1
         WHERE volunteer_id = $2
         AND opportunity_id = $3
         RETURNING *`,
        [
            "withdrawn",
            req.params.volunteerId,
            req.params.opportunityId
        ]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Application not found"
        });
    }

    res.json({
        application: result.rows[0]
    });

});


export default router;