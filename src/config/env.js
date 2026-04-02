import "dotenv/config"
import { envSchema } from "../schemas/env.schema.js"

const env = envSchema.parse(process.env)

export default env