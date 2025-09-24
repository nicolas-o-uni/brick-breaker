import Phaser from 'phaser';
import { restartLevel, CompleteMenu } from 'src/app/game/phaser-game';

export default class MainScene extends Phaser.Scene {
  ball!: Phaser.Physics.Arcade.Image;
  balls!: Phaser.Physics.Arcade.Group;
  paddle!: Phaser.Physics.Arcade.Image;
  bricks!: Phaser.Physics.Arcade.StaticGroup;
  unbreakableBricks!: Phaser.Physics.Arcade.StaticGroup;
  specialBlock!: Phaser.Physics.Arcade.Image | null; // Variável para o bloco especial

  constructor() { super({ key: 'MainScene' }); }

  preload() {
    // caminhos relativos à root do app: src/assets/ -> 'assets/...'
    this.load.image('ball', 'assets/images/Ball Green.png');
    this.load.image('paddle', 'assets/images/Paddle Gray.png');
    this.load.image('brick', 'assets/images/Block Gray.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Physics world
    this.physics.world.setBounds(0, 0, W, H);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Cria grupo de bolas antes de criar a primeira bola
    this.balls = this.physics.add.group({
      defaultKey: 'ball',
      maxSize: 10,
      // Quando uma nova bola é criada, ela deve colidir com a barra automaticamente
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1,
    });

    // Cria a bola inicial
    this.ball = this.physics.add.image(W / 2, H - 130, 'ball') as Phaser.Physics.Arcade.Image;
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1);
    (this.ball.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    // Adiciona a bola ao grupo
    this.balls.add(this.ball);

    // Lógica para todas as bolas do grupo
    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;
      if (!ball || !ball.body) return;
      ball.setCollideWorldBounds(true);
      ball.setBounce(1);
      (ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    });

    //pause
    this.physics.pause();
    this.input.on('pointerdown', () => {
      this.physics.resume();
      this.balls.getChildren().forEach((b) => {
        const ball = b as Phaser.Physics.Arcade.Image;
        if (!ball || !ball.body) return;

        // Só lança se a bola estiver parada
        if (ball.body.velocity.x === 0 && ball.body.velocity.y === 0) {
          this.launchBall(ball); // função launchBall agora recebe bola como parâmetro
        }
      });
    });

    // Paddle
    this.paddle = this.physics.add.image(W / 2, H - 60, 'paddle')
      .setImmovable(true)
      .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    // Bricks
    this.bricks = this.physics.add.staticGroup();
    this.unbreakableBricks = this.physics.add.staticGroup(); // tijolos inquebráveis

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
          startX + c * (bw + marginX),
          100 + r * (bh + marginY),
          'brick'
        );
        brick.displayWidth = bw;
        brick.displayHeight = bh;

        brick.refreshBody();
      }
    }

    // Escolher bloco especial aleatório
    this.specialBlock = this.setSpecialBlock();

    // Colliders
    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      const b = ball as Phaser.Physics.Arcade.Image;
      const p = paddle as Phaser.Physics.Arcade.Image;
      const diff = b.x - p.x;
      b.setVelocityX(15 * diff);
    });

    this.physics.add.collider(this.balls, this.bricks, (ball, brick) => {
      brick.destroy();
      if (this.specialBlock && brick === this.specialBlock) {
        // Quando o bloco especial for destruído, multiplicamos as bolas
        this.multiplyBalls();
      }

      if (this.bricks.countActive() === 0) {
        this.scene.pause();
        // menu ao completar fase
        CompleteMenu(this);
      }
    });

    this.physics.add.collider(this.balls, this.unbreakableBricks);

    // Input: mover paddle com pointer/touch
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(p.x, this.paddle.displayWidth / 2, W - this.paddle.displayWidth / 2);
    });
  }

  // Função de lançamento da bola
  launchBall(ball?: Phaser.Physics.Arcade.Image) {
    const b = ball || this.ball;
    if (!b || !b.body) return;

    const speed = 250;

    b.setVelocityX(0);
    b.setVelocityY(speed);
  }

  // Função para multiplicar as bolas
  multiplyBalls() {
    const newBallsCount = this.balls.getChildren().length * 2;

    for (let i = this.balls.getChildren().length; i < newBallsCount; i++) {
      let newBall = this.physics.add.image(this.paddle.x, this.paddle.y - 50, 'ball'); // Aumenta a distância da barra
      this.balls.add(newBall);

      // Ajuste das propriedades da nova bola
      newBall.setCollideWorldBounds(true);
      newBall.setBounce(1);
      newBall.setVelocityY(-250);
      newBall.setVelocityX(Phaser.Math.Between(-200, 200));

      this.physics.add.collider(newBall, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(15 * diff);
      });
    }
  }

  // Função para escolher um bloco especial aleatório
  setSpecialBlock() {
    const randomBlockIndex = Phaser.Math.Between(0, this.bricks.getLength() - 1);
    const specialBlock = this.bricks.getChildren()[randomBlockIndex] as Phaser.Physics.Arcade.Image;
    specialBlock.setTint(0xff0000); // Destacar o bloco especial
    return specialBlock;
  }

  override update(_time: number, _delta: number): void {
    // Aqui você pode adicionar lógica por frame, modificadores temporários, etc.

    //reset
    const H = this.scale.height;

    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;

      // Se a bola passou do limite inferior
      if (ball.y > H) {
        ball.destroy();

        if (this.balls.countActive() === 0) {
          restartLevel(this);
        }
      }
    });
  }
}
