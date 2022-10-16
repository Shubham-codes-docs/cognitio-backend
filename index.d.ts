import express from "express";

interface AuthContext {
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
