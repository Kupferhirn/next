/**
 * Dependencies
 */
var express    = require('express')
var MongoStore = require('connect-mongo')(express)
var st         = require('st')
var flash      = require('express-flash')
var path       = require('path')
var mongoose   = require('mongoose')
var passport   = require('passport')
var validator  = require('express-validator')

/**
 * Load controllers
 */
var homeController    = require('./controllers/home')
var userController    = require('./controllers/user')
var profileController = require('./controllers/profile')
var adminController   = require('./controllers/admin')

/**
 * Configuration
 */
var secrets = require('./config/secrets')
var pass    = require('./config/passport')
var mincer  = require('./config/mincer')

/**
 * Create Express server
 */
var app = express()

/**
 * Mongoose config
 */
mongoose.connect(secrets.db)
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.')
})

/**
 * Express configuration
 */

// General setup
// --------------------------------
app.set('port', process.env.PORT || 3000)
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(mincer.assets())
app.use(express.compress())
app.use(express.favicon('public/favicon.ico'))
app.use(express.logger('dev'))
app.use(express.cookieParser())
app.use(express.json())
app.use(express.urlencoded())
app.use(validator())
app.use(express.methodOverride())
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  }, function() { console.log('✔ Session store connection established') })
}))
app.use(express.csrf())

// Passport
// --------------------------------
app.use(passport.initialize())
app.use(passport.session())

// Locals
// --------------------------------
app.use(function(req, res, next) {
  res.locals.user = req.user
  res.locals.token = req.csrfToken()

  // Navigation items
  var nav = []

  if(req.user) {
    if(req.user.admin)
      nav.push({ href: '/admin', name: 'Admin Page' })

    nav.push(
      { href: '/account', name: 'Account' },
      { href: '/logout', name: 'Log Out' }
    )
  } else
    nav.push(
      { href: '/signup', name: 'Sign Up' },
      { href: '/login', name: 'Login' }
    )

  res.locals.navItems = nav

  return next()
})

// Flash messages
// --------------------------------
app.use(flash())

// Asset configuration
// --------------------------------
app.configure('production', function() {
  app.use(st({
    path: path.join(__dirname, 'public/assets'),
    url: '/assets'
  }))
})

app.configure('development', function() {
  app.use('/assets', mincer.createServer())
})

// Router
// --------------------------------

// Keep track of previous URL
app.use(function(req, res, next) {
  if(req.method !== 'GET')
    return next()

  if(/(login|logout|signup)$/.test(req.path.split('/')[1]))
    return next()

  req.session.returnTo = req.path
  next()
})

// Router
app.use(app.router)

// 404
app.use(function(req, res) {
  res.status(404)
  res.render('404')
})

// Last stop: default error handler
app.use(express.errorHandler())

/**
 * Routes
 */
app.get('/', homeController.index)
app.get('/login', userController.getLogin)
app.post('/login', userController.postLogin)
app.get('/logout', userController.getLogout)
app.get('/signup', userController.getSignup)
app.post('/signup', userController.postSignup)
app.get('/account', pass.ensureAuthenticated, userController.getAccount)
app.get('/@:user', profileController.getProfile)
app.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin(), adminController.getAdmin)

/**
 * Start the server
 */
app.listen(app.get('port'), function() {
  console.log('✔ Express server listening on port %d in %s mode', app.get('port'), app.settings.env)
})