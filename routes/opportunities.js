import express from "express";
import pgclient from "../db/db.js";
import organizationAuth from "../middleware/organizationAuth.js";

const router = express.Router();

// localhost:5000/api/opportunities/1
// GET
// Get opportunity by ID
router.get("/:id", async (req, res) => {

    const result = await pgclient.query(
        `SELECT *
         FROM opportunities
         WHERE opportunity_id = $1`,
        [req.params.id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Opportunity not found"
        });
    }

    res.json(result.rows[0]);

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
        organization_id,
        is_featured
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
    WHERE 1=1
`;

    const values = [];


    if (search) {
        values.push(`%${search}%`);
        query += ` AND o.title ILIKE $${values.length}`;
    }


    if (category_id) {
        values.push(category_id);
        query += ` AND o.category_id = $${values.length}`;
    }


    if (city) {
        values.push(city);
        query += ` AND o.city = $${values.length}`;
    }


    if (status) {
        values.push(status);
        query += ` AND o.listing_status = $${values.length}`;
    }


    if (compensation) {
        values.push(compensation);
        query += ` AND o.compensation_type = $${values.length}`;
    }


    if (date) {
        values.push(date);
        query += ` AND o.event_date = $${values.length}`;
    }

    if (organization_id) {
        values.push(organization_id);
        query += ` AND o.organization_id = $${values.length}`;
    }

    if (is_featured) {
        values.push(is_featured);
        query += ` AND o.is_featured = $${values.length}`;
    }

    if (sort === "date_asc") {
        query += " ORDER BY o.event_date ASC";
    }
    else if (sort === "date_desc") {
        query += " ORDER BY o.event_date DESC";
    }
    else if (sort === "newest") {
        query += " ORDER BY o.created_at DESC";
    }
    else {
        query += " ORDER BY o.opportunity_id";
    }


    const result = await pgclient.query(query, values);

    res.json(result.rows);

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
        meals_provided,
        transport_allowance,
        certificate_provided,
        event_date,
        start_time,
        end_time,
        application_deadline,
        venue_name,
        street_address,
        city,
        state,
        postcode,
        latitude,
        longitude,
        transport_notes,
        volunteers_needed,
        minimum_age,
        additional_requirements,
        listing_status,
        application_review,
        is_featured
    } = req.body;


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
            meals_provided,
            transport_allowance,
            certificate_provided,
            event_date,
            start_time,
            end_time,
            application_deadline,
            venue_name,
            street_address,
            city,
            state,
            postcode,
            latitude,
            longitude,
            transport_notes,
            volunteers_needed,
            minimum_age,
            additional_requirements,
            listing_status,
            application_review,
            is_featured
        )
        VALUES
        (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19,
            $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        )
        RETURNING *`,
        [
            organization_id,
            category_id,
            title,
            description,
            opportunity_type,
            compensation_type,
            compensation_amount,
            payment_schedule,
            meals_provided,
            transport_allowance,
            certificate_provided,
            event_date,
            start_time,
            end_time,
            application_deadline,
            venue_name,
            street_address,
            city,
            state,
            postcode,
            latitude,
            longitude,
            transport_notes,
            volunteers_needed,
            minimum_age,
            additional_requirements,
            listing_status,
            application_review,
            is_featured
        ]
    );


    res.status(201).json({
        opportunity: result.rows[0]
    });

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
        meals_provided,
        transport_allowance,
        certificate_provided,
        event_date,
        start_time,
        end_time,
        application_deadline,
        venue_name,
        street_address,
        city,
        state,
        postcode,
        latitude,
        longitude,
        transport_notes,
        volunteers_needed,
        minimum_age,
        additional_requirements,
        listing_status,
        application_review,
        is_featured
    } = req.body;


    const result = await pgclient.query(
        `UPDATE opportunities
         SET organization_id = $1,
             category_id = $2,
             title = $3,
             description = $4,
             opportunity_type = $5,
             compensation_type = $6,
             compensation_amount = $7,
             payment_schedule = $8,
             meals_provided = $9,
             transport_allowance = $10,
             certificate_provided = $11,
             event_date = $12,
             start_time = $13,
             end_time = $14,
             application_deadline = $15,
             venue_name = $16,
             street_address = $17,
             city = $18,
             state = $19,
             postcode = $20,
             latitude = $21,
             longitude = $22,
             transport_notes = $23,
             volunteers_needed = $24,
             minimum_age = $25,
             additional_requirements = $26,
             listing_status = $27,
             application_review = $28,
             is_featured = $29,
             updated_at = CURRENT_TIMESTAMP
         WHERE opportunity_id = $30
         RETURNING *`,
        [
            organization_id,
            category_id,
            title,
            description,
            opportunity_type,
            compensation_type,
            compensation_amount,
            payment_schedule,
            meals_provided,
            transport_allowance,
            certificate_provided,
            event_date,
            start_time,
            end_time,
            application_deadline,
            venue_name,
            street_address,
            city,
            state,
            postcode,
            latitude,
            longitude,
            transport_notes,
            volunteers_needed,
            minimum_age,
            additional_requirements,
            listing_status,
            application_review,
            is_featured,
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

});

// localhost:5000/api/opportunities/3
// DELETE
// Delete opportunity
router.delete("/:id", organizationAuth, async (req, res) => {

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

});

export default router;