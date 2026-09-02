// import express from "express";
// import pgclient from "../db/db.js";
// import volunteerAuth from "../middleware/volunteerAuth.js";

// const router = express.Router();


// // localhost:5000/api/saved-opportunities
// // POST
// // Volunteer saves an opportunity
// router.post("/", volunteerAuth, async (req, res) => {

//     const {
//         volunteer_id,
//         opportunity_id
//     } = req.body;


//     const exists = await pgclient.query(
//         `SELECT *
//          FROM saved_opportunities
//          WHERE volunteer_id = $1
//          AND opportunity_id = $2`,
//         [volunteer_id, opportunity_id]
//     );


//     if (exists.rows.length > 0) {
//         return res.status(400).json({
//             message: "Opportunity already saved"
//         });
//     }


//     const result = await pgclient.query(
//         `INSERT INTO saved_opportunities
//         (
//             volunteer_id,
//             opportunity_id
//         )
//         VALUES ($1, $2)
//         RETURNING *`,
//         [
//             volunteer_id,
//             opportunity_id
//         ]
//     );


//     res.status(201).json({
//         savedOpportunity: result.rows[0]
//     });

// });

// // localhost:5000/api/saved-opportunities/3
// // GET
// // Get all saved opportunities for one volunteer
// router.get("/:volunteerId", volunteerAuth, async (req, res) => {

//     const result = await pgclient.query(
//         `SELECT
//             s.volunteer_id,
//             s.opportunity_id,
//             s.saved_at,
//             o.title,
//             o.description,
//             o.event_date,
//             o.start_time,
//             o.city,
//             o.venue_name,
//             o.compensation_type,
//             o.listing_status
//          FROM saved_opportunities s
//          JOIN opportunities o
//          ON s.opportunity_id = o.opportunity_id
//          WHERE s.volunteer_id = $1
//          ORDER BY s.saved_at DESC`,
//         [req.params.volunteerId]
//     );

//     res.json(result.rows);

// });

// // localhost:5000/api/saved-opportunities/3/4
// // DELETE
// // Remove saved opportunity
// router.delete("/:volunteerId/:opportunityId", volunteerAuth, async (req, res) => {

//     const result = await pgclient.query(
//         `DELETE FROM saved_opportunities
//          WHERE volunteer_id = $1
//          AND opportunity_id = $2
//          RETURNING *`,
//         [
//             req.params.volunteerId,
//             req.params.opportunityId
//         ]
//     );


//     if (result.rows.length === 0) {
//         return res.status(404).json({
//             message: "Saved opportunity not found"
//         });
//     }


//     res.json({
//         deleted: result.rows[0]
//     });

// });


// export default router;

import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";

const router = express.Router();


// localhost:5000/api/saved-opportunities
// POST
// Volunteer saves an opportunity
router.post("/", volunteerAuth, async (req, res) => {

    const {
        volunteer_id,
        opportunity_id
    } = req.body;


    // Check required information
    if (!volunteer_id || !opportunity_id) {
        return res.status(400).json({
            message: "Volunteer ID and opportunity ID are required"
        });
    }


    try {

        // Check if opportunity is already saved
        const exists = await pgclient.query(
            `SELECT *
             FROM saved_opportunities
             WHERE volunteer_id = $1
             AND opportunity_id = $2`,
            [volunteer_id, opportunity_id]
        );


        if (exists.rows.length > 0) {
            return res.status(400).json({
                message: "Opportunity already saved"
            });
        }


        const result = await pgclient.query(
            `INSERT INTO saved_opportunities
            (
                volunteer_id,
                opportunity_id
            )
            VALUES ($1, $2)
            RETURNING *`,
            [
                volunteer_id,
                opportunity_id
            ]
        );


        res.status(201).json({
            savedOpportunity: result.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/saved-opportunities/3
// GET
// Get all saved opportunities for one volunteer
router.get("/:volunteerId", volunteerAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `SELECT
                s.volunteer_id,
                s.opportunity_id,
                s.saved_at,
                o.title,
                o.description,
                o.event_date,
                o.start_time,
                o.city,
                o.venue_name,
                o.compensation_type,
                o.listing_status
             FROM saved_opportunities s
             JOIN opportunities o
             ON s.opportunity_id = o.opportunity_id
             WHERE s.volunteer_id = $1
             ORDER BY s.saved_at DESC`,
            [req.params.volunteerId]
        );


        res.json(result.rows);

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/saved-opportunities/3/4
// DELETE
// Remove saved opportunity
router.delete("/:volunteerId/:opportunityId", volunteerAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `DELETE FROM saved_opportunities
             WHERE volunteer_id = $1
             AND opportunity_id = $2
             RETURNING *`,
            [
                req.params.volunteerId,
                req.params.opportunityId
            ]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Saved opportunity not found"
            });
        }


        res.json({
            deleted: result.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


export default router;

