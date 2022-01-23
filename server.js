require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoDBStore = require('connect-mongodb-session')(session);

const Users = require('./models/index').Users;
const userController = require('./controllers/userController');

const port = process.env.PORT || 3000;

const store = new MongoDBStore(
  {
    uri: `mongodb+srv://administrator:${process.env.MONGO_PASSWORD}@cluster0.hjo5m.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    collection: 'sessions',
    expires: 1000 * 60 * 60, // 1 hour
  },
  error => {
    if (error === undefined) {
      console.log('Connected to the MongoDB session store...');
    } else {
      console.error('Error connecting to the MongoDB session store:', error);
    }
  }
);

store.on('error', error => {
  console.error('There was an error with the MongoDB session store:', error);
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    (username, password, done) => {
      // async/await?
      Users.findOne({ email: username }, (error, user) => {
        if (error) {
          return done(error);
        }
        if (!user) {
          return done(null, false, {
            message: 'The provided sign-in credentials are invalid.',
          });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, {
            message: 'The provided sign-in credentials are invalid.',
          });
        }
        return done(null, user);
      });
    }
  )
);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: 'falcon.sid',
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/users', require('./routes/userRouter'));

app.get('/', (req, res) => {
  console.log('Current session:', JSON.stringify(req.session));
  res.status(200).send('Falcon Investments server is live.');
});

app.post('/signup', (req, res, next) => {
  userController.addUser;
});

app.post('/signin', passport.authenticate('local'), (req, res) => {
  console.log('Current session:', JSON.stringify(req.session));
  res.status(200).send('You are now logged in.');
});

app.post('/signout', (req, res, next) => {
  if (req.session) {
    req.logout();
    req.session.destroy(error => {
      if (error) {
        console.error('There was an error signing out:', error);
      } else {
        res.clearCookie('falcon.sid');
        res.status(200).send('You have been signed out.');
      }
    });
  } else {
    // next(error);
    res.status(400).send('No user is logged in.');
  }
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}...`);
});
