const Express = require('express')
const _ = require('lodash')
const path = require('path')
const bodyParser = require('body-parser')
const valid = require('validator')

const hp = require('./helper.js')
const { kebabCase, includes, keys } = require('lodash')
const { default: isAlpha } = require('validator/lib/isAlpha.js')
const { default: isEmail } = require('validator/lib/isEmail.js')


app = Express()

// Database

let my_db = [
    {'id': '0','name':'ansh','email':'ansh.tyagi@mylofamily.com'},
    {'id': '1','name':'vansh','email':'vansh.tyagi@mylofamily.com'}
            ]

// Middlewares

app.use(Express.static('./static'))
app.use(bodyParser.json())

// Get Requests

app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'./static/index.html'))})

app.get('/users',(req,res)=>{
    
    res.send(my_db).status(200)
})

app.get('/user',(req,res)=>{

    const qdb = req.query

    let filteredData = my_db.filter((data) => {
        let keys = Object.keys(qdb);
        for (let i = 0; i < keys.length; i++) {
          if (data[keys[i]] !== qdb[keys[i]]) {
            return false;
          }
        }
        return true;
      });
    
    res.send(filteredData).status(200)

})

app.get('*',(req,res)=>{
    res.status(404).send('Resource not found')
})

// Post Requests

app.post('/user/create',(req,res)=>{

    let body = req.body
    let obj = {'id':my_db.length.toString()}

    Object.keys(my_db[0]).forEach((param)=>{

        let keys = Object.keys(body)

        if (keys.includes(param)){

            if (param == 'email'){

                if(isEmail(body[param])){
                    obj[param] = body[param]
                }
                else{
                    res.status(400).send('Invalid Email')
                }
            }
            else if (param == 'name'){

                if (isAlpha(body[param])){
                    obj[param] = body[param]
                }
                else{
                    res.status(400).send('Invalid Name')
                }
            }
            else{
                obj[param] = body[param]
            }
        }    
    })

    my_db.push(obj)
    res.send('User Successfully added').status(200)

})
// Delete Requests

app.delete('/user',(req,res)=>{

    const qdb = req.query

    let filteredData = my_db.filter((data) => {
        let keys = Object.keys(qdb);
        for (let i = 0; i < keys.length; i++) {
          if (data[keys[i]] !== qdb[keys[i]]) {
            return true;
          }
        }
        return false;
      });

    my_db = filteredData
    res.send(my_db).status(200)

})

// PUT Requests

app.put('/user', (req, res) => {

    let id = req.query.id
    let body = req.body[0]

    // Error? : Cannot set headers after they are sent to the client

    let invalid_data = false

    Object.keys(body).forEach((item)=>{
    
        if (item == 'email'){
            if (!isEmail(body[item])){
                //return res.status(400).send('Invalid email')
                invalid_data = true
            }
        }

        else if (item == 'name'){
            if (!isAlpha(body[item])){
                //return res.status(400).send('Invalid name')
                invalid_data = true
            }
        }
    })

    if (invalid_data){
        return res.status(400).send('Invalid data')
    }

    let userIndex = my_db.findIndex((user) => user.id === id)

    if (userIndex === -1) {
        return res.status(404).send('User not found')
    }

    my_db[userIndex] = {...my_db[userIndex],...body}

    res.send(my_db[userIndex]).status(200)
})

app.listen(5000,()=>{
    console.log('App is live on port 5000...')
})
