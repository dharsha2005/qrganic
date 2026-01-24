#!/bin/bash

# Build the app
npm run build

# Copy _redirects file to dist
cp _redirects dist/_redirects

echo "_redirects file copied to dist/"
