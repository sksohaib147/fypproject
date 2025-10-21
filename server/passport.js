const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.OAUTH_CALLBACK_URL}/google`,
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ email: profile.emails[0].value });
  if (!user) {
    user = await User.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      password: Math.random().toString(36).slice(-8), // random password
      phone: 'N/A'
    });
  }
  return done(null, user);
}));

module.exports = passport; 