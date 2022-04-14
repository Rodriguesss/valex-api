import { Request, Response } from 'express';

async function createCard(req: Request, res: Response) {


  res.sendStatus(200);
}

export const cardController = { createCard, };
