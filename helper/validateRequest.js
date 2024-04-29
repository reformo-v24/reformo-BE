const validate = {};

validate.validateRequest = async (req, res, next, schema) => {
  const options = {
    abortEarly: true, 
    allowUnknown: true, 
    stripUnknown: false, 
  };
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    return res.status(400).json({ message: error.message, status: false });
  }
  next();
};

module.exports = validate;
