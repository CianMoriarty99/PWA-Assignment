const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const storyRouter = require('./routes/stories');
const usersRouter = require('./routes/users');
const {logged_in, logged_out } = require('./utils')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/li', logged_in , (req, res) => {
  res.send(req.username)
})

app.get('/lo', logged_out , (req, res) => {
  res.send("user logged out")
})

app.post('/login', async (req, res) => { //logged_out
  const username = req.body.username;
  const password = req.body.password;
  console.log(username, password)
  const user = await User.verify(username, password);//cannot read property 'verify' of undefined
  if (!user) {
      console.log('no pass match');
      res.status(401).send('no password match');
      return;
   }
  const token = jwt.sign({ username }, secret, {
       expiresIn: '1h'
  });
  res.cookie('token', token, { httpOnly: true })
  res.redirect('/')
});


app.get('/logout', (req,res) => {
  res.cookie('token', '', { httpOnly: true })
  res.redirect('/')
})

app.use('/', indexRouter);
app.use('/stories', storyRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





module.exports = app;
