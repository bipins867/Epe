const { body,validationResult } = require('express-validator');


const validateLogin = [
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('phone').optional().isNumeric().withMessage('Phone number must be numeric').isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.phone) {
            throw new Error('Either email or phone is required');
        }
        if (req.body.email && req.body.phone) {
            throw new Error('Provide only one: email or phone');
        }
        return true;
    })
];



const validateSignUp = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone').isNumeric().withMessage('Phone number must be numeric').isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];




const checkValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err={}
      for(const e of errors.array()){

        if (e.path==''){
          err['emailOrPhone']=e.msg;
        }
        else{
          err[e.path]=e.msg;
        }
      }
      
        return res.status(400).json({ errors: err });
    }
    next();
};


module.exports={validateLogin,validateSignUp,checkValidationErrors}