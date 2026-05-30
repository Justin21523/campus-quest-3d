// apps/web/src/phaser/scenes/LibrarySortScene.ts
import Phaser from 'phaser';

interface BookData {
  id: string;
  title: string;
  category: 'history' | 'science' | 'literature';
  color: number;
}

const BOOKS: BookData[] = [
  { id: 'b1', title: 'Starbridge Chronicles', category: 'history', color: 0xef4444 },
  { id: 'b2', title: 'Quantum Mechanics 101', category: 'science', color: 0x3b82f6 },
  { id: 'b3', title: 'Poetry of the Lost', category: 'literature', color: 0xa855f7 },
  { id: 'b4', title: 'Campus Architecture', category: 'history', color: 0xef4444 },
  { id: 'b5', title: 'Neural Networks', category: 'science', color: 0x3b82f6 },
  { id: 'b6', title: 'Midnight Sonnets', category: 'literature', color: 0xa855f7 },
];

const CATEGORIES = ['history', 'science', 'literature'] as const;
const CATEGORY_COLORS: Record<string, number> = {
  history: 0xef4444,
  science: 0x3b82f6,
  literature: 0xa855f7,
};
const CATEGORY_LABELS: Record<string, string> = {
  history: '📜 History',
  science: '🔬 Science',
  literature: '📖 Literature',
};

export default class LibrarySortScene extends Phaser.Scene {
  private sortedCount = 0;
  private totalBooks = BOOKS.length;
  private progressText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private bookContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'LibrarySortScene' });
  }

  create(): void {
    // Background
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // Title
    this.add.text(400, 40, '📚 Library Sorting System', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(400, 75, 'Drag each book to the correct shelf!', {
      fontSize: '14px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    // Create category shelves
    const shelfWidth = 200;
    const shelfGap = 40;
    const startX = 400 - ((CATEGORIES.length * shelfWidth + (CATEGORIES.length - 1) * shelfGap) / 2) + shelfWidth / 2;

    CATEGORIES.forEach((cat, i) => {
      const x = startX + i * (shelfWidth + shelfGap);
      const y = 480;

      // Shelf background
      const shelf = this.add.rectangle(x, y, shelfWidth, 120, 0x2d2d44)
        .setStrokeStyle(2, CATEGORY_COLORS[cat])
        .setInteractive({ useHandCursor: true });

      // Category label
      this.add.text(x, y - 40, CATEGORY_LABELS[cat], {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      // Drop zone data
      shelf.setData('category', cat);

      // Visual feedback on hover
      shelf.on('pointerover', () => shelf.setStrokeStyle(3, 0xfbbf24));
      shelf.on('pointerout', () => shelf.setStrokeStyle(2, CATEGORY_COLORS[cat]));
    });

    // Progress display
    this.progressText = this.add.text(400, 560, `Sorted: 0 / ${this.totalBooks}`, {
      fontSize: '18px',
      color: '#fbbf24',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Feedback text (correct/wrong)
    this.feedbackText = this.add.text(400, 300, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Spawn books in random positions at top area
    const shuffled = Phaser.Utils.Array.Shuffle([...BOOKS]);
    shuffled.forEach((book, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const bx = 200 + col * 200;
      const by = 160 + row * 80;
      this.createBook(book, bx, by);
    });

    // ESC to exit without completing
    this.input.keyboard?.on('keydown-ESC', () => {
      this.game.events.emit('minigame-exit');
      this.game.destroy(true);
    });

    // Instructions
    this.add.text(780, 580, '[ESC] Exit', {
      fontSize: '12px',
      color: '#64748b',
    }).setOrigin(1, 0.5);
  }

  private createBook(data: BookData, x: number, y: number): void {
    const container = this.add.container(x, y);
    container.setData('bookData', data);
    container.setSize(140, 50);
    container.setInteractive({ useHandCursor: true, draggable: true });

    // Book visual
    const bg = this.add.rectangle(0, 0, 140, 50, 0x374151)
      .setStrokeStyle(2, data.color);
    const title = this.add.text(0, 0, data.title, {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: 120, useAdvancedWrap: true },
      align: 'center',
    }).setOrigin(0.5);

    container.add([bg, title]);
    this.bookContainers.push(container);

    // Drag events
    container.on('dragstart', () => {
      container.setDepth(100);
      container.setScale(1.1);
    });

    container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      container.setPosition(dragX, dragY);
    });

    container.on('dragend', () => {
      container.setDepth(0);
      container.setScale(1);
      this.checkDrop(container, data);
    });
  }

  private checkDrop(container: Phaser.GameObjects.Container, bookData: BookData): void {
    const bookBounds = container.getBounds();
    let dropped = false;

    // Check overlap with each shelf
    this.children.list.forEach((child) => {
      if (!(child instanceof Phaser.GameObjects.Rectangle)) return;
      const category = child.getData('category');
      if (!category) return;

      const shelfBounds = child.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(bookBounds, shelfBounds)) {
        dropped = true;
        if (category === bookData.category) {
          this.handleCorrectDrop(container, child);
        } else {
          this.handleWrongDrop(container);
        }
      }
    });

    // If not dropped on any shelf, snap back (already handled by no position change)
    if (!dropped) {
      this.showFeedback('✗ Wrong shelf!', '#ef4444');
    }
  }

  private handleCorrectDrop(container: Phaser.GameObjects.Container, shelf: Phaser.GameObjects.Rectangle): void {
    // Snap to shelf center
    const shelfBounds = shelf.getBounds();
    const offsetY = (this.sortedCount % 3) * 18 - 18;
    container.setPosition(shelfBounds.centerX, shelfBounds.centerY + offsetY);
    container.disableInteractive();
    container.setAlpha(0.7);

    this.sortedCount++;
    this.progressText.setText(`Sorted: ${this.sortedCount} / ${this.totalBooks}`);
    this.showFeedback('✓ Correct!', '#4ade80');

    // Remove from active list
    this.bookContainers = this.bookContainers.filter((c) => c !== container);

    // Check completion
    if (this.sortedCount >= this.totalBooks) {
      this.handleCompletion();
    }
  }

  private handleWrongDrop(container: Phaser.GameObjects.Container): void {
    // Shake effect
    this.tweens.add({
      targets: container,
      x: container.x - 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.showFeedback('✗ Wrong category!', '#ef4444');
      },
    });
  }

  private showFeedback(text: string, color: string): void {
    this.feedbackText.setText(text).setColor(color).setAlpha(1);
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      delay: 800,
      duration: 400,
    });
  }

  private handleCompletion(): void {
    this.progressText.setText('✅ All Books Sorted!').setColor('#4ade80');

    // Celebration tween
    this.tweens.add({
      targets: this.progressText,
      scale: 1.3,
      duration: 300,
      yoyo: true,
      repeat: 2,
    });

    // Emit completion after short delay
    this.time.delayedCall(1500, () => {
      this.game.events.emit('minigame-complete');
      this.game.destroy(true);
    });
  }
}
