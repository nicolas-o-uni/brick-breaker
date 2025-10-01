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
    // caminhos relativos à root do app: src/assets/ -> 'assets/...'
    this.load.image('ball', 'assets/images/Ball Gray.png');
    this.load.image('paddle', 'assets/images/Paddle Orange.png');
    this.load.image('brick', 'assets/images/Block Orange.png');
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
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1,
    });

    // Cria a bola inicial
    this.ball = this.physics.add
      .image(W / 2, H - 60, 'ball')
      .setCollideWorldBounds(true)
      .setDisplaySize(12, 12)
      .setBounce(1);
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
    this.paddle = this.physics.add
      .image(W / 2, H - 40, 'paddle')
      .setImmovable(true)
      .setDisplaySize(60, 10) // define tamanho real
      .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    // Bricks
    this.bricks = this.physics.add.staticGroup();
    this.unbreakableBricks = this.physics.add.staticGroup(); //tijolos inquebraveis

    const cols = 8,
      rows = 7;

    // Tamanho desejado do brick
    const bw = 21; // largura
    const bh = 12; // altura

    const marginX = 10; // margem horizontal entre blocos
    const marginY = 6; // margem vertical entre blocos

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

        // 🔹 Torna a primeira linha indestrutível
        if (r === 6) {
          brick.setData('indestructible', true);
          brick.setTint(0xff50); // cor diferente (cinza)
        } else {
          brick.setData('indestructible', false);
        }
      }
    }

    this.specialBlocks = this.setSpecialBlocks(10); // O número determina a quantidade de blocos especiais

    //  --CÓDIGO PRA CENTRALIZAR OS BLOCOS--
    //    const brick = this.bricks.create(
    //    startX + c * (bw + marginX),
    //    100 + r * (bh + marginY),
    //   'brick'

    // Colliders
    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      const b = ball as Phaser.Physics.Arcade.Image;
      const p = paddle as Phaser.Physics.Arcade.Image;
      const diff = b.x - p.x;
      b.setVelocityX(10 * diff);
    });

    this.physics.add.collider(this.balls, this.bricks, (ball, brick: any) => {
      // Verifica se o bloco é especial antes de destruir
      if (
        this.specialBlocks &&
        this.specialBlocks.includes(brick as Phaser.Physics.Arcade.Image)
      ) {
        this.multiplyBalls(); // Multiplica ao destruir bloco especial
      }

      if (!brick.getData('indestructible')) {
        brick.destroy();
      }

      if (this.bricks.countActive() === 0) {
        this.scene.pause();

        // definir proxima fase
        this.registry.set('faseAtual', 4);

        // menu ao completar fase
        CompleteMenu(this);
      }
    });

    this.physics.add.collider(this.balls, this.unbreakableBricks);

    // Input: mover paddle com pointer/touch
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(
        p.x,
        this.paddle.displayWidth / 2,
        W - this.paddle.displayWidth / 2
      );
    });
  }

  // Função de lançamento da bola
  launchBall(ball?: Phaser.Physics.Arcade.Image) {
    const b = ball || this.ball;
    if (!b || !b.body) return;

    const speed = 360;

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

      // 🔸 Copia o tamanho da bola original
      newBall.setDisplaySize(this.ball.displayWidth, this.ball.displayHeight);

      this.balls.add(newBall);

      newBall.setCollideWorldBounds(true);
      newBall.setBounce(1);
      newBall.setVelocityY(-360);
      newBall.setVelocityX(Phaser.Math.Between(-360, 360));

      (newBall.body as Phaser.Physics.Arcade.Body).allowGravity = false;

      this.physics.add.collider(newBall, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(10 * diff);
      });
    }
  }

  // NOVA função para selecionar múltiplos blocos especiais
  setSpecialBlocks(minSpecialBlocks = 3): Phaser.Physics.Arcade.Image[] {
    const allBricks =
      this.bricks.getChildren() as Phaser.Physics.Arcade.Image[];

    // 🔸 Filtra apenas os blocos que são quebráveis
    const breakableBricks = allBricks.filter(
      (brick) => !brick.getData('indestructible')
    );

    const specialBlocks: Phaser.Physics.Arcade.Image[] = [];

    if (breakableBricks.length < minSpecialBlocks) {
      console.warn('Não há blocos quebráveis suficientes para especiais.');
      return specialBlocks;
    }

    const selectedIndices = new Set<number>();
    while (selectedIndices.size < minSpecialBlocks) {
      const randomIndex = Phaser.Math.Between(0, breakableBricks.length - 1);
      selectedIndices.add(randomIndex);
    }

    selectedIndices.forEach((index) => {
      const specialBlock = breakableBricks[index];
      specialBlock.setTint(0xff0000); // destaca em vermelho
      specialBlocks.push(specialBlock);
    });

    return specialBlocks;
  }

  override update(_time: number, _delta: number): void {
    // Aqui pode adicionar lógica por frame, modificadores temporários, etc.

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
