// --------------------------------------------------------------** Game controller Class
var gameController = (function() {
    var object = {};

    object.gameLevel = 1;
    object.playerScore = 0;

    object.speed = 1;

    //Removed the canvas creation from engine.js
    var doc = document,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        container = $('.game-container');

    canvas.width = container.innerWidth();
    canvas.height = container.innerHeight();

    // nvas.width = 505;
    // canvas.height = 606;

    container.prepend(canvas);

    this.ctx = ctx;

    var waterSprite = 'images/water-block.png';
    var stoneSprite = 'images/stone-block.png';
    var grassSprite = 'images/grass-block.png';

    var tileAspectRatio = 101 / 83; //83 , 133 , 171
    var imageAspectRatio = 101 / 171;

    // Calculates tile sizes and row positions
    object.adjustMapSize = function() {
        var numberOfWaterRows = 1;
        var numberOfStoneRows = Math.min(2 + object.gameLevel, 15);
        var numberOfGrassRows = 2;

        var totalNumberOfRows = numberOfWaterRows + numberOfStoneRows + numberOfGrassRows;

        var rowHeight = canvas.height / totalNumberOfRows;
        var rowWidth = rowHeight * tileAspectRatio;

        object.tileSize = [rowWidth, rowHeight];
        object.imageSize = [rowWidth, rowWidth / imageAspectRatio];

        // This will adjust the vertical position of objects.
        object.verticalConstantFix = object.tileSize[1] - object.imageSize[1] + 15*(object.imageSize[1] / 171);

        object.waterRowPositions = [];
        object.stoneRowPositions = [];
        object.grassRowPositions = [];

        object.columnPositions = [];

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

    object.render = function() {
        function GetDrawFunction(sprite) {
            return function(rowPosition) {
                object.columnPositions.forEach(function(columnPosition) {
                    ctx.drawImage(Resources.get(sprite), columnPosition, rowPosition - 50 * (object.tileSize[1] / 83), object.imageSize[0], object.imageSize[1]);
                });
            };
        }

        object.waterRowPositions.forEach(GetDrawFunction(waterSprite));
        object.stoneRowPositions.forEach(GetDrawFunction(stoneSprite));
        object.grassRowPositions.forEach(GetDrawFunction(grassSprite));
    };

    object.postRender = function() {
        ctx.fillStyle = '#cdcca6';
        ctx.fillRect(0, 0, object.gameWindow.left, canvas.height);
        ctx.fillRect(object.gameWindow.right, 0, canvas.width - object.gameWindow.right, canvas.height);
        ctx.fillStyle = 'black';
    };

    object.adjustMapSize();

    object.update = function() {
        if(player.getBoxColliderBorder().bottom < object.waterRowPositions[object.waterRowPositions.length-1] + object.tileSize[1]) {
            object.gameLevel++;

            object.updateScore();

            object.adjustMapSize();

            player.reset();

            enemyController.reset();
        }
    }

    object.reset = function() {
        object.gameLevel = 1;

        object.updateScore();

        object.adjustMapSize();

        player.reset();

        enemyController.reset();
    }

    var currentScore = $('.current .value');
    var maxScore = $('.max .value');

    var cacheEntryName = 'FroggerCloneMaxScore';

    if(localStorage[cacheEntryName]) {
        maxScore.text(localStorage[cacheEntryName]);
    }

    object.updateScore = function() {
        currentScore.text(object.gameLevel);
        maxScore.text(Math.max(parseInt(maxScore.text()), object.gameLevel));
        localStorage[cacheEntryName] = maxScore.text();
    }

    window.addEventListener('resize', function(e) {
        canvas.width = container.innerWidth();
        canvas.height = container.innerHeight();

        object.adjustMapSize();

        player.reset();
    });

    return object;
}) ();


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

    this.active = true;
};
// Updates object position
GameObject.prototype.update = function(dt) {
    if(this.active) {
        this.x += this.vx*dt;
        this.y += this.vy*dt;
    }
};
// Draw the object on the screen, required method for game
GameObject.prototype.render = function() {
    if(this.active) {
        // ctx.strokeRect(this.x + this.boxColliderPositionOffset[0], this.y + this.boxColliderPositionOffset[1] + gameController.verticalConstantFix, this.boxColliderSize[0], this.boxColliderSize[1]);
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y + gameController.verticalConstantFix, gameController.imageSize[0], gameController.imageSize[1]);
    }
};

// Returns the box collider borders
GameObject.prototype.getBoxColliderBorder = function() {
    return {
        top: this.y + this.boxColliderPositionOffset[1] + gameController.verticalConstantFix,
        right: this.x + this.boxColliderPositionOffset[0] + this.boxColliderSize[0],
        bottom: this.y + this.boxColliderPositionOffset[1] + this.boxColliderSize[1] + gameController.verticalConstantFix,
        left: this.x + this.boxColliderPositionOffset[0]
    };
};

// Returns if there is a collision
GameObject.prototype.hasCollided = function(boxBorders) {
    var myBorder = this.getBoxColliderBorder();

    return (Math.min(myBorder.right, boxBorders.right) - Math.max(myBorder.left, boxBorders.left) >= 0) && (Math.min(myBorder.bottom, boxBorders.bottom) - Math.max(myBorder.top, boxBorders.top) >= 0);
}

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

// Resets enemy
Enemy.prototype.reset = function() {
    this.x = gameController.gameWindow.left - gameController.imageSize[0];
    this.y = gameController.stoneRowPositions[Math.floor(Math.random() * gameController.stoneRowPositions.length)];

    var speedReference = gameController.tileSize[0];

    this.vx = speedReference*(1+ 0.05*gameController.gameLevel) + (Math.floor(Math.random()*speedReference*(0.8 + 0.1*gameController.gameLevel)) + 1);


    this.boxColliderSize = [gameController.imageSize[0]*0.9, gameController.imageSize[1]*0.35];
    this.boxColliderPositionOffset = [(gameController.imageSize[0] - this.boxColliderSize[0])/2, gameController.imageSize[1]*0.49];

    this.active = true;
};

// Updates enemies and checks for collisions
Enemy.prototype.update = function(dt) {
    GameObject.prototype.update.call(this, dt);

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

    this.reset();
};
Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

// Resets player
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
}

// Kilss player
Player.prototype.kill = function() {
    gameController.reset();
};

// Updates player and check for position limits
Player.prototype.update = function(dt) {
    GameObject.prototype.update.call(this, dt);

    // Stops when arriving at target destination.
    if(this.lastClickPosition) {
        var myCenter = this.getCenter();
        var targetDistance = Math.sqrt(Math.pow(this.lastClickPosition[0] - myCenter[0], 2) + Math.pow(this.lastClickPosition[1] - myCenter[1], 2));

        if(Math.abs(this.lastClickPosition[0] - myCenter[0]) < gameController.tileSize[0]*0.1) {
            this.vx = 0;
        }

        if(Math.abs(this.lastClickPosition[1] - myCenter[1]) < gameController.tileSize[1]*0.1) {
            this.vy = 0;
        }

        // if( (this.vx == 0) && (this.vy == 0) ) {
        //     this.lastClickPosition = null;
        // }
    }

    var myBorders = this.getBoxColliderBorder();

    if(myBorders.left < gameController.gameWindow.left) {
        this.x += gameController.gameWindow.left - myBorders.left;
    }
    else if(myBorders.right > gameController.gameWindow.right) {
        this.x -= myBorders.right - gameController.gameWindow.right;
    }

    if(myBorders.bottom > gameController.gameWindow.bottom) {
        this.y -= myBorders.bottom - gameController.gameWindow.bottom;
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

// Handles user input to controll the character
Player.prototype.handleClickInput = function(clickPosition) {
    this.lastClickPosition = clickPosition;

    var myCenter = this.getCenter();

    this.vx = clickPosition[0] - myCenter[0];
    this.vy = clickPosition[1] - myCenter[1];

    var normilizer = this.moveSpeed * Math.sqrt(1 / (Math.pow(this.vx, 2) + Math.pow(this.vy, 2)));

    this.vx *= normilizer;
    this.vy *= normilizer;
}

// Cancels last target click
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
var TimeEvent = function(period, successRate, successCallback) {
    this.eventPeriod = period;
    this.timer = period;
    this.successRate = successRate;

    this.successCallback = successCallback;
}
TimeEvent.prototype.update = function(dt) {
    this.timer -= dt;

    if(this.timer < 0) {
        this.timer = this.eventPeriod;

        if(this.successRate - Math.random() > 0) {
            this.successCallback();
        }
    }
}

var EnemyController = function() {
  this.activeEnemies = [];
  this.inactiveEnemies = [];
  TimeEvent.call(this, 0, 0, this.spawnEnemy);

  this.reset();
}
EnemyController.prototype = Object.create(TimeEvent.prototype);
EnemyController.prototype.contructor = EnemyController;

EnemyController.prototype.update = function(dt) {
    this.successRate = 0.01*gameController.gameLevel;
    this.period = 0.5 - 0.1*gameController.gameLevel;

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
        TimeEvent.prototype.update.call(this, dt);
    }
}

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
}

// Reset enemies
EnemyController.prototype.reset = function() {
    this.timer = 0;

    while(this.activeEnemies.length > 0) {
        var enemy = this.activeEnemies.pop();
        enemy.active = false;
        this.inactiveEnemies.push(enemy);
    }

    // the higher the level, the more enemies there will be
    for(var i=0 ; i<Math.min(gameController.gameLevel, 10); i++) {
        this.activeEnemies.push(new Enemy());
    }
}


// --------------------------------------------------------------** Object instances
var player = new Player();

var enemyController = new EnemyController();


// --------------------------------------------------------------** Event subscriptions
// These listens for key presses and sends the keys to your Player.handleInput method
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

document.addEventListener('mousedown', function(event) {
    followMouse(event);
});
document.addEventListener('touchstart', function(event) {
    followMouse(event);
});

document.addEventListener('mousemove', function(event) {
    if(player.lastClickPosition) {
        followMouse(event);
    }
});

document.addEventListener('touchmove', function(event) {
    if(player.lastClickPosition) {
        followMouse(event);
    }
});

document.addEventListener('mouseup', function(event) {
    player.cancelLastClick();
});

document.addEventListener('touchend', function(event) {
    player.cancelLastClick();
});
