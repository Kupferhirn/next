var _ = require('lodash')
var Promise = require('bluebird')
var Queue = require('bull')
var config = require('../../../config')
var utils = require('../../../utils')

var groupQueue = Queue('yodel:groups')
var ranks = _(config.teamspeak.ranksToGroups).values().map(_.parseInt).value()

module.exports = function(userSchema) {
  userSchema.pre('save', function(next) {
    if(this.rank >= 1 || (!this.isModified('teamspeakUid') && !this.isModified('emailVerified')))
      return next()

    if(this.teamspeakUid && this.emailVerified) {
      this.rank = 1
    }

    next()
  })

  userSchema.pre('save', function(next) {
    if(!this.isModified('teamspeakUid') && !this.isModified('rank'))
      return next()

    var done = []

    if(this.isModified('teamspeakUid')) {
      var oldId = this._clean.get('teamspeakUid')

      if(oldId) {
        done.push(groupQueue.add({ id: oldId, remove: '*' }))
      }
    }

    if(this.teamspeakUid) {
      var groupId = utils.rankToTsGroupId(this.rank)
      var removeGroups = _.without(ranks, groupId)

      done.push(groupQueue.add({ id: this.teamspeakUid, add: groupId, remove: removeGroups }))
    }

    Promise.all(done).then(function() {
      next()
    }).catch(function(err) {
      next(err)
    })
  })

  userSchema.pre('save', function(next) {
    if(!this.isModified('rank'))
      return next()

    console.log('Rank changed for', this.username, 'old:', this._clean.get('rank'), 'new:', this.rank)

    if(this._clean.get('rank') > this.rank) {
      this.showRankNotice = false
    } else {
      this.showRankNotice = true
    }

    next()
  })
}