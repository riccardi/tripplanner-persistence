$(function initializeMap() {

    var graceHopperAcademy = new google.maps.LatLng(40.705086, -74.009151);

    var styleArr = [{
        featureType: 'landscape',
        stylers: [{ saturation: -100 }, { lightness: 60 }]
    }, {
        featureType: 'road.local',
        stylers: [{ saturation: -100 }, { lightness: 40 }, { visibility: 'on' }]
    }, {
        featureType: 'transit',
        stylers: [{ saturation: -100 }, { visibility: 'simplified' }]
    }, {
        featureType: 'administrative.province',
        stylers: [{ visibility: 'off' }]
    }, {
        featureType: 'water',
        stylers: [{ visibility: 'on' }, { lightness: 30 }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{ color: '#ef8c25' }, { lightness: 40 }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: 'off' }]
    }, {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{ color: '#b6c54c' }, { lightness: 40 }, { saturation: -40 }]
    }];

    var mapCanvas = document.getElementById('map-canvas');

    var currentMap = new google.maps.Map(mapCanvas, {
        center: graceHopperAcademy,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styleArr
    });

    var iconURLs = {
        hotel: '/images/lodging_0star.png',
        restaurant: '/images/restaurant.png',
        activity: '/images/star-3.png'
    };

    function drawMarker(type, coords) {
        var latLng = new google.maps.LatLng(coords[0], coords[1]);
        var iconURL = iconURLs[type];
        var marker = new google.maps.Marker({
            icon: iconURL,
            position: latLng
        });
        // console.log("drawn marker", marker);
        marker.setMap(currentMap);
        return marker
    }

    //ON INDEX.HTML LOAD
    $.ajax({
            method: 'GET',
            url: '/api/days',
        })
        .done(function(data) {
            console.log(data);
            data.forEach(function(day) {
                console.log(day);
                var curDay = day.number === 1 ? 'current-day' : '';
                var selected = day.number === 1 ? 'selected' : '';

                var hotel = day.hotel !== null ? `<li class=itinerary-item> ${day.hotel.name} <button data-action="deleteFromTrip" class="btn btn-xs btn-danger remove btn-circle">x</button></li>` : '';
                // Draw a marker on the map
                
               
                $("#day-add").before('<button class="btn btn-circle day-btn ' + curDay + '" data-day="' + day.number + '">' + day.number + '</button>');
                $("#itinerary").append(`<section class="day ${selected}" data-index="${day.number}">
                  <div>
                    <h4>My Hotel</h4>
                    <ul class="list-group trip-day-hotels">
                      ${hotel}
                    </ul>
                  </div>
                  <div>
                    <h4>My Restaurants</h4>
                    <ul class="list-group trip-day-restaurants">
                    </ul>
                  </div>
                  <div>
                    <h4>My Activities</h4>
                    <ul class="list-group trip-day-activities">
                    </ul>
                  </div>
                </section>`);
                var hotelLi = $('section[data-index='+day.number+'] .trip-day-hotels li');
                hotelLi.marker = drawMarker('hotel', day.hotel.place.location);
                if(day.number !== 1) hotelLi.marker.setMap(null);
            });
        })
        .fail(function(error) {
            console.error(error);
        });

    function makeOptions(attractionType) {
        var select = $(`#${attractionType}-choices`);
        var attractions = {};
        $.when($.ajax({ method: "GET", url: "/api/hotels" }), $.ajax({ method: "GET", url: "/api/restaurants" }), $.ajax({ method: "GET", url: "/api/activities" }))
            .done(function(hotels, restaurants, activities) {
                attractions.hotel = hotels[0];
                attractions.restaurant = restaurants[0];
                attractions.activity = activities[0];

                attractions[attractionType].forEach(function(attraction) {
                    var option = $(`<option value="${attraction.id}">${attraction.name}</option>`)[0];
                    option.attraction = attraction;
                    option.attraction.place.type = attractionType;
                    select.append(option);
                });
            });
    }

    makeOptions('hotel');
    makeOptions('restaurant');
    makeOptions('activity');


    var dayTemplate = `
          <section class="day">
            <div>
              <h4>My Hotel</h4>
              <ul class="list-group trip-day-hotels">

              </ul>
            </div>
            <div>
              <h4>My Restaurants</h4>
              <ul class="list-group trip-day-restaurants">
              </ul>
            </div>
            <div>
              <h4>My Activities</h4>
              <ul class="list-group trip-day-activities">
              </ul>
            </div>            
          </section>
    `;

    $('#day-add').click(function addDay() {
        // Find the index of the last day section
        var lastIndex = $('section.day').last().data('index');
        console.log(lastIndex); // Are you an array?

        var ourIndex = lastIndex + 1;

        // 1. Create a new day section based off dayTemplate
        var day = $(dayTemplate)

        // Set the index on the section we're adding
        day[0].dataset.index = ourIndex

        // 2. Append it to the #itinerary
        $('#itinerary').append(day)

        // 3. Unselect all days
        $('.day').removeClass('selected')

        // 3a. select the one we just appended.
        $('#itinerary > .day').last().addClass('selected')

        // Create a button with the right number
        var button = $(`<button class="btn btn-circle day-btn current-day" data-day=${ourIndex}>${ourIndex}</button>`)
        $(this).before(button)

        // 5. Deselect all day buttons
        $('.day-buttons > button').removeClass('current-day')

        // 6. Select the one we just added
        button.addClass('current-day')

        //7. Add new day to database
        $.post({
            url: '/api/days',
            data: { "number": ourIndex },
            error: function(err) {
                console.log("!!!!", err);
            }
        });
    });

    $('.day-buttons').on('click', 'button[data-day]', function(event) {
        // Deselect all buttons
        $('.day-buttons > button').removeClass('current-day')

        // Select the button that was clicked
        $(this).addClass('current-day')

        // Deselect all days
        $('.day')
            .removeClass('selected')
            .find('li').each(function(i, li) {
                li.marker.setMap(null)
            })

        // Select the day for the button that was clicked
        $(`.day[data-index="${this.dataset.day}"]`)
            .addClass('selected')
            .find('li')
            .each(function(i, li) {
                li.marker.setMap(currentMap)
            })

        // Update the index display
        $('#day-title-index').text(this.dataset.day)
    });

    $(document.body).on('click', 'button[data-action="addSelectionToTrip"]', function(event) {
        var type = $(this).prev().attr("data-type");
        var selectedDay = $(".current-day").attr("data-day");
        var selectedOptionId = $(this).prev().val();
        // console.log(selectedOption);

        $.post({
            url: "/api/days/" + selectedDay + "/" + type,
            data: {
                "selectedOptionId": selectedOptionId
            },
            error: function(err) {
                console.log("Error: ", err);
            }
        });

        // console.log(this, event);
        var dst = $(this.dataset.destinationList);

        // console.log($(this.dataset.sourceSelect));

        Array.from(
                // Get all selected options (usually just one, but why not support many?)
                $(this.dataset.sourceSelect)[0].selectedOptions)
            .forEach(function(option) {
                // Create a new list item with a delete button
                var li = $(`<li class=itinerary-item>
                     ${option.textContent}
                     <button data-action="deleteFromTrip" class="btn btn-xs btn-danger remove btn-circle">x</button>
                   </li>`)[0]

                // Add to the destination list
                dst.append(li)

                option.getAttribute('place-latitude')

                // Draw a marker on the map
                li.marker = drawMarker(option.attraction.place.type,
                    option.attraction.place.location);
            });
    });

    $(document.body).on('click', 'button[data-action="deleteFromTrip"]', function(event) {
        // jQuery's closest function ascends the DOM tree to find the nearest ancestor matching
        // the selector.
        $(this).closest('li.itinerary-item').remove()
    })
});
