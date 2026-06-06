
import express from "express";
import sequelize from './config/database.js';
const app = express();

app.use(express.static("public"));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando');
});

sequelize.sync().then(() => {
  app.listen(3000, () => console.log('Server on'));
});
