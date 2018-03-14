'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const XiFuSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    sid: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  return mongoose.model('Xifu', XiFuSchema);
};
