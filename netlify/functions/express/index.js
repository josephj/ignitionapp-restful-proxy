const { useSofa } = require('sofa-api');
const express = require('express');
const { buildSchema } = require('graphql');
const { GraphQLClient } = require('graphql-request');
const path = require("path");
const fs = require("fs");
const serverless = require("serverless-http");

const app = express();

const schemaPath = path.join('schema.graphql');
if (!fs.existsSync(schemaPath)) {
  console.error(`The schema file was not found at ${schemaPath}`);
  return null;
}
const sdl = fs.readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(sdl);

app.use(express.json());

app.use(
  useSofa({
    basePath: '/api',
    schema: schema,
    async execute({ contextValue, document, variables, ...rest }) {
      const authHeader = contextValue.req.headers.authorization || ''
      if (!authHeader.includes('Bearer')) {
        const error = new Error('Unauthorized: No valid authorization header provided.');
        return {
          errors: [
            {
              message: error.message,
              status: 401,
              locations: [],
            }
          ]
        };
      }

      const graphqlClient = new GraphQLClient('https://demo.ignitionapp.com/graphql', {
        headers: {
          authorization: authHeader,
        },
      });

      try {
        const data = await graphqlClient.request(document, variables);
        return { data: data };
      } catch (error) {
        return { errors: [error] };
      }
    },
  }),
);

module.exports.handler = serverless(app)
