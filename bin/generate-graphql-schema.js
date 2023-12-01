const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter the accessToken: ', (accessToken) => {
  const endpoint = 'https://demo.ignitionapp.com/graphql';
  const command = `get-graphql-schema ${endpoint} --header='Authorization=Bearer ${accessToken.trim()}' > schema.graphql`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`An error occurred: ${error}`);
      return;
    }
    console.log('Schema has been fetched successfully.');
  });

  rl.close();
});
