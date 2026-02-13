import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { IsIataCode } from '../../../shared/validators/is-iata-code.decorator';

export enum SortStrategy {
    FASTEST = 'fastest',
    CHEAPEST = 'cheapest',
}

export class SearchTripDto {
    @IsNotEmpty()
    @IsString()
    @IsIataCode()
    origin: string;

    @IsNotEmpty()
    @IsString()
    @IsIataCode()
    destination: string;

    @IsNotEmpty()
    @IsEnum(SortStrategy)
    sort_by: SortStrategy;
}
