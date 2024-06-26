const mysql = require('mysql2')  // Модуль MySQL
const fs = require('fs')


// Подключение
function establishConnection(login, password) {

  // Данные подключения
  connection = mysql.createConnection({
    host: 'localhost',
    user: login,
    password: password,
    database: 'universal_db',
  })

  // Подключение
  connection.connect((err) => {
    if (err) {
      console.error('Ошибка подключения: ' + err.stack)
      return 
    }
    console.log(`Выполнено подключение (ID: ${ connection.threadId })`)
  })

  return connection
  
}

// Завершение подключения
function endConnection(connection) {
  connection.end()
}

const createTablesQuery = fs.readFileSync('./sql/createTables.sql', 'utf-8')

function createTables(connection) {
  const queries = [
    'CREATE TABLE IF NOT EXISTS `productiontypes` ( \
      `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, \
      `name` VARCHAR(255) NOT NULL \
    );',
    'CREATE TABLE IF NOT EXISTS `production` ( \
      `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, \
      `name` VARCHAR(255) NOT NULL, \
      `type` BIGINT UNSIGNED NOT NULL, \
      FOREIGN KEY (`type`) REFERENCES `productionTypes`(`id`) \
    );',
    'CREATE TABLE IF NOT EXISTS `defecttypes` ( \
      `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, \
      `prod_type` BIGINT UNSIGNED NOT NULL, \
      `name` VARCHAR(255) NOT NULL, \
      FOREIGN KEY (`prod_type`) REFERENCES `productionTypes`(`id`) \
    );',
    'CREATE TABLE IF NOT EXISTS `productionready` ( \
      `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, \
      `product` BIGINT UNSIGNED NOT NULL, \
      `count` BIGINT NOT NULL, \
      `timestamp` DATETIME NOT NULL, \
      FOREIGN KEY (`product`) REFERENCES `production`(`id`) \
    );',
    'CREATE TABLE IF NOT EXISTS `defects` ( \
      `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, \
      `product` BIGINT UNSIGNED NOT NULL, \
      `defect` BIGINT UNSIGNED NOT NULL, \
      `count` BIGINT NOT NULL, \
      `timestamp` DATETIME NOT NULL, \
      FOREIGN KEY (`product`) REFERENCES `production`(`id`), \
      FOREIGN KEY (`defect`) REFERENCES `defectTypes`(`id`) \
    );',
  ]

  try {
    // connection.query(createTablesQuery)
    queries.forEach(query => {
      // connection.query(query)
      connection.execute(query)
    })
    console.log('󰆼', 'Ok')
  } 
  catch(err) {
    console.error(err)
  }
}

function makeQuery(connection, query) {
  try {
    // await connection.execute(createTablesQuery)
    connection.query(query, (err, results) => {
      if (err) {
        throw err
      }
      console.log('󰆼', results)
    })
    console.log('󰆼', 'Ok')
  } 
  catch(err) {
    console.error(err)
  }
}

module.exports = {
  establishConnection, endConnection, createTables, makeQuery
}