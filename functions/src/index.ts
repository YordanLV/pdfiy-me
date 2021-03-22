import express = require('express');
import cors = require('cors');
import functions = require('firebase-functions');

import { exportPDF } from './exportPDF';

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// build multiple CRUD interfaces:
app.post('/', async (req, res) => {
  console.log(req.body)
  const { url, tag, landscape } = req.body;
  const pdf = await exportPDF(url, tag, landscape);
  res.contentType("application/pdf");
  res.send(pdf);
});

// Expose Express API as a single Cloud Function:
exports.app = functions.https.onRequest(app);