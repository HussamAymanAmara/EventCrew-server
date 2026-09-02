export default function userAuth(req, res, next) {

    const role = req.headers["x-role"];

    if (role === "volunteer" || role === "organization") {
        next();
    } else {
        res.status(403).json({
            message: "User access only"
        });
    }

}