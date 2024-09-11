const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bycrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bycrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};


const comparePassword = (password, password_hash)=> {
    return bcrypt.compare(password, password_hash);
  };

module.exports={
    hashPassword,
    comparePassword
}