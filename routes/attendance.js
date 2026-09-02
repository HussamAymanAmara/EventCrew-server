// import express from "express";
// import pgclient from "../db/db.js";
// import organizationAuth from "../middleware/organizationAuth.js";

// const router = express.Router();


// // localhost:5000/api/attendance/4
// // GET
// // Get accepted volunteers and attendance for one opportunity
// router.get("/:opportunityId", organizationAuth, async (req, res) => {

//     const result = await pgclient.query(
//         `SELECT
//             a.volunteer_id,
//             a.opportunity_id,
//             a.status AS application_status,
//             v.first_name,
//             v.last_name,
//             u.email,
//             at.attendance_status,
//             at.hours_completed,
//             at.record_status,
//             at.notes
//          FROM applications a
//          JOIN volunteer_profiles v
//          ON a.volunteer_id = v.volunteer_id
//          JOIN users u
//          ON a.volunteer_id = u.user_id
//          LEFT JOIN attendance at
//          ON a.volunteer_id = at.volunteer_id
//          AND a.opportunity_id = at.opportunity_id
//          WHERE a.opportunity_id = $1
//          AND a.status IN ('approved', 'confirmed')
//          ORDER BY v.first_name`,
//         [req.params.opportunityId]
//     );

//     res.json(result.rows);

// });
// // localhost:5000/api/attendance/3/4
// // PUT
// // Record or update attendance
// router.put("/:volunteerId/:opportunityId", organizationAuth, async (req, res) => {

//     const {
//         attendance_status,
//         hours_completed,
//         record_status,
//         notes
//     } = req.body;


//     const finalized_at =
//         record_status === "finalized"
//             ? new Date()
//             : null;


//     const result = await pgclient.query(
//         `INSERT INTO attendance
//         (
//             volunteer_id,
//             opportunity_id,
//             attendance_status,
//             hours_completed,
//             record_status,
//             finalized_at,
//             notes
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7)

//         ON CONFLICT (volunteer_id, opportunity_id)

//         DO UPDATE SET
//             attendance_status = EXCLUDED.attendance_status,
//             hours_completed = EXCLUDED.hours_completed,
//             record_status = EXCLUDED.record_status,
//             finalized_at = EXCLUDED.finalized_at,
//             notes = EXCLUDED.notes

//         RETURNING *`,
//         [
//             req.params.volunteerId,
//             req.params.opportunityId,
//             attendance_status,
//             hours_completed,
//             record_status,
//             finalized_at,
//             notes
//         ]
//     );


//     res.json({
//         attendance: result.rows[0]
//     });

// });
// export default router;

import express from "express";
import pgclient from "../db/db.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();


// localhost:5000/api/attendance/4
// GET
// Get accepted volunteers and attendance for one opportunity
router.get("/:opportunityId", organizationAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `SELECT
                a.volunteer_id,
                a.opportunity_id,
                a.status AS application_status,
                v.first_name,
                v.last_name,
                u.email,
                at.attendance_status,
                at.hours_completed,
                at.record_status,
                at.notes
             FROM applications a
             JOIN volunteer_profiles v
             ON a.volunteer_id = v.volunteer_id
             JOIN users u
             ON a.volunteer_id = u.user_id
             LEFT JOIN attendance at
             ON a.volunteer_id = at.volunteer_id
             AND a.opportunity_id = at.opportunity_id
             WHERE a.opportunity_id = $1
             AND a.status IN ('approved', 'confirmed')
             ORDER BY v.first_name`,
            [req.params.opportunityId]
        );


        res.json(result.rows);

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/attendance/3/4
// PUT
// Record or update attendance
router.put("/:volunteerId/:opportunityId", organizationAuth, async (req, res) => {

    const {
        attendance_status,
        hours_completed,
        record_status,
        notes
    } = req.body;


    // Check attendance status
    const allowedAttendanceStatuses = [
        "not_marked",
        "present",
        "absent"
    ];


    if (!allowedAttendanceStatuses.includes(attendance_status)) {
        return res.status(400).json({
            message: "Invalid attendance status"
        });
    }


    // Check record status
    const allowedRecordStatuses = [
        "draft",
        "finalized"
    ];


    if (!allowedRecordStatuses.includes(record_status)) {
        return res.status(400).json({
            message: "Invalid record status"
        });
    }


    // Hours cannot be negative
    if (
        hours_completed !== null &&
        hours_completed !== undefined &&
        hours_completed < 0
    ) {
        return res.status(400).json({
            message: "Hours completed cannot be negative"
        });
    }


    // Finalized records receive the current time
    const finalized_at =
        record_status === "finalized"
            ? new Date()
            : null;


    try {

        // Attendance can only be recorded for
        // approved or confirmed volunteers
        const applicationResult = await pgclient.query(
            `SELECT *
             FROM applications
             WHERE volunteer_id = $1
             AND opportunity_id = $2
             AND status IN ('approved', 'confirmed')`,
            [
                req.params.volunteerId,
                req.params.opportunityId
            ]
        );


        if (applicationResult.rows.length === 0) {
            return res.status(404).json({
                message: "Approved or confirmed application not found"
            });
        }


        const result = await pgclient.query(
            `INSERT INTO attendance
            (
                volunteer_id,
                opportunity_id,
                attendance_status,
                hours_completed,
                record_status,
                finalized_at,
                notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)

            ON CONFLICT (volunteer_id, opportunity_id)

            DO UPDATE SET
                attendance_status = EXCLUDED.attendance_status,
                hours_completed = EXCLUDED.hours_completed,
                record_status = EXCLUDED.record_status,
                finalized_at = EXCLUDED.finalized_at,
                notes = EXCLUDED.notes

            RETURNING *`,
            [
                req.params.volunteerId,
                req.params.opportunityId,
                attendance_status,
                hours_completed,
                record_status,
                finalized_at,
                notes
            ]
        );


        res.json({
            attendance: result.rows[0]
        });

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


export default router;