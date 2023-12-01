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
      // const authHeader = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJ1c3J0a25fbXZ2ZWJwM2l1Z2hhYWxhYWllY3EiLCJpYXQiOjE3MDE0NjIyMDcsImV4cCI6MTcwMTQ2NDAwNywic3ViIjoidXNlcl9tcDc3NnBvbWdnZXFhZ3FheGx3cSIsInNjb3BlcyI6WyJtZmEiLCJhcHAiXSwic2Vzc2lvbl9pZCI6IjIxZTJlMjFkYzUwZmNkYmVkYmU2ZTY0YjMxMzRkMzBiOTg4NDJhNTY3Nzk2Yzk0YmE0YTQzODhlM2NhY2JkOGUifQ._drpPPVlEv11sntpDe3qQL0Dtv7Od4P8ni26Ofu2HJU';
      const authHeader = contextValue.req.headers.authorization || ''
      if (authHeader.indexOf('Bearer ') !== 0) {
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
