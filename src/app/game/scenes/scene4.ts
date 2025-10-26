import Phaser from 'phaser';
import { startLevel, pause, isPaused, resume, isGameStarted, restartLevel, CompleteMenu, isInMenu } from '../phaser-game';
import { BaseFase } from '../basefase';
import { RankService } from "../services/onRank.service";
import { isRankRunEnabled, RankRunData, RankRunState, nextLevel } from '../phaser-game';

export default class map extends BaseFase {

  constructor() { super({ key: 'map4' }); }

  preload() {
    // caminhos relativos à root do app: src/assets/ -> 'assets/...'
    this.load.image('ball', 'assets/images/Ball Gray.png');
    this.load.image('paddle', 'assets/images/Paddle Orange.png');
    this.load.image('brick', 'assets/images/Block Orange.png' );
  }

  async init() {
    this.onProgressLoaded = () => {
      if (this.progress.levelsCleared.includes('map4')) {
        console.log("Fase já concluída!");
      }
    };
    await this.createBase('map4');
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
      maxSize: 100,
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
    const startY = 60;


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
    this.specialBlocks = this.setSpecialBlocks(3); // O número determina a quantidade de blocos especiais
    
          
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

    // Pausar com tecla P
    if (this.input.keyboard) {
        this.input.keyboard.on('keydown-P', () => {
        if (isGameStarted && !isPaused) pause(this.physics);
        else if (isPaused) resume(this.physics);
        });
        this.input.keyboard.on('keydown-E', () => {
        CompleteMenu(this.physics, this);
        this.finish();
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
        specialBlock.setTintFill(0x00FF9F); // destaca em vermelho
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

            if (ball === this.ball) {
              restartLevel(this);
              return;
            }
          }
        });
    }
}