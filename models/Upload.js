const mongoose = require('mongoose')
const _ = require('lodash')

const javascriptTimeAgo = require('javascript-time-ago')
javascriptTimeAgo.locale(require('javascript-time-ago/locales/en'))
require('javascript-time-ago/intl-messageformat-global')
require('intl-messageformat/dist/locale-data/en')
const timeAgoEnglish = new javascriptTimeAgo('en-US')

const uploadSchema = new mongoose.Schema({
  title: String,
  description: String,
  originalFileName: String,
  fileExtension: String,

  uploadServer: { type: String, enum: ['uploads1', 'uploads3'] },

  hostUrl: String, // (backblaze prepend)  TODO: can eventually delete this
  // uniqueTag: { type: String, index: true, unique: true },
  uniqueTag: { type: String, index: true, unique: true },
  fileType: { type: String, enum: ['video', 'image', 'audio', 'unknown', 'convert'] },
  fileSize: Number,
  views: {
    type: Number,
    default: 0
  },
  visibility: { type: String, enum: ['public', 'unlisted', 'private', 'removed', 'pending'], default: 'public' },
  thumbnailUrl: 'String',  // TODO: can eventually delete this
  customThumbnailUrl: 'String', // TODO: can eventually delete this
  uploadUrl: 'String',
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  checkedViews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'View',
    default: []
  }],

  reacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'React',
    default: []
  }],

  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],

  youTubeData: mongoose.Schema.Types.Mixed,

  status: String,
  sensitive: {
    type: Boolean,
    default: false
  },

  rating: { type: String, enum: ['allAges', 'mature', 'sensitive'] },

  thumbnails: {
    generated: 'String',
    custom: 'String',
    medium: 'String',
    large: 'String'
  },

  quality: {
    high: Number
  },

  livestreamDate: {
    type: String
  },

  uncurated: {
    type: Boolean
  },

  moderated: {
    type: Boolean
  },

  category: {
    type: String,
    default: 'uncategorized',
    enum: ['uncategorized', 'healthAndWellness', 'comedy', 'technologyAndScience', 'news', 'politics', 'music', 'gaming', 'howToAndEducation']
  },

  subcategory: {
    type: String, enum: ['pranks', 'meditation', 'yoga', 'rightwing', 'leftwing', 'uncategorized', 'fitness',
      'yogaAndMeditation', 'blockchain', 'internet', 'political']
  }

}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  autoIndex: false
})

const oneHourAmount = 1000 * 60 * 60
const oneDayAmount = 1000 * 60 * 60 * 24

uploadSchema.virtual('uploadServerUrl').get(function () {

  let uploadServerUrl

  if (process.env.NODE_ENV == 'development') {
    uploadServerUrl = '/uploads'
  } else {
    uploadServerUrl = `https://${this.uploadServer}.pew.tube`
  }

  return uploadServerUrl
})

uploadSchema.virtual('thumbnail').get(function () {

  // order of importance: custom, then generated, then medium
  const thumbnail = this.thumbnails.custom || this.thumbnails.generated || this.thumbnails.medium

  return thumbnail
})

uploadSchema.virtual('lessThan1hOld').get(function () {

  const timeDiff = new Date() - this.createdAt
  const timeDiffInH = timeDiff / oneHourAmount

  return timeDiffInH > 1
})

uploadSchema.virtual('lessThan24hOld').get(function () {

  const timeDiff = new Date() - this.createdAt
  const timeDiffInH = timeDiff / oneHourAmount

  return timeDiffInH > 24
})

uploadSchema.virtual('lessThan24hOld').get(function () {

  const timeDiff = new Date() - this.createdAt
  const timeDiffInH = timeDiff / oneHourAmount

  return timeDiffInH > 24
})

uploadSchema.virtual('timeAgo').get(function () {

  return timeAgoEnglish.format(new Date(this.createdAt))
})

uploadSchema.virtual('viewsWithin1hour').get(function () {

  let realViews = _.filter(this.checkedViews, function (view) {
    return view.validity == 'real' && view.createdAt > (new Date() - oneHourAmount)
  })

  return realViews.length
})

uploadSchema.virtual('viewsWithin24hour').get(function () {

  let realViews = _.filter(this.checkedViews, function (view) {
    return view.validity == 'real' && view.createdAt > (new Date() - oneDayAmount)
  })

  return realViews.length
})

uploadSchema.virtual('viewsWithin1week').get(function () {

  let realViews = _.filter(this.checkedViews, function (view) {
    return view.validity == 'real' && view.createdAt > (new Date() - oneDayAmount * 7)
  })

  return realViews.length
})

uploadSchema.virtual('viewsWithin1month').get(function () {

  let realViews = _.filter(this.checkedViews, function (view) {
    return view.validity == 'real'
  })

  return realViews.length
})

uploadSchema.virtual('viewsAllTime').get(function () {

  let realViews = _.filter(this.checkedViews, function (view) {
    return view.validity == 'real' && (new Date() - oneDayAmount * 365)
  })

  return realViews.length
})

uploadSchema.virtual('legitViewAmount').get(function () {

  const realViews = _.filter(this.checkedViews, function (view) {
    return view.validity == 'real'
  })

  let legitViews = this.views + realViews.length

  /** CAP TO 300 WITHIN HOUR **/
  const timeDiff = new Date() - this.createdAt
  const timeDiffInH = timeDiff / (1000 * 60 * 60)

  // cap views to 300
  if (timeDiffInH < 24 && legitViews > 300) {
    return 300
  }

  return legitViews
})

uploadSchema.index({ sensitive: 1, visibility: 1, status: 1, createdAt: -1, category: 1 }, { name: 'All Media List' })
uploadSchema.index({ sensitive: 1, visibility: 1, status: 1, fileType: 1, createdAt: -1 }, { name: 'File Type List' })
uploadSchema.index({ uploader: 1, visibility: 1, status: 1, createdAt: -1 }, { name: 'Subscription Uploads' })
uploadSchema.index({ uploader: 1, title: 1 }, { name: 'Upload Check' })

const Upload = mongoose.model('Upload', uploadSchema)

module.exports = Upload
