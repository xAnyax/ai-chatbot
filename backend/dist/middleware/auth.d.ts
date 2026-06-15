import { NextFunction, Request, Response } from "express";
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
export interface AuthTokenPayload {
    userId: string;
}
export declare function createAuthToken(userId: string): string;
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map