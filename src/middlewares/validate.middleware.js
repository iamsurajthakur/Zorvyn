import ApiError from "../utils/ApiError.js"

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    })

    if(!result.success){
        return next(
            new ApiError(400, 'Validation failed', result.error.flatten().fieldErrors())
        )
    }

    // Attach parsed data back to request
    Object.assign(req, result.data)

    next()
}

export default validate