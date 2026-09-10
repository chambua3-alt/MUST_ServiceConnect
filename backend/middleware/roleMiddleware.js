function authorizeRoles(...allowedRoles) {

    return function (req, res, next) {

        /* Check Authentication */

        if (!req.user) {

            return res.status(401).json({
                message:
                    "Authentication is required."
            });

        }


        /* Check User Role */

        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({
                message:
                    "You do not have permission to perform this action."
            });

        }


        next();

    };

}


module.exports = {
    authorizeRoles
};