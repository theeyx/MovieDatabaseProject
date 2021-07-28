const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;


//movie schema where we will save the movies on the database
const movieSchema = new Schema({
  Title: { type: String, required: true},
  Year: { type: String, required: true},
  AvgRate: {type: Number, default: 0},
  Rated: {type: String, enum: ['G', 'PG', 'PG-13', 'R']},
  Released: { type: String, required: true },
  Runtime: { type: String, required: true },
  Genre: [{type: String, enum: ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime','Documentary', 'Drama', 'Family', 'Fantasy', 'Horror','Romance','Sport', 'Thriller','War', 'Western', 'Musical', 'Mystery', 'Music', 'Sci-Fi', 'Short' , 'Biography' , 'History' , 'N/A', 'Film-Noir', 'News']}],
  Director: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  Actor: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  Writer: [{type: Schema.Types.ObjectId, ref: 'Person'}],
  Similar: [{type: Schema.Types.ObjectId, ref: 'Movie'}],
  Reviews: [String],
  Score: [Number],
  Plot: {type: String, required: true},
  Awards: {type: String, required: true},
  Poster:{type: String},
  type: { type: String},
});



//const Movie = mongoose.model("Movie", movieSchema);
module.exports = mongoose.model("Movie", movieSchema);
