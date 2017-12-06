//Global Variable
var map;

// The model
// The locations are free Altamed Clinics in East LA
var locations = [
    {title: 'AltaMed Medical Group - Commerce', location: {lat: 34.019861, lng: -118.153169}},

        {title: 'AltaMed Medical and Dental Group - Boyle Heights', location: {lat: 34.024119, lng: -118.187775}},

        {title: 'AltaMed Youth and Senior Care Management – Indiana', location: {lat: 34.029989, lng: -118.192030}},

        {title: 'AltaMed Medical Group - Estrada Courts', location: {lat: 34.020796, lng: -118.208344}},

        {title: 'AltaMed Medical Group - Montebello', location: {lat: 34.013085, lng: -118.125732}}

    ];

      //Initiates map
      function initMap() {
        // style created by Adam Krogh at https://twitter.com/adamkrogh
      var styles =
        [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 13
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#144b53"
            },
            {
                "lightness": 14
            },
            {
                "weight": 1.4
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#08304b"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0c4152"
            },
            {
                "lightness": 5
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b434f"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b3d51"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "color": "#146474"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#021019"
            }
        ]
    }
];

//Location to start map on
var EastLA = {lat: 34.0224, lng: -118.1670};
// Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: EastLA,
          zoom: 13,
          styles: styles,
        });
        ko.applyBindings(new ViewModel());
      }

//knockout viewmodel
var ViewModel = function() {
    var self = this;

    self.markers = [];

    self.site = ko.observableArray(locations);

    self.loclist = ko.observable('');

    //infowindow
    var largeInfowindow = new google.maps.InfoWindow();
      // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = makeMarkerIcon('930029');
        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = makeMarkerIcon('FFFF24');


      //yahoo api
      $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='la, ca') &format=json").success(function(data){
   console.log(data);
   $('#yahoo').html("Temperature in Los Angeles "+data.query.results.channel.item.condition.temp + "°F");
  });
      //NyTimes Api
      function loadData() {

    var $nytElem = $('#nytimes-articles');

    // clear out old data before new request
    $nytElem.text("");

    //NYTimes Ajax request
    var nytimesUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=Los Angeles&sort=newest&api-key=3aab32b91721433782d30c05b223597d';

    // load nytimes
    $.getJSON(nytimesUrl, function(data){

        articles = data.response.docs;
        for (var i = 0; i < articles.length; i++) {
          if (i === 2) { break; }
            var article = articles[i];
            $nytElem.append('<li class ="article">'+
                '<a href="'+article.web_url+'">'+article.headline.main+
                    '</a>'+
                '<p>' + article.snippet + '</p>'+
            '</li>');
        }
    }).error(function(e){
        $nytHeaderElem.text('New York Times Articles could Not Be Loaded');
    });
  }
  $('#nytimes-articles').html(loadData);

      // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++){
          var position = locations[i].location;
          var title = locations[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            infowindow: largeInfowindow,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i
          });

          // Push the marker to our array of markers.
          self.site()[i].marker = marker;

          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', function() {
            self.populateInfoWindow(this, largeInfowindow);
          });

          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });

          //Bounce marker on Click
         marker.addListener('click', toggleBounce);

          function toggleBounce() {
            if (this.getAnimation() !== null) {
              this.setAnimation(null);
          } else {
            this.setAnimation(google.maps.Animation.BOUNCE);
            var y = this;
            setTimeout(function(){ y.setAnimation(null); }, 1200);
            }
          }
        }
        //The altamed location list filter
        self.regionlist = ko.computed(function() {
        return ko.utils.arrayFilter(self.site(), function(spot) {
          var search = spot.marker.title.toLowerCase().indexOf(self.loclist().toLowerCase()) >= 0;
          if (search) {
            spot.marker.setVisible(search);
          } else{
            spot.marker.setVisible(search);
            spot.marker.infowindow.close();
          }
          return search;
          });
      });

    //Animates marker and opens infowindow
    self.show = function (chosen) {
      for (var i = 0; i < self.site().length; i++) {
        self.site()[i].marker.setAnimation(null);
      }
      self.populateInfoWindow(chosen.marker, largeInfowindow);
    };
    // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      self.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.marker = marker;
          //Bounce marker
          infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick',function(){
            infowindow.setMarker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      };

      // This function takes in a COLOR, and then creates a new marker
      // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).
      function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }
  };

//Map not found for Google maps Api
function mapNotFound() {
  alert('Google map did not load. We are sorry for the inconvenience.');
}
//Yahoo weather Api error
function weatherNotFound() {
  alert('Yahoo weather did not load.We are sorry for the inconvenience.');
}
