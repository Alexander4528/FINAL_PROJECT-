const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: `A record with this ${err.meta?.target?.join(', ')} already exists`
      });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found',
        message: err.meta?.cause || 'The requested record does not exist'
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid'
    });
  }

  // Custom errors
  if (err.status && err.message) {
    return res.status(err.status).json({
      error: err.name || 'Error',
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = { errorHandler };