const Express = require('express')
const _ = require('lodash')
const path = require('path')
const bodyParser = require('body-parser')

const hp = require('./utils/helper.js')
const { kebabCase, includes, keys } = require('lodash')

const routes = require('./users/routes.js')


app = Express()

// Middlewares

app.use(Express.static('./static'))
app.use(bodyParser.json())

routes(app)

app.listen(5000,()=>{
    console.log('App is live on port 5000...')
})
