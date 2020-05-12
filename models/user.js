const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  },
  gender: {
    type: Boolean,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  matches: [mongoose.Schema.Types.ObjectID],
  removedmatches: [mongoose.Schema.Types.ObjectID]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
