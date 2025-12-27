import pino from 'pino';
// import dayjs from 'dayjs';

const logger = pino({
  level: process.env.LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  // timestamp: () => `,"time":"${dayjs().format()}`,
});
export default logger;
