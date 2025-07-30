// test hashing with bcrypt

import bcrypt from "bcrypt";

// create a function to hash a password

const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}


// create a function to compare a password with a hashed password

const comparePassword = async (password: string, hashedPassword: string) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}


hashPassword("admin123").then(console.log);

comparePassword("admin123", "$2b$10$.Kp1/eZ7V1csMVN6ZbVS3.7VuRTMNG5rvprCgSGTAw7PRmKJWjMZe").then(console.log);

