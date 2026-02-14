import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'saved-trips', timestamps: true })
export class SavedTripDocument extends Document {
  @Prop({ required: true, index: true })
  sessionId!: string;

  @Prop({ type: String, required: false, index: true })
  userId?: string | null;

  @Prop({ required: true })
  tripId!: string;

  @Prop({ required: true })
  origin!: string;

  @Prop({ required: true })
  destination!: string;

  @Prop({ required: true })
  cost!: number;

  @Prop({ required: true })
  duration!: number;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  displayName!: string;

  @Prop({ type: Date, default: Date.now })
  savedAt!: Date;
}

export const SavedTripSchema = SchemaFactory.createForClass(SavedTripDocument);

// Create compound index for efficient queries
SavedTripSchema.index({ sessionId: 1, savedAt: -1 });
