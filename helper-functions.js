const generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const checkEmail = (email, usersDatabase) => {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return user;
    }
  }
  return undefined;
};

const filterUserUrls = (currentId, urlDatabase) => {
  const urls = {};
  for (const url in urlDatabase) {
    if(urlDatabase[url].userId === currentId) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

module.exports = {
  generateRandomString,
  checkEmail,
  filterUserUrls
};