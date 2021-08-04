const generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const checkDuplicateEmail = (email, users) => {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return undefined;
};


module.exports = {
  generateRandomString,
  checkDuplicateEmail
}