import express from "express";
import crypto from "crypto";
import pgclient from "../db/db.js";

const router = express.Router();


// localhost:5000/api/password-reset/forgot-password
// POST
// Create password reset token
router.post("/forgot-password", async (req, res) => {

    const { email } = req.body;


    const userResult = await pgclient.query(
        `SELECT user_id, email
         FROM users
         WHERE email = $1`,
        [email]
    );


    if (userResult.rows.length === 0) {
        return res.status(404).json({
            message: "User not found"
        });
    }


    const user = userResult.rows[0];


    const resetToken = crypto.randomBytes(32).toString("hex");


    const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
    );


    const result = await pgclient.query(
        `INSERT INTO password_reset_tokens
         (user_id, reset_token, expires_at)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [
            user.user_id,
            resetToken,
            expiresAt
        ]
    );


    res.status(201).json({
        message: "Password reset token created",
        reset_token: resetToken
    });

});


// localhost:5000/api/password-reset/reset-password
// POST
// Reset password
router.post("/reset-password", async (req, res) => {

    const {
        reset_token,
        new_password
    } = req.body;


    const tokenResult = await pgclient.query(
        `SELECT *
         FROM password_reset_tokens
         WHERE reset_token = $1
         AND used_at IS NULL
         AND expires_at > CURRENT_TIMESTAMP`,
        [reset_token]
    );


    if (tokenResult.rows.length === 0) {
        return res.status(400).json({
            message: "Invalid or expired reset token"
        });
    }


    const token = tokenResult.rows[0];


    await pgclient.query(
        `UPDATE users
         SET password = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [
            new_password,
            token.user_id
        ]
    );


    await pgclient.query(
        `UPDATE password_reset_tokens
         SET used_at = CURRENT_TIMESTAMP
         WHERE reset_token_id = $1`,
        [token.reset_token_id]
    );


    res.json({
        message: "Password reset successfully"
    });

});


export default router;