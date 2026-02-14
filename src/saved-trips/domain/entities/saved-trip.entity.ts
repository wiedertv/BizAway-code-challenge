export class SavedTrip {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly userId: string | null,
    public readonly tripId: string,
    public readonly origin: string,
    public readonly destination: string,
    public readonly cost: number,
    public readonly duration: number,
    public readonly type: string,
    public readonly displayName: string,
    public readonly savedAt: Date,
  ) {}

  static create(
    id: string,
    sessionId: string,
    userId: string | null,
    tripId: string,
    origin: string,
    destination: string,
    cost: number,
    duration: number,
    type: string,
    displayName: string,
    savedAt: Date,
  ): SavedTrip {
    return new SavedTrip(
      id,
      sessionId,
      userId,
      tripId,
      origin,
      destination,
      cost,
      duration,
      type,
      displayName,
      savedAt,
    );
  }
}
