// import express from "express";
// import pgclient from "../db/db.js";
// import organizationAuth from "../middleware/organizationAuth.js";
// import volunteerAuth from "../middleware/volunteerAuth.js";

// const router = express.Router();


// // localhost:5000/api/certificates
// // POST
// // Issue certificate to volunteer
// router.post("/", organizationAuth, async (req, res) => {

//     const {
//         volunteer_id,
//         opportunity_id,
//         certificate_number,
//         file_url
//     } = req.body;


//     // Check that volunteer completed the opportunity
//     const attendance = await pgclient.query(
//         `SELECT *
//          FROM attendance
//          WHERE volunteer_id = $1
//          AND opportunity_id = $2
//          AND attendance_status = 'present'
//          AND record_status = 'finalized'`,
//         [
//             volunteer_id,
//             opportunity_id
//         ]
//     );


//     if (attendance.rows.length === 0) {
//         return res.status(400).json({
//             message: "Volunteer must have finalized present attendance"
//         });
//     }


//     // Check if certificate already exists
//     const exists = await pgclient.query(
//         `SELECT *
//          FROM certificates
//          WHERE volunteer_id = $1
//          AND opportunity_id = $2`,
//         [
//             volunteer_id,
//             opportunity_id
//         ]
//     );


//     if (exists.rows.length > 0) {
//         return res.status(400).json({
//             message: "Certificate already issued"
//         });
//     }


//     const result = await pgclient.query(
//         `INSERT INTO certificates
//         (
//             volunteer_id,
//             opportunity_id,
//             certificate_number,
//             file_url,
//             issued_at
//         )
//         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
//         RETURNING *`,
//         [
//             volunteer_id,
//             opportunity_id,
//             certificate_number,
//             file_url
//         ]
//     );


//     res.status(201).json({
//         certificate: result.rows[0]
//     });

// });

// // localhost:5000/api/certificates/volunteer/3
// // GET
// // Get all certificates for one volunteer
// router.get("/volunteer/:volunteerId", async (req, res) => {

//     const result = await pgclient.query(
//         `SELECT
//             c.volunteer_id,
//             c.opportunity_id,
//             c.certificate_number,
//             c.file_url,
//             c.issued_at,
//             o.title,
//             o.event_date
//          FROM certificates c
//          JOIN opportunities o
//          ON c.opportunity_id = o.opportunity_id
//          WHERE c.volunteer_id = $1
//          ORDER BY c.issued_at DESC`,
//         [req.params.volunteerId]
//     );

//     res.json(result.rows);

// });

// // localhost:5000/api/certificates/3/4
// // GET
// // Get one certificate
// router.get("/:volunteerId/:opportunityId", volunteerAuth, async (req, res) => {

//     const result = await pgclient.query(
//         `SELECT
//             c.volunteer_id,
//             c.opportunity_id,
//             c.certificate_number,
//             c.file_url,
//             c.issued_at,
//             o.title,
//             o.event_date
//          FROM certificates c
//          JOIN opportunities o
//          ON c.opportunity_id = o.opportunity_id
//          WHERE c.volunteer_id = $1
//          AND c.opportunity_id = $2`,
//         [
//             req.params.volunteerId,
//             req.params.opportunityId
//         ]
//     );


//     if (result.rows.length === 0) {
//         return res.status(404).json({
//             message: "Certificate not found"
//         });
//     }


//     res.json(result.rows[0]);

// });

// export default router;


import express from "express";
import pgclient from "../db/db.js";
import organizationAuth from "../middleware/organizationAuth.js";
import volunteerAuth from "../middleware/volunteerAuth.js";

const router = express.Router();


// localhost:5000/api/certificates
// POST
// Issue certificate to volunteer
router.post("/", organizationAuth, async (req, res) => {

    const {
        volunteer_id,
        opportunity_id,
        certificate_number,
        file_url
    } = req.body;


    try {

        // Check that volunteer completed the opportunity
        const attendance = await pgclient.query(
            `SELECT *
             FROM attendance
             WHERE volunteer_id = $1
             AND opportunity_id = $2
             AND attendance_status = 'present'
             AND record_status = 'finalized'`,
            [
                volunteer_id,
                opportunity_id
            ]
        );


        if (attendance.rows.length === 0) {
            return res.status(400).json({
                message: "Volunteer must have finalized present attendance"
            });
        }


        // Check if certificate already exists
        const exists = await pgclient.query(
            `SELECT *
             FROM certificates
             WHERE volunteer_id = $1
             AND opportunity_id = $2`,
            [
                volunteer_id,
                opportunity_id
            ]
        );


        if (exists.rows.length > 0) {
            return res.status(400).json({
                message: "Certificate already issued"
            });
        }


        const result = await pgclient.query(
            `INSERT INTO certificates
            (
                volunteer_id,
                opportunity_id,
                certificate_number,
                file_url,
                issued_at
            )
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                volunteer_id,
                opportunity_id,
                certificate_number,
                file_url
            ]
        );


        res.status(201).json({
            certificate: result.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/certificates/volunteer/3
// GET
// Get all certificates for one volunteer
router.get("/volunteer/:volunteerId", volunteerAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `SELECT
                c.volunteer_id,
                c.opportunity_id,
                c.certificate_number,
                c.file_url,
                c.issued_at,
                o.title,
                o.event_date
             FROM certificates c
             JOIN opportunities o
             ON c.opportunity_id = o.opportunity_id
             WHERE c.volunteer_id = $1
             ORDER BY c.issued_at DESC`,
            [req.params.volunteerId]
        );


        res.json(result.rows);

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/certificates/3/4
// GET
// Get one certificate
router.get("/:volunteerId/:opportunityId", volunteerAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `SELECT
                c.volunteer_id,
                c.opportunity_id,
                c.certificate_number,
                c.file_url,
                c.issued_at,
                o.title,
                o.event_date
             FROM certificates c
             JOIN opportunities o
             ON c.opportunity_id = o.opportunity_id
             WHERE c.volunteer_id = $1
             AND c.opportunity_id = $2`,
            [
                req.params.volunteerId,
                req.params.opportunityId
            ]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Certificate not found"
            });
        }


        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


export default router;