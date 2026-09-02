import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import pgclient from "./db/db.js";

import categoryRoutes from "./routes/categories.js";
import skillRoutes from "./routes/skills.js";
import organizationTypeRoutes from "./routes/organizationTypes.js";
import authRoutes from "./routes/auth.js";
import volunteerRoutes from "./routes/volunteers.js";
import organizationRoutes from "./routes/organizations.js";

import opportunityRoutes from "./routes/opportunities.js";
import applicationRoutes from "./routes/applications.js";
import attendanceRoutes from "./routes/attendance.js";
import savedOpportunityRoutes from "./routes/savedOpportunities.js";
import certificateRoutes from "./routes/certificates.js";
import reportRoutes from "./routes/reports.js";

import volunteerDetailsRoutes from "./routes/volunteerDetails.js";
import organizationDetailsRoutes from "./routes/organizationDetails.js";
import opportunityDetailsRoutes from "./routes/opportunityDetails.js";

import dashboardRoutes from "./routes/dashboard.js";

import volunteerHistoryRoutes from "./routes/volunteerHistory.js";

import passwordResetRoutes from "./routes/passwordReset.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/organization-types", organizationTypeRoutes);

app.use("/api/volunteers", volunteerRoutes);
app.use("/api/organizations", organizationRoutes);

app.use("/api/opportunities", opportunityRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/saved-opportunities", savedOpportunityRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/volunteers", volunteerDetailsRoutes);
app.use("/api/organizations", organizationDetailsRoutes);
app.use("/api/opportunities", opportunityDetailsRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/volunteers", volunteerHistoryRoutes);
app.use("/api/password-reset", passwordResetRoutes);

app.get("/", (req, res) => {
    res.send("EventCrew API is running");
});


app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});


pgclient.connect().then(() => {

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

});