var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Bar = new Schema({
  bar_id: String,
  users: [],
});

module.exports = mongoose.model('Bar', Bar);
