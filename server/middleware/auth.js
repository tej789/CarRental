import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async(req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.json({ success: false, message: "not authorized" });
    }

    // Remove Bearer prefix if present
    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) {
            return res.json({ success: false, message: "not authorized" });
        }

        req.user = await User.findById(decoded).select("-password");                                // Select all fields except password for security reasons
        
        if (!req.user) {
            return res.json({ success: false, message: "User not found" });
        }
        
        next(); 
    }
    catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: "not authorized - invalid token" });
    }

}