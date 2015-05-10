var error   = require('../error')
var router  = require('express').Router()
var without = require('lodash-node/modern/arrays/without')
var User    = require('../models/User')

/**
 * Get corresponding user for the requested profile
 */
router.param('user', function(req, res, next, name) {
  User.findOne({ username: name }, function(err, user) {
    if(err)
      return next(err)
    else if(!user)
      return next('route')

    req.profile = user
    next()
  })
})

/**
 * GET /:user
 * Profile page
 */
router.get('/:user', function(req, res, next) {
  res.render('account/profile', {
    title: req.profile.username,
    profile: req.profile,
    customJs: 'profile'
  })
})

/**
 * POST /:user
 * Update profile page
 */
router.post('/:user', function(req, res, next) {
  var user = req.user
  var data = req.body

  if(!user || user.username !== req.profile.username)
    return next(new error.Unauthorized)

  user.bio.source = data.profile.bio

  user.save(function(err) {
    if(err)
      return res.handleMongooseError(err, next)

    res.returnWith('success', req.app.config.profile.bio.messages.successfullySaved)
  })
})

/**
 * GET /:user/friends
 * List all friends of a user
 */
router.get('/:user/friends', function(req, res, next) {
  var user = req.user

  if(!user || user.username !== req.profile.username)
    return next(new error.NotFound)

  req.profile.populate({
    path: 'friends',
    select: 'username gravatarId teamspeakUid teamspeakLinked teamspeakOnline teamspeakConnections'
  }, function(err, profile) {
    if(err)
      return res.handleMongooseError(err, next)

    res.render('account/friends', {
      title: 'Freunde',
      profile: profile
    })
  })
})

/**
 * POST /:user/befriend
 * Befriend a user
 */
router.post('/:user/befriend', function(req, res, next) {
  var user = req.user

  if(!user || user.username === req.profile.username)
    return next(new error.Unauthorized)
  if(user.friendsWith(req.profile.id))
    return next(new error.Forbidden)

  user.friends.push(req.profile.id)

  user.save(function(err) {
    if(err)
      return res.handleMongooseError(err, next)

    res.returnWith('success', req.app.config.friendship.messages.befriend, { username: req.profile.username }, req.session.returnTo || '/' + req.profile.username)
  })
})

/**
 * POST /:user/unfriend
 * Unfriend a user
 */
router.post('/:user/unfriend', function(req, res, next) {
  var user = req.user

  if(!user || user.username === req.profile.username)
    return next(new error.Unauthorized)
  if(!user.friendsWith(req.profile.id))
    return next(new error.Forbidden)

  user.friends = without(user.friends, req.profile.id)

  user.save(function(err) {
    if(err)
      return res.handleMongooseError(err, next)

    res.returnWith('success', req.app.config.friendship.messages.unfriend, { username: req.profile.username }, req.session.returnTo || '/' + req.profile.username)
  })
})

/**
 * Export the router
 */
module.exports = router