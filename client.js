const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

//function to authenticate a user
function initialize(passport, getUserbyName, getUserById) {
  const authenticateUser = async (username, password, done) => {

    const user = (await getUserbyName(username))[0];
    console.log(user);
    if (user == null) {
      return done(null, false, { message: 'No user with that username'})
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }

  }
  passport.use(new LocalStrategy({ usernameField: 'username'}, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    console.log("id:", id);
    return done(null, getUserById(id));
  })
}





//submit function to save the movie details inputed by the user
function submit() {
  const Title = document.getElementById('moviename').value
  const Year = document.getElementById('year').value
  const Runtime = document.getElementById('runtime').value
  const Released = document.getElementById('release').value
  const Plot = document.getElementById('plot').value
  const Awards = document.getElementById('awards').value
  const requestBody = {
    Title,
    Year,
    Runtime,
    Released,
    Plot,
    Awards,
  }
  console.log(requestBody)
}





//submit function to save the actor details inputed by the user
function submit2(){
  const name = document.getElementById('actorname').value
  const description = document.getElementById('description').value
  const requestBody = {
    name,
    descriptions
  }
}





//submit function to save the review input by user
function submitReview(){
  const rev  = documment.getElementById('review').value
  const requestBody = {
    rev
  }
}





//submit function to save the review input by user
function submitRating(){
  const score = document.getElementById('score').value
  const requestBody = {
    score
  }
}





module.exports = initialize;
