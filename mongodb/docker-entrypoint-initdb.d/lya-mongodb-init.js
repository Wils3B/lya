// MongoDB initialization script for LYA
// Uses environment variables: LYA_DB_USERNAME, LYA_DB_PASSWORD, LYA_DB_NAME

const username = process.env.LYA_DB_USERNAME;
const password = process.env.LYA_DB_PASSWORD;
const dbName = process.env.LYA_DB_NAME;

// Validate required environment variables
const missingEnvVars = [];
if (!username) {
  missingEnvVars.push('LYA_DB_USERNAME');
}
if (!password) {
  missingEnvVars.push('LYA_DB_PASSWORD');
}
if (!dbName) {
  missingEnvVars.push('LYA_DB_NAME');
}

if (missingEnvVars.length > 0) {
  print(
    'ERROR: Missing required environment variables: ' +
      missingEnvVars.join(', ') +
      '. Please set these before running the MongoDB initialization script.'
  );
  quit(1);
}
const testDbName = dbName + '_test';

// Create the LYA user in both the main and test databases so each URL authenticates independently.
for (const name of [dbName, testDbName]) {
  db = db.getSiblingDB(name);
  db.createUser({
    user: username,
    pwd: password,
    roles: [
      { role: 'readWrite', db: name },
      { role: 'dbAdmin', db: name },
    ]
  });
  print(`User '${username}' created with full privileges on '${name}'.`);
}
