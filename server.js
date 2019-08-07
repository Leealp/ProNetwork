const express = require('express');			//require express modules for the app
const connectDB = require('./config/db');

const app = express();						// initialize the app with express

//connect database
connectDB();

//init middleware
app.use(express.json({extended: false}));

const PORT = process.env.PORT||8080;

app.get('/', (req, res)=>res.send("App is running"));

//defines Routes (require the routes in auth.js, profile.js, posts.js, and users.js)
app.use('/api/users', require('./routes/api/users'));       //api/users refers to '/' in users.js
app.use('/api/auth', require('./routes/api/auth'));         //api/users refers to '/' in auth.js
app.use('/api/profile', require('./routes/api/profile'));   //api/users refers to '/' in profile.js
app.use('/api/posts', require('./routes/api/posts'));       //api/users refers to '/' in posts.js


app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`))