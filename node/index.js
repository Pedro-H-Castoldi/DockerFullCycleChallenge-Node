const mysql = require('mysql');
const express = require('express');
const { faker } = require('@faker-js/faker');

const app = express();
const port = 3000;


const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'mysql',
  user: 'root',
  password: 'root',
  database: 'nodedb'
});

app.get('/', (req, res) => {
  const name = faker.person.fullName();
  const insert = `INSERT INTO people(name) VALUES(?)`;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Erro ao obter conexão do pool:', err);
      return res.status(500).send('Erro interno');
    }

    connection.query(insert, [name], (err) => {
      if (err) {
        connection.release();
        return res.status(500).send('Erro ao inserir');
      }

      connection.query('SELECT name FROM people', (err, results) => {
        connection.release();

        if (err) {
          return res.status(500).send('Erro ao buscar nomes');
        }

        const names = results.map(row => `<li>${row.name}</li>`).join('');
        res.send(`
          <h1>Full Cycle Rocks!</h1>
          <ul>${names}</ul>
        `);
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});
