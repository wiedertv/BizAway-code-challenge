import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                process.env.NODE_ENV === 'production'
                    ? winston.format.json() // Production: JSON
                    : nestWinstonModuleUtilities.format.nestLike('App', {
                        colors: true,
                        prettyPrint: true,
                    }), // Dev: Nest-like colors
            ),
        }),
    ],
};
