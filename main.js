const db = require('./db')            // База данных
const express = require('express')    // Веб-сервер          
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const path = require('path')
const fs = require('fs')


// Настройки сервера
const app = express()
const port = 8000
app.use('/', express.static('./static/'))
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));

// Middleware
const middleware = function(req, res, next) {
  console.log(req.url, req.headers['hx-request'])
  next()
}
app.use(middleware)
app.use(bodyParser.json())
app.use(cookieParser());


// Пути
let routes = {
  '/login': {
    template: 'login',
    title: 'Авторизация',
  },
  '/': {
    template: 'test',
    title: 'База',
  },
  '/production': {
    template: 'sql_table',
    title: 'Учет готовой продукции',
    table: 'productionReady',
    perms: [1]
  },
  '/defects': {
    template: 'sql_table',
    title: 'Учет бракованной продукции',
    table: 'defects',
    perms: [1]
  },
  '/production_list': {
    template: 'sql_table',
    title: 'Список продукции',
    table: 'production',
    perms: [3]
  },
  '/production_types': {
    template: 'sql_table',
    title: 'Типы продукции',
    table: 'productionTypes',
    perms: [3]
  },
  '/defect_types': {
    template: 'sql_table',
    title: 'Типы дефектов',
    table: 'defectTypes',
    perms: [3]
  },
  '/denied': {
    template: 'perms_denied',
    title: 'Ошибка доступа',
  },
}


// Роутер и рендеринг страниц
app.get('/login', (req, res) => {

  let token = req.cookies.token ?? req.query.token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (!err) {
      res.redirect('/')
    }
  })

  const {template, title} = routes[req.url]

  if (req.headers['hx-request']) {
    res.render('login', { title: title })
    return
  }

  res.render('index', { title: title, content: '/login' })

})

app.get('/:template', verifyToken, (req, res) => {

  if (!routes[req.url]) {
    res.status(404).redirect('/')
    return
  }

  const perms = req.perms
  if (routes[req.url].perms) {
    try {
      routes[req.url].perms.forEach(perm => {
        if (!perms.find(el => el == perm)) {
          res.status(403).redirect('/denied')
          return
        }
      })
    }
    catch(err) {
      res.status(403).redirect('/denied')
      return
    }
  }

  const { template, title, table } = routes[req.url]
  const user = users.find(el => req.user.id == el.id).login

  if (req.headers['hx-request']) {
    res.render(template, { title, table, perms })
    return
  }

  res.render('index', { title: title, content: req.url , table: table, user: user, perms: perms })

})

app.get('/', verifyToken, (req, res) => {
  res.redirect('/production')
})

// Авторизация
const SECRET_KEY = 'universal_db'

const users = [
  { id: 1, login: 'admin', password: '12345', connection: '', perms: [1,2,3,4] },
  { id: 2, login: 'Terminal', password: '123', connection: '', perms: [1,2] },
  { id: 3, login: 'Manager', password: '123', connection: '', perms: [1,3,4] },
  { id: 4, login: 'Revision', password: '123', connection: '', perms: [1,3] },
]
// Ничего не делает
// users.forEach(usr => {
//   if (usr.connection) {
//     users[usr.id].connection = db.establishConnection(usr.login, usr.password)
//   }
// })
// console.log(users)

function verifyToken(req, res, next) {
  // console.log(users)
  const token = req.cookies.token

  if (!token) {
    // return res.status(403).send({ message: 'No token provided.' });
    return res.redirect('/login')
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(500).send({ message: 'Failed to authenticate token.' })
      }
      // Если токен валиден, сохраняем информацию о пользователе в запросе
      req.user = decoded
      req.perms = users[users.findIndex(usr => usr.id === req.user.id)].perms
      req.dbconnection = users[users.findIndex(usr => usr.id === req.user.id)].connection

      const user = users.find(usr => usr.id === decoded.id)
      const { login, password } = user

      if (!user.connection) {
        users[users.findIndex(usr => usr.id === user.id)].connection = db.establishConnection(login, password)
      }
      
      next()
  })

}


app.post('/login', (req, res) => {

  const { login, password } = req.body
  const user = users.find(u => u.login === login && u.password === password)
  if (user) {
      const token = jwt.sign({ id: user.id }, SECRET_KEY)
      res.json({ token })
  } else {
      res.status(401).send('Invalid credentials')
  }

})

app.post('/logout', verifyToken, (req, res) => {
  users[users.findIndex(usr => usr.id === req.user.id)].connection.end()
  users[users.findIndex(usr => usr.id === req.user.id)].connection = ''

  res.cookie('token', '', { maxAge: 0, path: '/' })
  res.redirect('/login')
})


// Запросы
app.post('/sql/create/tables', verifyToken, (req, res) => {
  db.createTables(req.dbconnection)
  res.send('ok')
})

app.post('/sql/query', verifyToken, (req, res) => {
  try {
    req.dbconnection.query(req.body.query, (err, results) => {
      if (err) {
        db.createTables(req.dbconnection)
        throw err
      }
      console.log(results)
      res.send(results)
    })
  }
  catch(err) {
    db.createTables(req.dbconnection)
    console.error(err)
  }
})

app.get('/sql/:table', verifyToken, (req, res) => {
  let query
  let date_from = req.query?.from ?? toIsoString(new Date()).slice(0, 16)
  let date_to = req.query?.to ?? toIsoString(new Date()).slice(0, 16)

  switch(req.params.table) {
    case 'defectTypes':
      query = `
        SELECT dt.id, pt.name as 'Тип продукции', dt.name as 'Дефект' FROM defectTypes dt
        JOIN productionTypes pt
        ON dt.prod_type = pt.id
      `
      break
    case 'productionTypes':
      query = `SELECT id, name as 'Название' FROM productionTypes`
      break
    case 'production':
      query = `
        SELECT p.id, pt.name as 'Тип продукции', p.name as 'Название' FROM production p
        JOIN productionTypes pt
        ON p.type = pt.id
      `
      break
    case 'productionReady':
      query = `
        SELECT pr.id, pt.name as 'Тип продукции', p.name as 'Название',
        pr.count as 'Количество', DATE_FORMAT(pr.timestamp, '%Y-%m-%d&emsp;%H:%i:%s') as 'Время'
        FROM productionReady pr
        JOIN production p ON pr.product = p.id
        JOIN productionTypes pt ON p.type = pt.id
        ORDER BY pr.timestamp
      `
      break
    case 'defects':
      query = `
        SELECT d.id, pt.name as 'Тип продукции', p.name as 'Название', dt.name as 'Дефект',
        d.count as 'Количество', DATE_FORMAT(d.timestamp, '%Y-%m-%d&emsp;%H:%i:%s') as 'Время'
        FROM defects d
        JOIN production p ON d.product = p.id
        JOIN productionTypes pt ON p.type = pt.id
        JOIN defectTypes dt ON d.defect = dt.id
        ORDER BY d.timestamp
      `
      break
    case 'productionReadyCombined':
      query = `
        SELECT pt.name as 'Тип продукции', p.name as 'Название',
        SUM(pr.count) as 'Количество' FROM productionReady pr
        JOIN production p ON pr.product = p.id
        JOIN productionTypes pt ON p.type = pt.id
        
        GROUP BY pt.name, p.name
      `
      break
    case 'defectsCombined':
      query = `
        SELECT pt.name as 'Тип продукции', p.name as 'Название', dt.name as 'Дефект',
        SUM(d.count) as 'Количество' FROM defects d
        JOIN production p ON d.product = p.id
        JOIN productionTypes pt ON p.type = pt.id
        JOIN defectTypes dt ON d.defect = dt.id
        WHERE d.timestamp >= '2024-06-24 00:00:00' AND d.timestamp <= '2025-06-24 00:00:00'
        GROUP BY pt.name, p.name, dt.name
      `
      break
    default:
      query = `SELECT * FROM ${req.params.table}`
      break
  }

  try {
    req.dbconnection.query(query, (err, results) => {
      if (err) {
        throw err
      }
      console.log('lmao', results)
      try {
        let table = `<tr>`
        Object.keys(results[0]).forEach(key => {
          console.log(key)
          table += `<th>${key}</th>`
        })
        table += `</tr>`
        results.forEach(row => {
          table += '<tr>'
          Object.values(row).forEach(el => {
            table += `<td>${el}</td>`
          })
          table += '</tr>'
        });
        res.send(table)
      }
      catch(err) {
        console.error(err)
        db.createTables(req.dbconnection)
        res.send('Ошибка запроса к базе данных.')
      }
      // res.json(results)
    })
  }
  catch(err) {
    console.error(err)
    db.createTables(req.dbconnection)
    res.send('Ошибка запроса к базе данных.')
  }
})

function toIsoString(date) {
  var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
          return (num < 10 ? '0' : '') + num;
      };

  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' + pad(Math.abs(tzo) % 60);
}

app.get('/sql/:table/download', verifyToken, (req, res) => {
  const table = req.params.table
  const format = req.query.format
  res.setHeader('Content-Disposition', `attachment; filename="${table}_data.${format}"`)
  res.setHeader('Content-Type', `application/${format}`)
  const query = `SELECT * FROM ${table}`
  req.dbconnection.query(query, (err, results) => {
    console.log(results)

    if (err) {
      throw err
    }

    switch(format) {
      case 'csv':
        const {Parser} = require('json2csv')
        const parser = new Parser({ delimiter: ';' })
        const csv = parser.parse(results)
        fs.writeFile(`./downloads/${table}_data.csv`, '\uFEFF' + csv, 'utf-8', (err) => {
          if (err) {
            return res.status(500).send(err)
          }
          // res.download(`./downloads/${table}_data.csv`)
          res.download(`./downloads/${table}_data.csv`, `${table}_data.csv`, (err) => {
            if (err) {
              console.error('Ошибка при скачивании файла:', err);
              res.status(404).send('Файл не найден');
            }
          })
        })
        break

      case 'xlsx':
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        let columns = []
        Object.keys(results[0]).forEach(key => {
          return columns.push({ header: key, key: key, width: 20 })
        })
        worksheet.columns = columns
          
        results.forEach(row => {
          worksheet.addRow(row);
        });
        workbook.xlsx.writeFile(`./downloads/${table}_data.xlsx`)
          .then(() => {
            res.download(`./downloads/${table}_data.xlsx`);
          })
          .catch(err => {
            res.status(500).send(err);
          });
        break

      case 'pdf':
        console.log(results)
        const PDFDocument = require('pdfkit')
        const doc = new PDFDocument({ font: './fonts/segoeui.ttf' })
        doc.pipe(fs.createWriteStream(`./downloads/${table}_data.pdf`))

        Object.keys(results[0]).forEach(value => {
          doc.fontSize(12).text(value + '\t', { continued: true })
        })
        doc.moveDown()

        results.forEach(row => {
          Object.values(row).forEach(value => {
            doc.fontSize(12).text(value + '\t', { continued: true })
          })
          doc.moveDown()
        })

        doc.end()
        res.download(`./downloads/${table}_data.pdf`)
        break
    }

    // res.download(`./downloads/${table}_data.${format}`, `${table}_data.${format}`, (err) => {
    //   if (err) {
    //     console.error('Ошибка при скачивании файла:', err);
    //     res.status(404).send('Файл не найден');
    //   }
    // })
    
  })
})


// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})


