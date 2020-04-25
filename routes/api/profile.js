const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route /api/Profile/me
//@desc get profile of curent user
//@access private
router.get('/me', auth, async (req, res) => {
  try {
    const userProfile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!userProfile) {
      return res.status(400).json({
        msg: "User Profile Doesn't exist",
      });
    }

    res.json(userProfile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

//@route post/api/Profile
//@desc create profile of curent user
//@access private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.company = company ? company : '';
    profileFields.location = location ? location : '';
    profileFields.website = website ? website : '';
    profileFields.bio = bio ? bio : '';
    if (status) profileFields.status = status;
    profileFields.githubusername = githubusername ? githubusername : '';
    //if (!githubusername) profileFields.githubusername = '';
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }
    profileFields.social = {};

    profileFields.social.youtube = youtube ? youtube : '';
    profileFields.social.facebook = facebook ? facebook : '';
    profileFields.social.twitter = twitter ? twitter : '';
    profileFields.social.linkedin = linkedin ? linkedin : '';
    profileFields.social.instagram = instagram ? instagram : '';

    try {
      let profile = await Profile.findOne({
        user: req.user.id,
      });

      if (profile) {
        //Update the profile
        let profile = await Profile.findOneAndUpdate(
          {
            user: req.user.id,
          },
          {
            $set: profileFields,
          },
          {
            new: true,
            upsert: true,
          }
        );
        return res.json(profile);
      }

      //Create new profile

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).json('Server Error');
    }
  }
);

//@route GET/api/Profile
//@desc GET all profile
//@access public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).json('Server Error');
  }
});

//@route GET/api/Profile/user/:user_id
//@desc GET profile by userid
//@access public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.user_id).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile)
      return res.status(400).json({
        msg: 'Profile  not found for this user',
      });

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'Profile not found for this user',
      });
    }
    res.status(500).json('Server Error');
  }
});

//@route DELETE/api/profile
//@desc DELETE profile,user and post
//@access private

router.delete('/', auth, async (req, res) => {
  try {
    //Remove posts
    await Post.deleteMany({ user: req.user.id });
    //Remove profile
    await Profile.findOneAndRemove({
      user: req.user.id,
    });

    //Remove User
    await User.findOneAndRemove({
      _id: req.user.id,
    });
    res.json({
      msg: 'User Deleted',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json('Server Error');
  }
});

//@route PUT/api/profile/experience
//@desc Add profile experience
//@access private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({
        user: req.user.id,
      });

      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route DELETE /api/profile/experience/:exp_id
//@desc delete profile experience
//@access private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    const removeExp = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeExp, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//@route PUT /api/profile/education
//@desc Add profile education
//@access private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School Name is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('from', 'From Date is required').not().isEmpty(),
      check('fieldofstudy', 'Field Of Study date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({
        user: req.user.id,
      });

      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route DELETE /api/profile/education/:edu_id
//@desc delete profile education
//@access private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    const removeEdu = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeEdu, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//@route GET /api/profile/github/:username
//@desc get user repos from github
//@access public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubClientSecret')}`,
      method: 'GET',
      headers: {
        'user-agent': 'node.js',
      },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({
          msg: 'Github Profile not found',
        });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
