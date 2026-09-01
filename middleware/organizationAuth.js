export default function organizationAuth(req, res, next) {

    const role = req.headers["x-role"];

    if (role === "organization") {
        next();
    } else {
        res.status(403).json({
            message: "Organization access only"
        });
    }

}