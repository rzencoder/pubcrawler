//Load previous search if possible
if (docCookies.getItem('fccnightlife')) {
  search();
}

function search() {

  //Store search as cookie for one hour
  var searchInput = $("#search-input").val() || docCookies.getItem('fccnightlife');
  if (!$("#search-input").val()) {
    $("#search-input").val(searchInput)
  }
  docCookies.setItem("fccnightlife", searchInput, 3600);

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
              $('#' + res.id).text(res.going + ' Going');
              if (res.username) {
                $('#' + res.id).append(`<p class="attending">Attending</p>`);
              } else {
                $('#' + res.id).children().last().remove();
              }
            })
        };

        //appending each bar data
        $('.bar-list').append(
          `<li class="bar">
        <img class="bar-image" src="${business.image_url}"/>
        <div class="details-container">
        <div class="details">
        <p class="bar-name">${business.name}</p>
        <p class="bar-price">Price: ${business.price}</p>
        <div class="rating large star-icon star-container direction-ltf value-${Math.ceil(business.rating)}">
          ${stars}
        </div>
        </div>
        </div>
        <div id="${business.id}" class="going">${business.going + " Going"}</div>
        </li>`);
        $('#' + business.id).click(click);
      })
    });
}

$("#going-btn").click(function(e) {
  $.ajax({
    url: "/going/" + user,
    type: "POST"
  })
});

$("#search").submit(search);
