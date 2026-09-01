import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import pgclient from "./db/db.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT;


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


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