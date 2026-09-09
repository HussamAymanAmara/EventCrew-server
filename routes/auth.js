// export default router;

import express from "express";
import pgclient from "../db/db.js";

const router = express.Router();


// localhost:5000/api/auth/signup
// POST
router.post("/signup", async (req, res) => {

    const {
        email,
        password,
        role,

        // Volunteer information
        first_name,
        last_name,
        phone,
        date_of_birth,
        area,
        city,
        about_me,

        // Organization information
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
        website,
        office_street_address,
        office_city,
        office_area

    } = req.body;


    // Check account information
    if (!email || !password || !role) {

        return res.status(400).json({
            message: "Email, password and role are required"
        });

    }


    // Check role
    if (
        role !== "volunteer" &&
        role !== "organization"
    ) {

        return res.status(400).json({
            message: "Invalid role"
        });

    }


    // Check volunteer information
    if (role === "volunteer") {

        if (
            !first_name ||
            !last_name ||
            !phone ||
            !date_of_birth ||
            !area ||
            !city ||
            !about_me
        ) {

            return res.status(400).json({
                message: "All volunteer information is required"
            });

        }

    }


    // Check organization information
    if (role === "organization") {

        if (
            !organization_name ||
            !organization_type_id ||
            !tagline ||
            !year_established ||
            !organization_size ||
            !about_organization ||
            !contact_person ||
            !contact_job_title ||
            !contact_email ||
            !phone ||
            !office_street_address ||
            !office_city ||
            !office_area
        ) {

            return res.status(400).json({
                message: "All organization information is required except website"
            });

        }


        // Year established must be an integer
        if (
            !Number.isInteger(
                Number(year_established)
            )
        ) {

            return res.status(400).json({
                message: "Year established must be a whole number"
            });

        }

    }


    try {

        // Check if email already exists
        const exists = await pgclient.query(
            `SELECT *
             FROM users
             WHERE email = $1`,
            [email]
        );


        if (exists.rows.length > 0) {

            return res.status(400).json({
                message: "User already exists"
            });

        }


        // Create user account
        const userResult = await pgclient.query(
            `INSERT INTO users
            (
                email,
                password,
                role
            )
            VALUES ($1, $2, $3)
            RETURNING user_id, email, role`,
            [
                email,
                password,
                role
            ]
        );


        const user = userResult.rows[0];


        // Create volunteer profile
        if (role === "volunteer") {

            await pgclient.query(
                `INSERT INTO volunteer_profiles
                (
                    volunteer_id,
                    first_name,
                    last_name,
                    phone,
                    date_of_birth,
                    area,
                    city,
                    about_me
                )
                VALUES
                (
                    $1, $2, $3, $4,
                    $5, $6, $7, $8
                )`,
                [
                    user.user_id,
                    first_name,
                    last_name,
                    phone,
                    date_of_birth,
                    area,
                    city,
                    about_me
                ]
            );

        }


        // Create organization profile
        if (role === "organization") {

            await pgclient.query(
                `INSERT INTO organization_profiles
                (
                    organization_id,
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
                    office_area
                )
                VALUES
                (
                    $1, $2, $3, $4,
                    $5, $6, $7, $8,
                    $9, $10, $11, $12,
                    $13, $14, $15, $16
                )`,
                [
                    user.user_id,
                    organization_name,
                    organization_type_id,
                    logo_url || null,
                    tagline,
                    Number(year_established),
                    organization_size,
                    about_organization,
                    contact_person,
                    contact_job_title,
                    contact_email,
                    phone,
                    website || null,
                    office_street_address,
                    office_city,
                    office_area
                ]
            );

        }


        res.status(201).json({
            message: "Registration successful",
            user: user
        });

    }
    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


// localhost:5000/api/auth/login
// POST
router.post("/login", async (req, res) => {

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }


    try {

        const result = await pgclient.query(
            `SELECT
                user_id,
                email,
                role,
                is_active
             FROM users
             WHERE email = $1
             AND password = $2`,
            [
                email,
                password
            ]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({
                message: "Invalid credentials"
            });

        }


        if (
            result.rows[0].is_active === false
        ) {

            return res.status(403).json({
                message: "Account is inactive"
            });

        }


        res.json({
            user: result.rows[0]
        });

    }
    catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

});


export default router;