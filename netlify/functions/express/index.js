// index.js (renamed to express.js as per Netlify Functions structure)
const index = require('express');
const serverless = require('serverless-http');
const { GraphQLClient } = require('graphql-request');
const { useSofa } = require('sofa-api');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

const loadSchemaFromFile = () => {
  const schemaPath = path.join('schema.graphql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`The schema file was not found at ${schemaPath}`);
    return null;
  }
  const sdl = fs.readFileSync(schemaPath, 'utf-8');
  return buildSchema(sdl);
}

const app = index();
app.use(index.json());

const schema = loadSchemaFromFile();

const endpoint = 'https://demo.ignitionapp.com/graphql';
const graphqlClient = new GraphQLClient(endpoint);

useSofa({
  basePath: '/api',
  schema,
  onRoute(info) {
    app[info.method](info.path, async (req, res) => {
      const accessToken = req.headers['authorization'] || 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJ1c3J0a25fbXZ1cnlja2RsaGRxYW9pYWp3cnEiLCJpYXQiOjE3MDEzODcyNzMsImV4cCI6MTcwMTM4OTA3Mywic3ViIjoidXNlcl9tcDc3NnBvbWdnZXFhZ3FheGx3cSIsInNjb3BlcyI6WyJtZmEiLCJhcHAiXSwic2Vzc2lvbl9pZCI6ImFjYzljZjYzOGQ1ZDBjZjQ0YmU3ZjI1ODE4MWE4ODM5NGM3NjVkNzBmNmY5ZTJkYTE1Zjk0NDI1NGI2YWI4ZWQifQ.GtIEcG6C9OXE1Z2gTCZqrjt2ZwxEYdpK4i2kL0VzTU0';
      console.log("=>(index.js:30) accessToken", accessToken);
      if (accessToken) {
        graphqlClient.setHeader('authorization', `Bearer ${accessToken}`);
      }

      try {
        const data = await graphqlClient.request(info.operation, req.body);
        res.send(data);
      } catch (error) {
        res.status(500).send(error);
      }
    });
  },
});

// Keep the code below if you want to continue using Express in a traditional way
// const PORT = 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
// });

// Export the handler for serverless
module.exports.handler = serverless(app);
