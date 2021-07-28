
const http = require("http");
const fs = require("fs");
const express = require("express");
const path = require("path");
const pug = require("pug");
const bcrypt = require('bcrypt');
const mongo = require("mongodb");
const passport = require('passport');
const flash = require('express-flash'); 
const session = require('express-session')
const Movie = require("./models/MovieModel");
const User = require("./models/UserModel");
const Person = require("./models/PersonModel");
const Notification = require("./models/Notification");
const Review = require("./models/ReviewModel");
const mongoose = require('mongoose');
const methodOverride = require('method-override'); 

//uses the initialize function in client.js to
//authenticate a user
const passportStart = require('./client');
passportStart(
	passport,
	async username => User.find({username: username}).exec(),
	async id => User.findById(id).exec()
);

//stores the registered users
const user = [];
const curId = "";


let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(flash())
app.use(session({
	secret: "some secret key here",
    resave: true,
    saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))

app.use(async function (req, res, next) {
    res.locals.currentUser = req.user;
    if (req.user) {
        try {
            const user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
            res.locals.notifications = user.notifications.reverse();
        } catch (err) {
            console.log(err.message);
        }
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

const port = 3000;

//Search Query function to help with searching without needing to type out entire words.
function searchQuery(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUEST FOR BASIC PAGES


//homepage request
app.get("/", function (req, res){
	res.status(200);
	res.send(
		pug.renderFile("./views/index.pug")
	);
});


//homepage request
app.get("/index", function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("./views/index.pug")
	);
});


//register page request
app.get("/create", notAuthenticated, function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("./views/create.pug")
	);
});


//login page request
app.get("/login", notAuthenticated, (req, res) => {
	res.status(200);
	res.send(
		pug.renderFile("./views/login.pug")
	);
});


//search page request
app.get("/search", function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("./views/search.pug")
	);
});

//notifications page request
app.get("/notifications", function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("./views/notifications.pug")
	);
});


//contribute page request
app.get("/contribute", authenticated, authRole ,(req, res) => {
	res.status(200);
	res.send(
		pug.renderFile("./views/contribute.pug")
	);
});


//seatch results page request
app.get("/searchResults", function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("./views/searchResults.pug")
	);
});


//switch user request
app.get("/switchUser", function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("./views/switchUser.pug")
	);
});


//enter correct number request
app.get("/enterCorrectNum", function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("./views/enterCorrectNum.pug")
	);
});


//follower/watched error page
app.get("/followerError", function (req, res){
	res.status(200);
	res.send(
			pug.renderFile("./views/followerError.pug")
	);
});

app.get("/allNotifications", function (req, res){
	res.status(200);
	res.send(
			pug.renderFile("./views/allNotifications.pug")
	);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUESTS FOR OBJECTS AT AN ID


//request for current user
app.get("/current", authenticated, genRec ,function(req, res){
	const currentUserId = req._passport.session.user;
	let userId;
	try {
		userId = new mongo.ObjectID(currentUserId);
	} catch {
		response.status(404).send("Error");
		return;
	}
	User.findOne({_id: userId}).populate('followers').populate('followingPeople').populate('following').populate('recommended').exec((err, data) => {
		if(err){
			response.status(404).send(`${currentUserId}`);
		}
		res.status = 200;
		res.send(pug.renderFile("./views/current.pug", { userArray: data }));
	});
});


//request for specific user
app.get("/user/:id", function (req,res){
  User.findOne({_id: req.params.id}).populate('followers').populate('followingPeople').populate('following').exec((err, targetUser) => {
    console.log(targetUser);
    console.log(targetUser.followers); // THIS SHOULD HAVE ALL THE FOLLOWER'S DATA
    if (err) {
      res.status(404).send(`User with ID ${req.params.id} does not exist.`);
    }
    res.statusCode = 200;

    res.send(pug.renderFile("./views/profile.pug", { userArray: targetUser }));
  });
});


//request for specific movie
app.get("/movies/:id", authenticated ,genSim, function (request, response) {
	const targetId = request.params.id;
	let movieId;
	try {
		movieId = new mongo.ObjectID(targetId);
	} catch {
	  response.status(404).send("Error");
	  return;
	}
	//gets the movie data from the database
	Movie.findOne({ _id: movieId }).populate('Director').populate('Writer').populate('Actor').populate('Similar').exec((err, movieData) => {
	  if (err) {
		response.status(404).send(`${targetId}`);
	  }
	  response.status(200);
	  response.send(pug.renderFile("./views/movies.pug", { moviesArray: movieData }));
})});


//request for specific actor
app.get("/people/:id",genCollab ,function (request, response) {
	const targetId = request.params.id;
	let personId;
	try {
		personId = new mongo.ObjectID(targetId);
	} catch {
		response.status(404).send("Error");
		return;
	}
	Person.findOne({ _id: personId }).populate('Director').populate('Actor').populate('Writer').populate('Collab').exec((err, personData) => {
		if (err) {
		response.status(404).send(`${targetId}`);
		}
		response.status(200);
		response.send(pug.renderFile("./views/people.pug", { peopleArray: personData }));
	});
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUESTS FOR FOLLOWING


//request for following user
app.get("/addFollower/:id", function (req, res) {
  const currentUserId = req._passport.session.user;
	User.findById(currentUserId, (err, results)=>{
		if(err){
			console.log(" failed");
			throw err;
		}
		var followedPeople = results.followers;
		for(let i = 0; i < followedPeople.length; ++i){
			if((req.params.id) == followedPeople[i]){
					return res.redirect('/followerError');
			}
		}
  User.findById(req.params.id, (err, result) => {
		if(err){
			console.log(" failed");
			throw err;
		}
    User.findByIdAndUpdate(currentUserId, {$push: {followers: result}}, {new: true}, (err, updatedUser) => {
			res.redirect('/current');
    });
  })
});
});


//request for following movie
app.get("/addMovie/:id", function (req, res) {
	const currentUserId = req._passport.session.user;
	User.findById(currentUserId, (err, results)=>{
		if(err){
			console.log(" failed");
			throw err;
		}
		var followedPeople = results.following;
		for(let i = 0; i < followedPeople.length; ++i){
			if((req.params.id) == followedPeople[i]){
					return res.redirect('/followerError');
			}
		}
	Movie.findById(req.params.id, (err, result) => {
		if(err){
			console.log(" failed");
			throw err;
		}
		User.findByIdAndUpdate(currentUserId, {$push: {following: result}}, {new: true}, (err, updatedUser) => {
			res.redirect('/current');
		});
	})
});
});


//request for following actor
app.get("/addPerson/:id", function(request, response){
	const currentPersonId = request._passport.session.user;
	User.findById(currentPersonId, (err, results)=>{
		if(err){
			console.log(" failed");
			throw err;
		}
		var followedPeople = results.followingPeople;
		for(let i = 0; i < followedPeople.length; ++i){
			if((request.params.id) == followedPeople[i]){
					return response.redirect('/followerError');
			}
		}
	Person.findById(request.params.id, (err, result) => {
		if(err){
			console.log(" failed");
			throw err;
		}
		User.findByIdAndUpdate(currentPersonId, {$push: {followingPeople: result}}, {new: true}, (err, updatedUser) => {
			response.redirect('/current')
		});
	})
});
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUESTS FOR NOTIFICATIONS

app.get('/notifications/:id', authenticated, async function(req, res) {
	try {
	  let notification = await Notification.findById(req.params.id);
	  notification.isRead = true;
	  notification.save();
	  res.redirect(`/index/${notification.campgroundId}`);
	} catch(err) {
	  req.flash('error', err.message);
	  res.redirect('back');
	}
  });

app.get('/notifications', authenticated, async function(req, res) {
	try {
	  let user = await User.findById(req.user._id).populate({
		path: 'notifications',
		options: { sort: { "_id": -1 } }
	  }).exec();
	  let allNotifications = user.notifications;
	  res.send(
		pug.renderFile("./views/allNotifications",{allNotifications}))
	} catch(err) {
	  req.flash('error', err.message);
	  res.redirect('back');
	}
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUESTS FOR UNFOLLOWING


//unfollow movie
app.get("/unfollowMovie/:id", function(req, res){
	const currentUserId = req._passport.session.user;
	Movie.findById(req.params.id, (err, result) => {
		User.findByIdAndUpdate(currentUserId, {$pull: {following: req.params.id}}, {new: true}, (err, updatedUser) => {
			return res.redirect('/current');
		});
	})
});


//unfollow user
app.get("/unfollowUser/:id", function(req, res){
	const currentUserId = req._passport.session.user;
	User.findById(req.params.id, (err, result) => {
		User.findByIdAndUpdate(currentUserId, {$pull: {followers: req.params.id}}, {new: true}, (err, updatedUser) => {
			return res.redirect('/current');
		});
	})
});


//unfollow actor
app.get("/unfollowActor/:id", function(req, res){
	const currentUserId = req._passport.session.user;
	Person.findById(req.params.id, (err, result) => {
		User.findByIdAndUpdate(currentUserId, {$pull: {followingPeople: req.params.id}}, {new: true}, (err, updatedUser) => {
			return res.redirect('/current');
		});
	})
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUESTS TO ADD OBJECTS ONTO SITE


//post request to authenticate a register a user and store their username and password
app.post('/register', notAuthenticated, async (req, res) => {
		if(req.body.username == '' || req.body.password == ''){
			return res.redirect('/enterCorrectNum');
		}
	  const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
			role: "user",
      bio: "No Bio",
    });
    newUser.save((err, result) => {
      console.log(result);
      if (err) {
        console.log(err);
        res.statusCode = 500;
        res.redirect('/create');
      } else {
        res.statusCode = 200;
        res.redirect('/index');
      }
    });
})


//request for contributer to add movie on site
app.post("/movieList", (request, response) => {
	if(request.body.Title == '' || request.body.Year == '' || request.body.Runtime == '' || request.body.Released == '' || request.body.Plot == '' || request.body.Awards == ''){
		return response.redirect('/enterCorrectNum');
	}
	//Gets the movie information such as title, actor, etc from the database
	const addMovie = new Movie({
	 type: "movies",
	  ...request.body,
	});
	//saves the movie information
	addMovie.save((err, result) => {
	  if (err) {
		console.log("Insertion failed");
		throw err;
	  }
	  response.redirect('/movieList')
	});
});


//request for contributer to add actor on site
app.post('/addAnActor', (request, response) => {
	if(request.body.name == ''){
		return response.redirect('/enterCorrectNum');
	}
	const addActor = new Person({
		type: "people",
		...request.body,
	});
	addActor.save((err, result) => {
		if(err){
			console.log("Insertion failed");
			throw err;
		}
		response.redirect('/peopleList')
	});
});


//request for adding a review
app.post('/addAnReview/:id', (request,response)=>{
	var currentUserId =  request._passport.session.user;
	var currentMovieId = request.params.id;

		/*
		Our Notification implementation would need to done by linking each review, score, 
		or summary added (with the ReviewModel schema) to the Notification schema. This 
		way a user that follows another would get a notification whenever a new review 
		summary or score was added to the database. The same could be implemented 
		whenever a followed user adds a new movie with a person that is followed by the user.
		*/

		// let user = User.findById(request.user._id).populate('followers').exec();
		// let newNotification = {
		// 	username: request.user.username
		// }

		// for(const follower of user.followers) {
		// 	let notification = Notification.create(newNotification);
		// 	follower.notifications.push(notification);
		// 	follower.save();
		// }

		// if(err){
		// 	console.log(" failed");
		// 	throw err;
		// }

	if(request.body.reviews === ''){
		return response.redirect('/enterCorrectNum');
	}
	Movie.findByIdAndUpdate(currentMovieId,{$push: {Reviews: request.body.reviews}}, {new: true}, (err,update)=>{
		if(err){
			console.log(" failed");
			throw err;
		}
		console.log("good");
	});
	User.findByIdAndUpdate(currentUserId, {$push: {userReviews: request.body.reviews}}, {new: true}, (err,update)=>{
		console.log("good");
	})
	response.redirect('/movies/' + currentMovieId);
});


//add score to a movie
app.post('/addRating/:id', (request, response)=>{
	if((request.body.score < 1)||(request.body.score > 10)){
		return response.redirect('/enterCorrectNum');
	}
	var currentMovieId = request.params.id;
	var curScore;
	var tally = 0;
	var total = 0;
	var count = 0;
	Movie.findByIdAndUpdate(currentMovieId, {$push: {Score: request.body.score}}, {new: true}, (err, update)=>{
		if(err){
			console.log(" failed");
			throw err;
		}
		curScore = update.Score;
		console.log(update.Score[0]);
		for(var i = 0; i<curScore.length; ++i){
			tally += curScore[i];
			count++;
		}
		total = tally/count;
		console.log(total);
    Movie.findByIdAndUpdate(currentMovieId, {$set: {AvgRate: total}}, {new: true}, (err, update)=>{
				if(err){
					console.log(" failed");
					throw err;
				}
				response.redirect('/movies/' + currentMovieId);
		});
	});
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUESTS FOR DISPLAYING THE LISTS OF OBJECTS


//request for the list of users
app.get("/userList", authenticated, function (req, res) {
	User.find({}, (err, users) => {
    res.status(200);
    res.send(
      pug.renderFile("./views/userList.pug",{user: users})
    );
  });
});


//request for the list of genres
app.get("/genreList", function (req, res) {
	//Used for the search function to check if what the user input in the search bar is in the database
	//Then it will filter and return the values searched for.
	/*
	Our search implementation includes the first 10 search results, but only on the first page. This 
	would be improved by allowing the following 10 results to be displayed on each proceeding page. 
	The way its currently implemented, pagination will allow for a maximum of 10 searches, but the 
	search does not get transferred onto the next pages.
	*/
	const pagination = 10;
	const page = 1;

	if (req.query.search) {
		const regex = new RegExp(searchQuery(req.query.search), 'gi');
		Movie.find({ "Genre": regex}, (err, genre) => {
			if (err) {
				console.log(err)
			} else {
			res.send(
				pug.renderFile("./views/genreList.pug",{movies: genre})
			);
			}
		})

		.skip((page - 1) * pagination)
		.limit(pagination)
	} else {
		//If there are no values searched for, the full list will be returned.
		//Or if not searching, gets the actor information saved on the database and
		//renders it to the peopleList page.
		Movie.find({}, (err, genre) => {
			res.send(
				pug.renderFile("./views/genreList.pug",{movies: genre})
			);
		});
	}
});

//request for the list of people
app.get("/peopleList", function (req, res) {
	//Used for the search function to check if what the user input in the search bar is in the database
	//Then it will filter and return the values searched for.

	const pagination = 10;
	const page = 1;

	if (req.query.search) {
		const regex = new RegExp(searchQuery(req.query.search), 'gi');
		Person.find({ "name": regex}, (err, people) => {
			if (err) {
				console.log(err)
			} else {
			res.send(
				pug.renderFile("./views/peopleList.pug",{person: people})
			);
			}
		})
		
		.skip((page - 1) * pagination)
		.limit(pagination)
	} else {
		//If there are no values searched for, the full list will be returned.
		//Or if not searching, gets the actor information saved on the database and
		//renders it to the peopleList page.
		Person.find({}, (err, people) => {
			res.send(
				pug.renderFile("./views/peopleList.pug",{person: people})
			);
		});
	}
});


//request for the list of movies
app.get("/movieList", function (req, res) {
	//Used for the search function to check if what the user input in the search bar is in the database
	//Then it will filter and return the values searched for.
	const pagination = 10;
	const page = 1;

	if (req.query.search) {
		const regex = new RegExp(searchQuery(req.query.search), 'gi');
		Movie.find({ "Title": regex}, (err, movie) => {
			if (err) {
				console.log(err)
			} else {
			res.send(
				pug.renderFile("./views/movieList.pug",{movies: movie})
			);
			}
		})

		.skip((page - 1) * pagination)
		.limit(pagination)
	} else {
		//If there are no values searched for, the full list will be returned.
		//Or if not searching, gets the actor information saved on the database and
		//renders it to the peopleList page.
		Movie.find({}, (err, movie) => {
			res.send(
				pug.renderFile("./views/movieList.pug",{movies: movie})
			);
		});
	}
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//AUTHENTICATION REQUESTS


//authenticates login
app.post('/login', notAuthenticated, passport.authenticate('local', {
	successRedirect: '/userList',
	failureRedirect: '/login',
	failureFlash: true
}))


//login function to authenticate a user once signed in.
//If they are not signed in, it sends them to the login page
function authenticated(req, res, next) {
	if (req.isAuthenticated()) {
	  return next()
	}

	res.redirect('/login')
}


//authentication function to check if the user is signed in.
//If they are signed in, it'll send the user to the homepage if they try to go to the login or register page.
//Until they logout again
function notAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
	  return res.redirect('/')
	}
	next()
}


//authenticates by user role
function authRole(req, res, next){
		User.findById(req._passport.session.user,function(err,u){
			if(err){
				res.status(404).send("Error");
			}
			if(u.role !== "cont"){
				return res.redirect('/switchUser');
			}
			next();
		});
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GENERATING OBJECTS


//generates 5 recommended movies for user
function genRec(req, res, next){
	const currentUserId = req._passport.session.user;
	Movie.aggregate([{ $sample: { size: 5 } }],function(err,result){
		if(err){
			console.log(" failed");
			throw err;
		}
		console.log(result.Title);
		User.findByIdAndUpdate(currentUserId,{$set: {recommended: [] }}, {new: true}, (err, update)=>{
			if(err){
				conosle.log(" failed");
				throw err;
			}
			console.log("success");
		});
		User.findByIdAndUpdate(currentUserId,{$push: {recommended: result}}, {new: true}, (err, updatedUser) => {
			if(err){
				console.log(" failed");
				throw err;
			}
			console.log("success");
			next();
		});
	});
}


//generates 3 similar movies for movie
function genSim(req, res, next){
	const targetId = req.params.id;
	Movie.aggregate([{ $sample: {size: 3} }],function(err, result){
		if(err){
			console.log(" failed");
			throw err;
		}
		Movie.findByIdAndUpdate(targetId,{$set: {Similar: [] }}, {new: true}, (err, update)=>{
			if(err){
				console.log(" failed");
				throw err;
			}
			console.log("success");
		});
		Movie.findByIdAndUpdate(targetId,{$push: {Similar: result}}, {new: true}, (err, updatedUser) => {
			if(err){
				console.log(" failed");
				throw err;
			}
			console.log("success");
			next();
		});
	});
}


//generate 5 freq collab
function genCollab(req, res, next){
	const targetId = req.params.id;
	User.aggregate([{$sample: {size:5}}],function(err,result){
		if(err){
			console.log(" failed");
			throw err;
		}
		Person.findByIdAndUpdate(targetId,{$set: {Collab: [] }}, {new: true}, (err, update)=>{
			if(err){
				conosle.log(" failed");
				throw err;
			}
			console.log("success");
		});
		Person.findByIdAndUpdate(targetId,{$push: {Collab: result}}, {new: true}, (err, updatedUser) => {
			if(err){
				console.log(" failed");
				throw err;
			}
			console.log("success");
			next();
		});
	});
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








//request for the client js
app.get("/client.js", function (req, res) {
	res.status(200);
	res.send(
		pug.renderFile("client.js")
	);
});








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//REQUEST FOR ROLE CHANGE


//role change from cont to reg
app.post('/reg/:id', function (req, res) {
	const currentUserId = req._passport.session.user;
	User.findByIdAndUpdate(currentUserId, {role: "reg"},(err, updatedUser) => {
		console.log(updatedUser);
	});
});


//role change from reg to cont
app.post('/cont/:id', function (req, res) {
	const currentUserId = req._passport.session.user;
	User.findByIdAndUpdate(currentUserId, {role: "cont"},(err, updatedUser) => {
		console.log(updatedUser);
	});
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








//This will log the user out.
//Once logged out, they are redirected to the login page
app.delete('/logout', (req, res) => {
	req.logOut()
	res.redirect('/login/')
})








// Connect to db and start server
mongoose.connect("mongodb://localhost/moviedb", (err) => {
  if (err) throw err;

  app.listen(port);
  console.log(`Listening on port ${port}`);
});
