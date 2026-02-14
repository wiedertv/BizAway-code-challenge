export class Trip {
  public readonly id: string;
  public readonly origin: string;
  public readonly destination: string;
  public readonly cost: number;
  public readonly duration: number;
  public readonly type: string;
  public readonly displayName: string;

  constructor(
    id: string,
    origin: string,
    destination: string,
    cost: number,
    duration: number,
    type: string,
    displayName: string,
  ) {
    this.id = id;
    this.origin = origin;
    this.destination = destination;
    this.cost = cost;
    this.duration = duration;
    this.type = type;
    this.displayName = displayName;
  }

  static create(
    id: string,
    origin: string,
    destination: string,
    cost: number,
    duration: number,
    type: string,
    displayName: string,
  ): Trip {
    return new Trip(id, origin, destination, cost, duration, type, displayName);
  }
}
