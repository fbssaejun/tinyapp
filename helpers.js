const generateRandomString = (length) => {
  let result = '';
  //Generates random string
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

//Returns user with the passed in email
const getUserByEmail = (email, usersDatabase) => {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return user;
    }
  }
  return undefined;
};

//Returns an object with urls from the passed in user
const urlsForUser = (id, urlDatabase) => {
  const urls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};