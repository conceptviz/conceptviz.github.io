#!/bin/bash

babel src/index.jsx --out-file index.js
yaml2json src/data.yaml > data.json
