import React, { Component, Fragment } from 'react';
import { Settings } from 'luxon';
import Phaser from 'phaser';
import { EventEmitter } from '../../utils';
import Toast, { T } from 'react-toast-mobile';
import Style from './style.scss';

import { Course } from '../../service';

import { VALUE } from '../../constants';

import WhiteBoard from '../../assets/images/whiteBoard.png';
import BlackBoard from '../../assets/images/blackBoard.png';
import Grid from '../../assets/images/grid.png';
import MoverPiece from '../../assets/images/movePiece.png';
import CleanBtn from '../../assets/images/btnClean.png';

Settings.defaultLocale = 'en';

let game;
let parentThis;

class Weiqi extends Phaser.Scene {
  constructor() {
    super('Weiqi');

    // 棋盘容器
    this.boardContainer = [];
    // 棋盘上棋子实时集合
    this.pieceGroup = [];
    // 棋盘上移动棋子前的集合
    this.beforeMovePieceGroup = [];
    // 白色棋篓
    this.whiteBoard = null;
    // 黑色棋篓
    this.blackBoard = null;
    // 清空按钮
    this.cleanBtn = null;
    // 保存按钮
    this.saveBtn = null;
    // 棋盘参数
    this.GAME_PARAMS = {
      boardContainerX: 5, // 棋盘容器起始x坐标
      boardContainerY: 5, // 棋盘容器起始y坐标
      boardX: 28, // 棋盘起始x坐标
      boardY: 28, // 棋盘起始y坐标
      gridSize: 38, // 棋盘格子大小
      minBoardX: 0, // 棋盘上x最小值
      minBoardY: 0, // 棋盘上y最小值
      maxBoardX: 0, // 棋盘上x最大值
      maxBoardY: 0 // 棋盘上y最大值
    };
    this.GAME_PARAMS.minBoardX =
      this.GAME_PARAMS.boardContainerX + this.GAME_PARAMS.boardX;
    this.GAME_PARAMS.minBoardY =
      this.GAME_PARAMS.boardContainerY + this.GAME_PARAMS.boardY;
    this.GAME_PARAMS.maxBoardX =
      this.GAME_PARAMS.boardContainerX +
      this.GAME_PARAMS.boardX +
      18 * this.GAME_PARAMS.gridSize;
    this.GAME_PARAMS.maxBoardY =
      this.GAME_PARAMS.boardContainerY +
      this.GAME_PARAMS.boardY +
      18 * this.GAME_PARAMS.gridSize;
  }

  preload() {
    EventEmitter.emit('fetch-show-loading');
    //this.load.crossOrigin = 'anonymous'; // 设置跨域
    this.load.spritesheet('whiteBoard', WhiteBoard, {
      frameWidth: 210,
      frameHeight: 210
    });
    this.load.spritesheet('blackBoard', BlackBoard, {
      frameWidth: 210,
      frameHeight: 210
    });
    this.load.spritesheet('grid', Grid, { frameWidth: 38, frameHeight: 38 });
    this.load.spritesheet('moverPiece', MoverPiece, {
      frameWidth: 38,
      frameHeight: 38
    });
    this.load.spritesheet('cleanBtn', CleanBtn, {
      frameWidth: 169,
      frameHeight: 91
    });
    this.load.on('complete', function() {
      EventEmitter.emit('fetch-hide-loading');
    });
  }
  create() {
    //设置棋盘容器
    this.boardContainer = this.add
      .container(
        this.GAME_PARAMS.boardContainerX,
        this.GAME_PARAMS.boardContainerY
      )
      .setSize(740, 740);

    // 设置棋子集合
    this.pieceGroup = this.add.group();

    //初始化棋盘数据
    this.initPieceBoard();

    //添加新棋子的原始坐标
    let movePieceXY = [0, 0];
    //当前棋盘上拖动棋子的原始坐标
    let pieceXY = [0, 0];

    // 绘制背景框
    let bg1 = this.add.graphics({ fillStyle: { color: 0xefa276 } });
    let bg1Rect = new Phaser.Geom.Rectangle(0, 0, 740, 740);
    // bg1.fillRectShape(bg1Rect);
    this.boardContainer.add(bg1.fillRectShape(bg1Rect));

    // 绘制背景框2
    let bg2 = this.add.graphics({ lineStyle: { width: 4, color: 0x560000 } });
    let bg2Rect = new Phaser.Geom.Rectangle(21, 21, 698, 698);
    // bg2.strokeRectShape(bg2Rect);
    this.boardContainer.add(bg2.strokeRectShape(bg2Rect));

    // 绘制网络
    for (let i = 0; i < 19; i++) {
      let lineObj = this.add.graphics({
        lineStyle: { width: 2, color: 0x560000 }
      });
      let verticalLine = new Phaser.Geom.Line(
        this.GAME_PARAMS.boardX + i * this.GAME_PARAMS.gridSize,
        this.GAME_PARAMS.boardY,
        this.GAME_PARAMS.boardX + i * this.GAME_PARAMS.gridSize,
        this.GAME_PARAMS.gridSize * 18 + this.GAME_PARAMS.boardX
      );
      let horizontal = new Phaser.Geom.Line(
        this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.boardX + i * this.GAME_PARAMS.gridSize,
        this.GAME_PARAMS.gridSize * 18 + this.GAME_PARAMS.boardY,
        this.GAME_PARAMS.boardY + i * this.GAME_PARAMS.gridSize
      );
      //lineObj.strokeLineShape(verticalLine);
      //lineObj.strokeLineShape(horizontal);
      this.boardContainer.add(lineObj.strokeLineShape(verticalLine));
      this.boardContainer.add(lineObj.strokeLineShape(horizontal));
    }

    // 绘制网络圆点
    const weiqiBoardPoints = [
      [
        this.GAME_PARAMS.gridSize * 3 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 3 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 9 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 3 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 15 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 3 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 3 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 9 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 9 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 9 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 15 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 9 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 3 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 15 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 9 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 15 + this.GAME_PARAMS.boardY
      ],
      [
        this.GAME_PARAMS.gridSize * 15 + this.GAME_PARAMS.boardX,
        this.GAME_PARAMS.gridSize * 15 + this.GAME_PARAMS.boardY
      ]
    ];
    for (let i = 0; i < weiqiBoardPoints.length; i++) {
      let circle = new Phaser.Geom.Circle(
        weiqiBoardPoints[i][0],
        weiqiBoardPoints[i][1],
        4
      );
      let circleObj = this.add.graphics({ fillStyle: { color: 0x560000 } });
      // circleObj.fillCircleShape(circle);
      this.boardContainer.add(circleObj.fillCircleShape(circle));
    }

    // 生成格子
    let gridIndex = 0;
    let grids = [];
    for (let i = 0; i < 361; i++) {
      if (gridIndex > 18) {
        gridIndex = 0;
      }
      let row = parseInt(i / 19, 10);
      let grid = this.add
        .sprite(
          this.GAME_PARAMS.boardX + gridIndex * this.GAME_PARAMS.gridSize,
          this.GAME_PARAMS.boardY + row * this.GAME_PARAMS.gridSize,
          'grid',
          0
        )
        .setInteractive()
        .setName('grid');
      grid.input.dropZone = true;
      grids.push(grid);
      gridIndex++;
    }

    this.boardContainer.add(grids);

    // 生成棋篓
    this.blackBoard = this.add
      .sprite(255, 865, 'blackBoard', 0)
      .setInteractive()
      .setName('blackMovePiece');
    this.input.setDraggable(this.blackBoard);

    this.whiteBoard = this.add
      .sprite(495, 865, 'whiteBoard', 0)
      .setInteractive()
      .setName('whiteMovePiece');
    this.input.setDraggable(this.whiteBoard);

    // 添加清空按钮
    this.cleanBtn = this.add
      .sprite(274, 1030, 'cleanBtn', 0)
      .setInteractive()
      .setName('cleanBtn');
    // 添加保存按钮
    this.saveBtn = this.add
      .sprite(474, 1030, 'cleanBtn', 2)
      .setInteractive()
      .setName('saveBtn');

    // 设置拖拽延时
    // this.input.dragTimeThreshold = 50;
    // 设置拖拽最小生效距离
    this.input.dragDistanceThreshold = 3;

    // 创建黑/白色移动棋子
    let movePiece = this.add
      .sprite(255, 865, 'moverPiece', 1)
      .setAlpha(0)
      .setDepth(2);

    // 创建辅助线组合
    let guidelines = this.add
      .container(-1000, -1000)
      .setDepth(1)
      .setAlpha(0.9);
    let guidelinesGraphics = this.add.graphics({
      lineStyle: { width: 2, color: 0xfffae1 }
    });
    let lineX = new Phaser.Geom.Line(-342, 0, 342, 0);
    let lineY = new Phaser.Geom.Line(0, -342, 0, 342);
    guidelines.add([
      guidelinesGraphics.strokeLineShape(lineX),
      guidelinesGraphics.strokeLineShape(lineY)
    ]);

    // 画布点击事件
    let timer = null;
    let timerCount = 0;
    this.input.on(
      'gameobjectdown',
      function(pointer, gameObject) {
        const that = this;
        // 点击棋子
        if (gameObject.name === 'piece') {
          // 清除棋篓选中状态
          this.cleanBoardState();
          movePiece.x = -100;
          movePiece.y = -100;

          // 设置棋子选中状态
          this.cleanPieceState();
          const frame = gameObject.frame.name % 2 === 0 ? 2 : 3;
          gameObject.setFrame(frame);

          //设置棋子选中状态
          timerCount++;
          timer = setTimeout(function() {
            timerCount = 0;
            clearTimeout(timer);
          }, 250);

          // 双击去子
          if (timerCount === 2) {
            let targetX =
              gameObject.frame.name % 2 === 0
                ? this.blackBoard.x
                : this.whiteBoard.x;
            let targetY =
              gameObject.frame.name % 2 === 0
                ? this.blackBoard.y
                : this.whiteBoard.y;
            gameObject.setFrame(gameObject.frame.name % 2 ? 1 : 0);

            this.tweens.add({
              targets: gameObject,
              props: {
                x: { value: targetX, duration: 600, ease: 'Power2' },
                y: { value: targetY, duration: 650, ease: 'Power2' }
              },
              onComplete: function() {
                gameObject.destroy();
              }
            });
          }
        }
        // 点击棋篓
        if (
          gameObject.name === 'blackMovePiece' ||
          gameObject.name === 'whiteMovePiece'
        ) {
          // 清除棋篓选中状态
          this.cleanBoardState();
          movePiece.x = -100;
          movePiece.y = -100;

          // 清除棋篓选中状态
          this.cleanPieceState();

          let frame = gameObject.frame.name;
          if (frame === 0) {
            gameObject.setFrame(1);
          } else {
            gameObject.setFrame(0);
          }

          //初始化移动棋子位置
          movePiece.setAlpha(1);
          movePiece.x = gameObject.x + 80;
          movePiece.y = gameObject.y - 80;
          movePiece.setFrame(gameObject.name === 'blackMovePiece' ? 0 : 1);
        }
        // 点击格子 (添加棋子|移动棋子)
        if (gameObject.name === 'grid') {
          let boardType = null;
          if (this.blackBoard.frame.name === 1) {
            boardType = 'black';
          }
          if (this.whiteBoard.frame.name === 1) {
            boardType = 'white';
          }
          // 选中棋篓进行下子
          if (boardType) {
            let origin = [movePiece.x, movePiece.y];
            this.tweens.add({
              targets: movePiece,
              props: {
                x: {
                  value: gameObject.x + this.GAME_PARAMS.boardContainerX,
                  duration: 100,
                  ease: 'Power2'
                },
                y: {
                  value: gameObject.y + this.GAME_PARAMS.boardContainerY,
                  duration: 100,
                  ease: 'Power2'
                }
              },
              onComplete: function() {
                let piece = that.add
                  .sprite(
                    movePiece.x,
                    movePiece.y,
                    'moverPiece',
                    boardType === 'black' ? 0 : 1
                  )
                  .setDepth(2)
                  .setInteractive()
                  .setName('piece');
                that.input.setDraggable(piece);
                that.pieceGroup.add(piece);
                movePiece.x = origin[0];
                movePiece.y = origin[1];
              }
            });
          }
          // 移动棋子
          const pieceGroup = this.pieceGroup.getChildren().filter(item => {
            return item.frame.name > 1;
          });
          if (pieceGroup && pieceGroup.length > 0) {
            this.tweens.add({
              targets: pieceGroup[0],
              props: {
                x: {
                  value: gameObject.x + this.GAME_PARAMS.boardContainerX,
                  duration: 300,
                  ease: 'Power2'
                },
                y: {
                  value: gameObject.y + this.GAME_PARAMS.boardContainerY,
                  duration: 300,
                  ease: 'Power2'
                }
              },
              onComplete: function() {
                pieceGroup[0].setFrame(
                  pieceGroup[0].frame.name % 2 === 0 ? 0 : 1
                );
              }
            });
          }
        }

        // 点击清空棋盘按钮
        if (gameObject.name === 'cleanBtn') {
          this.cleanBtn.setFrame(1);
          setTimeout(() => {
            this.cleanBtn.setFrame(0);
          }, 150);

          T.confirm({
            title: '提示',
            message: '确定要清空棋盘么？',
            option: [
              {
                text: '确定',
                fn: () => {
                  this.pieceGroup.clear(false, true);
                }
              },
              {
                text: '取消'
              }
            ]
          });
        }

        // 点击保存棋盘数据
        if (gameObject.name === 'saveBtn') {
          /*parentThis.test();
        parentThis.setState({
          abc:'32423'
        })*/
          this.saveBtn.setFrame(3);
          setTimeout(() => {
            this.saveBtn.setFrame(2);
          }, 150);
          this.saveData();
        }
      },
      this
    );

    // 画布移动开始事件
    this.input.on(
      'dragstart',
      function(pointer, gameObject) {
        // 从棋篓里拖拽棋子
        if (
          gameObject.name === 'blackMovePiece' ||
          gameObject.name === 'whiteMovePiece'
        ) {
          if (gameObject.name === 'blackMovePiece') {
            movePiece.setFrame(0);
          } else if (gameObject.name === 'whiteMovePiece') {
            movePiece.setFrame(1);
          }
          movePieceXY[0] = gameObject.x;
          movePieceXY[1] = gameObject.y;
        }

        // 在棋盘上拖动棋子
        if (gameObject.name === 'piece') {
          pieceXY[0] = gameObject.x;
          pieceXY[1] = gameObject.y;
          this.beforeMovePieceGroup = this.pieceGroup
            .getChildren()
            .map(item => {
              return { x: item.x, y: item.y };
            });
        }
      },
      this
    );

    // 画布移动中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 从棋篓里拖拽棋子
      if (
        gameObject.name === 'blackMovePiece' ||
        gameObject.name === 'whiteMovePiece'
      ) {
        movePiece.setAlpha(1);
        movePiece.x = dragX;
        movePiece.y = dragY;
        for (let i = 0; i < grids.length; i++) {
          if (
            Math.abs(
              movePiece.x - (grids[i].x + this.GAME_PARAMS.boardContainerX)
            ) <= 19 &&
            Math.abs(
              movePiece.y - (grids[i].y + this.GAME_PARAMS.boardContainerY)
            ) <= 19
          ) {
            // grids[i].setFrame(1);
            movePiece.x = grids[i].x + this.GAME_PARAMS.boardContainerX;
            movePiece.y = grids[i].y + this.GAME_PARAMS.boardContainerY;
            guidelines.x = grids[i].x + this.GAME_PARAMS.boardContainerX;
            guidelines.y = grids[i].y + this.GAME_PARAMS.boardContainerY;
          } else {
            // grids[i].setFrame(0);
          }
        }
      }
      // 在棋盘上拖拽棋子
      else if (gameObject.name === 'piece') {
        gameObject.x = dragX;
        gameObject.y = dragY;
        if (gameObject.x < this.GAME_PARAMS.minBoardX) {
          gameObject.x = this.GAME_PARAMS.minBoardX;
        }
        if (gameObject.x > this.GAME_PARAMS.maxBoardX) {
          gameObject.x = this.GAME_PARAMS.maxBoardX;
        }
        if (gameObject.y < this.GAME_PARAMS.minBoardY) {
          gameObject.y = this.GAME_PARAMS.minBoardY;
        }
        if (gameObject.y > this.GAME_PARAMS.maxBoardY) {
          gameObject.y = this.GAME_PARAMS.maxBoardY;
        }
        for (let i = 0; i < grids.length; i++) {
          if (
            Math.abs(
              gameObject.x - (grids[i].x + this.GAME_PARAMS.boardContainerX)
            ) <= 19 &&
            Math.abs(
              gameObject.y - (grids[i].y + this.GAME_PARAMS.boardContainerY)
            ) <= 19
          ) {
            gameObject.x = grids[i].x + this.GAME_PARAMS.boardContainerX;
            gameObject.y = grids[i].y + this.GAME_PARAMS.boardContainerY;
            guidelines.x = grids[i].x + this.GAME_PARAMS.boardContainerX;
            guidelines.y = grids[i].y + this.GAME_PARAMS.boardContainerY;
          }
        }
      }
    });

    // 画布移动结束事件
    this.input.on(
      'dragend',
      function(pointer, gameObject) {
        //拖拽添加黒棋或者白棋
        if (
          gameObject.name === 'blackMovePiece' ||
          gameObject.name === 'whiteMovePiece'
        ) {
          //如果拖拽到棋盘内则添加棋子
          if (
            movePiece.x >= this.GAME_PARAMS.minBoardX &&
            movePiece.x <= this.GAME_PARAMS.maxBoardX &&
            movePiece.y >= this.GAME_PARAMS.minBoardY &&
            movePiece.y <= this.GAME_PARAMS.maxBoardY &&
            this.checkPiecePosition(movePiece.x, movePiece.y)
          ) {
            let frame = gameObject.name === 'blackMovePiece' ? 0 : 1;
            let piece = this.add
              .sprite(movePiece.x, movePiece.y, 'moverPiece', frame)
              .setDepth(2)
              .setInteractive()
              .setName('piece');
            this.input.setDraggable(piece);
            this.pieceGroup.add(piece);

            this.cleanBoardState();
            movePiece.x = -100;
            movePiece.y = -100;
          } else {
            if (movePiece.x !== -100 && movePiece.y !== -100) {
              this.tweens.add({
                targets: movePiece,
                props: {
                  x: {
                    value: gameObject.x + 80,
                    duration: 600,
                    ease: 'Power2'
                  },
                  y: { value: gameObject.y - 80, duration: 650, ease: 'Power2' }
                },
                onComplete: function() {
                  movePiece.x = gameObject.x + 80;
                  movePiece.y = gameObject.y - 80;
                }
              });
            }
          }
        }

        //拖拽棋盘上的棋子
        if (gameObject.name === 'piece') {
          if (!this.checkPiecePosition(gameObject.x, gameObject.y, true)) {
            this.tweens.add({
              targets: gameObject,
              props: {
                x: { value: pieceXY[0], duration: 600, ease: 'Power2' },
                y: { value: pieceXY[1], duration: 650, ease: 'Power2' }
              },
              onComplete: function() {}
            });
          } else {
            gameObject.setFrame(gameObject.frame.name % 2 === 0 ? 0 : 1);
          }
        }

        guidelines.x = -1000;
        guidelines.y = -1000;

        // console.log(this.pieceGroup.getChildren());
      },
      this
    );
  }

  //初始化棋盘数据
  initPieceBoard = () => {
    const list = parentThis.state.list;
    if (list && list.length > 0) {
      list.forEach(item => {
        let piece = this.add
          .sprite(
            this.GAME_PARAMS.minBoardX + item.x * this.GAME_PARAMS.gridSize,
            this.GAME_PARAMS.minBoardY + item.y * this.GAME_PARAMS.gridSize,
            'moverPiece',
            item.role
          )
          .setDepth(2)
          .setInteractive()
          .setName('piece');
        this.input.setDraggable(piece);
        this.pieceGroup.add(piece);
      });
    }
  };

  /*
  * 判断棋盘上棋子是否被占位
  * isInBoardMove 是否在棋盘上拖动棋子
  */

  checkPiecePosition(moveX, moveY, isInBoardMove) {
    let isEmpty = true;
    const group = !isInBoardMove
      ? this.pieceGroup.getChildren()
      : this.beforeMovePieceGroup;
    let attr = group.filter(piece => {
      return piece.x === moveX && piece.y === moveY;
    });
    if (attr.length > 0) {
      isEmpty = false;
    }
    return isEmpty;
  }

  //清除棋篓选中状态
  cleanBoardState() {
    this.blackBoard.setFrame(0);
    this.whiteBoard.setFrame(0);
  }

  //清除棋子选中状态
  cleanPieceState() {
    if (this.pieceGroup.getChildren() && this.pieceGroup.getLength() > 0) {
      this.pieceGroup.getChildren().forEach(item => {
        if (item.frame.name === 2) {
          item.setFrame(0);
        } else if (item.frame.name === 3) {
          item.setFrame(1);
        }
      });
    }
  }

  // 保存棋子数据
  saveData = () => {
    const pieceGroup = this.pieceGroup.getChildren();
    if (pieceGroup.length < 1) {
      T.alert('请先摆放棋谱');
      return;
    }
    const groupData = pieceGroup.map(list => {
      return {
        role: list.frame.name % 2 === 0 ? 0 : 1,
        x: Math.round(
          (list.x - this.GAME_PARAMS.boardX) / this.GAME_PARAMS.gridSize
        ),
        y: Math.round(
          (list.y - this.GAME_PARAMS.boardY) / this.GAME_PARAMS.gridSize
        )
      };
    });
    console.log(groupData);
  };
}

class Home extends Component {
  constructor() {
    super();
    this.state = {
      list: []
    };
    parentThis = this;
  }

  componentDidMount() {
    Course.getActivityConfig(VALUE.ACT_ID).then(result => {
      if (result) {
        result = [
          { role: 0, x: 7, y: 5 },
          { role: 0, x: 4, y: 6 },
          { role: 0, x: 5, y: 11 },
          { role: 1, x: 0, y: 9 },
          { role: 1, x: 2, y: 11 },
          { role: 1, x: 7, y: 9 }
        ];
        this.setState({
          list: result
        });
        this.initWeiqi();
      }
    });
  }

  initWeiqi = () => {
    const config = {
      type: Phaser.CANVAS,
      parent: 'weiqi',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#742502',
      scene: [Weiqi],
      url: 'https://www.xiaoqishen.com/'
      /*scene: {
        preload: this.preload,
        create: this.create,
      }*/
    };
    game = new Phaser.Game(config);
    window.addEventListener(
      'resize',
      function(event) {
        game.resize(window.innerWidth, window.innerHeight);
      },
      false
    );
  };

  render() {
    return (
      <Fragment>
        <div id="weiqi" className={Style.wrapper} />
        <Toast />
      </Fragment>
    );
  }
}

export default Home;
