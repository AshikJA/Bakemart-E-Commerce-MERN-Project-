class BaseController {
  static asyncHandler = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  }

  static validateRequest = (schema, data) => {
    const { error, value } = schema.validate(data);
    if (error) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'Validation error',
        details: error.details
      };
    }
    return value;
  }
}

module.exports = BaseController;