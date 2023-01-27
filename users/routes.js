const funx = require('./functions.js')

module.exports = (app) => {
    app.get('/',funx.gethomepage),
    app.get('/users',funx.getusers),
    app.get('/user',funx.getuser),
    app.post('/user/create',funx.adduser),
    app.put('/user', funx.updateuser),
    app.get('*',funx.resourceerror)
}
