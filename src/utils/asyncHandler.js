const asyncHandler = (requestHandler) = (_, _, next) => {
    Promise.resolve(requestHandler(next)).catch((error) => next(error))
}

export default asyncHandler