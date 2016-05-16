var router = require('express').Router();
var Promise = require('bluebird');
var models = require('../../models');
var Hotel = models.Hotel;
var Restaurant = models.Restaurant;
var Activity = models.Activity;
var Place = models.Place;
var Day = models.Day;


router.get('/days', function(req, res, next) {
	Day.findAll({
		include: {model: Hotel, include: Place},
		order: [ 'number' ]
	})
	.then(function(days){
		res.json(days);
	});
});

router.get('/days/:id', function(req, res, next) {
});



router.post('/days', function(req, res, next) {
	Day.create({number: req.body.number});
	res.end();
});

router.post('/days/:id/hotel', function(req, res, next) {
	Promise.all([
		Day.find({
			where: {
				number: +req.params.id
			}
		}),
		Hotel.findById(+req.body.selectedOptionId)
	])
	.spread(function(day, hotel){
		console.log(day, hotel);
		day.setHotel(hotel);
	})
	.catch(next);
});

router.post('/days/:id/restaurant', function(req, res, next) {
});

router.post('/days/:id/activity', function(req, res, next) {
});




router.delete('/days/:id/hotel', function(req, res, next) {
});

router.delete('/days/:id/restaurant', function(req, res, next) {
});

router.delete('/days/:id/activity', function(req, res, next) {
});

router.delete('/days/:id', function(req, res, next) {
	Day.findById(req.params.id)
	.then(function(day){
		res.end();
		return day.destroy();
	})
	.catch(next);
});

module.exports = router;
