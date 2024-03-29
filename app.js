const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require('multer');

const indexRouter = require('./routes/index');
const storyRouter = require('./routes/stories');
const { loggedIn, loggedOut } = require('./utils')
const users = require('./controllers/users');
const massUpload = require('./controllers/massUpload');

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, "./public");
  },
  filename: (req, file, callback) => {
      callback(null, 'userUploadedjson.json');
  }
});
const upload = multer({
  storage: storage
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/li', loggedIn , (req, res) => res.send(req.username));

app.get('/lo', loggedOut , (req, res) => res.send("user logged out"));

app.get('/register', (req, res) => res.render('register.ejs'));

app.post('/register', users.register);

app.get('/login', (req, res) => res.render('login.ejs'));

app.post('/login', users.login);

app.get('/logout', (req, res) => res.cookie('token', '', { httpOnly: true }).redirect('/'));

app.get('/massUpload', (req, res) => res.render('massUpload.ejs'));
app.post('/massUpload', upload.single('jsonfile'), massUpload.massUpload);

app.use('/', indexRouter);
app.use('/stories', storyRouter);


// catch 404 and forward to error handler
app.use((req, res) => res.redirect('/'));

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500)
    .render('error');
});





module.exports = app;
