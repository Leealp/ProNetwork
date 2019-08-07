const express = require('express');             // require express modules
const router  = express.Router();               // to use express router
const gravatar = require('gravatar');           // to make sure users are found
const bcrypt = require('bcryptjs');             //for the password
const jwt = require('jsonwebtoken');  
const config = require('config');      
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route     POST api/users
//@desc      Register user
//@access    Public
router.post(
    '/',
    [
        check('name', 'Your name is required')
            .not()
            .isEmpty(),
        check('email', 'Please to enter a valid email').isEmail(),
        check(
            'password',
            'Password must be at least 5 characters'
        ).isLength({min:5})      
    ], 
    async(req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){      //if there are errors
            res.status(400).json({errors: errors.array()});
        }    

        const{name, email, password} = req.body;

        try{
            let user = await User.findOne({email})

            if(user){       //check if a user exists
                return res.status(400).json({errors: [{msg:'User already exists'}]});
            }
            
            const avatar = gravatar.url(email, {         //grabs a user gravatar
                s: '200',       //size
                r: 'pg',        //rating
                d: 'mm'             //default if a user doesn't have a gravatar

            });

            user = new User({       //to create an instance of a user
                name,
                email,
                avatar,
                password
            });

            const salt = await bcrypt.genSalt(10);    //will encrypt password
            user.password  = await bcrypt.hash(password, salt); //to create a hash and input it in the user's password

            await user.save();      //to save user in the database

            //returs jsonwebtoken
           
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
