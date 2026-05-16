const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Akses ditolak. Token tidak ditemukan." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meongmeong');
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid atau kadaluwarsa." });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role.toUpperCase() === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ message: "Akses terlarang. Hanya untuk Admin." });
    }
};

const isPimpinan = (req, res, next) => {
    if (req.user && req.user.role.toUpperCase() === 'PIMPINAN') {
        next();
    } else {
        return res.status(403).json({ message: "Akses terlarang. Hanya untuk Pimpinan." });
    }
};

module.exports = { verifyToken, isAdmin, isPimpinan };
