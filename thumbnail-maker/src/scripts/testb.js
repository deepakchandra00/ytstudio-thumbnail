const bcrypt = require('bcrypt');

const storedHash = "$2b$10$xP1E9SEpQXcGQ2zzi016auWTEuKe6cFLai0keiIKQkIPqGnJNgnJ2"; // Example stored hash
const rawPassword = "deepak@123";

bcrypt.compare(rawPassword, storedHash, (err, result) => {
  if (err) console.error("Error comparing:", err);
  console.log("Password match:", result);
});
