// Checks if the logged-in user has the 'admin' role
// This middleware must run *after* the `protect` middleware

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Forbidden. User is not an admin.' });
    }
};