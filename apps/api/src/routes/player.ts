import { Router, Request, Response } from 'express';
import Player from '../models/Player.model.js';
import type { PlayerState, PlayerInitRequest, PlayerUpdateRequest } from '@campus-quest/shared-types';

const router = Router();

router.post('/init', async (req: Request<{}, PlayerState, PlayerInitRequest>, res: Response) => {
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

    res.json(player.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize player' });
  }
});

// GET single player state
router.get('/:playerId', async (req: Request<{ playerId: string }>, res: Response) => {
  try {
    const player = await Player.findOne({ playerId: req.params.playerId });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// PATCH player state (position, rotation)
router.patch('/:playerId/state', async (req: Request<{ playerId: string }, PlayerState, PlayerUpdateRequest>, res: Response) => {
  try {
    const { position, rotation } = req.body;
    const updateFields: Partial<PlayerUpdateRequest> & { lastLogin: Date } = { lastLogin: new Date() };
    if (position) updateFields.position = position;
    if (rotation !== undefined) updateFields.rotation = rotation;

    const player = await Player.findOneAndUpdate(
      { playerId: req.params.playerId },
      { $set: updateFields },
      { new: true }
    );

    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Failed to update player state' });
  }
});

export default router;
