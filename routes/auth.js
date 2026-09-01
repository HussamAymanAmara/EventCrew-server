// import express from "express";
// import pgclient from "../db/db.js";

// const router = express.Router();


// // localhost:5000/api/auth/signup
// // POST
// // body >> { email, password, role }
// router.post("/signup", async (req, res) => {

//     const { email, password, role } = req.body;

//     const exists = await pgclient.query(
//         "SELECT * FROM users WHERE email = $1",
//         [email]
//     );

//     if (exists.rows.length > 0) {
//         return res.status(400).json({
//             message: "User already exists"
//         });
//     }

//     const result = await pgclient.query(
//         `INSERT INTO users (email, password, role)
//          VALUES ($1, $2, $3)
//          RETURNING *`,
//         [email, password, role]
//     );

//     res.status(201).json({
//         user: result.rows[0]
//     });

// });


// // localhost:5000/api/auth/login
// // POST
// // body >> { email, password }
// router.post("/login", async (req, res) => {

//     const { email, password } = req.body;

//     const result = await pgclient.query(
//         `SELECT *
//          FROM users
//          WHERE email = $1
//          AND password = $2`,
//         [email, password]
//     );

//     if (result.rows.length === 0) {
//         return res.status(401).json({
//             message: "Invalid credentials"
//         });
//     }

//     res.json({
//         user: result.rows[0]
//     });

// });


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
        state,
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
        office_state,
        office_postcode,
        latitude,
        longitude,
        facebook_url,
        instagram_url,
        linkedin_url

    } = req.body;


    // Check role
    if (role !== "volunteer" && role !== "organization") {
        return res.status(400).json({
            message: "Invalid role"
        });
    }


    // Check if email already exists
    const exists = await pgclient.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );


    if (exists.rows.length > 0) {
        return res.status(400).json({
            message: "User already exists"
        });
    }


    // Create the user account
    const userResult = await pgclient.query(
        `INSERT INTO users (email, password, role)
         VALUES ($1, $2, $3)
         RETURNING user_id, email, role`,
        [email, password, role]
    );


    const user = userResult.rows[0];


    // If the user is a volunteer,
    // create the volunteer profile
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
                state,
                about_me
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                user.user_id,
                first_name,
                last_name,
                phone,
                date_of_birth,
                area,
                city,
                state,
                about_me
            ]
        );

    }


    // If the user is an organization,
    // create the organization profile
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
                office_state,
                office_postcode,
                latitude,
                longitude,
                facebook_url,
                instagram_url,
                linkedin_url
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
            )`,
            [
                user.user_id,
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
            ]
        );

    }


    res.status(201).json({
        message: "Registration successful",
        user: user
    });

});


// localhost:5000/api/auth/login
// POST
// body >> { email, password }
router.post("/login", async (req, res) => {

    const { email, password } = req.body;


    const result = await pgclient.query(
        `SELECT user_id, email, role
         FROM users
         WHERE email = $1
         AND password = $2`,
        [email, password]
    );


    if (result.rows.length === 0) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }


    res.json({
        user: result.rows[0]
    });

});


export default router;