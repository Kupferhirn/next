var _      = require('lodash')
var crypto = require('crypto')
var url    = require('url')
var config = require('./config')
var moment = require('moment')

var rankImages = _.mapValues(config.ranks, _.kebabCase)

exports.isValidObjectId = function(id) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

exports.isMobileUserAgent = function(userAgent) {
  if(!_.isString(userAgent))
    return false

  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4))
}

exports.isTabletUserAgent = function(userAgent) {
  if(!_.isString(userAgent))
    return false

  return /android|ipad|playbook|silk/i.test(userAgent)
}

exports.isValidUrl = function(url) {
  return /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i.test(url)
}

exports.createSha1Hmac = function createSha1Hmac(value, key) {
  if(!value || !key)
    return false

  var hmac = crypto.createHmac('sha1', key)

  hmac.setEncoding('hex')
  hmac.write(value)
  hmac.end()

  return hmac.read()
}

exports.md5 = function md5(input) {
  return crypto.createHash('md5').update(input).digest('hex').toString()
}

exports.convertToCamoUrl = function(url) {
  if(!config.camo.key || !exports.isValidUrl(url))
    return false

  var hmac = exports.createSha1Hmac(url, config.camo.key)

  return config.camo.url + '/' + hmac + '/' + Buffer.from(url).toString('hex')
}

exports.resolveUrl = function(base, target) {
  if(!/\/$/.test(base))
    base = base + '/'

  return url.resolve(base, target).replace(/\/$/, '')
}

exports.isPlainObject = _.isPlainObject

exports.msToHumanReadable = function(ms) {
  var duration = moment.duration(ms)
  var readable = []

  _.each([
    ['years', 'Jahr', 'Jahre'],
    ['months', 'Monat', 'Monate'],
    ['days', 'Tag', 'Tage'],
    ['hours', 'Stunde', 'Stunden'],
    ['minutes', 'Minute', 'Minuten'],
    ['seconds', 'Sekunde', 'Sekunden']
  ], function(arr, index, all) {
    var val = duration.get(arr[0])

    if(val) {
      readable.push(val + ' ' + (val > 1 ? arr[2] : arr[1]))
    }
  })

  var last = ' und ' + readable.pop()

  return readable.join(', ') + last
}

exports.avatarElement = function(user, size, additionalClasses) {
  var classes = []

  if(additionalClasses) {
    classes.push(additionalClasses)
  }

  if(user.avatar.type === 'default') {
    classes.push('img-pixelated')
  }

  return '<img' + (classes.length ? ' class="' + classes.join(' ') + '"' : '') + ' src="' + user.avatarUrl(size) + '" alt="' + user.username + '">'
}

exports.getPageTitle = function(title) {
  return title === 'Gamekeller' ? 'Gamekeller' : title + ' · Gamekeller'
}

exports.buildSchemaValidator = function(path, msg, fn, async) {
  return {
    message: msg,
    isAsync: true,
    validator: function(value, next) {
      if(this.isModified && !this.isModified(path))
        return next()

      if(async)
        fn.apply(this, arguments)
      else
        next(fn.call(this, value))
    }
  }
}

exports.rankToTsGroupId = function(rankValue) {
  return config.teamspeak.ranksToGroups[rankValue]
}

exports.verifyTeamspeakLinkRequest = function(id, digest) {
  if(!id || id.length % 2 !== 0 || !/[0-9a-f]/.test(id) || !digest || !/[0-9a-f]/.test(digest))
    return false

  var id = Buffer.from(id, 'hex').toString()
  var realDigest = exports.createSha1Hmac(id, config.teamspeak.link.key)

  return realDigest === digest ? id : false
}

exports.getRankIcon = function(rankValue) {
  return rankValue !== undefined && config.ranks[rankValue] ? 'img/ranks/' + rankImages[rankValue] + '.png' : null
}

exports.getRankName = function(rankValue) {
  return rankValue !== undefined && config.ranks[rankValue] ? config.ranks[rankValue] : null
}

exports.getNextRank = function(rankValue) {
  var index = _.indexOf(config.rankProgression, rankValue)

  return index >= 0 && config.rankProgression[index + 1] ? config.rankProgression[index + 1] : false
}

exports.getXpNeededForLevel = function(level) {
  return config.xp.levelXpKey[level - 1] ? config.xp.levelXpKey[level - 1] : _.last(config.xp.levelXpKey)
}