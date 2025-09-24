import Phaser from 'phaser';
import { restartLevel, CompleteMenu } from 'src/app/game/phaser-game';

export default class MainScene extends Phaser.Scene {
  ball!: Phaser.Physics.Arcade.Image;
  balls!: Phaser.Physics.Arcade.Group;
  paddle!: Phaser.Physics.Arcade.Image;
  bricks!: Phaser.Physics.Arcade.StaticGroup;
  unbreakableBricks!: Phaser.Physics.Arcade.StaticGroup;
  specialBlocks!: Phaser.Physics.Arcade.Image[]; // Agora é uma lista

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('ball', 'assets/images/Ball Green.png');
    this.load.image('paddle', 'assets/images/Paddle Gray.png');
    this.load.image('brick', 'assets/images/Block Gray.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.physics.world.setBounds(0, 0, W, H);
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.balls = this.physics.add.group({
      defaultKey: 'ball',
      maxSize: 10,
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1,
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
      (ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    });

    this.physics.pause();
    this.input.on('pointerdown', () => {
      this.physics.resume();
      this.balls.getChildren().forEach((b) => {
        const ball = b as Phaser.Physics.Arcade.Image;
        if (!ball || !ball.body) return;
        if (ball.body.velocity.x === 0 && ball.body.velocity.y === 0) {
          this.launchBall(ball);
        }
      });
    });

    this.paddle = this.physics.add
      .image(W / 2, H - 60, 'paddle')
      .setImmovable(true)
      .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    this.bricks = this.physics.add.staticGroup();
    this.unbreakableBricks = this.physics.add.staticGroup();

    const cols = 4,
      rows = 2;
    const bw = 61;
    const bh = 22;
    const marginX = 10;
    const marginY = 6;
    const startX = (W - cols * (bw + marginX)) / 2 + bw / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const brick = this.bricks.create(
          startX + c * (bw + marginX),
          100 + r * (bh + marginY),
          'brick'
        );
        brick.displayWidth = bw;
        brick.displayHeight = bh;
        brick.refreshBody();
      }
    }

    // ✅ Escolher múltiplos blocos especiais
    this.specialBlocks = this.setSpecialBlocks(4); // O número determina a quantidade de blocos especiais

    // Colliders
    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      const b = ball as Phaser.Physics.Arcade.Image;
      const p = paddle as Phaser.Physics.Arcade.Image;
      const diff = b.x - p.x;
      b.setVelocityX(15 * diff);
    });

    this.physics.add.collider(this.balls, this.bricks, (ball, brick) => {
      // ✅ Verifica se o bloco é especial antes de destruir
      if (
        this.specialBlocks &&
        this.specialBlocks.includes(brick as Phaser.Physics.Arcade.Image)
      ) {
        this.multiplyBalls(); // Multiplica ao destruir bloco especial
      }

      brick.destroy();

      if (this.bricks.countActive() === 0) {
        this.scene.pause();
        CompleteMenu(this);
      }
    });

    this.physics.add.collider(this.balls, this.unbreakableBricks);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(
        p.x,
        this.paddle.displayWidth / 2,
        W - this.paddle.displayWidth / 2
      );
    });
  }

  launchBall(ball?: Phaser.Physics.Arcade.Image) {
    const b = ball || this.ball;
    if (!b || !b.body) return;

    const speed = 250;

    b.setVelocityX(0);
    b.setVelocityY(speed);
  }

  multiplyBalls() {
    const newBallsCount = this.balls.getChildren().length * 2;

    for (let i = this.balls.getChildren().length; i < newBallsCount; i++) {
      let newBall = this.physics.add.image(
        this.paddle.x,
        this.paddle.y - 50,
        'ball'
      );
      this.balls.add(newBall);

      newBall.setCollideWorldBounds(true);
      newBall.setBounce(1);
      newBall.setVelocityY(-280);
      newBall.setVelocityX(Phaser.Math.Between(-200, 200));

      this.physics.add.collider(newBall, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(15 * diff);
      });
    }
  }

  // ✅ NOVA função para selecionar múltiplos blocos especiais
  setSpecialBlocks(minSpecialBlocks = 3): Phaser.Physics.Arcade.Image[] {
    const totalBricks = this.bricks.getLength();
    const specialBlocks: Phaser.Physics.Arcade.Image[] = [];

    if (totalBricks < minSpecialBlocks) {
      console.warn('Não há blocos suficientes para selecionar especiais.');
      return specialBlocks;
    }

    const selectedIndices = new Set<number>();
    while (selectedIndices.size < minSpecialBlocks) {
      const randomIndex = Phaser.Math.Between(0, totalBricks - 1);
      selectedIndices.add(randomIndex);
    }

    const allBricks =
      this.bricks.getChildren() as Phaser.Physics.Arcade.Image[];

    selectedIndices.forEach((index) => {
      const specialBlock = allBricks[index];
      specialBlock.setTint(0xff0000); // destaca em vermelho
      specialBlocks.push(specialBlock);
    });

    return specialBlocks;
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
