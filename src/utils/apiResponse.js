export function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

export function errorResponse(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}
