// apps/web/src/phaser/scenes/SportsQteScene.ts
// Sports QTE mini-game: press the correct key when prompted within a shrinking
// time window. Hit 8/12 prompts to win.
import Phaser from 'phaser';

const TOTAL_PROMPTS = 12;
const PASS_THRESHOLD = 8;
const KEYS = ['A', 'S', 'D', 'F', 'J', 'K', 'L'];
const INITIAL_WINDOW_MS = 2000;
const MIN_WINDOW_MS = 800;

export default class SportsQteScene extends Phaser.Scene {
  private promptIndex = 0;
  private hits = 0;
  private misses = 0;
  private windowMs = INITIAL_WINDOW_MS;
  private promptText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Rectangle;
  private timerBg!: Phaser.GameObjects.Rectangle;
  private timerEvent?: Phaser.Time.TimerEvent;
  private waiting = false;
  private keyDisplay!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'SportsQteScene' });
  }

  create(): void {
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    this.add.text(400, 40, '⚡ Sports Quick-Time Event', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(400, 75, `Press the correct key before time runs out! (${PASS_THRESHOLD}/${TOTAL_PROMPTS} to pass)`, {
      fontSize: '14px', color: '#94a3b8',
    }).setOrigin(0.5);

    this.scoreText = this.add.text(400, 560, `Hits: 0 / ${TOTAL_PROMPTS}`, {
      fontSize: '16px', color: '#fbbf24', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(400, 420, '', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Timer bar
    this.timerBg = this.add.rectangle(400, 480, 500, 20, 0x374151).setStrokeStyle(1, 0x64748b);
    this.timerBar = this.add.rectangle(150, 480, 500, 16, 0x4ade80).setOrigin(0, 0.5);

    // Key display
    this.keyDisplay = this.add.text(400, 250, '', {
      fontSize: '80px', color: '#fbbf24', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.promptText = this.add.text(400, 350, 'Get ready...', {
      fontSize: '18px', color: '#94a3b8', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(780, 580, '[ESC] Exit', {
      fontSize: '12px', color: '#64748b',
    }).setOrigin(1, 0.5);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.game.events.emit('minigame-exit');
      this.game.destroy(true);
    });

    // Listen for key presses
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.waiting) return;
      const pressed = event.key.toUpperCase();
      if (KEYS.includes(pressed)) {
        this.handleKeyPress(pressed);
      }
    });

    // Start first prompt after a short delay
    this.time.delayedCall(1000, () => this.nextPrompt());
  }

  private nextPrompt(): void {
    if (this.promptIndex >= TOTAL_PROMPTS) {
      this.showResults();
      return;
    }

    const key = KEYS[Math.floor(Math.random() * KEYS.length)];
    this.keyDisplay.setText(key).setColor('#fbbf24');
    this.promptText.setText(`Press [${key}] now!`);
    this.waiting = true;

    // Shrink window over time
    this.windowMs = Math.max(MIN_WINDOW_MS, INITIAL_WINDOW_MS - this.promptIndex * 100);

    // Animate timer bar
    this.timerBar.setScaleX(1);
    this.timerBar.setFillStyle(0x4ade80);

    this.timerEvent?.remove();
    const startTime = this.time.now;
    this.timerEvent = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        const elapsed = this.time.now - startTime;
        const pct = 1 - elapsed / this.windowMs;
        this.timerBar.setScaleX(Math.max(0, pct));
        if (pct < 0.3) this.timerBar.setFillStyle(0xef4444);
        else if (pct < 0.6) this.timerBar.setFillStyle(0xfbbf24);
        if (elapsed >= this.windowMs) {
          this.timerEvent?.remove();
          this.handleTimeout();
        }
      },
    });
  }

  private handleKeyPress(pressed: string): void {
    this.waiting = false;
    this.timerEvent?.remove();

    const expected = this.keyDisplay.text;
    if (pressed === expected) {
      this.hits++;
      this.keyDisplay.setColor('#4ade80');
      this.showFeedback('✓ Perfect!', '#4ade80');
    } else {
      this.misses++;
      this.keyDisplay.setColor('#ef4444');
      this.showFeedback(`✗ Wrong! Expected [${expected}]`, '#ef4444');
    }

    this.scoreText.setText(`Hits: ${this.hits} / ${TOTAL_PROMPTS}`);
    this.promptIndex++;

    this.time.delayedCall(800, () => this.nextPrompt());
  }

  private handleTimeout(): void {
    this.waiting = false;
    this.misses++;
    this.keyDisplay.setColor('#ef4444');
    this.showFeedback('⏱ Too slow!', '#ef4444');
    this.scoreText.setText(`Hits: ${this.hits} / ${TOTAL_PROMPTS}`);
    this.promptIndex++;

    this.time.delayedCall(800, () => this.nextPrompt());
  }

  private showFeedback(text: string, color: string): void {
    this.feedbackText.setText(text).setColor(color).setAlpha(1);
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      delay: 600,
      duration: 300,
    });
  }

  private showResults(): void {
    this.keyDisplay.setText('');
    this.timerBar.setVisible(false);
    this.timerBg.setVisible(false);
    const passed = this.hits >= PASS_THRESHOLD;

    this.add.rectangle(400, 280, 500, 250, 0x2d2d44)
      .setStrokeStyle(3, passed ? 0x4ade80 : 0xef4444);

    this.add.text(400, 200, passed ? '🏆 Great Performance!' : '😅 Keep Practicing!', {
      fontSize: '28px', color: passed ? '#4ade80' : '#ef4444', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(400, 260, `Hits: ${this.hits} / ${TOTAL_PROMPTS}`, {
      fontSize: '22px', color: '#fbbf24', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(400, 310, passed
      ? 'Your reflexes earned you rewards!'
      : 'Try again to improve your reflexes!', {
      fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace',
      wordWrap: { width: 400 }, align: 'center',
    }).setOrigin(0.5);

    if (passed) {
      this.time.delayedCall(2000, () => {
        this.game.events.emit('minigame-complete');
        this.game.destroy(true);
      });
    } else {
      this.promptText.setText('[ESC] Close');
    }
  }
}
