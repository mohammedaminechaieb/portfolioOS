import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    adminId?: string;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function signToken(id: string): string;
//# sourceMappingURL=auth.d.ts.map