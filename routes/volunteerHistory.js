import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";

const router = express.Router();


// localhost:5000/api/volunteers/3/history
// GET
// Get volunteer completed activity history
router.get("/:id/history", volunteerAuth, async (req, res) => {

    const result = await pgclient.query(
        `SELECT
            at.volunteer_id,
            at.opportunity_id,
            at.hours_completed,
            at.attendance_status,
            at.finalized_at,

            o.title,
            o.event_date,
            o.city,
            o.venue_name,

            org.organization_name,

            c.certificate_number,
            c.file_url,
            c.issued_at

         FROM attendance at

         JOIN opportunities o
         ON at.opportunity_id = o.opportunity_id

         JOIN organization_profiles org
         ON o.organization_id = org.organization_id

         LEFT JOIN certificates c
         ON at.volunteer_id = c.volunteer_id
         AND at.opportunity_id = c.opportunity_id

         WHERE at.volunteer_id = $1
         AND at.attendance_status = 'present'
         AND at.record_status = 'finalized'

         ORDER BY o.event_date DESC`,
        [req.params.id]
    );


    res.json(result.rows);

});


export default router;