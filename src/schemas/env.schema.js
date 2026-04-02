import z from "zod";

const JWTAccessExpiry = z.enum(["10s","30m", "1h", "1d",])
const JWTRefreshExpiry = z.enum(["60s","15m","3d", "7d",])

export const envSchema = z.object({

    MONGODB_URI: z.string().min(1),
    PORT: z.string().transform((val) => {
        const port = Number(val);
        if (isNaN(port)) throw new Error("PORT must be a number");
        return port;
    }).default(8000),
    ACCESS_TOKEN_SECRET: z.string().min(32),
    ACCESS_TOKEN_EXPIRY: JWTAccessExpiry,
    REFRESH_TOKEN_SECRET: z.string().min(32),
    REFRESH_TOKEN_EXPIRY: JWTRefreshExpiry,
    NODE_ENV: z.enum(["development", "production"]).default("development")

})