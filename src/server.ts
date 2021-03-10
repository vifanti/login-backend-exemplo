import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import axios from 'axios';
import querystring from 'querystring';

import AppError from './errors/AppError';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/exchange-authorization-code', async (request, response) => {
  const code = request.query.code as string;

  if (!code) {
    throw new AppError('Code not provided.');
  }

  const requestBody: querystring.ParsedUrlQueryInput = {
    code,
    grant_type: 'authorization_code',
  };

  try {
    const session = await axios({
      method: 'POST',
      url: 'http://localhost:8099/services/login/oauth2/token',
      data: querystring.stringify(requestBody),
      auth: {
        username: 'efd13589-03ee-42e1-99e0-8134eecf5ae7', // client id
        password: '028573e7-0c59-4700-9724-c16e01350e3c', // secret key
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.json(session.data);
  } catch (error) {
    const { message } = error.response.data;
    const { statusCode } = error.response;
    throw new AppError(message, statusCode);
  }
});

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.listen(3333, () => {
  // eslint-disable-next-line no-console
  console.log('🏥 Server start on http://localhost:3333');
});
