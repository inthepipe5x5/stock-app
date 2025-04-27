import { Request } from "express";

export interface RequestWithUserContext extends Request {
    userContext: {
        user: {
            id: string;
            email: string;
            role: string;
        };
    };
    params: Record<string, any>;
    query: Record<string, any>;
    body: Record<string, any>;
}