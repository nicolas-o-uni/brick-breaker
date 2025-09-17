import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  ball!: Phaser.Physics.Arcade.Image;
  paddle!: Phaser.Physics.Arcade.Image;
  bricks!: Phaser.Physics.Arcade.StaticGroup;

  constructor() { super({ key: 'MainScene' }); }

  preload() {
    // caminhos relativos à root do app: src/assets/ -> 'assets/...'
    this.load.image('ball', 'assets/images/Balls.png');
    this.load.image('paddle', 'assets/images/Paddles.png');
    this.load.image('brick', 'assets/images/Bricks Full.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Physics world
    this.physics.world.setBounds(0, 0, W, H);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Paddle
    this.paddle = this.physics.add.image(W/2, H - 40, 'paddle')
    .setImmovable(true)
    .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    // Ball
    this.ball = this.physics.add.image(W/2, H - 60, 'ball')
    .setCollideWorldBounds(true)
    .setBounce(1);
    this.ball.setVelocity(150, -150);

    // Bricks (static)
    this.bricks = this.physics.add.staticGroup();
    const cols = 8, rows = 3, bw = 64, bh = 32;
    const startX = (W - cols * bw) / 2 + bw / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.create(startX + c * bw, 100 + r * bh, 'brick');
      }
    }

    // Colliders
    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(10 * diff);
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
