declare module 'multer';

declare namespace Express {
  interface Request {
    file?: any;
    files?: any;
  }
}
