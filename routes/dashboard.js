// import express from "express";
// import pgclient from "../db/db.js";
// import volunteerAuth from "../middleware/volunteerAuth.js";
// import organizationAuth from "../middleware/organizationAuth.js";

// const router = express.Router();


// // localhost:5000/api/dashboard/volunteer/3
// // GET
// // Get volunteer dashboard data
// router.get("/volunteer/:id", volunteerAuth, async (req, res) => {

//     const volunteerId = req.params.id;


//     // Volunteer basic information
//     const volunteerResult = await pgclient.query(
//         `SELECT
//             first_name,
//             last_name,
//             annual_hours_goal
//          FROM volunteer_profiles
//          WHERE volunteer_id = $1`,
//         [volunteerId]
//     );


//     if (volunteerResult.rows.length === 0) {
//         return res.status(404).json({
//             message: "Volunteer not found"
//         });
//     }


//     // Total completed hours
//     const hoursResult = await pgclient.query(
//         `SELECT COALESCE(SUM(hours_completed), 0) AS total_hours
//          FROM attendance
//          WHERE volunteer_id = $1
//          AND attendance_status = 'present'
//          AND record_status = 'finalized'`,
//         [volunteerId]
//     );


//     // Completed activities count
//     const completedResult = await pgclient.query(
//         `SELECT COUNT(*) AS completed_activities
//          FROM attendance
//          WHERE volunteer_id = $1
//          AND attendance_status = 'present'
//          AND record_status = 'finalized'`,
//         [volunteerId]
//     );


//     // Upcoming activities count
//     const upcomingCountResult = await pgclient.query(
//         `SELECT COUNT(*) AS upcoming_activities
//          FROM applications a
//          JOIN opportunities o
//          ON a.opportunity_id = o.opportunity_id
//          WHERE a.volunteer_id = $1
//          AND a.status IN ('approved', 'confirmed')
//          AND o.event_date >= CURRENT_DATE`,
//         [volunteerId]
//     );


//     // Total applications
//     const applicationsCountResult = await pgclient.query(
//         `SELECT COUNT(*) AS total_applications
//          FROM applications
//          WHERE volunteer_id = $1`,
//         [volunteerId]
//     );


//     // Upcoming opportunities
//     const upcomingResult = await pgclient.query(
//         `SELECT
//             o.opportunity_id,
//             o.title,
//             o.event_date,
//             o.start_time,
//             o.end_time,
//             o.venue_name,
//             o.city,
//             a.status,
//             org.organization_name
//          FROM applications a
//          JOIN opportunities o
//          ON a.opportunity_id = o.opportunity_id
//          JOIN organization_profiles org
//          ON o.organization_id = org.organization_id
//          WHERE a.volunteer_id = $1
//          AND a.status IN ('approved', 'confirmed')
//          AND o.event_date >= CURRENT_DATE
//          ORDER BY o.event_date ASC`,
//         [volunteerId]
//     );


//     // Recent applications
//     const recentApplicationsResult = await pgclient.query(
//         `SELECT
//             a.opportunity_id,
//             a.status,
//             a.applied_at,
//             o.title,
//             o.event_date,
//             org.organization_name
//          FROM applications a
//          JOIN opportunities o
//          ON a.opportunity_id = o.opportunity_id
//          JOIN organization_profiles org
//          ON o.organization_id = org.organization_id
//          WHERE a.volunteer_id = $1
//          ORDER BY a.applied_at DESC
//          LIMIT 5`,
//         [volunteerId]
//     );


//     // Completed activities
//     const completedActivitiesResult = await pgclient.query(
//         `SELECT
//             o.opportunity_id,
//             o.title,
//             o.event_date,
//             org.organization_name,
//             at.hours_completed,
//             c.certificate_number,
//             c.file_url
//          FROM attendance at
//          JOIN opportunities o
//          ON at.opportunity_id = o.opportunity_id
//          JOIN organization_profiles org
//          ON o.organization_id = org.organization_id
//          LEFT JOIN certificates c
//          ON at.volunteer_id = c.volunteer_id
//          AND at.opportunity_id = c.opportunity_id
//          WHERE at.volunteer_id = $1
//          AND at.attendance_status = 'present'
//          AND at.record_status = 'finalized'
//          ORDER BY o.event_date DESC`,
//         [volunteerId]
//     );


//     res.json({
//         volunteer: volunteerResult.rows[0],

//         statistics: {
//             total_hours: hoursResult.rows[0].total_hours,
//             completed_activities: completedResult.rows[0].completed_activities,
//             upcoming_activities: upcomingCountResult.rows[0].upcoming_activities,
//             total_applications: applicationsCountResult.rows[0].total_applications
//         },

//         upcoming_opportunities: upcomingResult.rows,

//         recent_applications: recentApplicationsResult.rows,

//         completed_activities: completedActivitiesResult.rows
//     });

// });

// // localhost:5000/api/dashboard/organization/4
// // GET
// // Get organization dashboard data
// router.get("/organization/:id", organizationAuth, async (req, res) => {

//     const organizationId = req.params.id;


//     // Organization basic information
//     const organizationResult = await pgclient.query(
//         `SELECT
//             organization_name,
//             logo_url
//          FROM organization_profiles
//          WHERE organization_id = $1`,
//         [organizationId]
//     );


//     if (organizationResult.rows.length === 0) {
//         return res.status(404).json({
//             message: "Organization not found"
//         });
//     }


//     // Active opportunities
//     const activeCountResult = await pgclient.query(
//         `SELECT COUNT(*) AS active_opportunities
//          FROM opportunities
//          WHERE organization_id = $1
//          AND listing_status = 'open'`,
//         [organizationId]
//     );


//     // Total applications
//     const applicationsCountResult = await pgclient.query(
//         `SELECT COUNT(*) AS total_applications
//          FROM applications a
//          JOIN opportunities o
//          ON a.opportunity_id = o.opportunity_id
//          WHERE o.organization_id = $1`,
//         [organizationId]
//     );


//     // Accepted volunteers
//     const acceptedCountResult = await pgclient.query(
//         `SELECT COUNT(*) AS accepted_volunteers
//          FROM applications a
//          JOIN opportunities o
//          ON a.opportunity_id = o.opportunity_id
//          WHERE o.organization_id = $1
//          AND a.status IN ('approved', 'confirmed')`,
//         [organizationId]
//     );


//     // Total volunteer hours logged
//     const hoursResult = await pgclient.query(
//         `SELECT COALESCE(SUM(at.hours_completed), 0) AS hours_logged
//          FROM attendance at
//          JOIN opportunities o
//          ON at.opportunity_id = o.opportunity_id
//          WHERE o.organization_id = $1
//          AND at.attendance_status = 'present'
//          AND at.record_status = 'finalized'`,
//         [organizationId]
//     );


//     // Active opportunity cards
//     const activeOpportunitiesResult = await pgclient.query(
//         `SELECT
//             opportunity_id,
//             title,
//             event_date,
//             start_time,
//             city,
//             venue_name,
//             volunteers_needed,
//             listing_status
//          FROM opportunities
//          WHERE organization_id = $1
//          AND listing_status = 'open'
//          ORDER BY event_date ASC`,
//         [organizationId]
//     );


//     // Recent applications
//     const recentApplicationsResult = await pgclient.query(
//         `SELECT
//             a.volunteer_id,
//             a.opportunity_id,
//             a.status,
//             a.applied_at,
//             v.first_name,
//             v.last_name,
//             o.title
//          FROM applications a
//          JOIN opportunities o
//          ON a.opportunity_id = o.opportunity_id
//          JOIN volunteer_profiles v
//          ON a.volunteer_id = v.volunteer_id
//          WHERE o.organization_id = $1
//          ORDER BY a.applied_at DESC
//          LIMIT 5`,
//         [organizationId]
//     );


//     res.json({
//         organization: organizationResult.rows[0],

//         statistics: {
//             active_opportunities:
//                 activeCountResult.rows[0].active_opportunities,

//             total_applications:
//                 applicationsCountResult.rows[0].total_applications,

//             accepted_volunteers:
//                 acceptedCountResult.rows[0].accepted_volunteers,

//             hours_logged:
//                 hoursResult.rows[0].hours_logged
//         },

//         active_opportunities:
//             activeOpportunitiesResult.rows,

//         recent_applications:
//             recentApplicationsResult.rows
//     });

// });

// export default router;

import express from "express";
import pgclient from "../db/db.js";
import volunteerAuth from "../middleware/volunteerAuth.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();


// localhost:5000/api/dashboard/volunteer/3
// GET
// Get volunteer dashboard data
router.get("/volunteer/:id", volunteerAuth, async (req, res) => {

    const volunteerId = req.params.id;


    try {

        // Volunteer basic information
        const volunteerResult = await pgclient.query(
            `SELECT
                first_name,
                last_name,
                annual_hours_goal
             FROM volunteer_profiles
             WHERE volunteer_id = $1`,
            [volunteerId]
        );


        if (volunteerResult.rows.length === 0) {
            return res.status(404).json({
                message: "Volunteer not found"
            });
        }


        // Total completed hours
        const hoursResult = await pgclient.query(
            `SELECT COALESCE(SUM(hours_completed), 0) AS total_hours
             FROM attendance
             WHERE volunteer_id = $1
             AND attendance_status = 'present'
             AND record_status = 'finalized'`,
            [volunteerId]
        );


        // Completed activities count
        const completedResult = await pgclient.query(
            `SELECT COUNT(*) AS completed_activities
             FROM attendance
             WHERE volunteer_id = $1
             AND attendance_status = 'present'
             AND record_status = 'finalized'`,
            [volunteerId]
        );


        // Upcoming activities count
        const upcomingCountResult = await pgclient.query(
            `SELECT COUNT(*) AS upcoming_activities
             FROM applications a
             JOIN opportunities o
             ON a.opportunity_id = o.opportunity_id
             WHERE a.volunteer_id = $1
             AND a.status IN ('approved', 'confirmed')
             AND o.event_date >= CURRENT_DATE`,
            [volunteerId]
        );


        // Total applications
        const applicationsCountResult = await pgclient.query(
            `SELECT COUNT(*) AS total_applications
             FROM applications
             WHERE volunteer_id = $1`,
            [volunteerId]
        );


        // Upcoming opportunities
        const upcomingResult = await pgclient.query(
            `SELECT
                o.opportunity_id,
                o.title,
                o.event_date,
                o.start_time,
                o.end_time,
                o.venue_name,
                o.city,
                a.status,
                org.organization_name
             FROM applications a
             JOIN opportunities o
             ON a.opportunity_id = o.opportunity_id
             JOIN organization_profiles org
             ON o.organization_id = org.organization_id
             WHERE a.volunteer_id = $1
             AND a.status IN ('approved', 'confirmed')
             AND o.event_date >= CURRENT_DATE
             ORDER BY o.event_date ASC`,
            [volunteerId]
        );


        // Recent applications
        const recentApplicationsResult = await pgclient.query(
            `SELECT
                a.opportunity_id,
                a.status,
                a.applied_at,
                o.title,
                o.event_date,
                org.organization_name
             FROM applications a
             JOIN opportunities o
             ON a.opportunity_id = o.opportunity_id
             JOIN organization_profiles org
             ON o.organization_id = org.organization_id
             WHERE a.volunteer_id = $1
             ORDER BY a.applied_at DESC
             LIMIT 5`,
            [volunteerId]
        );


        // Completed activities
        const completedActivitiesResult = await pgclient.query(
            `SELECT
                o.opportunity_id,
                o.title,
                o.event_date,
                org.organization_name,
                at.hours_completed,
                c.certificate_number,
                c.file_url
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
            [volunteerId]
        );


        res.json({
            volunteer: volunteerResult.rows[0],

            statistics: {
                total_hours: hoursResult.rows[0].total_hours,
                completed_activities: completedResult.rows[0].completed_activities,
                upcoming_activities: upcomingCountResult.rows[0].upcoming_activities,
                total_applications: applicationsCountResult.rows[0].total_applications
            },

            upcoming_opportunities: upcomingResult.rows,

            recent_applications: recentApplicationsResult.rows,

            completed_activities: completedActivitiesResult.rows
        });

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/dashboard/organization/4
// GET
// Get organization dashboard data
router.get("/organization/:id", organizationAuth, async (req, res) => {

    const organizationId = req.params.id;


    try {

        // Organization basic information
        const organizationResult = await pgclient.query(
            `SELECT
                organization_name,
                logo_url
             FROM organization_profiles
             WHERE organization_id = $1`,
            [organizationId]
        );


        if (organizationResult.rows.length === 0) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }


        // Active opportunities
        const activeCountResult = await pgclient.query(
            `SELECT COUNT(*) AS active_opportunities
             FROM opportunities
             WHERE organization_id = $1
             AND listing_status = 'open'`,
            [organizationId]
        );


        // Total applications
        const applicationsCountResult = await pgclient.query(
            `SELECT COUNT(*) AS total_applications
             FROM applications a
             JOIN opportunities o
             ON a.opportunity_id = o.opportunity_id
             WHERE o.organization_id = $1`,
            [organizationId]
        );


        // Accepted volunteers
        const acceptedCountResult = await pgclient.query(
            `SELECT COUNT(*) AS accepted_volunteers
             FROM applications a
             JOIN opportunities o
             ON a.opportunity_id = o.opportunity_id
             WHERE o.organization_id = $1
             AND a.status IN ('approved', 'confirmed')`,
            [organizationId]
        );


        // Total volunteer hours logged
        const hoursResult = await pgclient.query(
            `SELECT COALESCE(SUM(at.hours_completed), 0) AS hours_logged
             FROM attendance at
             JOIN opportunities o
             ON at.opportunity_id = o.opportunity_id
             WHERE o.organization_id = $1
             AND at.attendance_status = 'present'
             AND at.record_status = 'finalized'`,
            [organizationId]
        );


        // Active opportunity cards
        const activeOpportunitiesResult = await pgclient.query(
            `SELECT
                opportunity_id,
                title,
                event_date,
                start_time,
                city,
                venue_name,
                volunteers_needed,
                listing_status
             FROM opportunities
             WHERE organization_id = $1
             AND listing_status = 'open'
             ORDER BY event_date ASC`,
            [organizationId]
        );


        // Recent applications
        const recentApplicationsResult = await pgclient.query(
            `SELECT
                a.volunteer_id,
                a.opportunity_id,
                a.status,
                a.applied_at,
                v.first_name,
                v.last_name,
                o.title
             FROM applications a
             JOIN opportunities o
             ON a.opportunity_id = o.opportunity_id
             JOIN volunteer_profiles v
             ON a.volunteer_id = v.volunteer_id
             WHERE o.organization_id = $1
             ORDER BY a.applied_at DESC
             LIMIT 5`,
            [organizationId]
        );


        res.json({
            organization: organizationResult.rows[0],

            statistics: {
                active_opportunities:
                    activeCountResult.rows[0].active_opportunities,

                total_applications:
                    applicationsCountResult.rows[0].total_applications,

                accepted_volunteers:
                    acceptedCountResult.rows[0].accepted_volunteers,

                hours_logged:
                    hoursResult.rows[0].hours_logged
            },

            active_opportunities:
                activeOpportunitiesResult.rows,

            recent_applications:
                recentApplicationsResult.rows
        });

    } catch (err) {

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


export default router;