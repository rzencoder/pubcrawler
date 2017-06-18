var Account = require('../models/account');
var Bar = require('../models/bars');
var yelp = require('yelp-fusion');

var client = yelp.client(process.env.YELP_TOKEN);

function SearchHandler() {
  this.going = function(req, res){
    if(typeof req.user !== "undefined"){
      Bar.find({bar_id: req.params.id}).exec()
        .then(function(elem){
          if (elem.length){
            if(elem[0].users.includes(req.user.username)){
              Bar.findOne({ bar_id: req.params.id }, function (err, doc){
                  var index = doc.users.indexOf(req.user.username);
                  doc.users.splice(index, 1);
                  doc.save();
                  res.json({id: req.params.id, going: doc.users.length, username: null});
                });
            }else{
                Bar.findOne({ bar_id: req.params.id }, function (err, doc){
                    doc.users.push(req.user.username)
                    doc.going = doc.users.length;
                    doc.save();
                    res.json({id: req.params.id, going: doc.going, username: req.user.username});
                  });
            }
          }else{
            var newBar = Bar({
              bar_id: req.params.id,
              users: req.user.username,
              going: 1
            });
            newBar.save()
              .then(function(){
                res.json({id: req.params.id, going: 1, username: req.user.username});
              });
          }
        }).catch(function(err){
          throw err;
        });
    }
  }

  this.search = function(req, res){
    client.search({
      term:'bar',
      location: req.params.place
    }).then(response => {
      var arr = [];
      var count = 0;
      var body = JSON.parse(response.body);
      function callback(){
        res.json({ businesses: arr,
                   region: body.region
                    });
      }
      body.businesses.forEach(business => {
        Bar.findOne({ bar_id: business.id }, function (err, doc){
        })
        .then(function(doc){
          var val = 0;
          var attending = false;

          if(doc){
            val = doc.users.length;
            if(req.user){
              doc.users.forEach(user => {
                if(user === req.user.username){
                  attending = true;
                }
              })
            }
          }
          var ob = {
            id: business.id,
            image_url: business.image_url,
            name: business.name,
            price: business.price,
            rating: business.rating,
            coord: business.coordinates,
            type: business.categories[0].title,
            city: business.location.city,
            country: business.location.country,
            going: val,
            attending: attending
          }
          count++
          arr.push(ob);
          if(count === body.businesses.length){
            callback();
          }
        })
      })
    }).catch(e => {
      console.log(e);
    });
  }

}

module.exports = SearchHandler;
