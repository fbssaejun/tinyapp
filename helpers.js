const generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserByEmail = (email, usersDatabase) => {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = (id, urlDatabase) => {
  console.log("urlsForUser", urlDatabase)
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