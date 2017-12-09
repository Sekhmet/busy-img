const cloudinary = require('cloudinary');
const express = require('express');
const request = require('request');
const limiter = require('limiter');
const multipart = require('connect-multiparty');
const debug = require('debug')('busy-img');
const redis = require('redis');
const { getAvatarURL } = require('../helpers');

/**
 * Configuration
 */
const EXPIRY_TIME = 5 * 60;
const defaultAvatarTag = 'U5ds8wePoj1V1DoRR4bzzKUARNiywjp';

const redisClient = redis.createClient(process.env.REDISCLOUD_URL);
redisClient.on('error', function (err) {
  console.error('RedisError', err);
});

const multipartMiddleware = multipart();
// 2000 calls an hour because we're on the Bronze plan, usually would be 500
const cloudinaryRateLimiter = new limiter.RateLimiter(2000, 'hour');
const router = express.Router();

const saveAvatar = (key, val) => redisClient.setex(key, EXPIRY_TIME, val);

router.get('/@:username', async (req, res) => {
  const username = req.params.username;
  const width = req.query.width || req.query.w || req.query.size || req.query.s || 128;
  const height = req.query.height || req.query.h || req.query.size || req.query.s || 128;
  const small = req.query.small || 0;

  const useSmallImage = small != 0 || width <= 64 || height <= 64; 

  let usernameKey;
  let requestURL;
  if (useSmallImage) {
    requestURL = `https://steemitimages.com/u/${username}/avatar/small`;
    usernameKey = `@avatar-small/${username}`;
  } else {
    requestURL = `https://steemitimages.com/u/${username}/avatar`;
    usernameKey = `@avatar/${username}`;
  }

  const defaultAvatar = getAvatarURL(username, useSmallImage);

  redisClient.get(usernameKey, (err, reply) => {
    if (reply) res.redirect(reply);
    else {
      request.head({
        url: requestURL,
        timeout: 2500,
      }, (err, response) => {
        if (err) {
          saveAvatar(usernameKey, defaultAvatar);
          return res.redirect(defaultAvatar);
        }

        const url = response.request.uri.href;
        if (url.indexOf(defaultAvatarTag) !== -1) {
          saveAvatar(usernameKey, defaultAvatar);
          return res.redirect(defaultAvatar);
        }

        saveAvatar(usernameKey, url);
        res.redirect(url);
      });
    }
  });
});

router.post('/@:username', multipartMiddleware, (req, res, next) => {
  const username = req.params.username;
  const file = req.files;
  const path = file[Object.keys(file)[0]].path;
  cloudinary.uploader.upload(path, (result) => {
    res.json({ url: result.url });
  }, {
      public_id: '@' + username,
      tags: [
        '@' + username,
        'profile_image'
      ]
    });
  delete req.files;
});

router.post('/@:username/cover', multipartMiddleware, (req, res, next) => {
  const username = req.params.username;
  const file = req.files;
  const path = file[Object.keys(file)[0]].path;
  cloudinary.uploader.upload(path, (result) => {
    res.json({ url: result.url });
  }, {
      public_id: '@' + username + '/cover',
      tags: [
        '@' + username,
        'cover_image'
      ]
    });
  delete req.files;
});

/*!
 * POST /@:username/uploads
 *
 * Uploads a file to cloudinary and responds with the result. Requires one
 * multipart form file field
 */

router.post('/@:username/uploads', multipartMiddleware, (req, res, next) => {
  const username = req.params.username;
  const files = req.files;
  const keys = Object.keys(files);

  if (!keys[0]) {
    const err = new Error('Missing a file parameter');
    err.status = 422;
    return next(err);
  }

  const path = files[keys[0]].path;
  cloudinary.uploader.upload(path, (result) => {
    res.status(201);
    res.json(result);
  }, {
      tags: [
        '@' + username,
        'general-upload'
      ]
    });
});

/*!
 * GET /@:username/uploads
 *
 * Gets an user's uploads by querying cloudinary for its tag
 */

router.get('/@:username/uploads', (req, res, next) => {
  const username = req.params.username;
  cloudinaryRateLimiter.removeTokens(1, () => {
    // ^^ Error isn't relevant here, see
    // https://www.npmjs.com/package/limiter#usage
    cloudinary.api.resources_by_tag('@' + username, (result) => {
      res.json(result.resources);
    });
  });
});

module.exports = router;
