const express = require('express');     // require express modules
const router  = express.Router();              // to use express router
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route     POST api/posts
//@desc      Create a post
//@access    Private
router.post(
    '/', 
    [ 
        auth, 
        [
            check('text', 'Text is required')
            .not()
            .isEmpty()
       ]
    ],
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    });

    const post = await newPost.save();   
    
    res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');        
    }
 }
);   //to create a route

//@route     GET api/posts
//@desc      Get all posts
//@access    Private
router.get('/', auth, async (req, res) =>{
    try {
        const posts = await Post.find().sort({ date: -1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route     GET api/posts/:id
//@desc      Get post by ID
//@access    Private
router.get('/:id', auth, async (req, res) =>{ //req.params.id allows you to get a post from the URL
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({ msg: 'There is no post for this id'});
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'There is no post for this id'});
        }
        res.status(500).send('Server Error');
    }
});

//@route     DELETE api/posts/:iid
//@desc      Delete a post
//@access    Private
router.delete('/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({ msg: 'There is no post for this id'});
        }

        //check user; we only want owners to be able to delete their own post
        if(post.user.toString() !== req.user.id){      //req.user.id is the logged in user
            return res.status(401).json({ msg: 'User not authorized'}); //401: unauthorized
        }

        await post.remove();
        
        res.json({ msg: 'Post is removed'});
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'There is no post for this id'});
        }
        res.status(500).send('Server Error');
    }
});

//@route     PUT api/posts/like/:iid
//@desc      Like a post
//@access    Private
router.put('/like/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        //let check to see if the post has already been like by the user
        if(
            post.likes.filter(like => like.user.toString() === req.user.id).length > 0
        ){
            return res.status(400).json({ msg: 'This post has already been liked'});
        }

        post.likes.unshift({ user: req.user.id});

        await post.save();      //to save in the database

        res.json(post.likes);                
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route     PUT api/posts/unlike/:iid
//@desc      Unlike a post
//@access    Private
router.put('/unlike/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        //let check to see if the post has already been like by the user
        if(
            post.likes.filter(like => like.user.toString() === req.user.id).length == 0
        ){
            return res.status(400).json({ msg: 'This post has not been liked yet'});
        }

        
        //Get remove index
        const removeIndex = post.likes
        .map(like => like.user.toString())
        .indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();      //to save in the database

        res.json(post.likes);                
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route     POST api/posts/comment/:id
//@desc      Comment on a post
//@access    Private
router.post(
    '/comment/:id', 
    [ 
        auth, 
        [
            check('text', 'Text is required')
            .not()
            .isEmpty()
       ]
    ],
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

    const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    };

    post.comments.unshift(newComment);

    await post.save();   
    
    res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');        
    }
 }
);   //to create a route

//@route     DELETE api/posts/comment/:id/:comment_di
//@desc      Delete comment on a post
//@access    Private
router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //to pull comment
        const comment = post.comments.find(
            comment => comment.id === req.params.comment_id
        );

        //just to see if comment exists
        if(!comment){
            return res.status(404).json({ msg: 'Comment not found!'});
        }

        //only users that made the comment can delete it
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'You are not authorized!'});
        }

        //Get remove index
        const removeIndex = post.comments
        .map(comment => comment.user.toString())
        .indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();      //to save in the database

        res.json(post.comments);     
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



module.exports = router;
