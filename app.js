const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const storyRouter = require('./routes/stories');
const { logged_in, logged_out } = require('./utils')
const users = require('./controllers/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/li', logged_in , (req, res) => res.send(req.username));

app.get('/lo', logged_out , (req, res) => res.send("user logged out"));

app.get('/register', (req, res) => res.render('register.ejs'));

app.post('/register', users.register);

app.get('/login', (req, res) => res.render('login.ejs'));

app.post('/login', users.login);

app.get('/logout', (req, res) => res.cookie('token', '', { httpOnly: true }).redirect('/'));

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
