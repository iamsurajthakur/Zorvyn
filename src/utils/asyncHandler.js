const asyncHandler = (requestHandler) = (_req, _res, next) => {
    Promise.resolve(requestHandler(next)).catch((error) => next(error))
}

export default asyncHandler