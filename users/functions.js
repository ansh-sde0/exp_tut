const { toInteger } = require('lodash')
const { QueryTypes } = require('sequelize')
const { default: isAlpha } = require('validator/lib/isAlpha.js')
const { default: isEmail } = require('validator/lib/isEmail.js')

const mysql_db = require('../database/mysql_db.js')


const gethomepage = async (req,res)=>{res.sendFile(path.resolve(__dirname,'./static/index.html'))}

const getusers = async (req,res)=>{

    let all_users = await mysql_db.query('select * from users')
    res.send(all_users[0])
}

const getuser = async (req,res)=>{

    const qdb = req.query
    let my_db = (await mysql_db.query('select * from users'))[0]
    
    let filteredData = my_db.filter((data) => {
        let keys = Object.keys(qdb);
        for (let i = 0; i < keys.length; i++) {

            if (keys[i] == 'id'){
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

const verify_user = async (user)=>{

    rep = {'state':true,'msg':''}

    if (!isAlpha(user.name)){
        rep.state = false
        rep.msg = 'Add a proper username. Please use only alphanumeric characters.'
        return rep
    }

    else if (!isEmail(user.email)){
        rep.state = false
        rep.msg = 'Add a proper email. Ex: xyz@gmail.com'
        return rep
    }

    else {
        const check_exist = await mysql_db.query('select * from users where email = ?', {
            replacements: [user.email],
            type: QueryTypes.SELECT
        })

        if (check_exist.length){
            rep.state = false
            rep.msg = 'User Already Exists with this email'
            return rep
        }
        return rep
    }

}
const adduser = async (req,res)=>{

    let body = req.body
    let legit_user = await verify_user(body)

    if (!legit_user.state){
        return res.status(400).send(legit_user.msg)
    }
    
    const insert_data = await mysql_db.query('insert into users (name,email) values (?,?)',{
        replacements:[body.name,body.email],
        type: QueryTypes.INSERT})
    
    res.send('User Added Successfully')
}

const updateuser = (req,res)=>{
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
    
        res.status(200).send(my_db[userIndex])
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