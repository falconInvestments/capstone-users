const express = require('express');

const port = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Falcon Investments server is live.');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}...`);
});
