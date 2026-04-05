import express from 'express'
import errorHandler from './middlewares/globalErrorHandler.middleware.js'

const app = express()

app.use(express.json({ limit: '20kb' }))

app.get('/', (_, res) => {
    res.send('API is running...')
})

// Import routes
import authRouter from './routes/auth.route.js'
import recordRouter from './routes/record.route.js'
import userRouter from './routes/user.route.js'
import dashboardRouter from './routes/dashboard.route.js'

// Route definition
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/record', recordRouter)
app.use('/api/v1/dashboard', dashboardRouter)

// Global error handler
app.use(errorHandler)

export default app