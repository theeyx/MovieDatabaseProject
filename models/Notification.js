const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    username: String,
    movieID: String,
    reviewID: String,
    personID: String,
    isRead: {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('Notification', NotificationSchema);