//Load previous search if possible
if (docCookies.getItem('fccnightlife')) {
  apiSearch(docCookies.getItem('fccnightlife'));
}

function search(event) {
  event.preventDefault();
  //Store search as cookie for one hour
  var searchInput = $("#search-input").val() || docCookies.getItem('fccnightlife');
  docCookies.setItem("fccnightlife", searchInput, 3600);
  apiSearch(searchInput)
}

function apiSearch(searchInput){
  //Add loading classes
  $('.glasses').css('display', 'block');
  $('.loader').css('display', 'flex');

  //Add search text if empty
  if (!$("#search-input").val()) {
    $("#search-input").val(searchInput)
  }

  //ajax call to yelp api
  $.ajax({
      url: "/search/" + searchInput,
      type: "POST"
    })
    .done(function(data) {

      $('.bar-list').empty();

      data.businesses.forEach(business => {

        //Add click handler for each bar
        var click = function() {
          $.ajax({
              url: '/going/' + business.id,
              type: 'POST',
            })
            .done(function(res) {
              if(res.username){
                $('.' + res.id + '.going').text(res.going + ' Going - ' + 'Attending');
                $('.' + res.id + '.btn').text('Cancel');
                $('.' + res.id + '.btn').addClass('btn-cancel');
              } else {
                $('.' + res.id + '.going').text(res.going + ' Going');
                $('.' + res.id + '.btn').text('Attend');
                $('.' + res.id + '.btn').removeClass('btn-cancel');
              }
            })
        };

        //appending each bar data
        $('.bar-list').append(
           `<li class="bar" id="${business.id}">
              <img class="bar-image" src="${business.image_url}"/>
              <div class="details-container">
                <div class="details">
                  <p class="bar-name">${business.name}</p>
                  <p class="bar-price">${business.price} - ${business.type}</p>
                  <p class="bar-location">${business.city}, ${business.country}</p>
                  <div class="rating medium star-icon star-container direction-ltf value-${Math.ceil(business.rating)}">
                    ${stars}
                  </div>
                  <div class="going ${business.id}">${business.going + " Going"} ${business.attending ? ' - Attending' : ''}</div>
                  ${user ? '<button class="attend-btn btn ' + business.id + '">Attend<button/>' : ''}
                </div>
              </div>
            </li>`);
        if (business.attending) {
          $('.' + business.id + '.btn').text('Cancel');
          $('.' + business.id + '.btn').addClass('btn-cancel');
        }
        $('.' + business.id + '.attend-btn').click(click);
      })
      plotMarkers(data.businesses)
    });
}

$("#going-btn").click(function(e) {
  $.ajax({
    url: "/going/" + user,
    type: "POST"
  })
});

$("#search").bind('submit', search);

var js_file = document.createElement('script');
js_file.type = 'text/javascript';
js_file.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCGFWV94drOwU9IeHY_aVdiZcmWyYr4s8A&callback=initMap";
document.getElementsByTagName('head')[0].appendChild(js_file);

var mapStyle = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]

var map;
var markers;
var bounds;

function initMap() {
  var manchester = {lat: 53.4810009, lng: -2.2333594};
  map = new google.maps.Map(document.getElementById('map'),
              {zoom: 12, center: manchester, styles: mapStyle});
}

function plotMarkers (m) {
  markers = [];
  bounds = new google.maps.LatLngBounds();

  m.forEach(function (marker) {
    var position = new google.maps.LatLng(marker.coord.latitude, marker.coord.longitude);
    var mark =  new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    })
    var infoWnd = new google.maps.InfoWindow();
    infoWnd.setContent(`<div class="info-wnd-content scrollFix">
                          <h4>${marker.name}</h4>
                          <p>${marker.type}</p>
                          <p>${marker.price}</p>
                          <div class="rating small star-icon star-container direction-ltf value-${Math.ceil(marker.rating)}">
                            ${stars}
                          </div>
                          <img src="${marker.image_url}"/>
                        </div>`);

    google.maps.event.addListener(mark, 'mouseover', function() {
      infoWnd.open(map, mark);
    });

    google.maps.event.addListener(mark, 'mouseout', function() {
			infoWnd.close();
		});

    var liTag = '#' + marker.id;
    var open = false;

    $(liTag).click(function () {
      if (open) {
        infoWnd.close();
      } else {
        infoWnd.open(map, mark);
      }
        open = !open;
      });

    google.maps.event.addListener(map, 'click', function (event) {
      if (infoWnd) {
        infoWnd.close();
      }
		});

    markers.push(mark);
    bounds.extend(position);
  });

  $('.loader').css('display', 'none');
  map.fitBounds(bounds);
}
