// index.js (renamed to express.js as per Netlify Functions structure)
const express = require('express');
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


const app = express();
app.use(express.json());

const schema = loadSchemaFromFile();

const endpoint = 'https://demo.ignitionapp.com/graphql';
const graphqlClient = new GraphQLClient(endpoint);

useSofa({
  basePath: '/api',
  schema,
  onRoute(info) {
    app[info.method](info.path, async (req, res) => {
      const accessToken = req.headers['authorization'] || 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJ1c3J0a25fbXZ1czdpYXhiNXNxYXJxYXh5ZmEiLCJpYXQiOjE3MDEzOTIyODgsImV4cCI6MTcwMTM5NDA4OCwic3ViIjoidXNlcl9tcDc3NnBvbWdnZXFhZ3FheGx3cSIsInNjb3BlcyI6WyJtZmEiLCJhcHAiXSwic2Vzc2lvbl9pZCI6IjJkMTQ5MWZmNmYxMzNhMjNmNGIxZjlhY2E1OWIzMmMyYTE3ZDI3OTUyNzVmODQ1NGZiMGU2NzU5YjllYTEzM2MifQ.4grrbJilSkpBq2vxiMcDV90XnJyAYZMMhmbmjXDW5Bg';
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

module.exports.handler = serverless(app)
