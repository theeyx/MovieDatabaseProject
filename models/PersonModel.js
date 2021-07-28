const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const personSchema = new Schema({
  name: { type: String, required: true},
  Director: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  Actor: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  Writer: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
  Collab: [{type:Schema.Types.ObjectId, ref: 'User'}],
});


module.exports = mongoose.model("Person", personSchema);
