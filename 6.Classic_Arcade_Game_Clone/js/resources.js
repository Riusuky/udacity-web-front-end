'use strict';

/* Resources.js
 * This is simply an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function() {
    var imageResourceCache = {};
    var audioResourceCache = {};
    var readyCallbacks = [];

    /* This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     */
    function loadImage(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _loadImage(url);
            });
        } else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _loadImage(urlOrArr);
        }
    }

    function loadAudio(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _loadAudio(url);
            });
        } else {
            _loadAudio(urlOrArr);
        }
    }

    /* This is our private image loader function, it is
     * called by the public image loader function.
     */
    function _loadImage(url) {
        if(imageResourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return imageResourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                imageResourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                    readyCallbacks = [];
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the image's src attribute to the passed in URL.
             */
            imageResourceCache[url] = false;
            img.src = url;
        }
    }

    function _loadAudio(url) {
        if(audioResourceCache[url]) {
            return audioResourceCache[url];
        }
        else {
            var sound = new Audio();
            sound.oncanplaythrough = function() {
                audioResourceCache[url] = sound;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                    readyCallbacks = [];
                    sound.oncanplaythrough = null;
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the image's src attribute to the passed in URL.
             */
            audioResourceCache[url] = false;
            sound.src = url;
        }
    }

    /* This is used by developers to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     */
    function getImage(url) {
        return imageResourceCache[url];
    }

    function getAudio(url) {
        return audioResourceCache[url];
    }

    /* This function determines if all of the images and audios that have been requested
     * for loading have in fact been properly loaded.
     */
    function isReady() {
        var ready = true;
        for(var k in imageResourceCache) {
            if(imageResourceCache.hasOwnProperty(k) &&
               !imageResourceCache[k]) {
                ready = false;
            }
        }

        for(var h in audioResourceCache) {
            if(audioResourceCache.hasOwnProperty(h) &&
               !audioResourceCache[h]) {
                ready = false;
            }
        }

        return ready;
    }

    /* This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        loadImage: loadImage,
        loadAudio: loadAudio,
        getImage: getImage,
        getAudio: getAudio,
        onReady: onReady,
        isReady: isReady
    };
})();
