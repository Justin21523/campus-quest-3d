// apps/web/src/phaser/scenes/ExamQuizScene.ts
// Exam Quiz mini-game: answer multiple-choice campus trivia questions within
// a time limit. Score ≥ 4/6 to pass.
import Phaser from 'phaser';

interface Question {
  text: string;
  options: string[];
  correct: number; // index into options
}

const QUESTIONS: Question[] = [
  {
    text: 'Which district houses the Starbridge Library?',
    options: ['Riverside', 'Starbridge', 'Northhill', 'Downtown'],
    correct: 1,
  },
  {
    text: 'What is the name of the school newspaper?',
    options: ['The Campus Voice', 'The Daily Owl', 'The Starbridge Herald', 'The Riverside Post'],
    correct: 2,
  },
  {
    text: 'How many schools are in the campus district?',
    options: ['2', '3', '4', '5'],
    correct: 1,
  },
  {
    text: 'Which NPC is the Science Teacher?',
    options: ['Bob', 'Alice', 'Mr. Sato', 'Kenji'],
    correct: 2,
  },
  {
    text: 'What happens when you collect all map fragments?',
    options: ['Unlock a shop', 'Reveal a secret spot', 'Gain 100 coins', 'Nothing'],
    correct: 1,
  },
  {
    text: 'Which item does Alice love the most?',
    options: ['Energy Drink', 'Library Document', 'Club Flyer', 'Coffee Can'],
    correct: 1,
  },
];

const PASS_THRESHOLD = 4;
const TIME_PER_QUESTION = 15; // seconds

export default class ExamQuizScene extends Phaser.Scene {
  private currentQ = 0;
  private score = 0;
  private timeLeft = TIME_PER_QUESTION;
  private timerEvent?: Phaser.Time.TimerEvent;
  private questionText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ExamQuizScene' });
  }

  create(): void {
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    this.add.text(400, 40, '📝 Campus Exam Quiz', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(400, 75, `Answer ${PASS_THRESHOLD}/${QUESTIONS.length} correctly to pass!`, {
      fontSize: '14px', color: '#94a3b8',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(50, 560, `Score: 0/${QUESTIONS.length}`, {
      fontSize: '16px', color: '#fbbf24', fontFamily: 'monospace',
    });

    this.timerText = this.add.text(750, 560, `⏱ ${TIME_PER_QUESTION}s`, {
      fontSize: '16px', color: '#f87171', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    this.feedbackText = this.add.text(400, 300, '', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(780, 580, '[ESC] Exit', {
      fontSize: '12px', color: '#64748b',
    }).setOrigin(1, 0.5);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.game.events.emit('minigame-exit');
      this.game.destroy(true);
    });

    this.showQuestion();
  }

  private showQuestion(): void {
    // Clear old buttons
    this.optionButtons.forEach((c) => c.destroy());
    this.optionButtons = [];

    if (this.currentQ >= QUESTIONS.length) {
      this.showResults();
      return;
    }

    const q = QUESTIONS[this.currentQ];

    // Question number
    this.add.text(400, 110, `Question ${this.currentQ + 1} / ${QUESTIONS.length}`, {
      fontSize: '14px', color: '#64748b', fontFamily: 'monospace',
    }).setOrigin(0.5).setName(`qnum-${this.currentQ}`);

    // Question text
    this.questionText = this.add.text(400, 170, q.text, {
      fontSize: '20px', color: '#ffffff', fontFamily: 'monospace',
      wordWrap: { width: 650 }, align: 'center',
    }).setOrigin(0.5).setName(`qtext-${this.currentQ}`);

    // Options
    const startY = 260;
    const gap = 65;
    q.options.forEach((opt, i) => {
      const y = startY + i * gap;
      const container = this.add.container(400, y);
      container.setSize(500, 50);
      container.setInteractive({ useHandCursor: true });

      const bg = this.add.rectangle(0, 0, 500, 50, 0x2d2d44)
        .setStrokeStyle(2, 0x6366f1);
      const label = this.add.text(-220, 0, `${String.fromCharCode(65 + i)}. ${opt}`, {
        fontSize: '16px', color: '#ffffff', fontFamily: 'monospace',
      }).setOrigin(0, 0.5);

      container.add([bg, label]);
      container.on('pointerover', () => bg.setStrokeStyle(3, 0xfbbf24));
      container.on('pointerout', () => bg.setStrokeStyle(2, 0x6366f1));
      container.on('pointerdown', () => this.handleAnswer(i));

      this.optionButtons.push(container);
    });

    // Start timer
    this.timeLeft = TIME_PER_QUESTION;
    this.timerText.setText(`⏱ ${this.timeLeft}s`);
    this.timerEvent?.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`⏱ ${this.timeLeft}s`);
        if (this.timeLeft <= 5) this.timerText.setColor('#ef4444');
        else this.timerText.setColor('#f87171');
        if (this.timeLeft <= 0) {
          this.timerEvent?.remove();
          this.handleAnswer(-1); // timeout
        }
      },
    });
  }

  private handleAnswer(chosen: number): void {
    this.timerEvent?.remove();
    const q = QUESTIONS[this.currentQ];
    const correct = chosen === q.correct;

    if (correct) {
      this.score++;
      this.showFeedback('✓ Correct!', '#4ade80');
    } else {
      const answer = chosen === -1 ? 'Time\'s up!' : '✗ Wrong!';
      this.showFeedback(`${answer} Answer: ${q.options[q.correct]}`, '#ef4444');
    }

    this.scoreText.setText(`Score: ${this.score}/${QUESTIONS.length}`);

    // Disable buttons
    this.optionButtons.forEach((c) => c.disableInteractive());

    // Next question after delay
    this.time.delayedCall(1500, () => {
      // Clean up question-specific objects
      this.children.list
        .filter((c) => c.name?.startsWith(`qnum-`) || c.name?.startsWith(`qtext-`))
        .forEach((c) => c.destroy());
      this.currentQ++;
      this.showQuestion();
    });
  }

  private showFeedback(text: string, color: string): void {
    this.feedbackText.setText(text).setColor(color).setAlpha(1).setDepth(200);
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      delay: 1000,
      duration: 400,
    });
  }

  private showResults(): void {
    this.optionButtons.forEach((c) => c.destroy());
    const passed = this.score >= PASS_THRESHOLD;

    const resultBg = this.add.rectangle(400, 300, 500, 300, 0x2d2d44)
      .setStrokeStyle(3, passed ? 0x4ade80 : 0xef4444);

    this.add.text(400, 200, passed ? '🎉 Exam Passed!' : '😞 Exam Failed', {
      fontSize: '32px', color: passed ? '#4ade80' : '#ef4444', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(400, 260, `Score: ${this.score} / ${QUESTIONS.length}`, {
      fontSize: '24px', color: '#fbbf24', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(400, 310, passed
      ? 'Great job! You earned your rewards.'
      : 'Study more and try again next time!', {
      fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace',
      wordWrap: { width: 400 }, align: 'center',
    }).setOrigin(0.5);

    if (passed) {
      this.time.delayedCall(2000, () => {
        this.game.events.emit('minigame-complete');
        this.game.destroy(true);
      });
    } else {
      this.add.text(400, 380, '[ESC] Close', {
        fontSize: '14px', color: '#64748b', fontFamily: 'monospace',
      }).setOrigin(0.5);
    }
  }
}
