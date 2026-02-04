import { Request, Response } from "express";

//
export const entryMessage = (req: Request, res: Response) => {
  res.send({
    message: "Welcome to Julfinar server!!!",
  });
};
