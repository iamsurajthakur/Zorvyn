import ApiError from "../utils/ApiError.js"

const errorHandler = (err, req, res, _next) => {
    let error = err

    if(!(error instanceof ApiError)){
        error = new ApiError(500, error.message || 'Internal server error')
    }

    const { statusCode, message, errors } = error

    console.error(`[${statusCode}] ${req.method} ${req.path} - ${message}`)

    if (process.env.NODE_ENV === 'development') {
        const relevantStack = err.stack
        ?.split('\n')
        .filter((line) => line.includes('/src/'))
        .join('\n')

        if (relevantStack) console.error(relevantStack)
    }

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false,
        errors: errors || []
    })
}

export default errorHandler