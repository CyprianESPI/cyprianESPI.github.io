// global variable
var GB_game_over = false;

// Create our 'main' state that will contain the game
var mainState = {
    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the images and sounds 
        game.load.image('bird', 'assets/bird.png');
        game.load.image('pipe', 'assets/pipe.png');
        game.load.audio('jump', 'assets/jump.wav'); 
    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.  

        // Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird at the position x=100 and y=245
        this.bird = game.add.sprite(100, 245, 'bird');

        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000;  

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(
                        Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 
        
        // Create an empty group
        this.pipes = game.add.group(); 
        
        // add a timer
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); 
        
        // Score
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", 
            { font: "30px Arial", fill: "#ffffff" }); 
        
        
        // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5); 
        
        // add the jump sound in the game
        this.jumpSound = game.add.audio('jump'); 
        
        // jump once
        this.jump();
    },

    // This function is called 60 times per second    
    // It contains the game's logic
    update: function() {
        // if game over -> do nothing
        if (GB_game_over == true)
            return;
        
        // Bird dies if it goes off the screen
        if (this.bird.y < 0 || this.bird.y > 490){
            this.bird.alive = false;
            this.gameOver();
            return;
        }
        
        // Restart the game in case of collision
        game.physics.arcade.overlap(
            this.bird, this.pipes, this.hitPipe, null, this);
        
        // increase the angle when the bird is falling
        if (this.bird.angle < 20)
            this.bird.angle += 1; 
    },
    
    // Make the bird jump 
    jump: function() {
        // trigger restart of game if game is over
        if (GB_game_over == true){
            this.restartGame();
            return;
        }
            
        
        // block jumping if the bird is dead
        if (this.bird.alive == false)
            return;  
        
        this.jumpSound.play(); 
        
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        
        // Create an animation on the bird for when it is falling
        // one liner:
        // game.add.tween(this.bird).to({angle: -20}, 100).start(); 
        var animation = game.add.tween(this.bird);

        // Change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start(); 
    },
    
    addOnePipe: function(x, y) {
    // Create a pipe at the position x and y
    var pipe = game.add.sprite(x, y, 'pipe');

    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Enable physics on the pipe 
    game.physics.arcade.enable(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200; 

    // Automatically kill the pipe when it's no longer visible 
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
    },
    
    addRowOfPipes: function() {
    
        // Do nothing if the game is over
        if (GB_game_over == true)
            return;
        
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes 
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1) 
                this.addOnePipe(400, i * 60 + 10); 

        this.score += 1;
        this.labelScore.text = this.score; 
    },
    
    // Game Over
    gameOver: function() {
        GB_game_over = true;
        
        // Game over hint
        this.labelGameOver = game.add.text(20, 200, "Press space to play", 
            { font: "40px Arial", fill: "#ffffff" });
    },
    
    // Restart the game
    restartGame: function() {
        
        GB_game_over = false;
        
        // Start the 'main' state, which restarts the game
        game.state.start('main');
        
    },
    
    // Death animation (called before restarting game)
    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    }, 
};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

// Start the state to actually start the game
game.state.start('main');