var router = require('express').Router();
var Promise = require('bluebird');
var models = require('../../models');
var Hotel = models.Hotel;
var Restaurant = models.Restaurant;
var Activity = models.Activity;
var Place = models.Place;



router.get('/hotels', function(req, res, next) {
    Hotel.findAll({ include: Place })
        .then(function(hotels) {
            res.json(hotels);
        })
        .catch(next);

    // same as above
    // .catch(function(error) {
    // 	next(error);
    // });
});

router.get('/restaurants', function(req, res, next) {
    Restaurant.findAll({ include: Place })
        .then(function(restaurants) {
            res.json(restaurants);
        })
        .catch(next);
});

router.get('/activities', function(req, res, next) {
    Activity.findAll({ include: Place })
        .then(function(activities) {
            res.json(activities);
        })
        .catch(next);
});

module.exports = router;


