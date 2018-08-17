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

class Weiqi extends Phaser.Scene {

  constructor ()
  {
    super('Weiqi');

    this.pieceGroup = [];
  }

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

    const GAME_PARAMS = {
      boardX:33,// 棋盘起始x坐标
      boardY:33,// 棋盘起始y坐标
      gridSize:38,// 棋盘格子大小
    }
    let movePieceXY = [0,0];
    //棋子移动动画
    let pieceTween = null;

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
      let verticalLine = new Phaser.Geom.Line(GAME_PARAMS.boardX+(i*GAME_PARAMS.gridSize), GAME_PARAMS.boardY, GAME_PARAMS.boardX+(i*GAME_PARAMS.gridSize), GAME_PARAMS.gridSize*18+GAME_PARAMS.boardX);
      let horizontal = new Phaser.Geom.Line(GAME_PARAMS.boardX, GAME_PARAMS.boardX+(i*GAME_PARAMS.gridSize), GAME_PARAMS.gridSize*18+GAME_PARAMS.boardY,GAME_PARAMS.boardY+(i*GAME_PARAMS.gridSize));
      lineObj.strokeLineShape(verticalLine);
      lineObj.strokeLineShape(horizontal);
    }

    // 绘制网络圆点
    const weiqiBoardPoints = [
      [GAME_PARAMS.gridSize*3+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*3+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*9+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*3+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*15+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*3+GAME_PARAMS.boardY],
      [GAME_PARAMS.gridSize*3+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*9+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*9+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*9+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*15+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*9+GAME_PARAMS.boardY],
      [GAME_PARAMS.gridSize*3+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*15+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*9+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*15+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*15+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*15+GAME_PARAMS.boardY],
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
      let row = parseInt((i/19),10);
      let grid = this.add.sprite(GAME_PARAMS.boardX+(gridIndex*GAME_PARAMS.gridSize), GAME_PARAMS.boardY+(row*GAME_PARAMS.gridSize), 'grid',0).setInteractive();
      grid.input.dropZone = true;
      grids.push(grid);
      gridIndex++;
    }

    this.input.on('gameobjectdown', function (pointer, gameObject) {
      // gameObject.setFrame(1);
      // console.log(gameObject);
    });

    // 生成棋篓
    let blackBoard = this.add.sprite(255, 865, 'blackBoard');

    let whiteBoard = this.add.sprite(495, 865, 'whiteBoard');

    // 创建黑色棋篓可移动区域
    let blackMovePiece = this.add.sprite(255, 865, 'blackMovePiece',0).setInteractive().setName("blackMovePiece");
    this.input.setDraggable(blackMovePiece);

    // 创建白色棋篓可移动区域
    let whiteMovePiece = this.add.sprite(495, 865, 'blackMovePiece',0).setInteractive().setName("whiteMovePiece");
    this.input.setDraggable(whiteMovePiece);

    // 创建黑/白色移动棋子
    let movePiece = this.add.sprite(255, 865, 'moverPiece',1).setAlpha(0).setDepth(2);

    // 创建辅助线组合
    let guidelines = this.add.container(-1000, -1000).setDepth(1).setAlpha(0.9);
    let guidelinesGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xfffae1 } });
    let lineX = new Phaser.Geom.Line(-342, 0, 342, 0);
    let lineY = new Phaser.Geom.Line(0, -342, 0, 342);
    guidelines.add([ guidelinesGraphics.strokeLineShape(lineX),guidelinesGraphics.strokeLineShape(lineY) ]);

    // 设置棋子集合
    this.pieceGroup = this.add.group();

    // 画布移动开始事件
    this.input.on('dragstart', function (pointer, gameObject)
    {
      // 从棋篓里拖拽棋子
      if(gameObject.name==='blackMovePiece' || gameObject.name==='whiteMovePiece')
      {
        if(gameObject.name==='blackMovePiece'){
          movePiece.setFrame(0);
        }else if(gameObject.name==='whiteMovePiece'){
          movePiece.setFrame(1);
        }
        movePieceXY[0] = gameObject.x;
        movePieceXY[1] = gameObject.y;
      }

    })

    // 画布移动中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {

      // 从棋篓里拖拽棋子
      if(gameObject.name==="blackMovePiece" || gameObject.name==="whiteMovePiece")
      {
        movePiece.setAlpha(1);
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


    // 画布移动结束事件
    this.input.on('dragend', function (pointer, gameObject)
    {

      //拖拽添加黒棋或者白棋
      if(gameObject.name==="blackMovePiece" || gameObject.name==="whiteMovePiece")
      {

        //如果拖拽到棋盘内则添加棋子
        if(movePiece.x>=GAME_PARAMS.boardX && movePiece.x<=GAME_PARAMS.boardX+GAME_PARAMS.gridSize*18 && movePiece.y>=GAME_PARAMS.boardY && movePiece.y<=GAME_PARAMS.boardY+GAME_PARAMS.gridSize*18)
        {

          let frame = gameObject.name==="blackMovePiece" ? 0 : 1;
          let piece = this.add.sprite(movePiece.x, movePiece.y, 'moverPiece',frame).setDepth(2).setInteractive();
          this.input.setDraggable(piece);
          this.pieceGroup.add(piece);
          movePiece.x = -100;
          movePiece.y = -100;
        }
        else
        {
          pieceTween = this.tweens.add({
            targets: movePiece,
            props: {
              x: { value: movePieceXY[0], duration: 600, ease: 'Power2' },
              y: { value: movePieceXY[1], duration: 650, ease: 'Power2' }
            },
            onComplete:function(){
              movePiece.x = -100;
              movePiece.y = -100;
            }
          });
          pieceTween = null;

        }

      }
      guidelines.x = -1000;
      guidelines.y = -1000;

      this.checkPiecePosition();

      //删除棋子
      /*if(pieceGroup.getLength()>2){
        piece.destroy()
      }*/

    },this);

  }

  checkPiecePosition ()
  {
    console.log(this.pieceGroup.getChildren());
  }

}


class Home extends Component {
  state = {
    list: [],
  };

  componentDidMount() {
    this.initWeiqi();
  }

  initWeiqi = () =>
  {
    const config = {
      type: Phaser.CANVAS,
      parent: 'weiqi',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor:'#742502',
      scene: [ Weiqi]
      /*scene: {
        preload: this.preload,
        create: this.create,
      }*/
    };
    game = new Phaser.Game(config);
    window.addEventListener('resize', function (event) {
      game.resize(window.innerWidth, window.innerHeight);
    }, false);
  };


  /*preload ()
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

    const GAME_PARAMS = {
      boardX:33,// 棋盘起始x坐标
      boardY:33,// 棋盘起始y坐标
      gridSize:38,// 棋盘格子大小
    }
    let movePieceXY = [0,0];
    //棋子移动动画
    let pieceTween = null;

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
      let verticalLine = new Phaser.Geom.Line(GAME_PARAMS.boardX+(i*GAME_PARAMS.gridSize), GAME_PARAMS.boardY, GAME_PARAMS.boardX+(i*GAME_PARAMS.gridSize), GAME_PARAMS.gridSize*18+GAME_PARAMS.boardX);
      let horizontal = new Phaser.Geom.Line(GAME_PARAMS.boardX, GAME_PARAMS.boardX+(i*GAME_PARAMS.gridSize), GAME_PARAMS.gridSize*18+GAME_PARAMS.boardY,GAME_PARAMS.boardY+(i*GAME_PARAMS.gridSize));
      lineObj.strokeLineShape(verticalLine);
      lineObj.strokeLineShape(horizontal);
    }

    // 绘制网络圆点
    const weiqiBoardPoints = [
      [GAME_PARAMS.gridSize*3+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*3+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*9+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*3+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*15+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*3+GAME_PARAMS.boardY],
      [GAME_PARAMS.gridSize*3+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*9+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*9+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*9+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*15+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*9+GAME_PARAMS.boardY],
      [GAME_PARAMS.gridSize*3+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*15+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*9+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*15+GAME_PARAMS.boardY],[GAME_PARAMS.gridSize*15+GAME_PARAMS.boardX,GAME_PARAMS.gridSize*15+GAME_PARAMS.boardY],
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
      let row = parseInt((i/19),10);
      let grid = this.add.sprite(GAME_PARAMS.boardX+(gridIndex*GAME_PARAMS.gridSize), GAME_PARAMS.boardY+(row*GAME_PARAMS.gridSize), 'grid',0).setInteractive();
      grid.input.dropZone = true;
      grids.push(grid);
      gridIndex++;
    }

    this.input.on('gameobjectdown', function (pointer, gameObject) {
       // gameObject.setFrame(1);
      // console.log(gameObject);
    });

    // 生成棋篓
    let blackBoard = this.add.sprite(255, 865, 'blackBoard');

    let whiteBoard = this.add.sprite(495, 865, 'whiteBoard');

    // 创建黑色棋篓可移动区域
    let blackMovePiece = this.add.sprite(255, 865, 'blackMovePiece',0).setInteractive().setName("blackMovePiece");
    this.input.setDraggable(blackMovePiece);

    // 创建白色棋篓可移动区域
    let whiteMovePiece = this.add.sprite(495, 865, 'blackMovePiece',0).setInteractive().setName("whiteMovePiece");
    this.input.setDraggable(whiteMovePiece);

    // 创建黑/白色移动棋子
    let movePiece = this.add.sprite(255, 865, 'moverPiece',1).setAlpha(0).setDepth(2);

    // 创建辅助线组合
    let guidelines = this.add.container(-1000, -1000).setDepth(1).setAlpha(0.9);
    let guidelinesGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xfffae1 } });
    let lineX = new Phaser.Geom.Line(-342, 0, 342, 0);
    let lineY = new Phaser.Geom.Line(0, -342, 0, 342);
    guidelines.add([ guidelinesGraphics.strokeLineShape(lineX),guidelinesGraphics.strokeLineShape(lineY) ]);

    // 设置棋子集合
    let pieceGroup = this.add.group();

    // 画布移动开始事件
    this.input.on('dragstart', function (pointer, gameObject)
    {
      // 从棋篓里拖拽棋子
      if(gameObject.name==='blackMovePiece' || gameObject.name==='whiteMovePiece')
      {
        if(gameObject.name==='blackMovePiece'){
          movePiece.setFrame(0);
        }else if(gameObject.name==='whiteMovePiece'){
          movePiece.setFrame(1);
        }
        movePieceXY[0] = gameObject.x;
        movePieceXY[1] = gameObject.y;
      }

    })

    // 画布移动中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {

      // 从棋篓里拖拽棋子
      if(gameObject.name==="blackMovePiece" || gameObject.name==="whiteMovePiece")
      {
        movePiece.setAlpha(1);
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

    /!*this.input.on('dragenter', function (pointer, gameObject, dropZone) {

    });

    this.input.on('dragleave', function (pointer, gameObject, dropZone) {

    });*!/


    // 画布移动结束事件
    this.input.on('dragend', function (pointer, gameObject)
    {
      let piece;
      //拖拽添加黒棋或者白棋
      if(gameObject.name==="blackMovePiece" || gameObject.name==="whiteMovePiece")
      {

        //如果拖拽到棋盘内则添加棋子
        if(movePiece.x>=GAME_PARAMS.boardX && movePiece.x<=GAME_PARAMS.boardX+GAME_PARAMS.gridSize*18 && movePiece.y>=GAME_PARAMS.boardY && movePiece.y<=GAME_PARAMS.boardY+GAME_PARAMS.gridSize*18)
        {

          let frame = gameObject.name==="blackMovePiece" ? 0 : 1;
          piece = this.add.sprite(movePiece.x, movePiece.y, 'moverPiece',frame).setDepth(2).setInteractive();
          this.input.setDraggable(piece);
          pieceGroup.add(piece);
          movePiece.x = -100;
          movePiece.y = -100;
        }
        else
        {
          pieceTween = this.tweens.add({
            targets: movePiece,
            props: {
              x: { value: movePieceXY[0], duration: 600, ease: 'Power2' },
              y: { value: movePieceXY[1], duration: 650, ease: 'Power2' }
            },
            onComplete:function(){
              movePiece.x = -100;
              movePiece.y = -100;
            }
          });
          pieceTween = null;

        }

      }
      guidelines.x = -1000;
      guidelines.y = -1000;

      //删除棋子
      /!*if(pieceGroup.getLength()>2){
        piece.destroy()
      }*!/
      console.log(pieceGroup.getChildren());
    },this);

    /!*checkPiecePosition ()
    {
      console.log(this);
    }*!/

  }*/




  render() {
    return (
      <div id="weiqi" className={Style.wrapper}>

      </div>
    );
  }
}

export default Home;
