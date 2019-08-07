const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {     //so that users can only delete their own posts
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    likes: [
        {
            user: {     //so we can know which likes came from which users
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ],
    comments: [
        {
            user: {     
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        } 
    ],
    date: {     //date on the actual post itself
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);