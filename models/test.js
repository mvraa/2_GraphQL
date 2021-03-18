const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  test: String,
});

const Games = mongoose.model("games", schema);

Games.createIndexes();

module.exports = Games;