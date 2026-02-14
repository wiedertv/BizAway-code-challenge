import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { ALLOWED_IATA_CODES } from '../constants/iata-codes.constant';

export function IsIataCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isIataCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          return ALLOWED_IATA_CODES.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid IATA code supported by the provider (e.g. SYD, JFK, LHR)`;
        },
      },
    });
  };
}
