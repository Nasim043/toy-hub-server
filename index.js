const express = require('express');
const app = express();
const port = 5000;


app.get('/', (req, res) => {
  res.send('Welcome to ToyGalaxyHub')
})

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});