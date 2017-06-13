'use strict';

$(function() {
    var infoContentTemplate =   '<article class="spot-info">'+
                                    '<header>'+
                                        '<h3>%title%</h3>'+
                                    '</header>'+

                                    '<img  class="spot-image" src="%img-src%" alt="%img-alt%">'+

                                    '<p>'+
                                        '<span class="spot-current-people"><span class="label">People there now:</span> <span class="value">%people%</span></span>'+
                                        '<span class="spot-rating"><span class="label">Rating:</span> <span class="value">%rating%</span></span>'+
                                    '</p>'+

                                    '<p class="spot-description">%description%</p>'+

                                    '<footer class="spot-footer">'+
                                        '<p><em>Powered by <span class="red-text">Foursquare</span> <span class="red-text fa fa-foursquare"></span></em></p>'+
                                    '</footer>'+
                                '</article>';

    var latLngObject = function(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    };

    // MODELS
    var spotModel = function(name, location, type, fourshareID) {
        this.name = name;
        this.location = location;
        this.type = type;
        this.fourshareID = fourshareID;
    };
    spotModel.prototype.CreateInfoContent = function(title, imgSrc, activePeople, rating, description) {
        this.infoContent = infoContentTemplate.replace(/%title%/g, title)
                                              .replace(/%img-src%/g, imgSrc)
                                              .replace(/%img-alt%/g, title+' photo')
                                              .replace(/%people%/g, activePeople)
                                              .replace(/%rating%/g, rating)
                                              .replace(/%description%/g, description);
    }

    var spotType = function(name, className, character) {
        this.name = name;
        this.className = className;
        this.visible = ko.observable(true);
        this.character = character;
    }

    // Object that will store all the spot type shown in the app.
    var spotTypeList = [
        new spotType('University', 'fa-graduation-cap', ''),
        new spotType('Movie Theater', 'fa-film', ''),
        new spotType('Shopping Mall', 'fa-credit-card', ''),
        new spotType('Theater', 'fa-university', ''),
        new spotType('Restaurant', 'fa-glass', '')
    ];

    // Returns an object that will perform all the drawings on the map and that will hold the fourshare API interface as well.
    function InitializeMap() {
        var foursquareEndpoint = 'https://api.foursquare.com/v2/venues/';

        // Embedding the secret key here is definitely not appropriate (should be in server side), but since I will not be requesting users their data, I think that it is ok...
        var fourshareCredentials = 'client_id=KA305KK30MBVHBCVTPQQNHFC55AUXIHWBH0PICUPA5PCYZ3Z&client_secret=TGBKJCYOLDAZCNSU5VCTWVKHXMEYNNH0RGAJGZ4NYXMW5EE5';

        var currentDate = new Date();
        var year = currentDate.getFullYear().toString();
        var month = (currentDate.getMonth() + 1).toString();

        month = (month.length > 1) ? month : '0'+month;

        var day =currentDate.getDate().toString();

        day = (day.length > 1) ? day : '0'+day;

        var fourshareVersion = 'v='+year+month+day;

        function BuildFourshareRequest(spotID) {
            return foursquareEndpoint + spotID + '?' + fourshareCredentials + '&' + fourshareVersion;
        }

        window.mapInterface = {};

        var self = window.mapInterface;

        window.mapInterface.map = new google.maps.Map($('.map-container')[0], {
            center: {lat: -22.009815, lng: -47.890911},
            zoom: 15,
            styles: window.mapStyle,
            mapTypeControl: false
        });

        // It creates the marker and triggers fourshare API requests assynchronously for the respective marker.
        window.mapInterface.createMarker = function(spot) {
            var map = self.map;

            if(!spot.marker) {

                spot.marker = new google.maps.Marker({
                    position: spot.location,
                    title: spot.name,
                    animation: google.maps.Animation.DROP,
                    label: {
                        fontFamily: "FontAwesome",
                        fontSize: "0.9em",
                        color: "white",
                        text: spot.type.character
                    }
                });

                requestAnimationFrame(function() {
                    spot.marker.setMap(map);
                });
            }

            if( spot.fourshareID && !spot.fourshareData) {
                $.getJSON(BuildFourshareRequest(spot.fourshareID), function(data) {
                    var name = data.response.venue.name;

                    var imgSrc = null;
                    if( data.response.venue.photos && (data.response.venue.photos.count > 0) ) {
                        imgSrc = data.response.venue.photos.groups[0].items[0].prefix + 'original' + data.response.venue.photos.groups[0].items[0].suffix;
                    }

                    var activePeople = data.response.venue.hereNow.count;

                    var rating = data.response.venue.rating || 'Unavailable';

                    var description = data.response.venue.description || '';

                    spot.CreateInfoContent(name, imgSrc, activePeople, rating, description);

                    spot.infoWindow = new google.maps.InfoWindow({
                        content: spot.infoContent
                    });

                    spot.marker.addListener('click', function() {
                        // This will toggle the info window.
                        window.mapInterface.setInfoWindowVisibility(spot, !spot.infoWindowVisible);
                    });
                });
            }
        };

        window.mapInterface.setMarkerVisibility = function(spot) {
            if( spot && spot.marker ) {
                if(spot.type.visible()) {
                    requestAnimationFrame(function() {
                        spot.marker.setVisible(true);
                        spot.marker.setAnimation(google.maps.Animation.DROP);
                    });
                }
                else {
                    window.mapInterface.setInfoWindowVisibility(spot, false);

                    requestAnimationFrame(function() {
                        spot.marker.setVisible(false);
                    });
                }
            }
        };

        window.mapInterface.setInfoWindowVisibility = function(spot, visible) {
            if(spot.infoWindow) {
                requestAnimationFrame(function() {
                    if(visible) {
                        spot.infoWindow.open(self.map, spot.marker);
                    }
                    else {
                        spot.infoWindow.close();
                    }

                    spot.infoWindowVisible = visible;
                });
            }
        }
    }

    // Hard coded spots shown in the app. I placed the coordinates here so that the marker can be placed independently.
    var spots = [
        new spotModel('UFSCar', new latLngObject(-21.9858147, -47.8800048), spotTypeList[0], '4c49a8966594be9a3e126025'),
        new spotModel('USP 1', new latLngObject(-22.0086098,-47.8974033), spotTypeList[0], '4bfc201fd6f2c9b693c14ec8'),
        new spotModel('USP 2', new latLngObject(-22.002026337513556,-47.930731773376465), spotTypeList[0], '4d946b35cf46224b588f9394'),
        new spotModel('Unicep', new latLngObject(-22.0319650340178,-47.87670135498047), spotTypeList[0], '4dc990efd4c0abe9b63302ca'),
        new spotModel('Cine Araújo', new latLngObject(-22.0144537,-47.9054762), spotTypeList[1], '4d813b511013236ab4699735'),
        new spotModel('Cine São Carlos', new latLngObject(-22.01694347915993,-47.8892290962072), spotTypeList[1], '4cb12f12562d224baf2d1d88'),
        new spotModel('Passeio São Carlos', new latLngObject(-22.005330502395463,-47.904135024674616), spotTypeList[2], '567467c7498eff76ae3e2984'),
        new spotModel('Shopping Iguatemi', new latLngObject(-22.01746395704613,-47.91506767272949), spotTypeList[2], '4b82b047f964a52097de30e3'),
        new spotModel('Town\'s Theater', new latLngObject(-22.01597199247966,-47.893524169921875), spotTypeList[3], '4c8c1118ed3ab60cb1646421'),
        new spotModel('Amici', new latLngObject(-22.012120549472062,-47.897939408804774), spotTypeList[4], '4d23b1e0fdfb236ab8d17267'),
        new spotModel('Yachi', new latLngObject(-22.014168330969095,-47.882219389138136), spotTypeList[4], '52e97b6211d2245118a33991'),
        new spotModel('Chez Marcel', new latLngObject(-21.995779002666776,-47.890059508178936), spotTypeList[4], '4bb3be4b35f0c9b61bd2bc83')
    ];

    var viewModel = function() {
        this.spotList = ko.observableArray(spots);

        this.spotTypes = ko.observableArray(spotTypeList);

        this.listIsVisible = ko.observable(false);
        this.filterListIsVisible = ko.observable(false);

        var self = this;

        this.animationInterval = 200;

        var loopRoutine = null;

        function TimedForEach(array, callback, interval) {
            clearInterval(loopRoutine);

            var counter = 0;

            // First marker will drop with a delay, but that ok since the map might still be loading.
            loopRoutine = setInterval(function() {
                callback(array[counter]);
                counter++;

                if(counter >= array.length) {
                    clearInterval(loopRoutine);
                }
            }, interval);
        }

        this.updateMarkersVisibility = function(type) {
            var spotArray = self.spotList().filter(function(spot) { return spot.type === type; });

            TimedForEach(spotArray, window.mapInterface.setMarkerVisibility, type.visible() ? self.animationInterval : 0);
        };

        this.spotTypes().forEach(function(type) {
            var type = type;
            type.visible.subscribe(function() {
                self.updateMarkersVisibility(type);
            });
        });

        this.toggleListVisibility = function() {
            self.listIsVisible(!self.listIsVisible());

            if(self.listIsVisible()) {
                self.centerMap();
            }
        };

        // I'm declaring this variable here so I don't have to select the same boxes every time the user hovers the search box.
        var searchBoxes = $('.filter-container > div');

        var searchTouched = false;

        this.showFilterList = function(data, event) {
            searchTouched = true;
            self.filterListIsVisible(true);
        };

        this.hideFilterList = function(data, event) {
            if(!searchTouched) {
                self.filterListIsVisible(false);
            }

            searchTouched = false;
        };

        this.centerMap = function() {
            requestAnimationFrame(function() {
                var boundary = new google.maps.LatLngBounds();

                var visibleSpots = self.spotList().filter(function(spot) { return spot.type.visible(); } );

                if(visibleSpots.length > 0) {
                    visibleSpots.forEach(function(spot) {
                        boundary.extend(spot.location);
                    });

                    window.mapInterface.map.fitBounds(boundary);
                }

            });
        };

        this.panToSpot = function(spot) {
            if(!spot.type.visible()) {
                return;
            }

            // This line right below this comment is a hack.... it will prevent the infoWindow from flicking if it is already open.
            spot.infoWindowVisible = false;
            self.hideAllInfoWindow();

            requestAnimationFrame(function() {
                window.mapInterface.map.panTo(spot.location);

                window.mapInterface.setInfoWindowVisibility(spot, true);
            });
        };

        this.hideAllInfoWindow = function() {
            self.spotList().forEach(function(spot) {
                if(spot.infoWindowVisible) {
                    window.mapInterface.setInfoWindowVisibility(spot, false);
                }
            });
        }

        this.setMapInitializedCallback = function(callback) {
            if(!callback) {
                return;
            }

            requestAnimationFrame(function() {
                if( !window.mapInterface || !window.mapInterface.map || !window.mapInterface.map.getBounds() ) {
                    self.setMapInitializedCallback(callback);
                }
                else {
                    callback();
                }
            });
        };

        // Initialize drawings on the map.
        this.initMap = function() {
            self.setMapInitializedCallback

            var spotArray = self.spotList();

            self.centerMap();

            TimedForEach(spotArray, window.mapInterface.createMarker, self.animationInterval);
        };

        this.setMapInitializedCallback(this.initMap);

        // Checks if Google Maps API is loaded, otherwise set proper callback.
        if(window.googleMapInitialized) {
            InitializeMap();
        }
        else {
            window.googleMapCallback = InitializeMap;
        }
    }

    ko.applyBindings(new viewModel());
});
