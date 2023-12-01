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
      const accessToken = req.headers['authorization'] || 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJ1c3J0a25fbXZ1dXRva2RsaGRxYWxhYWtqcWEiLCJpYXQiOjE3MDEzOTg5NjksImV4cCI6MTcwMTQwMDc2OSwic3ViIjoidXNlcl9tcDc3NnBvbWdnZXFhZ3FheGx3cSIsInNjb3BlcyI6WyJtZmEiLCJhcHAiXSwic2Vzc2lvbl9pZCI6IjIwZGM1ZWFjM2Q2N2RjNDdlYTZlZDk3MTE2Y2JhZTcyNzAyMTM1MDIwYmEyZTI4NmU4ZmJjMTdjMjIwMjZmYzgifQ.qCrq8yJoX2Fm1JekwO_Xe8O4E9__wBuM-LmBvPz7Lw0';
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
