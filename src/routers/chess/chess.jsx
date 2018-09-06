import React, { Component, Fragment } from 'react';
import { Settings } from 'luxon';
import Phaser from 'phaser';
import { EventEmitter } from '../../utils';
import Toast, { T } from 'react-toast-mobile';
import Style from './style.scss';

import { Course } from '../../service';

import { VALUE } from '../../constants';

/*import WhiteBoard from '../../assets/images/whiteBoard.png';
import BlackBoard from '../../assets/images/blackBoard.png';
import Grid from '../../assets/images/grid.png';
import MoverPiece from '../../assets/images/movePiece.png';*/
import ChessBoard from '../../assets/images/chess_board.png';
import Grid from '../../assets/images/chess_grid.png';
import CleanBtn from '../../assets/images/btnClean.png';
import Piece from '../../assets/images/chess_piece.png';
import PieceBasket from '../../assets/images/chess_basket.png';
import ChessSelected from '../../assets/images/chess_selected.png';

Settings.defaultLocale = 'en';

let game;
let parentThis;

class ChessCanvas extends Phaser.Scene {
  constructor() {
    super('ChessCanvas');

    // 棋盘容器
    this.boardContainer = [];
    // 棋盘上棋子实时集合
    this.pieceGroup = [];
    // 棋盘上移动棋子前的集合
    this.beforeMovePieceGroup = [];
    // 白色棋篓
    this.whiteBoard = null;
    // 棋篓集合
    this.pieceBasketGroup = [];
    // 保存按钮
    this.saveBtn = null;
    // 棋盘参数
    this.GAME_PARAMS = {
      boardContainerX: 0, // 棋盘容器起始x坐标
      boardContainerY: 0, // 棋盘容器起始y坐标
      boardX: 43 + 42, // 棋盘起始x坐标
      boardY: 43 + 42, // 棋盘起始y坐标
      gridSize: 83, // 棋盘格子大小
      maxBoardX: 43 + 8 * 83, // 棋盘上x最大值
      maxBoardY: 43 + 8 * 83 // 棋盘上y最大值
    };
    // this.GAME_PARAMS.maxBoardX = this.GAME_PARAMS.boardContainerX + this.GAME_PARAMS.boardX;
    // this.GAME_PARAMS.minBoardY = this.GAME_PARAMS.boardContainerY + this.GAME_PARAMS.boardY;
    // this.GAME_PARAMS.maxBoardX = this.GAME_PARAMS.boardContainerX + this.GAME_PARAMS.boardX + 18 * this.GAME_PARAMS.gridSize;
    // this.GAME_PARAMS.maxBoardY = this.GAME_PARAMS.boardContainerY + this.GAME_PARAMS.boardY + 18 * this.GAME_PARAMS.gridSize;
    // 当前拖动的棋子
    this.movePiece = null;
    // 棋子拖动前位置
    this.beforeMovePieceXY = [0, 0];
    // 棋盘初始棋子摆放 黑：  车 马 相 后 王 相 马 车  兵*8  白：兵*8 车 马 相 后 王 相 马 车
    this.boardData = [
      { frame: 7, role: 11 },
      { frame: 8, role: 12 },
      { frame: 9, role: 13 },
      { frame: 10, role: 14 },
      { frame: 11, role: 15 },
      { frame: 9, role: 13 },
      { frame: 8, role: 12 },
      { frame: 7, role: 11 },
      { frame: 6, role: 10 },
      { frame: 6, role: 10 },
      { frame: 6, role: 10 },
      { frame: 6, role: 10 },
      { frame: 6, role: 10 },
      { frame: 6, role: 10 },
      { frame: 6, role: 10 },
      { frame: 6, role: 10 },

      { frame: 0, role: 0 },
      { frame: 0, role: 0 },
      { frame: 0, role: 0 },
      { frame: 0, role: 0 },
      { frame: 0, role: 0 },
      { frame: 0, role: 0 },
      { frame: 0, role: 0 },
      { frame: 0, role: 0 },
      { frame: 1, role: 1 },
      { frame: 2, role: 2 },
      { frame: 3, role: 3 },
      { frame: 4, role: 4 },
      { frame: 5, role: 5 },
      { frame: 3, role: 3 },
      { frame: 2, role: 2 },
      { frame: 1, role: 1 }
    ];
    // 棋篓初始数据
    this.pieceBasketData = [
      { frame: 0, role: 0, x: 68, y: 816 },
      { frame: 1, role: 1, x: 183, y: 816 },
      { frame: 2, role: 2, x: 298, y: 816 },
      { frame: 3, role: 3, x: 68, y: 931 },
      { frame: 4, role: 4, x: 183, y: 931 },
      { frame: 5, role: 5, x: 298, y: 931 },

      { frame: 6, role: 10, x: 454, y: 816 },
      { frame: 7, role: 11, x: 569, y: 816 },
      { frame: 8, role: 12, x: 684, y: 816 },
      { frame: 9, role: 13, x: 454, y: 931 },
      { frame: 10, role: 14, x: 569, y: 931 },
      { frame: 11, role: 15, x: 684, y: 931 }
    ];
    // 棋篓、棋子选中框
    this.selectBox = null;
  }

  preload() {
    EventEmitter.emit('fetch-show-loading');
    //this.load.crossOrigin = 'anonymous'; // 设置跨域
    this.load.image({
      key: 'chessBoard',
      url: ChessBoard
    });
    this.load.image({
      key: 'grid',
      url: Grid
    });
    this.load.image({
      key: 'chessSelected',
      url: ChessSelected
    });
    this.load.spritesheet('cleanBtn', CleanBtn, {
      frameWidth: 169,
      frameHeight: 91
    });
    this.load.spritesheet('piece', Piece, {
      frameWidth: 83,
      frameHeight: 83
    });
    this.load.spritesheet('pieceBasket', PieceBasket, {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.on('complete', function() {
      EventEmitter.emit('fetch-hide-loading');
    });
  }
  create() {
    //设置棋盘容器
    // this.boardContainer = this.add.container(this.GAME_PARAMS.boardContainerX, this.GAME_PARAMS.boardContainerY).setSize(750,750);
    // 设置棋子集合
    this.pieceGroup = this.add.group();
    // 设置棋篓集合
    this.pieceBasketGroup = this.add.group();

    //添加新棋子的原始坐标
    let movePieceXY = [0, 0];

    // 添加棋盘
    this.add.image(375, 375, 'chessBoard');

    // 添加选中框
    this.selectBox = this.add.image(-100, -100, 'chessSelected').setDepth(4);

    // 生成格子
    let gridIndex = 0;
    let grids = [];
    for (let i = 0; i < 64; i++) {
      if (gridIndex > 7) {
        gridIndex = 0;
      }
      let row = parseInt(i / 8, 10);
      let grid = this.add
        .image(
          this.GAME_PARAMS.boardX + gridIndex * this.GAME_PARAMS.gridSize,
          this.GAME_PARAMS.boardY + row * this.GAME_PARAMS.gridSize,
          'grid'
        )
        .setInteractive()
        .setName('grid')
        .setDepth(10);
      this.input.setDraggable(grid);
      grids.push(grid);
      gridIndex++;
    }

    if (parentThis.state.list.length > 0) {
      // 初始化棋盘数据
      this.initPieceBoard();
    } else {
      // 初始化摆放棋子
      this.initBoard();
    }

    // 初始化棋篓
    this.initPieceBasket();

    // 添加清空按钮
    this.cleanBtn = this.add
      .sprite(274, 1050, 'cleanBtn', 0)
      .setInteractive()
      .setName('cleanBtn');
    // 添加保存按钮
    this.saveBtn = this.add
      .sprite(474, 1050, 'cleanBtn', 2)
      .setInteractive()
      .setName('saveBtn');

    this.input.dragDistanceThreshold = 5;

    // 创建移动棋子
    let newPiece = this.add
      .sprite(68, 816, 'piece', 0)
      .setAlpha(0)
      .setDepth(5);

    // 画布点击事件
    let timer = null;
    let timerCount = 0;
    this.input.on(
      'gameobjectdown',
      function(pointer, gameObject) {
        // 点击棋篓
        if (gameObject.name === 'pieceBasket') {
          this.cleanBoardState();
          this.selectBox.x = gameObject.x;
          this.selectBox.y = gameObject.y;
          gameObject.setData('selected', true);
          // console.log(this.pieceBasketGroup.getChildren());
        }

        // 点击棋盘格子
        if (gameObject.name === 'grid') {
          // 目标格子
          let targetGrid = this.checkMovePiece(gameObject.x, gameObject.y);
          // 获取当前选中的棋篓
          let selectedBasket = this.getSelectedBasket();
          // 当前选中的棋子
          let nowSelectedPiece = this.checkMovePiece(
            this.selectBox.x,
            this.selectBox.y
          );

          //设置棋子选中状态
          timerCount++;
          timer = setTimeout(function() {
            timerCount = 0;
            clearTimeout(timer);
          }, 250);

          // 当前格子上有棋子
          if (targetGrid) {
            // 当前有选中的棋篓
            if (selectedBasket) {
              this.cleanBoardState();
              this.selectBox.x = gameObject.x;
              this.selectBox.y = gameObject.y;
            }

            // 选中的棋子和目标棋子不是同一方，吃掉对方棋子
            if (
              nowSelectedPiece &&
              nowSelectedPiece.getData('type') !== targetGrid.getData('type')
            ) {
              this.tweens.add({
                targets: [nowSelectedPiece, this.selectBox],
                props: {
                  x: { value: gameObject.x, duration: 150, ease: 'Power2' },
                  y: { value: gameObject.y, duration: 150, ease: 'Power2' }
                },
                onComplete: () => {
                  this.cleanPiece(targetGrid);
                  this.cleanSelected();
                }
              });
            } else {
              this.selectBox.x = gameObject.x;
              this.selectBox.y = gameObject.y;
            }

            // 双击去子
            if (timerCount === 2) {
              this.cleanPiece(targetGrid);
              this.cleanSelected();
            }
          } // 当前格子上没有棋子
          else {
            //从棋篓中添加棋子到此
            if (selectedBasket) {
              let piece = this.add
                .sprite(
                  selectedBasket.x,
                  selectedBasket.y,
                  'piece',
                  selectedBasket.frame.name
                )
                .setDepth(2)
                .setInteractive()
                .setData({
                  type: selectedBasket.getData('type'),
                  role: selectedBasket.getData('role')
                })
                .setName('piece');
              this.input.setDraggable(piece);
              this.pieceGroup.add(piece);
              this.tweens.add({
                targets: piece,
                props: {
                  x: { value: gameObject.x, duration: 100, ease: 'Power2' },
                  y: { value: gameObject.y, duration: 100, ease: 'Power2' }
                },
                onComplete: () => {}
              });
            }

            // 获取当前选中的棋子，移动到指定的位置
            if (nowSelectedPiece) {
              this.tweens.add({
                targets: [nowSelectedPiece, this.selectBox],
                props: {
                  x: { value: gameObject.x, duration: 100, ease: 'Power2' },
                  y: { value: gameObject.y, duration: 100, ease: 'Power2' }
                },
                onComplete: () => {
                  setTimeout(() => {
                    this.cleanSelected();
                  }, 100);
                }
              });
            }
          }

          // 取消选中棋子
          if (
            targetGrid &&
            nowSelectedPiece &&
            (targetGrid.x === nowSelectedPiece.x &&
              targetGrid.y === nowSelectedPiece.y)
          ) {
            this.cleanSelected();
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
        // 在棋盘上拖动棋子
        if (gameObject.name === 'grid') {
          if (this.checkMovePiece(gameObject.x, gameObject.y)) {
            this.movePiece = this.checkMovePiece(gameObject.x, gameObject.y);
            this.movePiece.setDepth(5);
            this.beforeMovePieceXY = [this.movePiece.x, this.movePiece.y];
            this.beforeMovePieceGroup = this.pieceGroup
              .getChildren()
              .map(item => {
                return { x: item.x, y: item.y, type: item.getData('type') };
              });
          }
        }
        // 从棋篓内拖动棋子到棋盘上
        if (gameObject.name === 'pieceBasket') {
          movePieceXY[0] = gameObject.x;
          movePieceXY[1] = gameObject.y;
          newPiece
            .setFrame(gameObject.frame.name)
            .setData('role', gameObject.getData('role'))
            .setTint(0xff0000);
        }
      },
      this
    );

    // 画布移动中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 在棋盘上拖动棋子
      if (gameObject.name === 'grid') {
        if (this.movePiece) {
          this.movePiece.x = dragX;
          this.movePiece.y = dragY;
          if (this.movePiece.x < this.GAME_PARAMS.boardX) {
            this.movePiece.x = this.GAME_PARAMS.boardX;
          }
          if (this.movePiece.x > this.GAME_PARAMS.maxBoardX) {
            this.movePiece.x = this.GAME_PARAMS.maxBoardX;
          }
          if (this.movePiece.y < this.GAME_PARAMS.boardY) {
            this.movePiece.y = this.GAME_PARAMS.boardY;
          }
          if (this.movePiece.y > this.GAME_PARAMS.maxBoardY) {
            this.movePiece.y = this.GAME_PARAMS.maxBoardY;
          }
          for (let i = 0; i < grids.length; i++) {
            if (
              Math.abs(this.movePiece.x - grids[i].x) <= 42 &&
              Math.abs(this.movePiece.y - grids[i].y) <= 42
            ) {
              this.movePiece.x = grids[i].x;
              this.movePiece.y = grids[i].y;
              this.selectBox.x = grids[i].x;
              this.selectBox.y = grids[i].y;
            }
          }
        }
      }

      // 从棋篓内拖动棋子到棋盘上
      if (gameObject.name === 'pieceBasket') {
        newPiece.setAlpha(1);
        newPiece.x = dragX;
        newPiece.y = dragY;
        for (let i = 0; i < grids.length; i++) {
          if (
            Math.abs(newPiece.x - grids[i].x) <= 42 &&
            Math.abs(newPiece.y - grids[i].y) <= 42
          ) {
            newPiece.x = grids[i].x;
            newPiece.y = grids[i].y;
          } else {
          }
        }
      }
    });

    // 画布移动结束事件
    this.input.on(
      'dragend',
      function(pointer, gameObject) {
        // 拖动棋盘上的棋子
        if (gameObject.name === 'grid') {
          if (this.movePiece) {
            this.checkPiecePosition(
              this.movePiece.x,
              this.movePiece.y,
              this.movePiece.getData('type'),
              true
            );
            this.movePiece.setDepth(2);
            this.movePiece = null;
            this.cleanSelected();
          }
          // console.log(this.pieceGroup.getChildren());
        }

        //拖拽棋篓添加棋子
        if (gameObject.name === 'pieceBasket') {
          //如果拖拽到棋盘内则添加棋子
          if (
            newPiece.x >= this.GAME_PARAMS.boardX &&
            newPiece.x <= this.GAME_PARAMS.maxBoardX &&
            newPiece.y >= this.GAME_PARAMS.boardY &&
            newPiece.y <= this.GAME_PARAMS.maxBoardY &&
            this.checkPiecePosition(newPiece.x, newPiece.y)
          ) {
            let piece = this.add
              .sprite(newPiece.x, newPiece.y, 'piece', newPiece.frame.name)
              .setDepth(2)
              .setInteractive()
              .setData({
                type: newPiece.frame.name > 5 ? 'black' : 'white',
                role: newPiece.getData('role')
              })
              .setName('piece');
            this.input.setDraggable(piece);
            this.pieceGroup.add(piece);
            newPiece.setAlpha(0);
            this.cleanBoardState();
          } else {
            this.tweens.add({
              targets: newPiece,
              props: {
                x: {
                  value: gameObject.x,
                  duration: 600,
                  ease: 'Power2'
                },
                y: { value: gameObject.y, duration: 650, ease: 'Power2' }
              },
              onComplete: function() {
                newPiece.setAlpha(0);
              }
            });
          }
        }
      },
      this
    );
  }

  // 初始化摆放棋子
  initBoard = () => {
    let j = 0;
    for (let i = 0; i < this.boardData.length; i++) {
      if (j > 7) {
        j = 0;
      }

      let row = parseInt(i / 8, 10);
      if (i > 15) {
        row = row + 4;
      }
      let piece = this.add
        .sprite(
          this.GAME_PARAMS.boardX + j * this.GAME_PARAMS.gridSize,
          this.GAME_PARAMS.boardY + row * this.GAME_PARAMS.gridSize,
          'piece',
          this.boardData[i].frame
        )
        .setDepth(2)
        .setInteractive()
        .setData({
          type: this.boardData[i].frame > 5 ? 'black' : 'white',
          role: this.boardData[i].role
        })
        .setName('piece');
      this.input.setDraggable(piece);
      this.pieceGroup.add(piece);

      j++;
    }
  };

  // 初始化棋篓
  initPieceBasket = () => {
    for (let i = 0; i < this.pieceBasketData.length; i++) {
      let pieceBasket = this.add
        .sprite(
          this.pieceBasketData[i].x,
          this.pieceBasketData[i].y,
          'pieceBasket',
          this.pieceBasketData[i].frame
        )
        .setDepth(2)
        .setInteractive()
        .setData({
          type: this.pieceBasketData[i].frame > 5 ? 'black' : 'white',
          role: this.pieceBasketData[i].role,
          selected: false
        })
        .setName('pieceBasket');
      this.input.setDraggable(pieceBasket);
      this.pieceBasketGroup.add(pieceBasket);
    }
  };

  //初始化棋盘数据
  initPieceBoard = () => {
    const list = parentThis.state.list;
    if (list && list.length > 0) {
      list.forEach(item => {
        let piece = this.add
          .sprite(
            this.GAME_PARAMS.boardX + item.x * this.GAME_PARAMS.gridSize,
            this.GAME_PARAMS.boardY + item.y * this.GAME_PARAMS.gridSize,
            'piece',
            item.role > 5 ? item.role - 4 : item.role
          )
          .setDepth(2)
          .setInteractive()
          .setData({
            type: item.role > 5 ? 'black' : 'white',
            role: item.role
          })
          .setName('piece');
        this.input.setDraggable(piece);
        this.pieceGroup.add(piece);
      });
    }
  };

  /*
  * 检查当前棋盘上拖动区域是否有棋子
  */
  checkMovePiece(moveX, moveY) {
    let piece = null,
      attr = [];
    const group = this.pieceGroup.getChildren();
    if (group && group.length > 0) {
      attr = group.filter(piece => {
        return piece.x === moveX && piece.y === moveY;
      });
    }
    if (attr.length > 0) {
      piece = attr[0];
    }
    return piece;
  }

  /*
  * 判断棋盘上棋子是否被占位
  * isInBoardMove 是否在棋盘上拖动棋子
  */

  checkPiecePosition(moveX, moveY, type, isInBoardMove) {
    let target = null,
      cleanPiece = null;
    let isEmpty = true;
    const group = !isInBoardMove
      ? this.pieceGroup.getChildren()
      : this.beforeMovePieceGroup;
    let attr = group.filter(piece => {
      return piece.x === moveX && piece.y === moveY;
    });

    if (attr.length > 0) {
      target = attr[0];
      if (isInBoardMove) {
        // 拖动到同类棋子上返回原来位置
        if (type === target.type) {
          this.tweens.add({
            targets: this.movePiece,
            props: {
              x: {
                value: this.beforeMovePieceXY[0],
                duration: 600,
                ease: 'Power2'
              },
              y: {
                value: this.beforeMovePieceXY[1],
                duration: 650,
                ease: 'Power2'
              }
            }
          });
        } // 拖动到对方棋子，清除对方棋子
        else {
          this.pieceGroup.getChildren().forEach(item => {
            if (
              item.x === target.x &&
              item.y === target.y &&
              item.getData('type') !== type
            ) {
              cleanPiece = item;
            }
          });
          // this.pieceGroup.remove(cleanPiece, true);
          this.cleanPiece(cleanPiece);
        }
      }
    }

    if (!isInBoardMove) {
      if (attr.length > 0) {
        isEmpty = false;
      }
      return isEmpty;
    }
  }

  // 清除棋篓、棋子选中状态
  cleanBoardState() {
    this.cleanSelected();
    this.pieceBasketGroup.getChildren().forEach(item => {
      item.setData('selected', false);
    });
  }

  // 清除棋篓、棋子选中状态
  cleanSelected() {
    this.selectBox.x = -100;
    this.selectBox.y = -100;
  }

  // 清除棋子
  cleanPiece(piece) {
    let moveXY = [-100, -100];
    let pieceFrame = piece.frame.name;
    this.pieceBasketGroup.getChildren().forEach(item => {
      if (item.frame.name === pieceFrame) {
        moveXY[0] = item.x;
        moveXY[1] = item.y;
      }
    });
    piece.setDepth(3);
    this.tweens.add({
      targets: [piece],
      props: {
        x: { value: moveXY[0], duration: 600, ease: 'Power2' },
        y: { value: moveXY[1], duration: 650, ease: 'Power2' }
      },
      onComplete: () => {
        this.pieceGroup.remove(piece, true);
        this.cleanSelected();
      }
    });
  }

  // 获取当前选中的棋篓
  getSelectedBasket() {
    let attr = this.pieceBasketGroup.getChildren().filter(item => {
      return item.getData('selected') === true;
    });
    return attr.length > 0 ? attr[0] : null;
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
        role: list.getData('role'),
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

class Chess extends Component {
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
          { role: 11, x: 0, y: 0 },
          { role: 12, x: 1, y: 0 },
          { role: 13, x: 2, y: 0 },
          { role: 14, x: 3, y: 0 },
          { role: 15, x: 4, y: 0 },
          { role: 10, x: 0, y: 1 },
          { role: 0, x: 0, y: 6 },
          { role: 1, x: 0, y: 7 },
          { role: 2, x: 1, y: 7 },
          { role: 3, x: 2, y: 7 },
          { role: 4, x: 3, y: 7 },
          { role: 5, x: 4, y: 7 }
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
      type: Phaser.AUTO,
      parent: 'chess',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#742502',
      scene: [ChessCanvas],
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
        <div id="chess" className={Style.wrapper} />
        <Toast />
      </Fragment>
    );
  }
}

export default Chess;
