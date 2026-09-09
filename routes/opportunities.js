import express from "express";
import pgclient from "../db/db.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();


// localhost:5000/api/opportunities/1
// GET
// Get opportunity by ID
router.get("/:id", async (req, res) => {

    try {

        const result = await pgclient.query(
            `SELECT
                o.*,
                org.organization_name,

                (
                    SELECT COUNT(*)
                    FROM applications a
                    WHERE a.opportunity_id = o.opportunity_id
                    AND a.status IN ('approved', 'confirmed')
                ) AS accepted_volunteers,

                GREATEST(
                    o.volunteers_needed -
                    (
                        SELECT COUNT(*)
                        FROM applications a
                        WHERE a.opportunity_id = o.opportunity_id
                        AND a.status IN ('approved', 'confirmed')
                    ),
                    0
                ) AS spots_remaining

             FROM opportunities o

             JOIN organization_profiles org
             ON o.organization_id = org.organization_id

             WHERE o.opportunity_id = $1`,
            [req.params.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Opportunity not found"
            });

        }


        res.json(result.rows[0]);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/opportunities
// GET
// Get all opportunities with filters and sorting
router.get("/", async (req, res) => {

    const {
        search,
        category_id,
        city,
        status,
        compensation,
        date,
        sort,
        organization_id
    } = req.query;


    let query = `
        SELECT
            o.*,

            (
                SELECT COUNT(*)
                FROM applications a
                WHERE a.opportunity_id = o.opportunity_id
                AND a.status IN ('approved', 'confirmed')
            ) AS accepted_volunteers,

            GREATEST(
                o.volunteers_needed -
                (
                    SELECT COUNT(*)
                    FROM applications a
                    WHERE a.opportunity_id = o.opportunity_id
                    AND a.status IN ('approved', 'confirmed')
                ),
                0
            ) AS spots_remaining

        FROM opportunities o

        WHERE 1 = 1
    `;


    const values = [];


    if (search) {

        values.push(`%${search}%`);

        query += `
            AND o.title ILIKE $${values.length}
        `;

    }


    if (category_id) {

        values.push(category_id);

        query += `
            AND o.category_id = $${values.length}
        `;

    }


    if (city) {

        values.push(city);

        query += `
            AND o.city = $${values.length}
        `;

    }


    if (status) {

        values.push(status);

        query += `
            AND o.listing_status = $${values.length}
        `;

    }


    if (compensation) {

        values.push(compensation);

        query += `
            AND o.compensation_type = $${values.length}
        `;

    }


    if (date) {

        values.push(date);

        query += `
            AND DATE(o.event_date) = $${values.length}
        `;

    }


    if (organization_id) {

        values.push(organization_id);

        query += `
            AND o.organization_id = $${values.length}
        `;

    }


    if (sort === "date_asc") {

        query += `
            ORDER BY o.event_date ASC
        `;

    }
    else if (sort === "date_desc") {

        query += `
            ORDER BY o.event_date DESC
        `;

    }
    else if (sort === "newest") {

        query += `
            ORDER BY o.created_at DESC
        `;

    }
    else {

        query += `
            ORDER BY o.opportunity_id
        `;

    }


    try {

        const result = await pgclient.query(
            query,
            values
        );


        res.json(result.rows);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/opportunities
// POST
// Create opportunity
router.post("/", organizationAuth, async (req, res) => {

    const {
        organization_id,
        category_id,
        title,
        description,
        opportunity_type,
        compensation_type,
        compensation_amount,
        payment_schedule,
        event_date,
        start_time,
        end_time,
        application_deadline,
        venue_name,
        street_address,
        building_number,
        city,
        transport_notes,
        volunteers_needed,
        minimum_age,
        additional_requirements,
        listing_status
    } = req.body;


    // Check required fields
    if (
        !organization_id ||
        !category_id ||
        !title ||
        !description ||
        !opportunity_type ||
        !compensation_type ||
        !event_date ||
        !start_time ||
        !end_time ||
        !venue_name ||
        !city ||
        !volunteers_needed ||
        !listing_status
    ) {

        return res.status(400).json({
            message: "Required opportunity fields are missing"
        });

    }


    // Check opportunity type
    if (
        opportunity_type !== "one-time" &&
        opportunity_type !== "recurring" &&
        opportunity_type !== "ongoing"
    ) {

        return res.status(400).json({
            message: "Invalid opportunity type"
        });

    }


    // Check compensation type
    if (
        compensation_type !== "paid" &&
        compensation_type !== "unpaid"
    ) {

        return res.status(400).json({
            message: "Invalid compensation type"
        });

    }


    // Check listing status
    if (
        listing_status !== "draft" &&
        listing_status !== "open" &&
        listing_status !== "completed" &&
        listing_status !== "cancelled"
    ) {

        return res.status(400).json({
            message: "Invalid listing status"
        });

    }


    if (volunteers_needed <= 0) {

        return res.status(400).json({
            message: "Volunteers needed must be greater than 0"
        });

    }


    if (
        minimum_age !== null &&
        minimum_age !== undefined &&
        (
            minimum_age < 0 ||
            minimum_age > 100
        )
    ) {

        return res.status(400).json({
            message: "Minimum age must be between 0 and 100"
        });

    }


    try {

        const finalCompensationAmount =
            compensation_type === "paid"
                ? compensation_amount
                : null;


        const finalPaymentSchedule =
            compensation_type === "paid"
                ? payment_schedule
                : null;


        const result = await pgclient.query(
            `INSERT INTO opportunities
            (
                organization_id,
                category_id,
                title,
                description,
                opportunity_type,
                compensation_type,
                compensation_amount,
                payment_schedule,
                event_date,
                start_time,
                end_time,
                application_deadline,
                venue_name,
                street_address,
                building_number,
                city,
                transport_notes,
                volunteers_needed,
                minimum_age,
                additional_requirements,
                listing_status
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16,
                $17, $18, $19, $20, $21
            )
            RETURNING *`,
            [
                organization_id,
                category_id,
                title,
                description,
                opportunity_type,
                compensation_type,
                finalCompensationAmount,
                finalPaymentSchedule,
                event_date,
                start_time,
                end_time,
                application_deadline,
                venue_name,
                street_address,
                building_number,
                city,
                transport_notes,
                volunteers_needed,
                minimum_age,
                additional_requirements,
                listing_status
            ]
        );


        res.status(201).json({
            opportunity: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/opportunities/1
// PUT
// Update opportunity
router.put("/:id", organizationAuth, async (req, res) => {

    const {
        organization_id,
        category_id,
        title,
        description,
        opportunity_type,
        compensation_type,
        compensation_amount,
        payment_schedule,
        event_date,
        start_time,
        end_time,
        application_deadline,
        venue_name,
        street_address,
        building_number,
        city,
        transport_notes,
        volunteers_needed,
        minimum_age,
        additional_requirements,
        listing_status
    } = req.body;


    // Check required fields
    if (
        !organization_id ||
        !category_id ||
        !title ||
        !description ||
        !opportunity_type ||
        !compensation_type ||
        !event_date ||
        !start_time ||
        !end_time ||
        !venue_name ||
        !city ||
        !volunteers_needed ||
        !listing_status
    ) {

        return res.status(400).json({
            message: "Required opportunity fields are missing"
        });

    }


    if (
        opportunity_type !== "one-time" &&
        opportunity_type !== "recurring" &&
        opportunity_type !== "ongoing"
    ) {

        return res.status(400).json({
            message: "Invalid opportunity type"
        });

    }


    if (
        compensation_type !== "paid" &&
        compensation_type !== "unpaid"
    ) {

        return res.status(400).json({
            message: "Invalid compensation type"
        });

    }


    if (
        listing_status !== "draft" &&
        listing_status !== "open" &&
        listing_status !== "completed" &&
        listing_status !== "cancelled"
    ) {

        return res.status(400).json({
            message: "Invalid listing status"
        });

    }


    if (volunteers_needed <= 0) {

        return res.status(400).json({
            message: "Volunteers needed must be greater than 0"
        });

    }


    if (
        minimum_age !== null &&
        minimum_age !== undefined &&
        (
            minimum_age < 0 ||
            minimum_age > 100
        )
    ) {

        return res.status(400).json({
            message: "Minimum age must be between 0 and 100"
        });

    }


    try {

        const finalCompensationAmount =
            compensation_type === "paid"
                ? compensation_amount
                : null;


        const finalPaymentSchedule =
            compensation_type === "paid"
                ? payment_schedule
                : null;


        const result = await pgclient.query(
            `UPDATE opportunities
             SET
                organization_id = $1,
                category_id = $2,
                title = $3,
                description = $4,
                opportunity_type = $5,
                compensation_type = $6,
                compensation_amount = $7,
                payment_schedule = $8,
                event_date = $9,
                start_time = $10,
                end_time = $11,
                application_deadline = $12,
                venue_name = $13,
                street_address = $14,
                building_number = $15,
                city = $16,
                transport_notes = $17,
                volunteers_needed = $18,
                minimum_age = $19,
                additional_requirements = $20,
                listing_status = $21,
                updated_at = CURRENT_TIMESTAMP

             WHERE opportunity_id = $22

             RETURNING *`,
            [
                organization_id,
                category_id,
                title,
                description,
                opportunity_type,
                compensation_type,
                finalCompensationAmount,
                finalPaymentSchedule,
                event_date,
                start_time,
                end_time,
                application_deadline,
                venue_name,
                street_address,
                building_number,
                city,
                transport_notes,
                volunteers_needed,
                minimum_age,
                additional_requirements,
                listing_status,
                req.params.id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Opportunity not found"
            });

        }


        res.json({
            opportunity: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/opportunities/3
// DELETE
// Delete opportunity
router.delete("/:id", organizationAuth, async (req, res) => {

    try {

        const result = await pgclient.query(
            `DELETE FROM opportunities
             WHERE opportunity_id = $1
             RETURNING *`,
            [req.params.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Opportunity not found"
            });

        }


        res.json({
            deleted: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


export default router;