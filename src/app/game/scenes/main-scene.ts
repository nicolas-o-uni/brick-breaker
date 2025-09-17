import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  ball!: Phaser.Physics.Arcade.Image;
  paddle!: Phaser.Physics.Arcade.Image;
  bricks!: Phaser.Physics.Arcade.StaticGroup;

  constructor() { super({ key: 'MainScene' }); }

  preload() {
    // caminhos relativos à root do app: src/assets/ -> 'assets/...'
    this.load.image('ball', 'assets/images/Ball Green.png');
    this.load.image('paddle', 'assets/images/Paddle Gray.png');
    this.load.image('brick', 'assets/images/Block Orange.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Physics world
    this.physics.world.setBounds(0, 0, W, H);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Paddle
    this.paddle = this.physics.add.image(W/2, H - 60, 'paddle')
    .setImmovable(true)
    .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    // Ball
    this.ball = this.physics.add.image(W/2, H - 60, 'ball')
    .setCollideWorldBounds(true)
    .setBounce(1);
    this.ball.setVelocity(250, -250);

    // Bricks (static)
    this.bricks = this.physics.add.staticGroup();

    // quantidade de colunas e tal
    const cols = 4, rows = 2;

    // Tamanho desejado do brick
    const bw = 61; // largura
    const bh = 22; // altura

    const marginX = 10; // margem horizontal entre blocos
    const marginY = 6;  // margem vertical entre blocos

    const initialX = 300; // ponto inicial X da grade
    const initialY = 255; // ponto inicial Y da grade

    const startX = (W - cols * (bw + marginX)) / 2 + bw / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const brick = this.bricks.create(
        initialX + c * (bw + marginX),
        initialY + r * (bh + marginY),
        'brick'
      );
        brick.displayWidth = bw;
        brick.displayHeight = bh;

        brick.refreshBody();
      }
    }

    // Colliders
    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(15 * diff);
    });

    this.physics.add.collider(this.ball, this.bricks, (ball, brick) => {
        brick.destroy();
    });

    // Input: mover paddle com pointer/touch
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(p.x, this.paddle.displayWidth / 2, W - this.paddle.displayWidth / 2);
    });
  }

  private hitPaddle(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image) {
    const diff = (ball.x - paddle.x);
    ball.setVelocityX(10 * diff);
  }

  private hitBrick(ball: Phaser.Physics.Arcade.Image, brick: Phaser.GameObjects.GameObject) {
    brick.destroy();
  }

  override update(_time: number, _delta: number): void {
    // por enquanto não uso nada aqui
  }
}
