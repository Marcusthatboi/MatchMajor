/**
 * Central export point for all Mongoose models
 * This file aggregates all models and makes them easily accessible throughout the application
 */

const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const Cart = require('./Cart');
const Survey = require('./Survey');
const Chatroom = require('./Chatroom');
const Message = require('./Message');
const Post = require('./Post');

module.exports = {
  User,
  Product,
  Order,
  Cart,
  Survey,
  Chatroom,
  Message,
  Post
};
