# Website Optimization

This project goal was to optimize some [given webpages](https://github.com/udacity/frontend-nanodegree-mobile-portfolio) so that they could both [load quickly](https://riusuky.github.io/udacity-web-front-end/7.Website_Optimization/dist/index.html) and [run at 60fps](https://riusuky.github.io/udacity-web-front-end/7.Website_Optimization/dist/views/pizza.html).

## Getting Started

To install all the project's dependencies, please see the [`README`](../README.md) file located at the repository's root first.

To run the Grunt task associated with this project, run `grunt webOptimization` where the `Gruntfile.js` file is located. This will create/refresh the `dist` folder based on the `src` folder content. Thus, all your custom modification must be made at the `src` folder, otherwise, you'd lose your work.

To open the project, simply use your preferred browser to open either the `dist/index.html` (Page load time) or the `dist/views/pizza.html` (Page at 60fps).

## Optimizations

### [Page load time](https://riusuky.github.io/udacity-web-front-end/7.Website_Optimization/dist/index.html)

[Page Speed Insight link](https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Friusuky.github.io%2Fudacity-web-front-end%2F7.Website_Optimization%2Fdist%2Findex.html&tab=mobile)

- Minified all html, css and javascript files;
- Inlined main style and added the media print attribute to the print.css;
- Updated analytics references so that they load asynchronously;
- Font loading was deferred;
- Optimized/resized and inlined the base64 encoded version of images.

### [Page at 60fps](https://riusuky.github.io/udacity-web-front-end/7.Website_Optimization/dist/views/pizza.html)

- Removed unnecessary function calls when resizing the pizza size. The value set does not depend on the current width value anymore, not triggering forced synchronous layout;
- All element creation/update procedure is now executed inside a requestAnimationFrame;
- Some element styles that were being set by JavaScript are now defined at style.css in its corresponding class;
- Scrolling does not trigger forced synchronous layout to change background pizza positions;
- Number of background pizzas are now calculated based on the screen size.
