// require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const verifyUser = require('./auth/auth');
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

app.get('/', (req, res) => {
  res.status(200).send('Falcon Investments server is live.');
});

app.get('/user-dashboard', verifyUser, (req, res) => {
  res
    .status(200)
    .send('You should only see this page if you are logged in and redirected.');
});

app.post('/signup', (req, res, next) => {
  userController.addUser(req, res);
});

app.post('/signin', verifyUser, (req, res) => {
  res.status(200).send({ message: 'You are now logged in.' });
});

app.post('/signout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        console.error('There was an error signing out:', error);
        res.status(500).send('There was an error signing out.');
      } else {
        res.clearCookie('falcon.sid');
        res.redirect('/');
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
