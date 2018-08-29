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

Settings.defaultLocale = 'en';

let game;
let parentThis;

class ChessCanvas extends Phaser.Scene {
  constructor() {
    super('ChessCanvas');

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
      boardX: 43 + 42, // 棋盘起始x坐标
      boardY: 43 + 42, // 棋盘起始y坐标
      gridSize: 83, // 棋盘格子大小
      maxBoardX: 43 + 8 * 83, // 棋盘上x最大值
      maxBoardY: 43 + 8 * 83 // 棋盘上y最大值
    };
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
    this.load.spritesheet('cleanBtn', CleanBtn, {
      frameWidth: 169,
      frameHeight: 91
    });
    this.load.spritesheet('piece', Piece, {
      frameWidth: 83,
      frameHeight: 83
    });
    this.load.on('complete', function() {
      EventEmitter.emit('fetch-hide-loading');
    });
  }
  create() {
    // 设置棋子集合
    this.pieceGroup = this.add.group();

    //初始化棋盘数据
    this.initPieceBoard();

    //添加新棋子的原始坐标
    let movePieceXY = [0, 0];
    //当前棋盘上拖动棋子的原始坐标
    let pieceXY = [0, 0];

    // 添加棋盘
    this.add.image(375, 375, 'chessBoard');

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

    // 初始化摆放棋子
    this.initBoard();

    this.input.dragDistanceThreshold = 5;

    // 画布点击事件
    let timer = null;
    let timerCount = 0;
    this.input.on(
      'gameobjectdown',
      function(pointer, gameObject) {
        const that = this;
        // console.log(gameObject);
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
          for (let i = 0; i < grids.length; i++) {
            if (
              Math.abs(this.movePiece.x - grids[i].x) <= 42 &&
              Math.abs(this.movePiece.y - grids[i].y) <= 42
            ) {
              this.movePiece.x = grids[i].x;
              this.movePiece.y = grids[i].y;
            }
          }
        }
      }
    });

    // 画布移动结束事件
    this.input.on(
      'dragend',
      function(pointer, gameObject) {
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
          }
          console.log(this.pieceGroup.getChildren());
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

  //初始化棋盘数据
  initPieceBoard = () => {
    const list = parentThis.state.list;
    if (list && list.length > 0) {
      list.forEach(item => {
        let piece = this.add
          .sprite(
            this.GAME_PARAMS.boardX + item.x * this.GAME_PARAMS.gridSize,
            this.GAME_PARAMS.boardY + item.y * this.GAME_PARAMS.gridSize,
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
          this.pieceGroup.remove(cleanPiece, true);
        }
      }
    }
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
        /*result = [
          { role: 0, x: 7, y: 5 },
          { role: 0, x: 4, y: 6 },
          { role: 0, x: 5, y: 11 },
          { role: 1, x: 0, y: 9 },
          { role: 1, x: 2, y: 11 },
          { role: 1, x: 7, y: 9 }
        ];
        this.setState({
          list: result
        });*/
        this.initWeiqi();
      }
    });
  }

  initWeiqi = () => {
    const config = {
      type: Phaser.CANVAS,
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
