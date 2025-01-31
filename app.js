if(process.env.NODE_ENV !== 'production'){ //開発環境の場合に実行
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const { name } = require('ejs')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

const MongoStore = require('connect-mongo');

mongoose.connect(dbUrl)
    .then( () => {
        console.log('MnogoDBコネクションOK!!');
    })
    .catch( err => {
        console.log('MongoDBコネクションエラー!!!');
        console.log(err);
    })

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
 //app.jsを基準としたviewsを使用するようにする
app.set('views', path.join(__dirname, 'views'))

//フォームから送信されたデータをパースして取得するための設定
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_',
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  // 24時間ごとにセッションを更新
    crypto: {
        secret: secret
    }
});

store.on('error', e => {
    console.log('セッションストアエラー', e)
})

const sessionConfig = {
    store,
    name : 'session',
    secret : secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())) //passport-local-mongooseを使っている場合は、User.authenticate()を使う
passport.serializeUser(User.serializeUser()) //ユーザー情報をセッションに保存
passport.deserializeUser(User.deserializeUser()) //ユーザー情報をセッションから取り出す

app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));


app.use((req,res,next) => {
    res.locals.currentUser = req.user //req.userはpassportが自動的に設定してくれる
    res.locals.success = req.flash('success') //res.locals.~ あるリクエストのライフサイクル中でのみ利用可能
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res)=>{
    res.render('home')
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.all('*', (req,res,next) => {
    next(new ExpressError('ページが見つかりません', 404))
})

app.use((err,req,res,next) => {
    const { statusCode = 500} = err
    if(!err.message){
        err.message = '問題が発生しました'
    }
    res.status(statusCode).render('err', { err })
})

const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`ポート${port}でリクエスト受付中...`)
})