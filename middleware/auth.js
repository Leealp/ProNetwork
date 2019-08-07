const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req,res,next){    // we are exporting a middleware function
    // Get token from header
    const token = req.header('x-auth-token'); //we're sending x-auth-token in

    //if there's no token and the route is protected using this middleware
    if(!token){
        return res.status(401).json({msg:'No token, you are denied!'});
    }

    //here, we verify the token
    try {       // if there's a token and it is valid, it's going to decode it through jwt.verify
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;    //we're setting req.user to the user in the decoded token
        next();                    //we can use that req.user in our routes
    } catch(err){   // if there's a token and it's not valid
        res.status(401).json({msg: 'Your token is invalid'});        
    }
}