import { Router, Request, Response } from 'express';
import Player from '../models/Player.model.js';

const router = Router();

// Initialize or fetch player state
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { playerId, name } = req.body;
    
    let player = await Player.findOne({ playerId });
    
    if (!player) {
      player = await Player.create({ 
        playerId, 
        name: name || 'New Student',
        position: { x: 0, y: 0, z: 0 }
      });
    } else {
      player.lastLogin = new Date();
      await player.save();
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize player' });
  }
});

// Update player position/state
router.patch('/:playerId/state', async (req: Request, res: Response) => {
  try {
    const { position, rotation } = req.body;
    const player = await Player.findOneAndUpdate(
      { playerId: req.params.playerId },
      { $set: { position, rotation, lastLogin: new Date() } },
      { new: true }
    );
    
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update state' });
  }
});

export default router;
