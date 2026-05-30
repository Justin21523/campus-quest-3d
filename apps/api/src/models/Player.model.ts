import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  playerId: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  inventory: string[];
  currentQuestId?: string;
  lastLogin: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  playerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  position: { 
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  rotation: { type: Number, default: 0 },
  inventory: [{ type: String }],
  currentQuestId: { type: String },
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.model<IPlayer>('Player', PlayerSchema);
