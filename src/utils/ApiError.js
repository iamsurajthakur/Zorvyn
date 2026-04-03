class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        errors = [],
        stack = ''
    ){
        super(message)

        this.statusCode = statusCode
        this.success = false
        this.data = null
        this.errors = errors
        this.isOperational = true

        if(stack){
            this.stack = stack
        }else{
                Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError