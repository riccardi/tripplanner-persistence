var db = require('./_db');

var Hotel = require('./hotel')(db);
var Restaurant = require('./restaurant')(db);
var Activity = require('./activity')(db);
var Place = require('./place')(db);
var Day = require('./day')(db);
var Sequelize = require('sequelize'); 


Hotel.belongsTo(Place);
Restaurant.belongsTo(Place);
Activity.belongsTo(Place);
Day.belongsTo(Hotel);

RestaurantDay = db.define('restaurant_day', {
	role: Sequelize.STRING
});

Restaurant.belongsToMany(Day, {through: RestaurantDay});
Day.belongsToMany(Restaurant, {through: RestaurantDay});


ActivityDay = db.define('activity_day', {
	role: Sequelize.STRING
});

Activity.belongsToMany(Day, {through: ActivityDay});
Day.belongsToMany(Activity, {through: ActivityDay});


module.exports = {
  db: db, 
  Place: Place, 
  Hotel: Hotel, 
  Activity: Activity, 
  Restaurant: Restaurant,
  Day: Day
} 
