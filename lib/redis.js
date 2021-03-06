var _       = require('lodash')
var config  = require('./config')
var Promise = require('bluebird')
var redis   = require('redis')
var client  = exports.$ = redis.createClient(config.redis.port, config.redis.host)
var prefix  = exports.prefix = config.redis.prefix

exports.getSessionById = function(id) {
  return new Promise(function(resolve, reject) {
    client.get(prefix + 'sess:' + id, function(err, data) {
      if(err)
        return reject(err)
      if(!data)
        return resolve()

      data = data.toString()

      try {
        data = JSON.parse(data)
      } catch(err) {
        return reject(err)
      }

      resolve(data)
    })
  })
}

exports.deleteSessionsById = function(sessions) {
  return new Promise(function(resolve, reject) {
    if(!sessions || !sessions.length)
      return resolve()

    client.del(_.map(sessions, function(sess) {
      return prefix + 'sess:' + sess
    }), function(err) {
      if(err)
        return reject(err)

      resolve()
    })
  })
}

exports.getOnlineTeamSpeakUsers = function() {
  return new Promise(function(resolve, reject) {
    client.smembers('YDL:online', function(err, replies) {
      if(err)
        return reject(err)

      return resolve(replies)
    })
  })
}