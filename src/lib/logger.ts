import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...metadata } = info;
    let log = `${timestamp} ${level}: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      // Remove Symbol properties that winston adds
      const cleanMetadata = Object.keys(metadata).reduce((acc, key) => {
        if (typeof key === 'string' && !key.startsWith('Symbol(')) {
          acc[key] = metadata[key];
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(cleanMetadata).length > 0) {
        log += `\n${JSON.stringify(cleanMetadata, null, 2)}`;
      }
    }

    return log;
  }),
);

// Define transports
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  levels,
  format,
  transports,
});

export default logger;
