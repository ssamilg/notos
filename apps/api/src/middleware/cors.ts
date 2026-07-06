import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  process.env.WEB_ORIGIN,
].filter((origin): origin is string => typeof origin === 'string' && origin.length > 0);

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});
