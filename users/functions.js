const { toInteger } = require('lodash')
const { QueryTypes } = require('sequelize')
const { default: isAlpha } = require('validator/lib/isAlpha.js')
const { default: isEmail } = require('validator/lib/isEmail.js')
const bcrypt = require('bcrypt')

const mysql_db = require('../database/mysql_db.js')

const gethomepage = async (req,res)=>{res.sendFile(path.resolve(__dirname,'./static/index.html'))}

const getusers = async (req,res)=>{

    let all_users = await mysql_db.query('select name,email from mylo_users', {type: QueryTypes.SELECT})
    res.send(all_users)
}
// Not updated
const getuser = async (req,res)=>{

    const qdb = req.query
    let my_db = (await mysql_db.query('select * from users'))[0]

    let filteredData = my_db.filter((data) => {
        let keys = Object.keys(qdb);
        for (let i = 0; i < keys.length; i++) {

            if (keys[i] === 'id'){
                qdb[keys[i]] = toInteger(qdb[keys[i]])
            }

            if (data[keys[i]] !== qdb[keys[i]]) {
            return false;
            }
        }
        return true;
        });

    res.status(200).send(filteredData)
}


// returns boolean if email exists in db
const emailexists = async (email)=>{

    const check_exist = await mysql_db.query('select * from mylo_users where email = ?', {
        replacements: [email],
        type: QueryTypes.SELECT
    })

    if (check_exist.length){
        return true
    }
    return false

}
// check if name and email are valid
const validcrediantials = async (name,email)=>{

    rep = {'state':true,'msg':''}

    if (!isAlpha(name)){
        rep.state = false
        rep.msg = 'Add a proper username. Please use only alphanumeric characters.'
        return rep
    }

    else if (!isEmail(email)){
        rep.state = false
        rep.msg = 'Add a proper email. Ex: xyz@gmail.com'
        return rep
    }
    return rep
}
const adduser = async (req,res)=>{

    let body = req.body
    let vc = await validcrediantials(body.name,body.email)

    if (!vc.state){
        return res.status(400).send(vc.msg)
    }

    if (!body.password.length){
        return res.status(400).send("Password can't be empty")
    }

    if (await emailexists(body.email)){
        return res.status(400).send('A User already exists with this Email address')
    }

    let hashed_password = await bcrypt.hash(body.password,10)

    const insert_data = await mysql_db.query('insert into mylo_users (name,email,password) values (?,?,?)',{
        replacements:[body.name,body.email,hashed_password],
        type: QueryTypes.INSERT})

    res.status(200).send('User Added Successfully')
}

// checks if a user with required name&password exists in db
const userindb = async (body)=>{

    let user = await mysql_db.query(`select * from mylo_users where email = ? && name = ?`,{
        replacements:[body.email,body.name],
        type: QueryTypes.SELECT
    })

    return user
}

// use a loop on keys

const updateuser = async (req,res)=>{

    let body = req.body
    let user_exists = await userindb(body)

    if (!user_exists.length){
        return res.status(400).send("User doesn't exist")
    }
    user_exists = user_exists[0]

    let new_name = body.new_name
    let new_email = body.new_email
    let new_password = body.new_password

    let vc = await validcrediantials(new_name,new_email)

    if (!vc.state){
        return res.status(400).send(vc.msg)
    }

    let password_match = await bcrypt.compare(body.password,user_exists.password)

    if (!password_match){
        return res.status(401).send("Password doesn't match")
    }

    let hashed_pasword = await bcrypt.hash(new_password,10)

    const result = await mysql_db.query(`update mylo_users set name = ?, email = ?, password = ?
                                            where name = ? && email = ?`,{
        replacements:[new_name,new_email,new_password,body.name,body.email],
        type:QueryTypes.UPDATE
    })

    res.status(200).send('User updated successfully')

}

const resourceerror = (req,res)=>{
    res.status(404).send('Resource not found')
}

module.exports = {
    gethomepage,
    getusers,
    getuser,
    adduser,
    updateuser,
    resourceerror
}