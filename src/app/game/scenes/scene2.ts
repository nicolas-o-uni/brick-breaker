import Phaser from 'phaser';
import {
  startLevel,
  pause,
  isPaused,
  resume,
  isGameStarted,
  restartLevel,
  CompleteMenu,
  isInMenu,
} from 'src/app/game/phaser-game';

export default class MainScene extends Phaser.Scene {
  ball!: Phaser.Physics.Arcade.Image;
  balls!: Phaser.Physics.Arcade.Group;
  paddle!: Phaser.Physics.Arcade.Image;
  bricks!: Phaser.Physics.Arcade.StaticGroup;
  multiplyBallBlocks!: Phaser.Physics.Arcade.Image[];
  invertScreenBlocks!: Phaser.Physics.Arcade.Image[];
  speedBoostBlocks!: Phaser.Physics.Arcade.Image[];
  isScreenInverted: boolean = false;

  constructor() {
    super({ key: 'map2' });
  }

  preload() {
    this.load.image('ball', 'assets/images/Ball Red.png');
    this.load.image('paddle', 'assets/images/Paddle Blue.png');
    this.load.image('brick', 'assets/images/Block Blue.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.physics.world.drawDebug = false;
    this.physics.world.setBounds(0, 0, W, H);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.balls = this.physics.add.group({
      defaultKey: 'ball',
      maxSize: 10,
    });

    this.ball = this.physics.add.image(
      W / 2,
      H - 130,
      'ball'
    ) as Phaser.Physics.Arcade.Image;
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1);
    (this.ball.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    this.balls.add(this.ball);

    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;
      if (!ball || !ball.body) return;
      ball.setCollideWorldBounds(true);
      ball.setBounce(1);
      ball.setTintFill(0xffffff);
      ball.setDisplaySize(15, 15);
      (ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    });

    this.paddle = this.physics.add
      .image(W / 2, H - 40, 'paddle')
      .setImmovable(true);
    this.paddle.setTintFill(0x00bfff);
    this.paddle
      .setDisplaySize(100, 15)
      .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    this.bricks = this.physics.add.staticGroup();

    const bw = 41;
    const bh = 22;
    const marginX = 1;
    const marginY = 10;

    const cols = 18;
    const rows = 12;
    const startX = (W - cols * (bw + marginX)) / 2 + bw / 2;
    const startY = 100;

    const layout = [
      'NNNNNNNNNNNNNNNNNN',
      'NNNNNNNNNNNNNNNNNN',
      'NNNNNNNNNNNNNNNNNN',
      'NNNNNNNNNNNNNNNNNN',
      'NNNNNNNNNNNNNNNNNN',
      'NNNNNNVVVVVVNNNNNN',
      'NNNNNVVVVVVVVNNNNN',
      'NNNNNNVVVVVVNNNNNN',
    ];

    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        const char = layout[r][c];
        if (char === 'N') continue;

        const x = startX + c * (bw + marginX);
        const y = startY + r * (bh + marginY);

        const brick = this.bricks.create(x, y, 'brick');
        brick.displayWidth = bw;
        brick.displayHeight = bh;
        brick.refreshBody();

        switch (char) {
          case 'V':
            brick.setTintFill(0x00bfff);
            break;
          case 'B':
            brick.setTintFill(0xfff0ff);
            break;
          case 'R':
            brick.setTintFill(0xff00f0);
            break;
          case 'I':
            brick.setTintFill(0x0000ff);
            brick.setData('indestructible', true);
            break;
        }
      }
    }

    // Define blocos especiais com cores específicas
    this.setSpecialBlocks(6);

    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      const b = ball as Phaser.Physics.Arcade.Image;
      const p = paddle as Phaser.Physics.Arcade.Image;
      const diff = b.x - p.x;
      b.setVelocityX(10 * diff);
    });

    this.physics.add.collider(this.balls, this.bricks, (ball, brick: any) => {
      // Verifica qual tipo de bloco especial foi atingido
      if (
        this.multiplyBallBlocks &&
        this.multiplyBallBlocks.includes(brick as Phaser.Physics.Arcade.Image)
      ) {
        this.multiplyBalls();
      } else if (
        this.invertScreenBlocks &&
        this.invertScreenBlocks.includes(brick as Phaser.Physics.Arcade.Image)
      ) {
        this.invertScreen();
      } else if (
        this.speedBoostBlocks &&
        this.speedBoostBlocks.includes(brick as Phaser.Physics.Arcade.Image)
      ) {
        this.speedBoost();
      }

      if (!brick.getData('indestructible')) {
        brick.destroy();
      }

      const allBricks =
        this.bricks.getChildren() as Phaser.Physics.Arcade.Image[];

      const breakableBricks = allBricks.filter(
        (brick) => !brick.getData('indestructible')
      );

      if (breakableBricks.length === 0) {
        CompleteMenu(this.physics, this);
      }
    });

    // Input: mover paddle com pointer/touch
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(
        p.x,
        this.paddle.displayWidth / 2,
        W - this.paddle.displayWidth / 2
      );
    });

    startLevel(
      this.balls,
      this.launchBall.bind(this),
      this.physics,
      this.input
    );

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-P', () => {
        if (isGameStarted && !isPaused) pause(this.physics);
        else if (isPaused) resume(this.physics);
      });
      this.input.keyboard.on('keydown-E', () => {
        CompleteMenu(this.physics, this);
      });
    }
  }

  launchBall(ball?: Phaser.Physics.Arcade.Image) {
    const b = ball || this.ball;
    if (!b || !b.body) return;

    const speed = 360;

    b.setVelocityX(0);
    b.setVelocityY(speed);
  }

  multiplyBalls() {
    const newBallsCount = this.balls.getChildren().length + 1;

    for (let i = this.balls.getChildren().length; i < newBallsCount; i++) {
      let newBall = this.physics.add.image(
        this.paddle.x,
        this.paddle.y - 50,
        'ball'
      );
      newBall.setDisplaySize(this.ball.displayWidth, this.ball.displayHeight);

      this.balls.add(newBall);

      newBall.setCollideWorldBounds(true);
      newBall.setBounce(1);
      newBall.setTintFill(0xffffff);
      newBall.setVelocityY(-360);
      newBall.setVelocityX(Phaser.Math.Between(-360, 360));

      this.physics.add.collider(newBall, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(10 * diff);
      });

      // Adiciona colisão com os blocos para a nova bola
      this.physics.add.collider(newBall, this.bricks, (ball, brick: any) => {
        if (
          this.multiplyBallBlocks &&
          this.multiplyBallBlocks.includes(brick as Phaser.Physics.Arcade.Image)
        ) {
          this.multiplyBalls();
        } else if (
          this.invertScreenBlocks &&
          this.invertScreenBlocks.includes(brick as Phaser.Physics.Arcade.Image)
        ) {
          this.invertScreen();
        } else if (
          this.speedBoostBlocks &&
          this.speedBoostBlocks.includes(brick as Phaser.Physics.Arcade.Image)
        ) {
          this.speedBoost();
        }

        if (!brick.getData('indestructible')) {
          brick.destroy();
        }

        const allBricks =
          this.bricks.getChildren() as Phaser.Physics.Arcade.Image[];

        const breakableBricks = allBricks.filter(
          (brick) => !brick.getData('indestructible')
        );

        if (breakableBricks.length === 0) {
          CompleteMenu(this.physics, this);
        }
      });
    }
  }

  invertScreen() {
    this.isScreenInverted = true;

    // Rotaciona a câmera 180 graus
    this.cameras.main.setRotation(Math.PI);

    // Restaura a câmera após 5 segundos
    this.time.delayedCall(5000, () => {
      this.cameras.main.setRotation(0);
      this.isScreenInverted = false;
    });
  }

  speedBoost() {
    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;
      if (!ball || !ball.body) return;

      const body = ball.body as Phaser.Physics.Arcade.Body;

      // Aumenta a velocidade em 50%
      const currentVelX = body.velocity.x;
      const currentVelY = body.velocity.y;

      ball.setVelocityX(currentVelX * 1.5);
      ball.setVelocityY(currentVelY * 1.5);

      // Efeito visual: deixa a bola amarela temporariamente
      ball.setTintFill(0xffff00);

      // Restaura a velocidade e cor após 5 segundos
      this.time.delayedCall(5000, () => {
        if (ball && ball.body) {
          const body = ball.body as Phaser.Physics.Arcade.Body;
          ball.setVelocityX(body.velocity.x / 1.5);
          ball.setVelocityY(body.velocity.y / 1.5);
          ball.setTintFill(0xffffff);
        }
      });
    });
  }

  setSpecialBlocks(totalSpecialBlocks = 6): void {
    const allBricks =
      this.bricks.getChildren() as Phaser.Physics.Arcade.Image[];

    const breakableBricks = allBricks.filter(
      (brick) => !brick.getData('indestructible')
    );

    if (breakableBricks.length < totalSpecialBlocks) {
      console.warn('Não há blocos quebráveis suficientes para especiais.');
      return;
    }

    // Divide os blocos especiais entre os três tipos
    const multiplyCount = Math.floor(totalSpecialBlocks / 3);
    const invertCount = Math.floor(totalSpecialBlocks / 3);
    const speedBoostCount = Math.floor(totalSpecialBlocks / 3);

    this.multiplyBallBlocks = [];
    this.invertScreenBlocks = [];
    this.speedBoostBlocks = [];

    const selectedIndices = new Set<number>();

    // Seleciona blocos para multiplicar bolas (ROXO - 0x9D00FF)
    while (this.multiplyBallBlocks.length < multiplyCount) {
      const randomIndex = Phaser.Math.Between(0, breakableBricks.length - 1);
      if (!selectedIndices.has(randomIndex)) {
        selectedIndices.add(randomIndex);
        const specialBlock = breakableBricks[randomIndex];
        specialBlock.setTintFill(0x9d00ff); // Roxo
        this.multiplyBallBlocks.push(specialBlock);
      }
    }

    // Seleciona blocos para inverter tela (Cinza - 0xAA9797)
    while (this.invertScreenBlocks.length < invertCount) {
      const randomIndex = Phaser.Math.Between(0, breakableBricks.length - 1);
      if (!selectedIndices.has(randomIndex)) {
        selectedIndices.add(randomIndex);
        const specialBlock = breakableBricks[randomIndex];
        specialBlock.setTintFill(0xaa9797); // Cinza
        this.invertScreenBlocks.push(specialBlock);
      }
    }

    // Seleciona blocos para acelerar bolas (AMARELO - 0xFFFF00)
    while (this.speedBoostBlocks.length < speedBoostCount) {
      const randomIndex = Phaser.Math.Between(0, breakableBricks.length - 1);
      if (!selectedIndices.has(randomIndex)) {
        selectedIndices.add(randomIndex);
        const specialBlock = breakableBricks[randomIndex];
        specialBlock.setTintFill(0xffff00); // Amarelo
        this.speedBoostBlocks.push(specialBlock);
      }
    }
  }

  override update(_time: number, _delta: number): void {
    const H = this.scale.height;

    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;

      if (ball.y > H) {
        ball.destroy();

        if (this.balls.countActive() === 0) {
          restartLevel(this);
        }
      }
    });
  }
}
