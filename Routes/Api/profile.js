const express = require('express');     // require express modules
const request = require('request');
const config = require('config');
const router  = express.Router();              // to use express router
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');



//@route     GET api/profile/me
//@desc      Get current users profile
//@access    Private
router.get('/me', auth, async (req,res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate(
            'user',
            ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({ msg:'No profile exists for this user'});
        }

        res.json(profile);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});   //to create a route

//@route     POST api/profile
//@desc      Create or update users profile
//@access    Private
router.post('/', 
[
    auth, 
    [
        check('status', 'Status is required')
            .not()
            .isEmpty(),
        check('skills', 'Skills is required')
            .not()
            .isEmpty()
    ]
] ,
async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
      } =req.body;

      //to build profile object
      const profileFields = {};
      profileFields.user = req.user.id
      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(status) profileFields.status = status;
      if(githubusername) profileFields.githubusername = githubusername;
      if(skills){
          profileFields.skills = skills.split(',').map(skills => skills.trim());
      }

      //for the social object
      profileFields.social = {}
      if(youtube) profileFields.social.youtube = youtube;
      if(facebook) profileFields.social.facebook = facebook;
      if(twitter) profileFields.social.twitter = twitter;
      if(instagram) profileFields.social.instagram = instagram;
      if(linkedin) profileFields.social.linkedin = linkedin;

      try{
        let profile = await Profile.findOne({ user: req.user.id });

        if(profile){ //if there is a profile, we will update it
            
            profile = await Profile.findOneAndUpdate(
            { user: req.user.id}, 
            {$set: profileFields },
            {new: true}
        );

            return res.json(profile);           
        }

        //this will create profiles
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);
      } catch(err){
          console.error(err.message);
          res.status(500).send('Server Error');
      }
    }
);

//@route     GET api/profile
//@desc      Get all profiles
//@access    Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route     GET api/profile/user/:user_id
//@desc      Get profile by user ID
//@access    Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ 
          user: req.params.user_id
        }).populate('user', ['name', 'avatar']);

        if(!profile) return res.status(400).json({ msg: 'Profile not found'});

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found'});
        }
        res.status(500).send('Server Error');
    }
});

//@route     DELETE api/profile
//@desc      DELETE profile, user & posts
//@access    Private
router.delete('/', auth, async (req, res) => {
    try {
        //we want to remove users posts

        //this will remove a profile
        await Profile.findOneAndRemove({ user: req.user.id});
        //this will remove a user
        await User.findOneAndRemove({ _id: req.user.id});
        res.json({ msg: 'User is removed!'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route     PUT api/profile/experience
//@desc      Add profile experience
//@access    Private
router.put(
    '/experience', 
    [
        auth, 
        [
    check('title', 'Title is required')
        .not()
        .isEmpty(),
    check('company', 'Title is required')
        .not()
        .isEmpty(),
    check('from', 'From date required')
        .not()
        .isEmpty()
   ] 
], 
async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }   

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }   = req.body;

    const newExp = {        //this will create an object with the data that the user submits
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');        
    }
 }
);

//@route     DELETE api/profile/experience/:exp_id
//@desc      Delete experience form profile
//@access    Private 
router.delete('/experience/:exp_id', auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });  //here we're getting the profile of the user
        
        //Get removve index
        const removeIndex = profile.experience      //here we're getting the index
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);      //then we splice the index

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')      
    }
});

//@route     PUT api/profile/education
//@desc      Add profile education
//@access    Private
router.put(
    '/education', 
    [
        auth, 
        [
    check('school', 'School is required')
        .not()
        .isEmpty(),
    check('degree', 'Degree is required')
        .not()
        .isEmpty(),
    check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty(),
    check('from', 'From date required')
        .not()
        .isEmpty()
   ] 
], 
async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }   

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }   = req.body;

    const newEdu = {        //this will create an object with the data that the user submits
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        
        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');        
    }
 }
);

//@route     DELETE api/profile/education/:edu_id
//@desc      Delete education form profile
//@access    Private 
router.delete('/education/:edu_id', auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });  //here we're getting the profile of the user
        
        //Get removve index
        const removeIndex = profile.education      //here we're getting the index
            .map(item => item.id)
            .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);      //then we splice the index

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');      
    }
});

//@route     GET api/profile/github/:username
//@desc      GET user repo form Github
//@access    Public 
router.get('/github/:username', (req, res)=>{
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                'githubClientId'
                )}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
            if(error) console.error(error);

            if(response.statusCode !==200){
                return res.status(404).json({ msg: 'No Github profile for this user'});
            }

            res.json(JSON.parse(body));
        });     
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');        
    }
});

module.exports = router;
