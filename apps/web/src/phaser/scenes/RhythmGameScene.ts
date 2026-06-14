// apps/web/src/phaser/scenes/RhythmGameScene.ts
// Rhythm game: notes fall from the top, press the correct key when they reach
// the hit zone. Hit 10/16 notes to pass.
import Phaser from 'phaser';

interface Note {
  lane: number;
  key: string;
  spawnTime: number;
  hit: boolean;
  missed: boolean;
  sprite?: Phaser.GameObjects.Rectangle;
}

const LANES = [
  { key: 'D', color: 0xef4444, x: 250 },
  { key: 'F', color: 0x3b82f6, x: 350 },
  { key: 'J', color: 0x4ade80, x: 450 },
  { key: 'K', color: 0xfbbf24, x: 550 },
];

const HIT_Y = 500;
const SPAWN_Y = -40;
const NOTE_SPEED = 200; // pixels per second
const HIT_TOLERANCE = 50; // pixels
const PASS_THRESHOLD = 10;

// Pre-composed note pattern (lane index, time offset in ms)
const PATTERN: { lane: number; time: number }[] = [
  { lane: 0, time: 500 },
  { lane: 1, time: 1000 },
  { lane: 2, time: 1500 },
  { lane: 3, time: 2000 },
  { lane: 1, time: 2500 },
  { lane: 0, time: 3000 },
  { lane: 3, time: 3300 },
  { lane: 2, time: 3600 },
  { lane: 0, time: 4200 },
  { lane: 2, time: 4500 },
  { lane: 1, time: 4800 },
  { lane: 3, time: 5100 },
  { lane: 0, time: 5600 },
  { lane: 1, time: 5900 },
  { lane: 2, time: 6200 },
  { lane: 3, time: 6500 },
];

export default class RhythmGameScene extends Phaser.Scene {
  private notes: Note[] = [];
  private hits = 0;
  private misses = 0;
  private totalNotes = PATTERN.length;
  private scoreText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private startTime = 0;
  private spawned = 0;
  private gameOver = false;

  constructor() {
    super({ key: 'RhythmGameScene' });
  }

  create(): void {
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    this.add.text(400, 20, '🎵 Rhythm Game', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Lane backgrounds
    LANES.forEach((lane) => {
      this.add.rectangle(lane.x, 300, 80, 600, 0x1e1e3a).setStrokeStyle(1, 0x374151);

      // Key label at hit zone
      this.add.text(lane.x, HIT_Y + 30, lane.key, {
        fontSize: '20px', color: '#94a3b8', fontFamily: 'monospace',
      }).setOrigin(0.5);
    });

    // Hit zone line
    this.add.rectangle(400, HIT_Y, 400, 4, 0x6366f1);

    this.scoreText = this.add.text(400, 570, `Hits: 0 / ${this.totalNotes}`, {
      fontSize: '16px', color: '#fbbf24', fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(400, 440, '', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(780, 580, '[ESC] Exit', {
      fontSize: '12px', color: '#64748b',
    }).setOrigin(1, 0.5);

    this.input.keyboard?.on('keydown-ESC', () => {
      this.game.events.emit('minigame-exit');
      this.game.destroy(true);
    });

    // Key press handler
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.gameOver) return;
      const key = event.key.toUpperCase();
      const laneIdx = LANES.findIndex((l) => l.key === key);
      if (laneIdx >= 0) this.tryHit(laneIdx);
    });

    // Start the rhythm
    this.startTime = this.time.now;
  }

  update(): void {
    if (this.gameOver) return;

    const elapsed = this.time.now - this.startTime;

    // Spawn notes based on pattern timing
    while (this.spawned < PATTERN.length && elapsed >= PATTERN[this.spawned].time) {
      const p = PATTERN[this.spawned];
      const lane = LANES[p.lane];
      const note: Note = {
        lane: p.lane,
        key: lane.key,
        spawnTime: this.time.now,
        hit: false,
        missed: false,
      };

      note.sprite = this.add.rectangle(lane.x, SPAWN_Y, 60, 20, lane.color)
        .setStrokeStyle(2, 0xffffff);

      this.notes.push(note);
      this.spawned++;
    }

    // Move notes down
    const dt = this.game.loop.delta / 1000;
    for (const note of this.notes) {
      if (note.hit || note.missed || !note.sprite) continue;
      note.sprite.y += NOTE_SPEED * dt;

      // Missed (passed hit zone)
      if (note.sprite.y > HIT_Y + HIT_TOLERANCE) {
        note.missed = true;
        this.misses++;
        note.sprite.setAlpha(0.3);
        this.showFeedback('Miss!', '#ef4444');
        this.updateScore();
      }
    }

    // Check if all notes are done
    const allDone = this.notes.length >= this.totalNotes &&
      this.notes.every((n) => n.hit || n.missed);
    if (allDone && !this.gameOver) {
      this.showResults();
    }
  }

  private tryHit(laneIdx: number): void {
    // Find the closest unhit note in this lane within tolerance
    const candidates = this.notes.filter(
      (n) => n.lane === laneIdx && !n.hit && !n.missed && n.sprite,
    );

    let closest: Note | null = null;
    let closestDist = Infinity;

    for (const note of candidates) {
      const dist = Math.abs(note.sprite!.y - HIT_Y);
      if (dist < HIT_TOLERANCE && dist < closestDist) {
        closest = note;
        closestDist = dist;
      }
    }

    if (closest) {
      closest.hit = true;
      this.hits++;

      // Visual feedback
      if (closest.sprite) {
        closest.sprite.setFillStyle(0xffffff);
        this.tweens.add({
          targets: closest.sprite,
          alpha: 0,
          scale: 1.5,
          duration: 200,
        });
      }

      // Flash the lane
      const flash = this.add.rectangle(LANES[laneIdx].x, HIT_Y, 80, 40, LANES[laneIdx].color, 0.5);
      this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });

      if (closestDist < 15) {
        this.showFeedback('Perfect!', '#fbbf24');
      } else {
        this.showFeedback('Good!', '#4ade80');
      }
      this.updateScore();
    }
  }

  private updateScore(): void {
    this.scoreText.setText(`Hits: ${this.hits} / ${this.totalNotes}`);
  }

  private showFeedback(text: string, color: string): void {
    this.feedbackText.setText(text).setColor(color).setAlpha(1);
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      delay: 400,
      duration: 300,
    });
  }

  private showResults(): void {
    this.gameOver = true;
    const passed = this.hits >= PASS_THRESHOLD;

    this.add.rectangle(400, 280, 500, 250, 0x2d2d44)
      .setStrokeStyle(3, passed ? 0x4ade80 : 0xef4444)
      .setDepth(100);

    this.add.text(400, 200, passed ? '🎶 Great Rhythm!' : '🎵 Keep Practicing!', {
      fontSize: '28px', color: passed ? '#4ade80' : '#ef4444', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(101);

    this.add.text(400, 260, `Hits: ${this.hits} / ${this.totalNotes}`, {
      fontSize: '22px', color: '#fbbf24', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(101);

    this.add.text(400, 310, passed
      ? 'Your rhythm earned you rewards!'
      : 'Practice makes perfect!', {
      fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace',
      wordWrap: { width: 400 }, align: 'center',
    }).setOrigin(0.5).setDepth(101);

    if (passed) {
      this.time.delayedCall(2000, () => {
        this.game.events.emit('minigame-complete');
        this.game.destroy(true);
      });
    }
  }
}
