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
// Switch to the LYA database
db = db.getSiblingDB(dbName);

// Create the LYA user with full privileges on the database
db.createUser({
  user: username,
  pwd: password,
  roles: [
    {
      role: 'readWrite',
      db: dbName
    },
    {
      role: 'dbAdmin',
      db: dbName
    }
  ]
});

print(`User '${username}' created with full privileges on database '${dbName}'`);
