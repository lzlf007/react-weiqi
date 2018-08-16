import React, { Component } from 'react';
import { Settings } from 'luxon';
import Phaser from 'phaser';

import Style from './style.scss';

import WhiteBoard from '../../assets/images/whiteBoard.png';
import BlackBoard from '../../assets/images/blackBoard.png';
import MoveBlackBoard from '../../assets/images/blackMove.png';
import Grid from '../../assets/images/grid.png';
import MoverPiece from '../../assets/images/movePiece.png';

Settings.defaultLocale = 'en';

let game;


class Home extends Component {
  state = {
    list: [],
  };

  componentDidMount() {

    this.initWeiai();

  }

  initWeiai = () =>
  {
    const config = {
      type: Phaser.CANVAS,
      parent: 'weiqi',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor:'#742502',
      scene: {
        preload: this.preload,
        create: this.create,
      }
    };
    game = new Phaser.Game(config);
    window.addEventListener('resize', function (event) {
      game.resize(window.innerWidth, window.innerHeight);

    }, false);
  };


  preload ()
  {

    //this.load.crossOrigin = 'anonymous'; // 设置跨域

    this.load.image('whiteBoard', WhiteBoard);
    this.load.image('blackBoard', BlackBoard);
    this.load.spritesheet('grid', Grid, { frameWidth: 38, frameHeight: 38 });
    this.load.spritesheet('moverPiece', MoverPiece, { frameWidth: 38, frameHeight: 38 });
    this.load.spritesheet('blackMovePiece', MoveBlackBoard, { frameWidth: 190, frameHeight: 190 });
  }
  create()
  {

    // 绘制背景框
    let bg1 = this.add.graphics({ fillStyle:{ color: 0xEFA276 } });
    let bg1Rect = new Phaser.Geom.Rectangle(5, 5, 740, 740);
    bg1.fillRectShape(bg1Rect);

    // 绘制背景框2
    let bg2 = this.add.graphics({ lineStyle: { width: 4, color: 0x560000 }});
    let bg2Rect = new Phaser.Geom.Rectangle(26, 26, 698, 698);
    bg2.strokeRectShape(bg2Rect);

    // 绘制网络
    for( let i=0;i<19;i++ )
    {
      let lineObj = this.add.graphics({ lineStyle: { width: 2, color: 0x560000 } });
      let verticalLine = new Phaser.Geom.Line(33+(i*38), 33, 33+(i*38), 718);
      let horizontal = new Phaser.Geom.Line(33, 33+(i*38), 718,33+(i*38),);
      lineObj.strokeLineShape(verticalLine);
      lineObj.strokeLineShape(horizontal);
    }

    // 绘制网络圆点
    const weiqiBoardPoints = [
      [147,147],[375,147],[603,147],
      [147,375],[375,375],[603,375],
      [147,603],[375,603],[603,603],
    ];
    for (let i=0;i<weiqiBoardPoints.length;i++)
    {
      let circle = new Phaser.Geom.Circle(weiqiBoardPoints[i][0], weiqiBoardPoints[i][1], 4);
      let circleObj = this.add.graphics({ fillStyle: { color: 0x560000 } });
      circleObj.fillCircleShape(circle);
    }

    // 生成格子
    let gridIndex = 0;
    let grids = [];
    for (let i=0;i<361;i++)
    {
      if(gridIndex>18){ gridIndex = 0; }
      let row = parseInt(i/19);
      let grid = this.add.sprite(33+(gridIndex*38), 33+(row*38), 'grid',0).setInteractive();
      grid.input.dropZone = true;
      grids.push(grid);
      gridIndex++;
    }

    this.input.on('gameobjectdown', function (pointer, gameObject) {
      // gameObject.setFrame(1);
    });

    // 生成棋篓
    let blackBoard = this.add.sprite(255, 865, 'blackBoard');

    let whiteBoard = this.add.sprite(495, 865, 'whiteBoard');
    //let black = this.add.sprite(33+(gridIndex*38), 33+(row*38), 'grid',0).setInteractive();

    // 创建黑色棋篓可移动区域
    let blackMovePiece = this.add.sprite(255, 865, 'blackMovePiece',0).setInteractive().setName("blackMovePiece");
    this.input.setDraggable(blackMovePiece);

    // 创建白色棋篓可移动区域
    let whiteMovePiece = this.add.sprite(495, 865, 'blackMovePiece',0).setInteractive().setName("whiteMovePiece");
    this.input.setDraggable(whiteMovePiece);

    // 创建黑/白色移动棋子
    let movePiece = this.add.sprite(-100, -100, 'moverPiece',1).setDepth(2);

    // 创建辅助线组合
    let guidelines = this.add.container(-1000, -1000).setDepth(1).setAlpha(0.9);
    let guidelinesGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xfffae1 } });
    let lineX = new Phaser.Geom.Line(-342, 0, 342, 0);
    let lineY = new Phaser.Geom.Line(0, -342, 0, 342);
    guidelines.add([ guidelinesGraphics.strokeLineShape(lineX),guidelinesGraphics.strokeLineShape(lineY) ]);

    // 设置棋子集合
    let pieceGroup = this.add.group();

    this.input.on('dragstart', function (pointer, gameObject) {
      if(gameObject.name==='blackMovePiece'){
        movePiece.setFrame(0);
      }else if(gameObject.name==='whiteMovePiece'){
        movePiece.setFrame(1);
      }
    })

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {

      // 从棋篓里拖拽棋子
      if(gameObject.name==="blackMovePiece" || gameObject.name==="whiteMovePiece")
      {
        movePiece.x = dragX;
        movePiece.y = dragY;
        for(let i=0;i<grids.length;i++){
          if( Math.abs(movePiece.x-grids[i].x)<=19 && Math.abs(movePiece.y-grids[i].y)<=19 ){
            // grids[i].setFrame(1);
            movePiece.x = grids[i].x;
            movePiece.y = grids[i].y;
            guidelines.x = grids[i].x;
            guidelines.y = grids[i].y;
          }else{
            // grids[i].setFrame(0);
          }
        }
      }
      // 在棋盘上拖拽棋子
      else
      {
        gameObject.x = dragX;
        gameObject.y = dragY;
        for(let i=0;i<grids.length;i++){
          if( Math.abs(gameObject.x-grids[i].x)<=19 && Math.abs(gameObject.y-grids[i].y)<=19 ){
            gameObject.x = grids[i].x;
            gameObject.y = grids[i].y;
            guidelines.x = grids[i].x;
            guidelines.y = grids[i].y;
          }else{
            // grids[i].setFrame(0);
          }
        }
      }



    });

    /*this.input.on('dragenter', function (pointer, gameObject, dropZone) {

    });

    this.input.on('dragleave', function (pointer, gameObject, dropZone) {

    });*/


    this.input.on('dragend', function (pointer, gameObject) {

      //拖拽添加黒棋或者白棋
      if(gameObject.name==="blackMovePiece" || gameObject.name==="whiteMovePiece")
      {
        let frame = gameObject.name==="blackMovePiece" ? 0 : 1;
        let piece = this.add.sprite(movePiece.x, movePiece.y, 'moverPiece',frame).setDepth(2).setInteractive();
        this.input.setDraggable(piece);
        pieceGroup.add(piece);
        movePiece.x = -100;
        movePiece.y = -100;
      }
      guidelines.x = -1000;
      guidelines.y = -1000;
      console.log(pieceGroup);
    },this);







    // 示例
    /*this.add.image(200, 300, 'sky');
    var particles = this.add.particles('red');
    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });
    var logo = this.physics.add.image(400, 100, 'logo');
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);
    emitter.startFollow(logo);*/


    // 拖动图片
    /*var image = this.add.sprite(200, 300, 'sky').setInteractive();
    this.input.setDraggable(image);
    //  The pointer has to move 16 pixels before it's considered as a drag
    this.input.dragDistanceThreshold = 16;
    this.input.on('dragstart', function (pointer, gameObject) {
      gameObject.setTint(0xff0000);
    });
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.input.on('dragend', function (pointer, gameObject) {
      gameObject.clearTint();
    });*/
    //this.scale.scaleMode =  Phaser.ScaleManager;

    /*var group = this.add.group({
      key: 'sky',
      frame: [ 0, 1, 2, 3, 4 ],
      frameQuantity: 20,
      width:10,
      height:10,
    });

    //console.log(group.getChildren());

    Phaser.Actions.GridAlign(group.getChildren(), {
      width: 10,
      height: 10,
      cellWidth: 32,
      cellHeight: 32,
      x: 20,
      y: 20
    });*/


    /*this.bg = this.add.image(0, 0, 'bg').setOrigin(0).setDisplaySize(game.config.width, game.config.height);
    this.logo = this.add.sprite(game.config.width / 2, game.config.height / 2, 'logo');*/


    //this.bg = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'bg').setOrigin(0);
    //this.logo = this.add.sprite(game.config.width / 2, game.config.height / 2, 'logo');



    /*var circle = new Phaser.Geom.Circle(350, 300, 225);
    var labelCircle = new Phaser.Geom.Circle(350, 300, 265);

    var graphics = this.add.graphics();

    graphics.lineStyle(2, 0x00bb00, 1);

    graphics.strokeCircleShape(circle);

    graphics.beginPath();

    for (var a = 0; a < 360; a += 22.5)
    {
      graphics.moveTo(350, 300);

      var p = Phaser.Geom.Circle.CircumferencePoint(circle, Phaser.Math.DegToRad(a));

      graphics.lineTo(p.x, p.y);

      var lp = Phaser.Geom.Circle.CircumferencePoint(labelCircle, Phaser.Math.DegToRad(a));

    }

    graphics.strokePath();*/


  }


  render() {
    return (
      <div id="weiqi" className={Style.wrapper}>

      </div>
    );
  }
}

export default Home;
