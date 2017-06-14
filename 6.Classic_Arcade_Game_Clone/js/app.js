(function() {
    'use strict';

    // --------------------------------------------------------------** Game controller Class
    // It holds some main game properties and will controll some major aspects of the game
    window.gameController = (function() {
        var object = {};

        object.gameLevel = 1;
        object.playerScore = 0;

        object.audioOn = true;

        object.speed = 1;

        // Adds canvas to the page
        var doc = document,
            canvas = doc.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            container = $('.game-container');

        canvas.width = container.innerWidth();
        canvas.height = container.innerHeight();

        var waterSprite = 'images/water-block.png';
        var stoneSprite = 'images/stone-block.png';
        var grassSprite = 'images/grass-block.png';

        var tileAspectRatio = 101 / 83; //83 , 133 , 171
        var imageAspectRatio = 101 / 171;

        // Calculates tile sizes and row positions and stores them in variables for other game objects
        object.adjustMapSize = function() {
            var numberOfWaterRows = 1;
            var numberOfStoneRows = Math.min(2 + object.gameLevel, 15);
            var numberOfGrassRows = 2;

            var totalNumberOfRows = numberOfWaterRows + numberOfStoneRows + numberOfGrassRows;

            var rowHeight = canvas.height / totalNumberOfRows;
            var rowWidth = rowHeight * tileAspectRatio;

            object.tileSize = [rowWidth, rowHeight];
            object.imageSize = [rowWidth, rowWidth / imageAspectRatio];

            // This will adjust the vertical position of objects. (this was empirically calculated based on the current size of images)
            object.verticalConstantFix = object.tileSize[1] - object.imageSize[1] + 15*(object.imageSize[1] / 171);

            object.waterRowPositions = [];
            object.stoneRowPositions = [];
            object.grassRowPositions = [];

            object.columnPositions = [];

            // Calculates horizontal offset so that the game is centered on the canvas.
            var totalNumberOfColumns = Math.floor(canvas.width / object.tileSize[0]);
            var horizontalOffset = (canvas.width % object.tileSize[0]) / 2;

            for (var column = 0; column < totalNumberOfColumns; column++) {
                object.columnPositions.push(column*object.tileSize[0] + horizontalOffset);
            }

            object.gameWindow = {
                top: 0,
                right: canvas.width - horizontalOffset,
                bottom: canvas.height,
                left: object.columnPositions[0]
            };

            function FillRowPositions(initialRow, finalRow, property) {
                for(var row = initialRow; row <= finalRow-1; row++) {
                    object[property].push(row*object.tileSize[1]);
                }
            }

            FillRowPositions(0, numberOfWaterRows, 'waterRowPositions');
            FillRowPositions(numberOfWaterRows, numberOfWaterRows+numberOfStoneRows, 'stoneRowPositions');
            FillRowPositions(numberOfWaterRows+numberOfStoneRows, numberOfWaterRows+numberOfStoneRows+numberOfGrassRows, 'grassRowPositions');
        };

        // Draws the game terrain
        object.render = function() {
            function GetDrawFunction(sprite) {
                return function(rowPosition) {
                    object.columnPositions.forEach(function(columnPosition) {
                        ctx.drawImage(Resources.getImage(sprite), columnPosition, rowPosition - 50 * (object.tileSize[1] / 83), object.imageSize[0], object.imageSize[1]);
                    });
                };
            }

            object.waterRowPositions.forEach(GetDrawFunction(waterSprite));
            object.stoneRowPositions.forEach(GetDrawFunction(stoneSprite));
            object.grassRowPositions.forEach(GetDrawFunction(grassSprite));
        };

        // Fills the transparent canvas areas so that no game character will float out of the game terrain
        object.postRender = function() {
            ctx.fillStyle = '#cdcca6';
            ctx.fillRect(0, 0, object.gameWindow.left, canvas.height);
            ctx.fillRect(object.gameWindow.right, 0, canvas.width - object.gameWindow.right, canvas.height);
            ctx.fillStyle = 'black';
        };

        // Checks if the player has win the current level
        object.update = function() {
            if(player.getBoxColliderBorder().bottom < object.waterRowPositions[object.waterRowPositions.length-1] + object.tileSize[1]) {
                object.gameLevel++;

                if(gameController.audioOn) {
                    var stepAudio = Resources.getAudio('sounds/win.mp3');

                    if(stepAudio) {
                        stepAudio.volume = 0.6;
                        stepAudio.playbackRate = 2;
                        stepAudio.pause();
                        stepAudio.currentTime = 0;
                        stepAudio.play();
                    }
                }

                object.refresh();
            }
        };

        // Resets the game
        object.reset = function() {
            object.gameLevel = 1;

            object.refresh();
        };

        // Refreshes game objects to given game level
        object.refresh = function() {
            object.updateScore();

            object.adjustMapSize();

            player.reset();

            enemyController.reset();

            rockController.reset();
        };

        object.init = function() {
            container.prepend(canvas);

            object.ctx = ctx;

            object.adjustMapSize();
        };

        var currentScore = $('.current .value');
        var maxScore = $('.max .value');

        var cacheEntryName = 'FroggerCloneMaxScore';

        if(localStorage[cacheEntryName]) {
            maxScore.text(localStorage[cacheEntryName]);
        }

        // Update game level texts and caches it
        object.updateScore = function() {
            currentScore.text(object.gameLevel);
            maxScore.text(Math.max(parseInt(maxScore.text()), object.gameLevel));
            localStorage[cacheEntryName] = maxScore.text();
        };

        // If user changes orientation on mobile it fixes the canvas
        window.addEventListener('resize', function(e) {
            canvas.width = container.innerWidth();
            canvas.height = container.innerHeight();

            object.adjustMapSize();

            player.reset();

            enemyController.reset();
        });

        return object;
    }) ();

    var gameController = window.gameController;

    // --------------------------------------------------------------** Classes definition
    // Base class for all movable objects
    var GameObject = function(sprite) {
        // Object position
        this.x = 0;
        this.y = 0;
        // Object velocity
        this.vx = 0;
        this.vy = 0;
        // Object sprite
        this.sprite = sprite;
        // Box colider
        this.boxColliderSize = [0, 0];
        this.boxColliderPositionOffset = [0, 0];
        // scale
        this.scale = 1;

        this.active = true;
    };
    // Updates object position
    GameObject.prototype.update = function(dt) {
        if(this.active) {
            this.x += this.vx*dt;
            this.y += this.vy*dt;
        }
    };
    // Draw the object on the screen
    GameObject.prototype.render = function() {
        if(this.active) {
            // var myBorders = this.getBoxColliderBorder();
            // ctx.strokeRect(myBorders.left, myBorders.top, myBorders.right - myBorders.left, myBorders.bottom - myBorders.top);
            gameController.ctx.drawImage(Resources.getImage(this.sprite), this.x, this.y + gameController.verticalConstantFix, gameController.imageSize[0]*this.scale, gameController.imageSize[1]*this.scale);
        }
    };

    // Returns the box collider borders
    GameObject.prototype.getBoxColliderBorder = function() {
        return {
            top: this.y + this.boxColliderPositionOffset[1]*this.scale + gameController.verticalConstantFix,
            right: this.x + (this.boxColliderPositionOffset[0] + this.boxColliderSize[0])*this.scale,
            bottom: this.y + (this.boxColliderPositionOffset[1] + this.boxColliderSize[1])*this.scale + gameController.verticalConstantFix,
            left: this.x + this.boxColliderPositionOffset[0]*this.scale
        };
    };

    // Returns if there is a collision
    GameObject.prototype.hasCollided = function(boxBorders) {
        var myBorder = this.getBoxColliderBorder();

        return (Math.min(myBorder.right, boxBorders.right) - Math.max(myBorder.left, boxBorders.left) >= 0) && (Math.min(myBorder.bottom, boxBorders.bottom) - Math.max(myBorder.top, boxBorders.top) >= 0);
    };

    // Debug function
    GameObject.prototype.debug = function() {
        console.log('Position: (' + this.x + ',' + this.y + ')' + 'Velocity: (' + this.vx + ',' + this.vy + ')');
    };

    // Enemies our player must avoid
    var Enemy = function(gameLevel) {
        // Inherits from GameObject
        GameObject.call(this, 'images/enemy-bug.png');

        this.reset();
    };
    Enemy.prototype = Object.create(GameObject.prototype);
    Enemy.prototype.constructor = Enemy;

    // Resets enemy by randomizing its position
    Enemy.prototype.reset = function() {
        this.x = gameController.gameWindow.left - gameController.imageSize[0];
        this.y = gameController.stoneRowPositions[Math.floor(Math.random() * gameController.stoneRowPositions.length)];

        var speedReference = gameController.tileSize[0];

        this.vx = speedReference*(1+ 0.06*(gameController.gameLevel-1)) + Math.random()*speedReference*(0.8 + 0.15*gameController.gameLevel);


        this.boxColliderSize = [gameController.imageSize[0]*0.9, gameController.imageSize[1]*0.35];
        this.boxColliderPositionOffset = [(gameController.imageSize[0] - this.boxColliderSize[0])/2, gameController.imageSize[1]*0.49];

        this.active = true;
    };

    // Updates enemies and checks for collisions
    Enemy.prototype.update = function(dt) {
        GameObject.prototype.update.call(this, dt);

        this.checkCollision();
    };

    // Checks enemies Collision with player and each other
    Enemy.prototype.checkCollision = function() {
        if(this.hasCollided(player.getBoxColliderBorder())) {
            player.kill();
        }

        for(var i=0; i<enemyController.activeEnemies.length; i++) {
            var otherEnemy = enemyController.activeEnemies[i];
            var otherEnemyBorders = otherEnemy.getBoxColliderBorder();

            var myBorders = this.getBoxColliderBorder();

            if( (otherEnemy !== this) && this.hasCollided(otherEnemyBorders) && (this.x < otherEnemy.x) && (this.vx != otherEnemy.vx) ) {
                this.x -= (myBorders.right - otherEnemyBorders.left);
                this.vx = otherEnemy.vx;
            }
        }
    };

    // Controllable character
    var Player = function() {
        // Inherits from GameObject
        GameObject.call(this, 'images/char-boy.png');

        this.lastClickPosition = null;
    };
    Player.prototype = Object.create(GameObject.prototype);
    Player.prototype.constructor = Player;

    // Resets player to its initial position
    Player.prototype.reset = function() {
        this.x = gameController.columnPositions[0];
        this.y = gameController.grassRowPositions[1];

        this.boxColliderSize = [gameController.imageSize[0]*0.4, gameController.imageSize[1]*0.22];
        this.boxColliderPositionOffset = [(gameController.imageSize[0] - this.boxColliderSize[0])/2, gameController.imageSize[1]*0.6];

        // Player base movespeed
        this.moveSpeed = gameController.tileSize[1]*2.0;

        this.cancelLastClick();
    };

    // Calculates player center position
    Player.prototype.getCenter = function() {
        var myBorders = this.getBoxColliderBorder();
        return [
            (myBorders.right + myBorders.left)/2,
            (myBorders.top + myBorders.bottom)/2,
        ];
    };

    // Kilss player
    Player.prototype.kill = function() {
        if(gameController.audioOn) {
            var deathSound = Resources.getAudio('sounds/death.mp3');

            if(deathSound) {
                deathSound.pause();
                deathSound.currentTime = 0;
                deathSound.play();
            }
        }

        gameController.reset();
    };

    // Adjust movement step for a given target (block movement)
    Player.prototype.checkMovement = function(step, target) {
        var futureBorder = null;

        // Horizontal check
        if(step[0] !== 0) {
            futureBorder = this.getBoxColliderBorder();
            futureBorder.left += step[0];
            futureBorder.right += step[0];

            if(target.hasCollided(futureBorder)) {
                if(step[0] > 0) {
                    step[0] += target.getBoxColliderBorder().left - futureBorder.right - 1;
                }
                else {
                    step[0] += target.getBoxColliderBorder().right - futureBorder.left + 1;
                }

                // If there is a collision on x, then we can suppose that there is not a collision on y. If it hits the corner of the box, then it will continue its movement on the y axis
                return step;
            }
        }

        // Vertical check
        if(step[1] !== 0) {
            futureBorder = this.getBoxColliderBorder();
            futureBorder.top += step[1];
            futureBorder.bottom += step[1];

            if(target.hasCollided(futureBorder)) {
                if(step[1] > 0) {
                    step[1] += target.getBoxColliderBorder().top - futureBorder.bottom - 1;
                }
                else {
                    step[1] += target.getBoxColliderBorder().bottom - futureBorder.top + 1;
                }
            }
        }

        return step;
    };

    // Updates player and check for position limits
    Player.prototype.update = function(dt) {
        // Stops when arriving at target destination if the user is controlling the character by mouse or touch
        if(this.lastClickPosition) {
            var myCenter = this.getCenter();

            if(Math.abs(this.lastClickPosition[0] - myCenter[0]) < gameController.tileSize[0]*0.1) {
                this.vx = 0;
            }

            if(Math.abs(this.lastClickPosition[1] - myCenter[1]) < gameController.tileSize[1]*0.1) {
                this.vy = 0;
            }
        }

        var step = [this.vx*dt, this.vy*dt];

        var me = this;

        // Blocks the player from entering a rock tile
        rockController.rocks.forEach(function(rock) {
            step = me.checkMovement(step, rock);
        });

        var futureBorder = this.getBoxColliderBorder();

        futureBorder.left += step[0];
        futureBorder.right += step[0];
        futureBorder.top += step[1];
        futureBorder.bottom += step[1];

        // Blocks player from leaving the game windows
        if(futureBorder.left < gameController.gameWindow.left) {
            step[0] += gameController.gameWindow.left - futureBorder.left;
        }
        else if(futureBorder.right > gameController.gameWindow.right) {
            step[0] -= futureBorder.right - gameController.gameWindow.right;
        }

        if(futureBorder.bottom > gameController.gameWindow.bottom) {
            step[1] -= futureBorder.bottom - gameController.gameWindow.bottom;
        }

        this.x += step[0];
        this.y += step[1];

        // Plays audio if the player is moving
        if(gameController.audioOn) {
            var stepAudio = Resources.getAudio('sounds/footsteps.mp3');

            if(stepAudio) {
                stepAudio.loop = true;
                stepAudio.playbackRate = 1.3;
                stepAudio.volume = 0.8;

                if( (Math.abs(step[0]) > gameController.tileSize[0]*0.001) || (Math.abs(step[1]) > gameController.tileSize[1]*0.001) ) {
                    if(stepAudio.paused) {
                        stepAudio.currentTime = 0;
                        stepAudio.play();
                    }
                }
                else if(!stepAudio.paused) {
                    stepAudio.pause();
                }
            }
        }
    };

    // Handles user input to controll the character
    Player.prototype.handleInput = function(keyDown, direction) {
        this.cancelLastClick();

        switch(direction) {
            case 'left':
                if(keyDown) {
                    this.vx = -1*this.moveSpeed;
                }
                else if(this.vx < 0) {
                    this.vx = 0;
                }
                break;
            case 'right':
                if(keyDown) {
                    this.vx = this.moveSpeed;
                }
                else if(this.vx > 0) {
                    this.vx = 0;
                }
                break;
            case 'up':
                if(keyDown) {
                    this.vy = -1*this.moveSpeed;
                }
                else if(this.vy < 0) {
                    this.vy = 0;
                }
                break;
            case 'down':
                if(keyDown) {
                    this.vy = this.moveSpeed;
                }
                else if(this.vy > 0) {
                    this.vy = 0;
                }
                break;
            default:
        }
    };

    // Handles user input to controll the character by mouse or touch
    Player.prototype.handleClickInput = function(clickPosition) {
        this.lastClickPosition = clickPosition;

        var myCenter = this.getCenter();

        this.vx = clickPosition[0] - myCenter[0];
        this.vy = clickPosition[1] - myCenter[1];

        var normilizer = this.moveSpeed * Math.sqrt(1 / (Math.pow(this.vx, 2) + Math.pow(this.vy, 2)));

        this.vx *= normilizer;
        this.vy *= normilizer;
    };

    // Cancels last target click (mouse or touch)
    Player.prototype.cancelLastClick = function() {
        if(this.lastClickPosition) {
            this.lastClickPosition = null;

            this.vx = 0;
            this.vy = 0;
        }
    };

    // Base class for events.
    // period - number in seconds.
    // successRate - [0, 1]
    // successCallback - function
    var PeriodicEvent = function(period, successRate, successCallback) {
        this.eventPeriod = period;
        this.timer = period;
        this.successRate = successRate;

        this.successCallback = successCallback;
    };

    // Tries to trigger event
    PeriodicEvent.prototype.update = function(dt) {
        this.timer -= dt;

        if(this.timer < 0) {
            this.timer = this.eventPeriod;
            if(this.successRate - Math.random() > 0) {
                this.successCallback();
            }
        }
    };

    // Class to control all enemies
    var EnemyController = function() {
      this.activeEnemies = [];
      this.inactiveEnemies = [];
      PeriodicEvent.call(this, 0, 0, this.spawnEnemy);
    };
    EnemyController.prototype = Object.create(PeriodicEvent.prototype);
    EnemyController.prototype.contructor = EnemyController;

    // Recycles enemies and controls the number of active enemies.
    EnemyController.prototype.update = function(dt) {
        var newActiveArray = [];
        var newInactiveArray = [];

        this.activeEnemies.forEach(function(enemy) {
            if(enemy.getBoxColliderBorder().left > gameController.gameWindow.right) {
                enemy.active = false;
                newInactiveArray.push(enemy);
            }
            else {
                newActiveArray.push(enemy);
            }
        });

        this.activeEnemies = newActiveArray;
        Array.prototype.push.apply(this.inactiveEnemies, newInactiveArray);

        if(this.activeEnemies.length <= 4 + gameController.gameLevel) {
            PeriodicEvent.prototype.update.call(this, dt);
        }
    };

    // Render all enemies
    EnemyController.prototype.render = function() {
        this.activeEnemies.forEach(function (enemy) {
            enemy.render();
        });
    };

    // Instatiates a new enemy
    EnemyController.prototype.spawnEnemy = function() {
        if(this.inactiveEnemies.length > 0) {
            var reusableEnemy = this.inactiveEnemies.pop();
            reusableEnemy.reset();
            this.activeEnemies.push(reusableEnemy);
        }
        else {
            this.activeEnemies.push(new Enemy());
        }
    };

    // toggles enemies sound
    EnemyController.prototype.sound = function(turnOn) {
        var bugSound = Resources.getAudio('sounds/bug.mp3');

        if(bugSound) {
            if(gameController.audioOn && turnOn) {
                bugSound.loop = true;
                bugSound.volume = 0.15;
                bugSound.pause();
                bugSound.currentTime = 0;
                bugSound.play();
            }
            else if(!bugSound.paused){
                bugSound.pause();
                bugSound.currentTime = 0;
            }
        }
    };

    // Reset all enemies and spawning properties
    EnemyController.prototype.reset = function() {
        this.timer = 0;

        this.sound(true);

        this.successRate = Math.min(0.3 + 0.022*gameController.gameLevel, 0.9) ;
        this.eventPeriod = Math.max(0.4 - 0.02*(gameController.gameLevel-1), 0.04);

        while(this.activeEnemies.length > 0) {
            var enemy = this.activeEnemies.pop();
            enemy.active = false;
            this.inactiveEnemies.push(enemy);
        }

        // the higher the level, the more enemies there will be
        for(var i=0 ; i<Math.min(gameController.gameLevel, 18); i++) {
            var newEnemy = new Enemy();
            newEnemy.x = (Math.floor(Math.random() * gameController.columnPositions.length) - 1) * gameController.tileSize[0];
            this.activeEnemies.push(newEnemy);
        }
    };

    // This object will block the player from reaching a water tile
    var Rock = function(columnIndex) {
        GameObject.call(this, 'images/Rock.png');

        this.scale = 0.9;

        this.index = columnIndex;

        this.y = gameController.waterRowPositions[gameController.waterRowPositions.length-1] + (1-this.scale)*gameController.imageSize[1];
        this.x = gameController.columnPositions[columnIndex] + (1-this.scale)*gameController.imageSize[0]/2;

        this.boxColliderSize = [gameController.imageSize[0]*0.9, gameController.imageSize[1]*0.52];
        this.boxColliderPositionOffset = [(gameController.imageSize[0] - this.boxColliderSize[0])/2, gameController.imageSize[1]*0.38];
    };
    Rock.prototype = Object.create(GameObject.prototype);
    Rock.prototype.contructor = RockController;

    // The class will contain all of the game rocks
    var RockController = function() {
        this.rocks = [];
    };

    // Generates rocks
    RockController.prototype.reset = function() {
        function checkRockIndex(newIndex, rock) {
            return rock.index != newIndex;
        }

        this.rocks = [];

        if(gameController.gameLevel >= 5) {
            while(this.rocks.length < Math.min(gameController.gameLevel - 4, gameController.columnPositions.length-2)) {
                var newIndex = Math.floor(Math.random()*gameController.columnPositions.length);

                if(this.rocks.every(checkRockIndex.bind(null, newIndex))) {
                    this.rocks.push(new Rock(newIndex));
                }
            }
        }
    };

    // Render all rocks
    RockController.prototype.render = function() {
        this.rocks.forEach(function(rock) {
            rock.render();
        });
    };


    // --------------------------------------------------------------** Object instances
    window.player = new Player();
    var player = window.player;

    window.enemyController = new EnemyController();
    var enemyController = window.enemyController;


    window.rockController = new RockController();
    var rockController = window.rockController;

    window.enemyController.activeEnemies.forEach(function(enemy) {
        enemy.checkCollision();
    });


    // --------------------------------------------------------------** Event subscriptions
    // These listen for key presses and sends the keys to the corresponding player handler
    document.addEventListener('keydown', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        player.handleInput(true, allowedKeys[e.keyCode]);
    });

    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        player.handleInput(false, allowedKeys[e.keyCode]);
    });

    function followMouse(event) {
        var clickPosition = [0, 0];

        var canvasPosition = $('canvas').offset();

        if(event.pageX) {
            clickPosition[0] = event.pageX - canvasPosition.left;
            clickPosition[1] = event.pageY - canvasPosition.top;
        }
        else {
            clickPosition[0] = event.touches[0].pageX - canvasPosition.left;
            clickPosition[1] = event.touches[0].pageY - canvasPosition.top;
        }

        if( ((clickPosition[0] > gameController.gameWindow.left) &&
            (clickPosition[0] < gameController.gameWindow.right) &&
            (clickPosition[1] > gameController.gameWindow.top) &&
            (clickPosition[1] < gameController.gameWindow.bottom)) ||
            player.lastClickPosition ) {

            player.handleClickInput(clickPosition);
        }
    }

    document.querySelector('main').addEventListener('mousedown', function(event) {
        event.preventDefault();
        followMouse(event);
    });
    document.querySelector('main').addEventListener('touchstart', function(event) {
        event.preventDefault();
        followMouse(event);
    });

    document.querySelector('main').addEventListener('mousemove', function(event) {
        event.preventDefault();
        if(player.lastClickPosition) {
            followMouse(event);
        }
    });

    document.querySelector('main').addEventListener('touchmove', function(event) {
        event.preventDefault();
        if(player.lastClickPosition) {
            followMouse(event);
        }
    });

    document.querySelector('main').addEventListener('mouseup', function(event) {
        event.preventDefault();
        player.cancelLastClick();
    });

    document.querySelector('main').addEventListener('touchend', function(event) {
        event.preventDefault();
        player.cancelLastClick();
    });

})();
