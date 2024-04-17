const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
//for password encryption
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
const databasePath = path.join(__dirname, 'userData.db')
let database = null

const initializeDnAndServer = async () => {
  try {
    database = await open({filename: databasePath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log(`Server is running on http://localhost:3000`)
    })
  } catch (error) {
    console.log(`Database Error is ${error}`)
    process.exit(1)
  }
}

initializeDnAndServer()

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  //encrypt password
  const hashedPassword = await bcrypt.hash(password, 10)
  // check if user exists
  const checkUserQuery = `select username from user where username = '${username}';`
  const checkUserResponse = await database.get(checkUserQuery)
  if (checkUserResponse === undefined) {
    const createUserQuery = `
      insert into user(username,name,password,gender,location) 
      values('${username}','${name}','${hashedPassword}','${gender}','${location}');`
    if (password.length > 5) {
      const createUser = await database.run(createUserQuery)
      response.status(200)
      response.send('User created successfully') //Scenario 3
    } else {
      response.status(400)
      response.send('Password is too short') //Scenario 2
    }
  } else {
    response.status(400)
    response.send(`User already exists`) //Scenario 1
  }
})
