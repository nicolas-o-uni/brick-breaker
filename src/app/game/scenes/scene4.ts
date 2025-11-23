import Phaser from 'phaser';
import { startLevel, pause, isPaused, resume, togglePauseState, isGameStarted, restartLevel, CompleteMenu, isInMenu, destroyGame } from '../phaser-game';
import { BaseFase } from '../basefase';
import { RankService } from "../services/onRank.service";
import { isRankRunEnabled, RankRunData, RankRunState, nextLevel } from '../phaser-game';
import { createHUD, createPauseMenu } from '../visual';

export default class map extends BaseFase {

  constructor() { super({ key: 'map4' }); }

  preload() {
    // caminhos relativos à root do app: src/assets/ -> 'assets/...'
    this.load.image('ball', 'assets/images/Ball Gray.png');
    this.load.image('paddle', 'assets/images/Paddle Orange.png');
    this.load.image('brick', 'assets/images/Block Orange.png' );

    this.load.audio('paddle-hit', 'assets/sounds/paddle-hit.wav');
    this.load.audio('brick-hit', 'assets/sounds/brick-hit.wav');
  }

  async init() {
    this.onProgressLoaded = () => {
      if (this.progress.levelsCleared.includes('map4')) {
        console.log("Fase já concluída!");
      }
    };
    await this.createBase('map4');

    this.gameTime = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.paddleSound = this.sound.add('paddle-hit', { volume: 0.5 });
    this.brickSound = this.sound.add('brick-hit', { volume: 0.5 });

    // Physics world
    this.physics.world.setBounds(0, 0, W, H);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Criação do hud
    const hud = createHUD(this, W, () => this.handleToggleMenu());
    this.timerText = hud.timerText;

    // Cria grupo de bolas antes de criar a primeira bola
    this.balls = this.physics.add.group({
      defaultKey: 'ball',
      maxSize: 1000,
    });

    // Cria a bola inicial
    this.ball = this.physics.add.image(W/2, H - 60, 'ball')
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
      ball.setTintFill(0xFFFFFF);
      (ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    });

    // Paddle
    this.paddle = this.physics.add.image(W/2, H - 40, 'paddle')
    .setImmovable(true)
    .setTintFill(0xFF4C4C)
    .setDisplaySize(60, 10) // define tamanho real
    .setCollideWorldBounds(true) as Phaser.Physics.Arcade.Image;
    (this.paddle!.body as any).allowGravity = false;

    // Bricks
    this.bricks = this.physics.add.staticGroup();   // --- GRUPOS DE BLOCOS ---

    const bw = 21; // largura do bloco
    const bh = 12; // altura do bloco
    const marginX = 1;
    const marginY = 4;

    const cols = 18; // largura total do mapa
    const rows = 12; // altura total
    const startX = (W - cols * (bw + marginX)) / 2 + bw / 2;
    const startY = 130;


    // Matriz do layout
    // N = nenhum bloco, Y = amarelo, P = roxo, G = verde
    const layout = [
      "NNNNNNNNNNNNNNNNNN",
      "NNNNNNNNNNNNNNNNNN",
      "IIIIIIIINNNNNNNNNN",
      "PPPNNGGGGGGGGNNPPP",
      "PPNNNGGGGGGGGNNNPP",
      "PNNNNNGGGGGGNNNNNP",
      "NNNNNGGGGGGGGNNNNN",
      "NNNNNGGGGGGGGNNNNN",
      "NNNNNNNNNNNNNNNNNN",
      "NNNNNNNNNNNNNNNNNN",
      "IINNIIIINNIIINNNII",
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

        // --- aplica as cores ---
        switch (char) {
          case "Y":
            brick.setTintFill(0xffeb3b); // amarelo
            break;
          case "P":
            brick.setTintFill(0xFFFF00); // laranja
            break;
          case "G":
            brick.setTintFill(0x00FFFF); // verde
            break;
          case "I":
            brick.setTintFill(0xFF4C4C); // azul claro (indestrutível)
            brick.setData("indestructible", true);
            break;
        }
      }
    }
    this.setSpecialBlocks();
        
        
    // Colliders
    this.physics.add.collider(this.balls, hud.headerBg, () => {});

    this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      const b = ball as Phaser.Physics.Arcade.Image;
      const p = paddle as Phaser.Physics.Arcade.Image;
      const diff = b.x - p.x;
      b.setVelocityX(10 * diff);
      this.paddleSound.play();
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
        this.brickSound.play();
      }
      
      const allBricks =
      this.bricks.getChildren() as Phaser.Physics.Arcade.Image[];

      // 🔸 Filtra apenas os blocos que são quebráveis
      const breakableBricks = allBricks.filter(
      (brick) => !brick.getData('indestructible')
      );

      if (breakableBricks.length === 0) {
        // menu ao completar fase
        if (!isRankRunEnabled()) {
          CompleteMenu(this.physics, this);
        }
        pause(this.physics);
        this.finish();
      }
    });

    // Input: mover paddle com pointer/touch
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(p.x, this.paddle.displayWidth / 2, W - this.paddle.displayWidth / 2);
    });

    // Inicia o nível
    startLevel(this.balls, this.launchBall.bind(this), this.physics, this.input);

    this.pauseMenuContainer = createPauseMenu(this, W, H, 
      () => this.handleToggleMenu(), // Callback Retomar
      () => {                        // Callback Sair
        destroyGame();
        window.location.replace('/fase-select');
      }
    );

    // comandos por teclado
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-P', () => {
        this.handleToggleMenu();
      });
      this.input.keyboard.on('keydown-E', () => {
        if (!isRankRunEnabled()) {
          CompleteMenu(this.physics, this);
        }
        pause(this.physics);
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

  handleToggleMenu() {
    togglePauseState(this.physics, this.pauseMenuContainer);
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

    const speed = 460;

    b.setVelocityX(0);
    b.setVelocityY(speed);

    this.startTime = Date.now();
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
      newBall.setDisplaySize(12, 12)
      newBall.setBounce(1);
      newBall.setTintFill(0x00FFFF);
      newBall.setVelocityY(-420);
      newBall.setVelocityX(Phaser.Math.Between(-420, 420));

      this.physics.add.collider(newBall, this.paddle, (ball, paddle) => {
        const b = ball as Phaser.Physics.Arcade.Image;
        const p = paddle as Phaser.Physics.Arcade.Image;
        const diff = b.x - p.x;
        b.setVelocityX(10 * diff);

        this.paddleSound.play();
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

      ball.setVelocityX(currentVelX * 1.5);
      ball.setVelocityY(currentVelY * 1.5);

      // Efeito visual: deixa a bola amarela temporariamente
      ball.setTintFill(0xffff00);
      this.ball.setTintFill(0xff4000);

      // Restaura a velocidade e cor após 5 segundos
      this.time.delayedCall(5000, () => {
        if (ball && ball.body) {
          const body = ball.body as Phaser.Physics.Arcade.Body;
          ball.setVelocityX(body.velocity.x / 1.5);
          ball.setVelocityY(body.velocity.y / 1.5);
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
    const multiplyCount = 3;
    const invertCount = 2;
    const speedBoostCount = 1;

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

  override update(time: number, delta: number): void {
    // Atualiza Timer
    if (isGameStarted && !isPaused && !isInMenu) {
      this.gameTime += delta;
      const totalSeconds = Math.floor(this.gameTime / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    // reset
    const H = this.scale.height;
    this.balls.getChildren().forEach((b) => {
      const ball = b as Phaser.Physics.Arcade.Image;
      if (ball.y > H) {
        ball.destroy();
        if (ball === this.ball) {
          restartLevel(this);
          this.gameTime = 0;
        }
      }
    });
  }
}