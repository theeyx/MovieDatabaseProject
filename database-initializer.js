const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Movie = require("./models/MovieModel");
const User = require("./models/UserModel");
const Person = require("./models/PersonModel");
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;


const allMovies = [];
const p = {};
const allPeople = [];


function addPersonToMovie(peopleName, movie, position){
	if(!p.hasOwnProperty(peopleName)){
		let addPeople = new Person();
		addPeople._id = mongoose.Types.ObjectId();
		addPeople.name = peopleName;
		addPeople.Director = [];
		addPeople.Actor = [];
		addPeople.Writer = [];
		allPeople.push(addPeople);
		p[addPeople.name] = addPeople;
	}
	let curPerson = p[peopleName];
	curPerson[position].push(movie._id);
	movie[position].push(curPerson._id);
}



let data = require('./movie-data-2500.json');
data.forEach(movie=>{
	let newMovie = new Movie();
  newMovie._id = mongoose.Types.ObjectId();
  newMovie.Title = movie.Title;
  newMovie.Year = movie.Year;
  newMovie.Runtime = movie.Runtime;
  newMovie.Genre = movie.Genre;
  newMovie.Plot = movie.Plot;
  newMovie.Released = movie.Released;
  newMovie.Awards = movie.Awards;
	newMovie.Poster = movie.Poster;
	movie.Actors.forEach(actorName => {
    addPersonToMovie(actorName, newMovie, "Actor");
  })
  //Repeat for directors
  movie.Director.forEach(directorName => {
    addPersonToMovie(directorName, newMovie, "Director");
  })
  //Repeast for writers
  movie.Writer.forEach(directorName => {
    addPersonToMovie(directorName, newMovie, "Writer");
  })
  //Add the movie to our array of all movies (these are added to the database once we are finished)
  allMovies.push(newMovie)
})



mongoose.connect('mongodb://localhost/moviedb', {useNewUrlParser: true});
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  //We are connected. Drop the database first so we start fresh each time.
  mongoose.connection.db.dropDatabase(function(err, result){

    //Add all of the movie documents to the database
    Movie.insertMany(allMovies, function(err, result){
  	  if(err){
  		  console.log(err);
  		  return;
  	  }

      //Add all of the people documents to the database
      Person.insertMany(allPeople, function(err, result){
    	  if(err){
    		  console.log(err);
    		  return;
    	  }




            mongoose.connection.close()


      });
    });
  });
});
