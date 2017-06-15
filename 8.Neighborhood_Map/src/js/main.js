(function() {
    'use strict';

    /**
    * Style can be found at: https://snazzymaps.com/style/8356/flat
    */
    window.MAP_STYLE = [
        {
            "featureType": "administrative.neighborhood",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "hue": "#ff0000"
                }
            ]
        },
        {
            "featureType": "administrative.neighborhood",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative.neighborhood",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#f7f1df"
                }
            ]
        },
        {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#d0e3b4"
                }
            ]
        },
        {
            "featureType": "landscape.natural.terrain",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.business",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.medical",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#fbd3da"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#bde6ab"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#ffe15f"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#efd151"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "black"
                }
            ]
        },
        {
            "featureType": "transit.station.airport",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#cfb2db"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#a2daf2"
                }
            ]
        }
    ];

    var INFO_CONTENT_TEMPLATE =   '<article class="spot-info">'+
    '<header>'+
    '<h3>%title%</h3>'+
    '</header>'+

    '<img  class="spot-image rounded-border" src="%img-src%" alt="%img-alt%">'+

    '<p>'+
    '<span class="spot-current-people"><span class="label">People there now:</span> <span class="value">%people%</span></span>'+
    '<span class="spot-rating"><span class="label">Rating:</span> <span class="value">%rating%</span></span>'+
    '</p>'+

    '<p class="spot-description">%description%</p>'+

    '<footer class="spot-footer">'+
    '<p><em>Powered by <span class="red-text">Foursquare</span> <span class="red-text fa fa-foursquare"></span></em></p>'+
    '</footer>'+
    '</article>';

    /**
    * Coordinate object constructor (latitude, longitude)
    * @constructor
    */
    var LatLngObject = function(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    };

    /**
    * This object contains all the relevant data about a spot/place category.
    * @param {string} name - type name.
    * @param {string} className - Fonts Awesome icon class reference.
    * @param {string} character - Fonts Awesome icon UTF-8 character.
    * @constructor
    */
    var SpotType = function(name, className, character) {
        this.name = name;
        this.className = className;
        this.visible = ko.observable(true);
        this.character = character;
    };

    /**
    *   Object that will store all the spot types shown in the app.
    */
    var spotTypeList = [
        new SpotType('University', 'fa-graduation-cap', ''),
        new SpotType('Movie Theater', 'fa-film', ''),
        new SpotType('Shopping Mall', 'fa-credit-card', ''),
        new SpotType('Theater', 'fa-university', ''),
        new SpotType('Restaurant', 'fa-glass', ''),
        new SpotType('Favorite', 'fa-star', '')
    ];

    /**
    * This object contains all the relevant data about a spot/place.
    * @param {string} name - spot's name.
    * @param {object} location - the LatLngObject reference.
    * @param {number} typeID - spotTypeList object index.
    * @param {string} typeID - Foursquare spot/place identifier
    * @method createInfoContent - it creates the infowindow's content html given the spot's data.
    * @constructor
    */
    var SpotModel = function(name, location, typeID, foursquareID) {
        this.name = name;
        this.location = location;
        this.type = spotTypeList[typeID];
        this.foursquareID = foursquareID;

        this.originalArgments = {
            name: name,
            location: location,
            typeID: typeID,
            foursquareID: foursquareID
        };
    };
    SpotModel.prototype.createInfoContent = function(title, imgSrc, activePeople, rating, description) {
        this.infoContent = INFO_CONTENT_TEMPLATE.replace(/%title%/g, title)
        .replace(/%img-src%/g, imgSrc  || '')
        .replace(/%img-alt%/g, imgSrc ? (title+' photo') : '')
        .replace(/%people%/g, activePeople  || '0')
        .replace(/%rating%/g, rating || 'Unavailable')
        .replace(/%description%/g, description  || '');
    };

    // Default, hard coded, city coordinates.
    var DEFAULT_CITY_COORDINATES = {lat: -22.009815, lng: -47.890911};

    /**
    * The block of code below creates the Foursquare object API that will handle all the Foursquare requests asynchronously.
    */
    var foursquareAPI = {};

    (function() {
        var FOURSQUARE_SPOT_ENDPOINT = 'https://api.foursquare.com/v2/venues/';
        var FOURSQUARE_SEARCH_ENDPOINT = 'https://api.foursquare.com/v2/venues/search';
        var FOURSQUARE_AUTOCOMPLETE_ENDPOINT = 'https://api.foursquare.com/v2/venues/suggestcompletion';

        // Embedding the secret key here is definitely not appropriate (should be in server side), but since I will not be requesting users their data, I think that it is ok...
        var FOURSQUARE_CREDENTIALS = 'client_id=KA305KK30MBVHBCVTPQQNHFC55AUXIHWBH0PICUPA5PCYZ3Z&client_secret=TGBKJCYOLDAZCNSU5VCTWVKHXMEYNNH0RGAJGZ4NYXMW5EE5';

        var FOURSQUARE_VERSION = function() {
            var currentDate = new Date();
            var year = currentDate.getFullYear().toString();
            var month = (currentDate.getMonth() + 1).toString();

            month = (month.length > 1) ? month : '0'+month;

            var day =currentDate.getDate().toString();

            day = (day.length > 1) ? day : '0'+day;

            return 'v='+year+month+day;
        }();

        function buildFoursquareIDRequest(foursquareID) {
            return FOURSQUARE_SPOT_ENDPOINT + foursquareID + '?' + FOURSQUARE_CREDENTIALS + '&' + FOURSQUARE_VERSION;
        }

        function buildFoursquareSearchRequest(location, searchString) {
            return FOURSQUARE_SEARCH_ENDPOINT + '?' + 'll='+ location.lat +','+ location.lng + '&radius=6000&limit=1&intent=browse&query='+ searchString + '&' + FOURSQUARE_CREDENTIALS + '&' + FOURSQUARE_VERSION;
        }

        function buildFoursquareAutocompleteRequest(location, searchString) {
            return FOURSQUARE_AUTOCOMPLETE_ENDPOINT + '?' + 'll='+ location.lat +','+ location.lng + '&radius=6000&limit=15&query='+ searchString + '&' + FOURSQUARE_CREDENTIALS + '&' + FOURSQUARE_VERSION;
        }

        foursquareAPI.retrieveSpotByID = function(foursquareID, successCallback, failCallback) {
            $.getJSON(buildFoursquareIDRequest(foursquareID), function(data) {
                if( successCallback && data.response && data.response.venue ) {
                    successCallback(data.response.venue);
                }
                else if(failCallback) {
                    failCallback();
                }
            }).fail(failCallback);
        };

        foursquareAPI.searchForSpot = function(searchString, successCallback, failCallback) {
            $.getJSON(buildFoursquareSearchRequest(DEFAULT_CITY_COORDINATES, searchString), function(data) {
                if( successCallback && data.response && data.response.venues && (data.response.venues.length > 0) ) {
                    successCallback(data.response.venues[0]);
                }
                else if(failCallback) {
                    failCallback();
                }
            }).fail(failCallback);
        };

        foursquareAPI.getAutocomplete = function(searchString, successCallback, failCallback) {
            $.getJSON(buildFoursquareAutocompleteRequest(DEFAULT_CITY_COORDINATES, searchString), function(data) {
                if( successCallback && data.response && data.response.minivenues && (data.response.minivenues.length > 0) ) {
                    var autocompleteArray = [];

                    data.response.minivenues.forEach(function(candidate) {
                        autocompleteArray.push(candidate.name);
                    });

                    successCallback(autocompleteArray);
                }
                else if(failCallback) {
                    failCallback();
                }
            }).fail(failCallback);
        };
    })();

    /**
    * The next block of code will initialize our Google Map Interface that will handle all the Google Maps APi requests
    */
    var mapInterface = {};

    function initializeMapInterface() {
        var NORMAL_MARKER_URL = 'img/normal-marker.png';
        var SELECTED_MARKER_URL = 'img/selected-marker.png';

        var SELECTED_MARKER_LABEL_COLOR = '#f36548';
        var NORMAL_MARKER_LABEL_COLOR = 'white';

        var SPOT_IMAGE_ASPECT = 1.3;

        var self = mapInterface;

        /**
        * @property {object} map - It draws the map on the screen when initialized.
        */
        mapInterface.map = new google.maps.Map($('.map-container')[0], {
            center: DEFAULT_CITY_COORDINATES,
            zoom: 15,
            styles: window.MAP_STYLE,
            mapTypeControl: false,
            streetViewControl: false
        });

        /**
        * @method createMarker - It creates the marker for the spot and, if possible, it begins retrieving the foursquare spot data asynchronously.
        */
        mapInterface.createMarker = function(spot) {
            if(!spot.marker) {
                spot.marker = new google.maps.Marker({
                    position: spot.location,
                    title: spot.name,
                    animation: google.maps.Animation.DROP,
                    label: {
                        fontFamily: "FontAwesome",
                        fontSize: "0.9em",
                        color: NORMAL_MARKER_LABEL_COLOR,
                        text: spot.type.character
                    },
                    icon: {
                        url: NORMAL_MARKER_URL,
                        labelOrigin: new google.maps.Point(11, 13)
                    }
                });

                requestAnimationFrame(function() {
                    spot.marker.setMap(self.map);
                });
            }

            if( spot.foursquareID && !spot.foursquareData) {
                spot.infoWindow = new google.maps.InfoWindow({
                    content: 'Loading content from Foursquare...'
                });

                spot.marker.addListener('click', function() {
                    if(self.markerClickedCallback) {
                        self.markerClickedCallback(spot);
                    }
                });

                foursquareAPI.retrieveSpotByID(spot.foursquareID, function(data) {
                    var name = data.name;

                    var imgSrc = null;
                    if( data.photos && (data.photos.count > 0) ) {
                        var photoWidth = data.photos.groups[0].items[0].width;
                        var photoHeight = data.photos.groups[0].items[0].height;

                        var aspect = photoWidth/photoHeight;

                        // Fixing image aspect.
                        if(aspect > SPOT_IMAGE_ASPECT) {
                            photoWidth = Math.floor(photoHeight*SPOT_IMAGE_ASPECT);
                        }
                        else {
                            photoHeight = Math.floor(photoWidth/SPOT_IMAGE_ASPECT);
                        }

                        // I could setup the srcset for further responsiveness... but I think that I've done enough for the project...
                        imgSrc = data.photos.groups[0].items[0].prefix + photoWidth + 'x' + photoHeight + data.photos.groups[0].items[0].suffix;
                    }

                    var activePeople = data.hereNow.count;

                    var rating = data.rating;

                    var description = data.description;

                    spot.createInfoContent(name, imgSrc, activePeople, rating, description);

                    spot.infoWindow.setContent(spot.infoContent);
                }, function() {
                    spot.createInfoContent('Could not load data from Foursquare =(');

                    spot.infoWindow.setContent(spot.infoContent);
                });
            }
        };

        /**
        * @method removeSpot - It is called when a marker is removed from the App spot's list.
        */
        mapInterface.removeSpot = function(spot) {
            if(spot.marker) {
                spot.marker.setMap(null);
            }

            if(spot.infoWindow) {
                spot.infoWindow.close();
            }
        };

        /**
        * @method updateMarkerVisibility - It updates the spot's marker and infoWindow based on the spot's type.
        */
        mapInterface.updateMarkerVisibility = function(spot) {
            if( spot && spot.marker ) {
                if(spot.type.visible()) {
                    requestAnimationFrame(function() {
                        spot.marker.setVisible(true);
                        spot.marker.setAnimation(google.maps.Animation.DROP);
                    });
                }
                else {
                    mapInterface.setInfoWindowVisibility(spot, false);

                    requestAnimationFrame(function() {
                        spot.marker.setVisible(false);
                    });
                }
            }
        };

        /**
        * @method setInfoWindowVisibility - Shows or hides the spot's infoWindow.
        */
        mapInterface.setInfoWindowVisibility = function(spot, visible) {
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
        };

        /**
        * @method panTo - It moves the map center to the given location.
        */
        mapInterface.panTo = function(location) {
            requestAnimationFrame(function() {
                self.map.panTo(location);
            });
        };

        /**
        * @method extendBounds - It adjusts the map zoom so that all the spots in the array are visible.
        */
        mapInterface.extendBounds = function(spotArray) {
            requestAnimationFrame(function() {
                var boundary = new google.maps.LatLngBounds();

                if(spotArray.length > 0) {
                    spotArray.forEach(function(spot) {
                        boundary.extend(spot.location);
                    });

                    self.map.fitBounds(boundary);
                }
            });
        };

        /**
        * @method setSpotHighlight - It sets the spot's "emphasis".
        */
        mapInterface.setSpotHighlight = function(spot, highlighted) {
            requestAnimationFrame(function() {
                if(spot.marker) {
                    var icon = spot.marker.getIcon();
                    var label = spot.marker.getLabel();

                    icon.url = highlighted ? SELECTED_MARKER_URL : NORMAL_MARKER_URL;
                    label.color = highlighted ? SELECTED_MARKER_LABEL_COLOR : NORMAL_MARKER_LABEL_COLOR;

                    spot.marker.setIcon(icon);
                    spot.marker.setLabel(label);
                }
            });
        };

        /**
        * @method addResizeEventListener
        */
        mapInterface.addResizeEventListener = function(callback) {
            google.maps.event.addDomListener(window, 'resize', callback);
        };
    }

    /**
    * Default hard coded spots shown in the app. The coordinates are also hard coded so that the marker can be placed independently.
    */
    var spots = [
        new SpotModel('UFSCar', new LatLngObject(-21.9858147, -47.8800048), 0, '4c49a8966594be9a3e126025'),
        new SpotModel('USP 1', new LatLngObject(-22.0086098,-47.8974033), 0, '4bfc201fd6f2c9b693c14ec8'),
        new SpotModel('USP 2', new LatLngObject(-22.002026337513556,-47.930731773376465), 0, '4d946b35cf46224b588f9394'),
        new SpotModel('Unicep', new LatLngObject(-22.0319650340178,-47.87670135498047), 0, '4dc990efd4c0abe9b63302ca'),
        new SpotModel('Cine Araújo', new LatLngObject(-22.0144537,-47.9054762), 1, '4d813b511013236ab4699735'),
        new SpotModel('Cine São Carlos', new LatLngObject(-22.01694347915993,-47.8892290962072), 1, '4cb12f12562d224baf2d1d88'),
        new SpotModel('Passeio São Carlos', new LatLngObject(-22.005330502395463,-47.904135024674616), 2, '567467c7498eff76ae3e2984'),
        new SpotModel('Shopping Iguatemi', new LatLngObject(-22.01746395704613,-47.91506767272949), 2, '4b82b047f964a52097de30e3'),
        new SpotModel('Town\'s Theater', new LatLngObject(-22.01597199247966,-47.893524169921875), 3, '4c8c1118ed3ab60cb1646421'),
        new SpotModel('Amici', new LatLngObject(-22.012120549472062,-47.897939408804774), 4, '4d23b1e0fdfb236ab8d17267'),
        new SpotModel('Yachi', new LatLngObject(-22.014168330969095,-47.882219389138136), 4, '52e97b6211d2245118a33991'),
        new SpotModel('Chez Marcel', new LatLngObject(-21.995779002666776,-47.890059508178936), 4, '4bb3be4b35f0c9b61bd2bc83')
    ];

    /**
    * This is the App's view model. It basically handles all user input and ensures that our view is updated based on the models.
    * @constructor
    */
    var ViewModel = function() {
        var self = this;

        // Auxiliar variables for touch handling.
        var searchTouched = false;
        var sideMenuTouched = false;

        /**
        * Properties initialization.
        */
        this.favList = ko.observableArray();

        var favoriteStorage = localStorage.favoriteSpots ? JSON.parse(localStorage.favoriteSpots) : [];

        favoriteStorage.forEach(function(entry) {
            self.favList.push(new SpotModel(entry.name, entry.location, entry.typeID, entry.foursquareID));
        });

        this.spotList = ko.observableArray(spots.concat(self.favList()));

        this.spotTypes = ko.observableArray(spotTypeList);

        this.searchAvailable = ko.observable(true);
        this.favoriteSearchValue = ko.observable('');
        this.favoriteSearchAutocomplete = ko.observableArray();

        this.sideMenuIsVisible = ko.observable(false);
        this.filterListIsVisible = ko.observable(false);

        this.favoriteTabSelected = ko.observable(false);
        this.spotTabSelected = ko.pureComputed(function() {
            return !self.favoriteTabSelected();
        });

        this.selectedSpot = null;

        // This interval is the interval between marker drops.
        this.animationInterval = 200;
        // This will reference the current loop dropping the markers.
        var loopRoutine = null;

        // Auxiliar variable just to help me reduce the number of alert messages displayed to the user.
        var lastInvalidSearchValue = '';

        /**
        * @function timedForEach - A array interator that interates elements by a timed interval.
        */
        function timedForEach(array, callback, interval) {
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

        /**
        * @method updateMarkersVisibility - It updates all spot markers visibility of given type.
        */
        this.updateMarkersVisibility = function(type) {
            var spotArray = self.spotList().filter(function(spot) { return spot.type === type; });

            timedForEach(spotArray, mapInterface.updateMarkerVisibility, type.visible() ? self.animationInterval : 0);
        };

        /**
        * @method setSideMenuVisibility - It sets the sidemenu's visibility.
        */
        this.setSideMenuVisibility = function(visible) {
            if(self.sideMenuIsVisible() != visible) {
                self.sideMenuIsVisible(visible);

                if(visible) {
                    self.centerMap();
                }
            }
        };

        /**
        * @method selectSpotTab - It selects the sidemenu's spot list tab.
        */
        this.selectSpotTab = function() {
            // Toggles the sidemenu
            if(!self.sideMenuIsVisible()) {
                self.setSideMenuVisibility(true);
            }
            else if(!self.favoriteTabSelected()) {
                self.setSideMenuVisibility(false);
            }

            self.favoriteTabSelected(false);
        };

        /**
        * @method selectFavoriteTab - It selects the sidemenu's favorite tab.
        */
        this.selectFavoriteTab = function() {
            // Toggles the sidemenu
            if(!self.sideMenuIsVisible()) {
                self.setSideMenuVisibility(true);
            }
            else if(self.favoriteTabSelected()) {
                self.setSideMenuVisibility(false);
            }

            self.favoriteTabSelected(true);
        };

        /**
        * @method showFilterList - It shows the spot type filter list.
        */
        this.showFilterList = function() {
            self.filterListIsVisible(true);
        };

        /**
        * @method hideFilterList - It hides the spot type filter list.
        */
        this.hideFilterList = function() {
            self.filterListIsVisible(false);
        };

        /**
        * @method onFilterListClick - handles clicks at the spot type filter list.
        */
        this.onFilterListClick = function() {
            searchTouched = true;
            self.showFilterList();
        };

        /**
        * @method onSideMenuClick - handles clicks at the sidemenu
        */
        this.onSideMenuClick = function() {
            sideMenuTouched = true;

            return true;
        };

        /**
        * @method onAppClick - handles clicks at the hole App.
        */
        this.onAppClick = function() {
            if(!searchTouched) {
                self.hideFilterList();
            }

            searchTouched = false;

            if(!sideMenuTouched) {
                self.setSideMenuVisibility(false);
            }

            sideMenuTouched = false;

            return true;
        };

        /**
        * @method centerMap - It adjusts the map zoom and position to show all the enabled markers.
        */
        this.centerMap = function() {
            if(mapInterface.extendBounds) {
                mapInterface.extendBounds(self.spotList().filter(function(spot) { return spot.type.visible(); } ));
            }
        };

        /**
        * @method panToSpot - It adjusts the map position to center a given spot.
        */
        this.panToSpot = function(spot) {
            mapInterface.panTo(spot.location);
        };

        /**
        * @method hideAllInfoWindow - It hides all infoWindows.
        */
        this.hideAllInfoWindow = function() {
            self.spotList().forEach(function(spot) {
                if(spot.infoWindowVisible) {
                    mapInterface.setInfoWindowVisibility(spot, false);
                }
            });
        };

        /**
        * @method setMapInitializedCallback - It sets the callback called when the Google Maps API Interface has loaded and is ready.
        */
        this.setMapInitializedCallback = function(callback) {
            if(!callback) {
                return;
            }

            requestAnimationFrame(function() {
                if( !mapInterface || !mapInterface.map || !mapInterface.map.getBounds() ) {
                    self.setMapInitializedCallback(callback);
                }
                else {
                    callback();
                }
            });
        };

        /**
        * @method selectSpot - It highlights a given spot and toggles its infoWindow.
        */
        this.selectSpot = function(spot) {
            if(!spot.type.visible()) {
                return;
            }

            if(self.selectedSpot == spot) {
                mapInterface.setInfoWindowVisibility(spot, !spot.infoWindowVisible);
            }
            else {
                if(self.selectedSpot) {
                    var lastSelected = self.selectedSpot;
                    mapInterface.setSpotHighlight(lastSelected, false);
                }

                mapInterface.setSpotHighlight(spot, true);

                self.hideAllInfoWindow();

                mapInterface.setInfoWindowVisibility(spot, true);

                self.selectedSpot = spot;
            }
        };

        /**
        * @method updateFavoriteLocalStorage - It serializes favorite spots to the local storage.
        */
        this.updateFavoriteLocalStorage = function() {
            var favStorage = [];

            self.favList().forEach(function(spot) {
                favStorage.push(spot.originalArgments);
            });

            localStorage.favoriteSpots = JSON.stringify(favStorage);
        };

        /**
        * @method addFavoriteSpot - Called when the user adds a spot.
        */
        this.addFavoriteSpot = function(spot) {
            if (!self.favList().concat(self.spotList()).some(function(element) { return element.foursquareID == spot.foursquareID; })) {
                self.favList.push(spot);
                self.spotList.push(spot);

                mapInterface.createMarker(spot);

                self.updateFavoriteLocalStorage();

                self.selectSpot(spot);
            }
        };

        /**
        * @method addFavoriteSpot - Called when the user removes a spot.
        */
        this.removeFavoriteSpot = function(spot) {
            self.favList.remove(spot);
            self.spotList.remove(spot);

            mapInterface.removeSpot(spot);

            self.updateFavoriteLocalStorage();
        };

        /**
        * @method searchAndAddFavoriteSpot - It searches a spot using the Foursquare API.
        */
        this.searchAndAddFavoriteSpot = function() {
            if(self.favoriteSearchValue()) {
                self.searchAvailable(false);

                foursquareAPI.searchForSpot(self.favoriteSearchValue(), function(data) {
                    var newSpot = new SpotModel(data.name, new LatLngObject(data.location.lat,data.location.lng), 5, data.id);

                    self.addFavoriteSpot(newSpot);

                    self.searchAvailable(true);
                }, function() {
                    window.alert('It was not possible to find a spot for the given search: '+self.favoriteSearchValue());

                    self.searchAvailable(true);
                });

                self.favoriteSearchValue('');
            }

            return true;
        };

        /**
        * @method initMap - This is called when the Google Maps API has loaded.
        */
        this.initMap = function() {
            mapInterface.markerClickedCallback = self.selectSpot;

            var spotArray = self.spotList();

            self.centerMap();

            mapInterface.addResizeEventListener(self.centerMap);

            timedForEach(spotArray, mapInterface.createMarker, self.animationInterval);
        };

        /**
        * Every time the users types in the favorite tab's search box, it requests the Foursquare API for autocomplete suggestions.
        */
        this.favoriteSearchValue.subscribe(function(searchValue) {
            var trimmedValue = searchValue.trim();
            if(trimmedValue) {
                if(!self.favoriteSearchAutocomplete().some(function(element) { return element == trimmedValue; })) {
                    foursquareAPI.getAutocomplete(trimmedValue, function(autocompleteArray) {
                        lastInvalidSearchValue = '';
                        self.favoriteSearchAutocomplete(autocompleteArray);
                    }, function() {
                        // I'd rather keep this message hidden from the user. But, since it is a requirement, I'll just show it as a window.alert...
                        if(searchValue.length > lastInvalidSearchValue.length) {
                            window.alert('Could not find any spot that begins with: '+searchValue+'.')
                        }

                        lastInvalidSearchValue = searchValue;
                    });
                }
            }
        });

        /**
        * Callback for when a spot type is clicked at the filter list.
        */
        this.spotTypes().forEach(function(type) {
            type.visible.subscribe(function() {
                self.updateMarkersVisibility(type);
            });
        });

        this.setMapInitializedCallback(this.initMap);
    };

    // When Google Maps API loads, this will be called.
    window.googleMapsOnSuccess = initializeMapInterface;

    // If Google Maps API does not load, this will be called.
    window.googleMapsOnError = function() {
        window.alert('Sorry, but it was not possible to load the Google Maps API. Please try again later.');
    };

    ko.applyBindings(new ViewModel());
})();
