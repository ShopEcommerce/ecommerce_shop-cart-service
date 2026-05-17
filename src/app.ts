import express, { RequestHandler, ErrorRequestHandler } from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { errorHandler, NotFoundError, correlationId, currentUser } from '@teleshop/common';
import { cartRouter } from './modules/cart/cart.route';
import { redisWrapper } from './redis/redis-wrapper';

const app = express();

app.set('trust proxy', true);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(correlationId as RequestHandler);

app.get('/health', (_req, res) => {
  res.status(200).send({ status: 'ok', service: 'cart-service' });
});

app.get('/health/redis', async (_req, res) => {
  const isHealthy = await redisWrapper.healthCheck();
  const status = isHealthy ? 'healthy' : 'unhealthy';
  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).send({ status, service: 'cart-service', component: 'redis' });
});

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }),
);

app.use(currentUser as RequestHandler);

app.use('/api/cart', cartRouter);

app.all(/.*/, () => {
  throw new NotFoundError();
});

app.use(errorHandler as ErrorRequestHandler);

export { app };
