
var game = new Phaser.Game(500, 700, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.atlas('bricker', 'assets/images/bricker.png', 'assets/images/bricker.json');
    game.load.image('field', 'assets/images/bricker background.png');
    game.load.image('titlePage', 'assets/images/Title Page.png');
    game.load.image('magicBolt', 'assets/images/magic bolt.png');

}
var uri = 'http://mcm-highscores-hrd.appspot.com/';
var canonball;
var sheild;
var wall;
var brickAI = [];
var magicBolt;
var firingTimer = 0;
var canonballOnSheild = true;
var lives = 3;
var score = 0;
var scoreText;
var livesText;
var introPage;
var gameName;
var name;
var email;
var s;

function create() { //Collision detection for walls and ceiling of the game area.

    game.physics.startSystem(Phaser.Physics.ARCADE);


    game.physics.arcade.checkCollision.down = false;

    s = game.add.tileSprite(0, 0, 500, 700, 'field');

    wall = game.add.group();
    wall.enableBody = true;
    wall.physicsBodyType = Phaser.Physics.ARCADE;

    var walls;

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 12; x++)
        {
            walls = wall.create(32 + (x * 36), 100 + (y * 52), 'bricker', 'brick_' + (y+1) + '_1.png');
            walls.body.bounce.set(1);
            walls.body.immovable = true;
        }
    }

    sheild = game.add.sprite(game.world.centerX, 500, 'bricker', 'paddle_big.png');
    sheild.anchor.setTo(0.5, 0.5);

    game.physics.enable(sheild, Phaser.Physics.ARCADE);

    sheild.body.collideWorldBounds = true;
    sheild.body.bounce.set(1);
    sheild.body.immovable = true;

    canonball = game.add.sprite(game.world.centerX, sheild.y - 16, 'bricker', 'ball_1.png');
    canonball.anchor.set(0.5);
    canonball.checkWorldBounds = true;

    game.physics.enable(canonball, Phaser.Physics.ARCADE);

    canonball.body.collideWorldBounds = true;
    canonball.body.bounce.set(1);

    canonball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

    canonball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(32, 30, 'score: 0', { font: "30px Comic Sans MS", fill: "#ff0000", align: "left" });
    livesText = game.add.text(380, 30, 'lives: 3', { font: "30px Comic Sans MS", fill: "#ff0000", align: "left" });
    introPage = game.add.sprite(game.world.centerX,350, 'titlePage');
    introPage.anchor.setTo(0.5, 0.5);

    magicBolts = game.add.group();
    magicBolts.enableBody = true;
    magicBolts.physicsBodyType = Phaser.Physics.ARCADE;
    magicBolts.createMultiple(1, 'magicBolt');
    magicBolts.setAll('anchor.x', 0.5);
    magicBolts.setAll('anchor.y', 1);
    magicBolts.setAll('outOfBoundsKill', true);
    magicBolts.setAll('checkWorldBounds', true);

    game.input.onDown.add(releaseBall, this);


    name = 'Robert';
    email = 'robertp92@googlemail.com';
    gameName = 'Bricker';



}

function update () {



    sheild.x = game.input.x;

    if (sheild.x < 24)
    {
        sheild.x = 24;
    }
    else if (sheild.x > game.width - 24)
    {
        sheild.x = game.width - 24;
    }

    if (canonballOnSheild)
    {
        canonball.body.x = sheild.x;
    }
    else
    {
        (game.time.now > firingTimer)
        {
            brickFires();
        }

       //Collision detection
        game.physics.arcade.overlap(magicBolts, sheild, enemyHitsPlayer, null, this);
        game.physics.arcade.collide(canonball, sheild, ballHitPaddle, null, this);
        game.physics.arcade.collide(canonball, wall, ballHitBrick, null, this);
    }

}



function releaseBall () {

    if (canonballOnSheild)
    {
        canonballOnSheild = false;
        canonball.body.velocity.y = -300;
        canonball.body.velocity.x = -75;
        canonball.animations.play('spin');
        introPage.visible = false;
    }

}

function ballLost () {

    lives--;
    livesText.text = 'lives: ' + lives;

    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        canonballOnSheild = true;

        canonball.reset(sheild.body.x + 16, sheild.y - 16);
        
        canonball.animations.stop();
    }

}



function ballHitBrick (_canonball, _brick) {

    _brick.kill();

    score += 10;

    scoreText.text = 'score: ' + score;

    //Check to see if there are any walls left on the screen.
    if (wall.countLiving() == 0)
    {
        //  New level starts
        score += 1000;
        scoreText.text = 'score: ' + score;
        introText.text = '- Next Level -';

        // Move the canonball back to the players shield.
        canonballOnSheild = true;
        canonball.body.velocity.set(0);
        canonball.x = sheild.x + 16;
        canonball.y = sheild.y - 16;
        canonball.animations.stop();

        //Replace the walls on the map.
        wall.callAll('revive');
    }

}

function ballHitPaddle (_canonball, _sheild) {

    var diff = 0;

    if (_canonball.x < _sheild.x)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _sheild.x - _canonball.x;
        _canonball.body.velocity.x = (-10 * diff);
    }
    else if (_canonball.x > _sheild.x)
    {
        //  Ball is on the right-hand side of the paddle
        diff = _canonball.x -_sheild.x;
        _canonball.body.velocity.x = (10 * diff);
    }
    else
    {
        //Apply a random X value to the ball upon release to prevent the ball form going straight up and making the game to easy.
        _canonball.body.velocity.x = 2 + Math.random() * 8;
    }

}

function enemyHitsPlayer (sheild,bullet) {

    bullet.kill();

    lives--;
    livesText.text = 'lives: ' + lives;

    if (lives === 0)
    {
        gameOver();
    }

    //If all of the lives have been lost.
    else
    {
        canonballOnSheild = true;

        canonball.reset(sheild.body.x + 16, sheild.y - 16);

        canonball.animations.stop();
    }

}

function brickFires () {

    // Select the first magic bolt.
    magicBolt = magicBolts.getFirstExists(false);

    brickAI.length=0;

    wall.forEachAlive(function(wall){

        // Move all of the wall sections on the gamecreen to an array.
        brickAI.push(wall);
    });


    if (magicBolt && brickAI.length > 1)
    {

        var random=game.rnd.integerInRange(0,brickAI.length-1);

        // Select a random wall section to shoot at the player, and then fire the magic bolt at the player.
        var shooter=brickAI[random];

        magicBolt.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(magicBolt,sheild,120);
        firingTimer = game.time.now + 2000;
    }

}



function gameOver () {

    canonball.body.velocity.setTo(0, 0);

    introText.text = 'Game Over!';
    introText.visible = true;



    console.log(score);
    submitScore(gameName, name, email, score);
    getTable();
    showScoreTable();

}


function submitScore(game, name, email, score) {
    var url = uri + "score?game={0}&nickname={1}&email={2}&score={3}&func=?";
    url = url.replace('{0}', game);
    url = url.replace('{1}', name);
    url = url.replace('{2}', email);
    url = url.replace('{3}', score);
    document.getElementById('url').innerText = url;

    $.ajax({
        type:  "GET",
        url:   url,
        async: true,
        contentType: 'application/json',
        dataType: 'jsonp',
        success: function (json) {
            $("#result").text(json.result);
        },
        error: function (e) {
            window.alert(e.message);
        }
    });
}



function showScoreTable(obj) {
    var s = "", i;
    for (i = 0; i < obj.scores.length; i += 1) {
        s += obj.scores[i].name + ' : ' + obj.scores[i].score + "\n";
    }
    document.getElementById("scoretable").innerHTML = s;
}

function getTable(game) {
    var url = uri + "scoresjsonp?game=" + game + "&func=?";
    document.getElementById('url').innerText = url;
    $.ajax({
        type: "GET",
        url: url,
        async: true,

        jsonpCallback: 'showScoreTable',
        contentType: 'application/json',
        dataType: 'jsonp',
        error: function (e) {
            window.alert(e.message);
        }

    });
}