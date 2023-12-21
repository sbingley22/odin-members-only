const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = mongoose.model(
  "Message",
  new Schema({
    user: { type: String, required: true },
    date: { type: Date, required: true },
    text: { type: String, required: true },
  })
);

module.exports =  Message