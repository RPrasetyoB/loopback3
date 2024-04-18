const {getToken, loggedUser} = require('../utils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_SECRET;

module.exports = function(app) {
  const Customer = app.models.Customer;

  // Register endpoint
  app.post('/api/auth/register', function(req, res, next) {
    const {username, password} = req.body;
    try {
      Customer.findOne({where: {username: username}}, function(err, existingUser) {
        if (err) {
          throw err;
        }
        if (existingUser) {
          return res.status(400).json({message: 'Username already exists'});
        }

        bcrypt.hash(password, 10, function(err, hashedPassword) {
          if (err) {
            throw err;
          }

          const newUser = {
            username: username,
            password: hashedPassword,
          };
          Customer.create(newUser, function(err, user) {
            if (err) {
              throw err;
            }
            res.status(200).json({message: 'User registered successfully'});
          });
        });
      });
    } catch (error) {
      return next(error);
    }
  });

  // Login endpoint
  app.post('/api/auth/login', function(req, res, next) {
    const {username, password} = req.body;
    try {
      Customer.findOne({where: {username: username}}, function(err, user) {
        if (err) {
          throw err;
        }
        if (!user) {
          return res.status(401).json({message: 'Invalid email or password'});
        }

        bcrypt.compare(password, user.password, function(err, passwordMatch) {
          if (err) {
            throw err;
          }
          if (!passwordMatch) {
            return res.status(401).json({message: 'Invalid email or password'});
          }
          const token = jwt.sign({userId: user.id}, jwtKey, {expiresIn: '60d'});

          res.status(200).json({message: 'User Logged in Successfully', token: token});
        });
      });
    } catch (error) {
      return next(error);
    }
  });

  // get user information endpoint
  app.get('/api/user', function(req, res, next) {
    const token = getToken(req);
    if (!token) {
      return res.status(401).send({message: 'Unauthorized, please login'});
    }
    const {userId} = loggedUser(token);
    try {
      Customer.findById(userId, function(err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(404).send({message: 'User not found'});
        }
        delete user.password;
        res.status(200).json(user);
      });
    } catch (error) {
      return next(error);
    }
  });

  // Update user information endpoint
  app.put('/api/user', function(req, res, next) {
    const token = getToken(req);
    if (!token) {
      return res.status(401).send({message: 'Unauthorized, please login'});
    }
    const {userId} = loggedUser(token);
    const {username, password} = req.body;
    try {
      Customer.findOne({where: {username: username}}, function(err, existingUser) {
        if (err) {
          return next(err);
        }
        if (existingUser) {
          return res.status(400).json({message: 'Username already exists'});
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userData = {
          username: username,
          password: hashedPassword,
        };
        Customer.updateAll({id: userId}, userData, function(err) {
          if (err) {
            return next(err);
          }
          res.status(200).json({message: 'User information updated successfully'});
        });
      });
    } catch (error) {
      return next(error);
    }
  });

  // delete user endpoint
  app.delete('/api/user/delete', function(req, res, next) {
    const token = getToken(req);
    if (!token) {
      return res.status(401).send({message: 'Unauthorized, please login'});
    }
    const {userId} = loggedUser(token);
    try {
      Customer.destroyById(userId, function(err) {
        if (err) {
          return next(err);
        }
        res.status(200).json({message: 'User deleted successfully'});
      });
    } catch (error) {
      return next(error);
    }
  });
};
