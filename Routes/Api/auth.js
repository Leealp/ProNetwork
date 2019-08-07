const express = require('express');     // require express modules
const router  = express.Router();              // to use express router
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');  
const config = require('config');      
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route     GET api/auth
//@desc      Test route
//@access    Public
router.get('/',auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
    }
});   //to create a route

//@route     POST api/auth
//@desc      Authenticate user and get token
//@access    Public
router.post(
    '/',
    [
        check('email', 'Please to enter a valid email').isEmail(),
        check('password', 'Password required').exists()     
    ], 
    async(req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){      //if there are errors
            res.status(400).json({errors: errors.array()});
        }    

        const{email, password} = req.body;

        try{
            let user = await User.findOne({email})

            if(!user){       //check if a user exists
                return res
                .status(400)
                .json({errors: [{msg:'Check your credentials!'}]});
            }
            
            
            const isMatch = await bcrypt.compare(password, user.password); //if the user exists, we store the password

            if(!isMatch){
                return res
                .status(400)
                .json({errors: [{msg:'Check your credentials!'}]});
            }
           
           
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn: 3600000},
            (err, token)=>{
                if(err) throw err;
                res.json({token});      //if we don't get an error, we send the token back to the client
            });

        } catch(err){
            console.error(err.message)
            res.status(500).send('server error');
        }

   
}); 
module.exports = router;
