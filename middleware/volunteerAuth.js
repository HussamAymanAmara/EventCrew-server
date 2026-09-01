export default function volunteerAuth(req, res, next) {

    const role = req.headers["x-role"];

    if (role === "volunteer") {
        next();
    } else {
        res.status(403).json({
            message: "Volunteer access only"
        });
    }

}