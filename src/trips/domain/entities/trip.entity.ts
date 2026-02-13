import { ApiProperty } from '@nestjs/swagger';

export class Trip {
    @ApiProperty({ example: 'a749c866-7928-4d08-9d5c-a6821a583d1a' })
    public readonly id: string;

    @ApiProperty({ example: 'SYD' })
    public readonly origin: string;

    @ApiProperty({ example: 'GRU' })
    public readonly destination: string;

    @ApiProperty({ example: 625 })
    public readonly cost: number;

    @ApiProperty({ example: 5 })
    public readonly duration: number;

    @ApiProperty({ example: 'flight' })
    public readonly type: string;

    @ApiProperty({ example: 'from SYD to GRU by flight' })
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
