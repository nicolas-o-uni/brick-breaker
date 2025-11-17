import Phaser from 'phaser';
import { startLevel, pause, isPaused, resume, isGameStarted, restartLevel, CompleteMenu, isInMenu } from '../phaser-game';
import { BaseFase } from '../basefase';
import { RankService } from "../services/onRank.service";
import { isRankRunEnabled, RankRunData, RankRunState, nextLevel } from '../phaser-game';

export default class map extends BaseFase {

  constructor() { super({ key: 'map1' }); }

  preload() {
    // caminhos relativos à root do app: src/assets/ -> 'assets/...'
    this.load.image('ball', 'assets/images/Ball Red.png');
    this.load.image('paddle', 'assets/images/Paddle Blue.png');
    this.load.image('brick', 'assets/images/Block Blue.png' );
  }

  async init() {
    this.onProgressLoaded = () => {
      if (this.progress.levelsCleared.includes('map1')) {
        console.log("Fase já concluída!");
      }
    };
    await this.createBase('map1');
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
      maxSize: 1000,
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
      ball.setTintFill(0xFFFFFF);
      ball.setDisplaySize(15,15);
      (ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    });

    // Paddle
    this.paddle = this.physics.add.image(W/2, H - 40, 'paddle')
    .setImmovable(true)
    this.paddle.setTintFill(0x00F000)
    this.paddle.setDisplaySize(100,12) 
    .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    // Bricks
    this.bricks = this.physics.add.staticGroup();
    
    const bw = 41; // largura do bloco
    const bh = 22; // altura do bloco
    const marginX = 1;
    const marginY = 10;

    const cols = 18; // largura total do mapa
    const rows = 12; // altura total
    const startX = (W - cols * (bw + marginX)) / 2 + bw / 2;
    const startY = 100;

    // Matriz do layout
    // N = nenhum bloco, Y = amarelo, P = roxo, G = verde
    const layout = [
      "NNNNNNNNNNNNNNNNNN",
      "NNNNNNNNNNNNNNNNNN",
      "NNNNNNNNNNNNNNNNNN",
      "NNNNNNNNNNNNNNNNNN",
      "NNNNNNNNNNNNNNNNNN",
      "NNNNNNVVVVVVNNNNNN",
      "NNNNNNVVVVVVNNNNNN",
      "NNNNNNNNNNNNNNNNNN",

    ];

    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        const char = layout[r][c];
        if (char === "N") continue;

        const x = startX + c * (bw + marginX);
        const y = startY + r * (bh + marginY);

        const brick = this.bricks.create(x, y, "brick");
        brick.displayWidth = bw;
        brick.displayHeight = bh;
        brick.refreshBody();

        // Aplica cor conforme letra
        switch (char) {
          case "V":
            brick.setTintFill(0x00FF00); // verde
            break;
          case "B":
            brick.setTintFill(0xFFF0FF); // branc
            break;
          case "R":
            brick.setTintFill(0xFF00F0); // rosa
            break;
            case "I":
            brick.setTintFill(0x0000FF); // indestrutivel
            brick.setData("indestructible", true);
            break
        }
        
      }
    }   
    this.setSpecialBlocks();
    

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

        // 🔸 Filtra apenas os blocos que são quebráveis
        const breakableBricks = allBricks.filter(
        (brick) => !brick.getData('indestructible')
        );

        if (breakableBricks.length === 0) {
            // menu ao completar fase
            CompleteMenu(this.physics, this);
            this.finish();
        }
    });

    // Input: mover paddle com pointer/touch
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(p.x, this.paddle.displayWidth / 2, W - this.paddle.displayWidth / 2);
    });

    // Inicia o nível
    startLevel(this.balls, this.launchBall.bind(this), this.physics, this.input);

    // comandos por teclado
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-P', () => {
        if (isGameStarted && !isPaused) pause(this.physics);
        else if (isPaused) resume(this.physics);
      });
      this.input.keyboard.on('keydown-E', () => {
        CompleteMenu(this.physics, this);
        this.finish();
      });
      this.input.keyboard.on('keydown-A', () => {
        this.multiplyBalls();
      });
      this.input.keyboard.on('keydown-S', () => {
        this.speedBoost();
      });
      this.input.keyboard.on('keydown-D', () => {
        this.invertScreen();
      });
    }
  }

  async finish() {
    await this.winLevel();

    const timeInSeconds = (Date.now() - this.startTime) / 1000;
    const mapName = this.faseName;

    // Se estiver em RankRun, acumula e vai automaticamente para a próxima cena
    if (isRankRunEnabled()) {
      RankRunData.totalTime += timeInSeconds;
      RankRunData.mapTimes[mapName] = timeInSeconds;

      // salva recorde individual se for melhor
      await RankService.saveScore(this.faseName, RankRunState.name, timeInSeconds);

      nextLevel(this);
      return;
    }
  }

  // Função de lançamento da bola
  launchBall(ball?: Phaser.Physics.Arcade.Image) {
    const b = ball || this.ball;
    if (!b || !b.body) return;

    const speed = 360;

    b.setVelocityX(0);
    b.setVelocityY(speed);

    this.startTime = Date.now();
  }

  multiplyBalls() {
    const newBallsCount = this.balls.getChildren().length + 1;

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
      newBall.setTintFill(0x00FFFF);
      newBall.setVelocityY(-360);
      newBall.setVelocityX(Phaser.Math.Between(-360, 360));

      this.physics.add.collider(newBall, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(10 * diff);
      });
    }
  }

  // Função de inverter a tela
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

  // Função de acelerar as bolas
  speedBoost() {
    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;
      if (!ball || !ball.body) return;

      const body = ball.body as Phaser.Physics.Arcade.Body;

      // Aumenta a velocidade em 50%
      const currentVelX = body.velocity.x;
      const currentVelY = body.velocity.y;

      ball.setVelocityX(currentVelX * 1.25);
      ball.setVelocityY(currentVelY * 1.25);

      // Efeito visual: deixa a bola amarela temporariamente
      ball.setTintFill(0xffff00);
      this.ball.setTintFill(0xff4000);

      // Restaura a velocidade e cor após 5 segundos
      this.time.delayedCall(5000, () => {
        if (ball && ball.body) {
          const body = ball.body as Phaser.Physics.Arcade.Body;
          ball.setVelocityX(body.velocity.x / 1.25);
          ball.setVelocityY(body.velocity.y / 1.25);
          ball.setTintFill(0x00FFFF);
          this.ball.setTintFill(0xffffff);
        }
      });
    });
  }

  // NOVA função para selecionar múltiplos blocos especiais e a quantidade
  setSpecialBlocks(totalSpecialBlocks = 0): void {
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
    const multiplyCount = 0;
    const invertCount = 0;
    const speedBoostCount = 0;

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
    // Aqui pode adicionar lógica por frame, modificadores temporários, etc.

    //reset
    const H = this.scale.height;

    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;

      // Se a bola passou do limite inferior
      if (ball.y > H) {
        ball.destroy();

        if (ball === this.ball) {
          restartLevel(this);
          return;
        }
      }
    });
  }
}