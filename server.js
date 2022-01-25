// require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Superfluous?
const { isLoggedIn, signUserIn, signUserOut } = require('./auth/auth');
const MongoDBStore = require('connect-mongodb-session')(session);

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

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: 'falcon.sid',
    cookie: {
      secure: true, // Need to change between dev and prod
      maxAge: 1000 * 60 * 60, // 1 hour
    },
    store: store,
    resave: true,
    saveUninitialized: false,
  })
);

app.use('/users', require('./routes/userRouter'));

// POST request is being redirected here and failing the GET expectation
// app.get('/', (req, res) => {
app.all('/', (req, res) => {
  res.status(200).send('Falcon Investments server is live.');
});

// POST request is being redirected here and failing the GET expectation
// app.get('/user-dashboard', isLoggedIn, (req, res) => {
app.all('/user-dashboard', isLoggedIn, (req, res) => {
  res.status(200).send('You should only see this page if you are logged in.');
});

app.post('/signup', (req, res, next) => {
  userController.addUser(req, res);
});

app.post('/signin', signUserIn, (req, res) => {
  if (req.session.userId) {
    res.redirect('/user-dashboard');
  } else {
    res.status(500).send('This error should never be reached');
  }
});

app.post('/signout', signUserOut, (req, res, next) => {
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}...`);
});
