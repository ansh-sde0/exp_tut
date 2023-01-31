const funx = require('./functions.js')
const leme_auth = require('../middleware/leme_auth.js')

module.exports = (app) => {
    app.get('/',funx.gethomepage),
    app.get('/users',funx.getusers),
    app.get('/user',leme_auth,funx.getuser),
    app.post('/user/create',funx.adduser),
    app.put('/user', funx.updateuser),
    app.post('/user/login',funx.loginuser)
    app.get('*',funx.resourceerror)
}
