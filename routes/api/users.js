const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {
    check,
    validationResult
} = require('express-validator')

//@route /api/users
//@desc register route
//@access public

router.post('/', [
        check('name', 'Name is Required').not().isEmpty(),
        check('email', 'Please Include a valid email').isEmail(),
        check('password', 'A minimum of 6 characters is required').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        //Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        let {
            email,
            name,
            password
        } = req.body;
        try {
            //Check if user already exist
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'User Already exists'
                    }]
                });
            }

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                password,
                email,
                avatar
            })

            //Encrypt password
            let salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            //return JWT Webtoken
            const payload = {
                user: {
                    id: user.id
                }
            };
            jwt.sign(
                payload,
                config.get('jwtSecret'), {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token
                    });
                });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

module.exports = router;