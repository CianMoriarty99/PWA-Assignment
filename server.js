require('dotenv').config()
 
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')



const initializePassport = require('./passport-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)


app.set('view-engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static("public"));

const posts = [
    {
        username: 'Kyle',
        title: 'post 1'
    },
    {
        username: 'Jim',
        title: 'post 2'
    }
]

const users = []


app.get('/', authenticateToken,(req, res) => {
    //console.log(req)
    console.log(req.username)
    res.json(posts.filter(posts => posts.username === req.username))//checkAuthenticated
})



app.post('/login', (req,res) =>{
    
    const username = req.body.username
    console.log(`body: ${Object.keys(req.body)}`);
    const accessToken = jwt.sign(
        { username }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '1h' }
    )
    //console.log(accessToken + "1")
    res.cookie('accessToken', accessToken, { httpOnly: true }) // passport.authenticate ('local', { failureRedirect: '/login', failureFlash: true})
        .json({ accessToken: accessToken })
})

app.get('/login', (req,res) =>{

    res.render('login.ejs')
})

app.get('/logout', (req, res) => {
    res.clearCookie('accessToken')
        .send('successfully logged out');
})


app.get('/register', checkNotAuthenticated, (req,res) =>{
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req,res) =>{

    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            password: hashedPassword

        })
        res.cookie()
            .json({ message: 'done!' });
    }catch{
        res.status(400)
            .json({ reason: 'mystery failure???' });
    }
    console.log(users)
});

async function authenticateToken(req, res, next){

    const auth = req.cookies.accessToken;
    console.log(`auth:  ${auth}`)
    const token = auth 

    
    console.log(token);

    if (!token) return res.sendStatus(401);

    try {
        const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('token: ');
        console.log(verify);
        req.username = verify.username;
        console.log("great success");
        next();
    }
    catch (err) {
        console.log("no success");
        res.status(400).json({ error: 'token invalid or expired' });
    }
}

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})
  
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)