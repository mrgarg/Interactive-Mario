var w = window.innerWidth;
var h = window.innerHeight;
var score=0;
var score_text;
var birds;
config={
    
    type: Phaser.CANVAS,  // either canvas or WebGl
    scale:{
        mode: Phaser.Scale.FIT,   // to fit in full screen
        width:w,
        height:h,
    },
    
    backgroundColor: 0xffcc11,
    
    physics:{
        default:'arcade',
        arcade:{
            gravity:{
                y:1000,
            },
            debug:false, // usefull for debugging and later on it can be set to false
        }
    
    },
    scene:{
        preload:preload,
        create:create,
        update:update,
    }
    
}

let game = new Phaser.Game(config);

player_config={
    player_speed:700,
    player_jump:1000,
}

function preload()
{
    this.load.image("ground","Assets/topground.png");
    this.load.image("sky","Assets/background.png");
    this.load.spritesheet("dude","Assets/dude.png",{frameWidth:32,frameHeight:48});
    this.load.image("ray","Assets/ray.png");
    this.load.image("pipe","Assets/pipe.png");
    this.load.image("flag","Assets/flag.png");
    this.load.image("tree","Assets/tree.png");
    this.load.image("coco","Assets/coco.png");
    this.load.image("mountain","Assets/mountain.png");
    this.load.image("brick","Assets/brick.png");
    this.load.image("tree1","Assets/tree1.png");
    this.load.image("cloud","Assets/cloud.png");
    this.load.image("bird","Assets/birds.png");
    this.load.image("bug_left","Assets/bug.png");
    this.load.image("bug_right","Assets/bug1.png");
    this.load.image("star","Assets/star.png");
    this.load.audio("corona","Assets/coronaguitar.mp3");    
    this.load.audio("jumpsound","Assets/jumpsound.mp3");

}

function create(){
    
    W = game.config.width;
    H = game.config.height;
    
    
    music= this.sound.add("corona");
    music.play();
    music.loop=true;
    console.log(music);
    
    
    jumpMusic= this.sound.add("jumpsound");
    jumpMusic.volume=0.2;
    
    // create the ground
    let ground = this.add.tileSprite(0,H-128,3*W,128,"ground"); //to repeated as tile
    ground.setOrigin(0,0);
    
    // background
    let background = this.add.sprite(0,0,"sky"); 
    background.setOrigin(0,0);
    background.displayWidth =3*W;
    background.displayHeight =H;
    background.depth =-2;
    
    
    //create rays on the top of the background
    let rays = [];
    for(let i=-10;i<=10;i++){
        let ray = this.add.sprite((3*W)/2,H-100,'ray');
        ray.displayHeight = 1.1*H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*20;
        ray.depth = -1;
        rays.push(ray);
    }
    console.log(rays);

    //tween
    this.tweens.add({
        targets: rays,
        props:{
            angle:{
                value : "+=40"
            },
        },
        duration : 8000,
        repeat : -1
    });
    
    
    
    //player
    //let player = this.add.sprite(100,100,"dude",4);  // 4th frame
    
    this.player = this.physics.add.sprite(100,100,"dude",4);  // 4th frame
    console.log(this.player);
    this.player.setBounce(0.2); // set Bounce
    
    this.physics.add.existing(ground ,true);  // for existing sprite // physics will be applied on the ground
    // ground.body.allowGravity= false;
    //ground.body.immovable = true;    // or write true
    
    
    this.player.setCollideWorldBounds(true); // so that it can't go out of the world
  
      
    // create group of stars and adding gravity
    let stars = this.physics.add.group({
        key:"star",
        repeat:100,   
        setScale:{x:1.5,y:1.5},
        setBounce:0.2,
        setXY:{x:10,y:0,stepX:75}    
    });
    //add bouncing effects to all the stars
    stars.children.iterate(function(f){
        f.setBounce(Phaser.Math.FloatBetween(0.3,0.7));
    })
    
    // adding platforms 
    let platform = this.physics.add.staticGroup();
    platform.create(500,400,"ground").setScale(2,0.5).refreshBody();  // refresh is done to change the size
    platform.create(1000,300,"ground").setScale(2,0.5).refreshBody();
    platform.create(100,200,"ground").setScale(2,0.5).refreshBody();
    platform.create(1500,200,"brick").setScale(1,1).refreshBody();
    platform.create(1635,200,"brick").setScale(1,1).refreshBody();
    platform.create(3200,300,"brick").setScale(1,1).refreshBody();
    platform.create(3335,300,"brick").setScale(1,1).refreshBody();
    platform.create(2400,400,"brick").setScale(1,1).refreshBody();
    platform.create(2535,400,"brick").setScale(1,1).refreshBody();
    platform.create(2400,200,"brick").setScale(1,1).refreshBody();
    platform.create(2535,200,"brick").setScale(1,1).refreshBody();    
    platform.create(3900,250,"brick").setScale(1,1).refreshBody();
    platform.create(4035,250,"brick").setScale(1,1).refreshBody();
    platform.create(4170,250,"brick").setScale(1,1).refreshBody();

    
    // add ground to platforms
    platform.add(ground);
    this.physics.add.collider(platform,stars); // ground is also a part of platform
  //  this.physics.add.collider(platform,coins); 
    
     // add a collision detection between player and ground
    this.physics.add.collider(platform,this.player); // on collinding with player, he will transfer its momentum
    
    
    // keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    

    // Animations
    this.anims.create({
        key : 'left',
        frames: this.anims.generateFrameNumbers('dude',{start:0,end:3}),
        frameRate : 10,
        repeat : -1
    });
    this.anims.create({
        key : 'center',
        frames: [{key:'dude',frame:4}],
        frameRate : 10,
    });
    this.anims.create({
        key : 'right',
        frames: this.anims.generateFrameNumbers('dude',{start:5,end:8}),
        frameRate : 10,
        repeat : -1
    });
    
    
    this.physics.add.overlap(this.player,stars,eatFruit,null,this); // when 
    //overlap occurs
   // this.physics.add.overlap(this.player,coins,eatCoins,null,this); 
    
    
    //create cameras
    this.cameras.main.setBounds(0,0,3*W,H);
    this.physics.world.setBounds(0,0,3*W,H);
    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(1);  // go to phaser site and check some more mehthods
    
    
    
    //creating pipe
    let pipes = this.physics.add.staticGroup();
    pipes.create(800,H-160,"pipe").setScale(1,0.5).refreshBody();  
    pipes.create(2500,H-160,"pipe").setScale(1,0.5).refreshBody();
    pipes.create(3*W-150,H-160,"pipe").setScale(1,0.5).refreshBody();
    this.physics.add.collider(pipes,this.player);
   // this.physics.add.collider(pipes,coins);
    this.physics.add.collider(pipes,stars);
    
    // flag
    let flag = this.add.sprite(3*w-80,h-338,"flag");
    flag.setScale(0.5,0.5);
    flag.depth=-2;
    this.add.text(3*W-150,h-449,"Thanks for",{ fontSize: '20px', fill: '#000' });
    this.add.text(3*W-150,h-427,"Playing",{ fontSize: '20px', fill: '#000' });
            
    
    //trees
    let tree = this.add.sprite(3500,H-225,"tree");
    tree.setScale(0.5,0.5);
    tree.depth =-1;
    
    let tree1 = this.add.sprite(100,H-200,"tree1");
    tree1.setScale(0.5,0.5);
    tree1.depth =-1;
    
    
    // coco tree
    let coco = this.add.sprite(1100,H-200+50,"coco");
    coco.setScale(0.5,0.5);
    coco.depth =-1;
    
    let coco1 = this.add.sprite(1200,H-200+20,"coco");
    coco1.setScale(0.5,0.5);
    coco1.depth =-1;
    
    let coco2 = this.add.sprite(1300,H-200,"coco");
    coco2.setScale(0.5,0.5);
    coco2.depth =-1;
    
    let coco3 = this.add.sprite(3900,H-200+50,"coco");
    coco3.setScale(0.5,0.5);
    coco3.depth =-1;
    
    let coco4 = this.add.sprite(4000,H-200+20,"coco");
    coco4.setScale(0.5,0.5);
    coco4.depth =-1;
    
    let coco5 = this.add.sprite(4100,H-200,"coco");
    coco5.setScale(0.5,0.5);
    coco5.depth =-1;
    
    
    // mountains
    let mountain = this.add.sprite(2000,H-128,"mountain");
    mountain.setScale(1,1);
    mountain.depth =-1;
    
    for(let i=-25;i<=20;i++){
        let cloud = this.add.sprite(250*i,150+i,'cloud');
       // cloud.displayHeight = 1.1*H;
        cloud.setOrigin(0.5,1);
        cloud.alpha = 0.4;
        cloud.depth = -1;
    }
      
     //Add birds
    for(let i=0;i<=4;i++)
    {
        birds = this.add.sprite(550+800*i,80,'bird');
        birds.setScale(0.7,0.7);
        birds.depth =-2;
     }
    
    // bugs
    for(let i =0;i<=15;i++)
    {
        var bug_right = this.physics.add.sprite(150+800*i,150,"bug_right");
        bug_right.setScale(0.7,0.7);
        bug_right.setVelocityX(100);
        this.physics.add.collider(this.player,bug_right,gameOver);
        this.physics.add.collider(platform,bug_right);

    }
    
    for(let i =0 ; i<=20;i++)
    {
        var bug_left = this.physics.add.sprite(250+800*i,150,"bug_left");
        bug_left.setScale(0.7,0.7);
        bug_left.setVelocityX(-100);
     // this.physics.add.collider(pipes,bug_right ,bugFunction );
        this.physics.add.collider(this.player,bug_left,gameOver);
        this.physics.add.collider(platform,bug_left);
        
        
    }

    
    score_text = this.add.text(16,16," ",{ fontSize: '30px', fill: '#000'});
   
}



function eatFruit(player,fruit)
{
    fruit.disableBody(true,true);
    score+=100;
    //score_text.setText('Score: ' + score);
}
function update(){
    
    if(this.cursors.left.isDown){
        this.player.setVelocityX(-player_config.player_speed);
        this.player.anims.play('left',true);
    }
    else if(this.cursors.right.isDown){
        
        this.player.setVelocityX(player_config.player_speed);
        this.player.anims.play('right',true);
    
    }
    else{
        this.player.setVelocityX(0);
        this.player.anims.play('center');
    
    }
    
    // add jump ability and stop it when it is in air
    if(this.cursors.up.isDown && this.player.body.touching.down){
        jumpMusic.play();
        this.player.setVelocityY(-player_config.player_jump);
    }
    
     
    if(this.player.x >3*W-100)
    {
        score_text.visible=false;
        score_text = this.add.text(this.player.x-1450,16,"Score: ",{ fontSize: '30px', fill: '#000' });
        score_text.setText('Score: ' + score);
        setTimeout( function(){
              alert("You Win! \nTotal Score :"+score);
            },100);
    }
    
    
}

function gameOver()
{
    jumpMusic.stop();
    let Score = score;
    alert("Game Over ! \nTotal Score : "+score);
}
