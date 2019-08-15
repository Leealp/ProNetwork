const express = require('express');			//require express modules for the app
const connectDB = require('./config/db');
const path = require('path');

const app = express();						// initialize the app with express

//connect database
connectDB();

//init middleware
app.use(express.json({extended: false}));
app.use(express.static("public"))

const PORT = process.env.PORT||8080;

//defines Routes (require the routes in auth.js, profile.js, posts.js, and users.js)
app.use('/api/users', require('./routes/api/users'));       //api/users refers to '/' in users.js
app.use('/api/auth', require('./routes/api/auth'));         //api/users refers to '/' in auth.js
app.use('/api/profile', require('./routes/api/profile'));   //api/users refers to '/' in profile.js
app.use('/api/posts', require('./routes/api/posts'));       //api/users refers to '/' in posts.js

// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static('client/build'));
  
//     app.get('*', (req, res) => {
//       res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
//   }


app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`))