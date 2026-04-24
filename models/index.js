/**
 * Central export point for all Mongoose models
 * This file aggregates all models and makes them easily accessible throughout the application
 */

const User = require('./User');
const Survey = require('./Survey');
const Chatroom = require('./Chatroom');
const Message = require('./Message');
const Post = require('./Post');
const ChatRequest = require('./ChatRequest');

module.exports = {
  User,
  Survey,
  Chatroom,
  Message,
  Post,
  ChatRequest
};
