(function() {
    'use strict';

    /**
    * This will simply add the font request once the page has loaded. Since there is no text showing up when the page loads, it will reduce the Critical Rendering Path.
    */
    $(function() {
        requestAnimationFrame(function() {
            var fontNode = $('<link href="https://fonts.googleapis.com/css?family=Luckiest+Guy|Open+Sans" rel="stylesheet">');

            $('body').append(fontNode);
        });
    });
})();
