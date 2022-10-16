import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "./user.model";
import jwt from "jsonwebtoken";

function emailValidator(email: string): boolean {
  const regex = /^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/;
  return email.match(regex) != null;
}

export const SignupUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log(req.body);

  if (!emailValidator(email)) {
    res
      .status(400)
      .json({
        message: "Invalid email provided",
      })
      .end();
    return;
  }

  const passHash = await bcrypt.hash(password, 10);
  const user = new User({ ...req.body, password: passHash });

  try {
    await user.save();
    res
      .status(200)
      .json({
        message: "Successfully signuped the user",
      })
      .end();
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .json({
        message: "Couldn't signup the user",
      })
      .end();
  }
};

export const LoginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({
        message: "username or password is not provided",
      })
      .end();
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res
      .status(400)
      .json({
        message: "Couldn't find the user",
      })
      .end();
    return;
  }

  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    res.status(400).json({ message: "Invalid credentials" }).end();
    return;
  }

  // Generate the jwt token and send it back;
  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      _id: user._id,
    },
    process.env.JWT_KEY || "12345"
  );

  res
    .status(200)
    .json({
      name: user.name,
      token,
      email: user.email,
    })
    .end();
};

export const VerifyToken = (req: Request, res: Response) => {
  if (!req.auth) {
    res.status(400).end();
    return;
  }

  res.status(200).json(req.auth).end();
};

export const Vote = (req: Request, res: Response) => {
  if (!req.auth) {
    res.status(400).end();
    return;
  }

  const { voted } = req.body;

  User.findOneAndUpdate({ email: req.auth.email }, { $set: { voted } }).then(
    (success) => {
      res.status(200).end();
    },
    (err) => {
      res.status(500).end();
    }
  );
};

export const GetVotes = async (req: Request, res: Response) => {
  const result = await User.aggregate([
    {
      $group: { _id: "$voted", count: { $sum: 1 } },
    },
  ] as any);

  res.status(200).json(result).end();
};
