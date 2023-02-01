const { toInteger } = require('lodash')
const { QueryTypes } = require('sequelize')
const { default: isAlpha } = require('validator/lib/isAlpha.js')
const { default: isEmail } = require('validator/lib/isEmail.js')
const bcrypt = require('bcrypt')
const gen_uuid = require('uuid').v4
const async = require('async');
const mysql_db = require('../database/mysql_db.js')
const { cons } = require('lodash-contrib')

const gethomepage = async (req,res)=>{res.sendFile(path.resolve(__dirname,'./static/index.html'))}

const loginuser = async (req,res)=>{
    
    const email = req.body.email;
    const password = req.body.password;
    
    if (!email){
        return res.status(400).send("Email can't be empty")
    }

    let user = await mysql_db.query(`Select * from users where email = ?`,
        {
            replacements: [email],
            type: QueryTypes.SELECT
        }
    )

    if (!user?.length) {
        return res.status(404).send("User not found.")
    }

    user = user[0]

    const passwordValid = await bcrypt.compare(password, user.password)

    if (!passwordValid) {
        return res.status(401).send("Password didn't match")
    }

    return res.status(200).send(`Login Success. Welcome ${user.name}`)
}

const getusers = async (req,res)=>{

    let all_users = await mysql_db.query('select * from users', {type: QueryTypes.SELECT})
    res.send(all_users)
}

const getuser = async (req,res)=>{
    
    res.status(200).send(req.user)
}

// returns boolean if email exists in db
const emailexists = async (email)=>{

    const check_exist = await mysql_db.query('select * from users where email = ?', {
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

// adduser(async.auto)
const adduser2 = async (req,res)=>{
    
    try{

        let results = await async.autoInject({

            check_crediantials: async()=>{

                let body = req.body
                let vc = await validcrediantials(body.name,body.email)

                if (!vc.state){
                    throw new Error (vc.msg)
                }
            },

            check_empty_password: async () => {

                let body = req.body
                
                if (!body.password.length) {
                    throw new Error ("Password can't be empty")
                }
                
            },

            email_indb:async (check_crediantials)=>{

                let body = req.body

                if (await emailexists(body.email)){
                    throw new Error ('A User already exists with this Email address')

                }
            },

            hash_password_token:async (check_empty_password,email_indb)=>{
                
                let body = req.body

                let hashed_password = await bcrypt.hash(body.password,10)
                let user_token = gen_uuid()
                
                return {'hashed_password':hashed_password,'user_token':user_token}
            },

            insert_data: async (hash_password_token)=>{

                let body = req.body
                let hashed_password = hash_password_token['hashed_password']
                let user_token = hash_password_token['user_token']

                const dataa = await mysql_db.query('insert into users (name,email,password,guid) values (?,?,?,?)',{
                    replacements:[body.name,body.email,hashed_password,user_token],
                    type: QueryTypes.INSERT})
                
            }
        })

        res.status(200).send('User added')

    }
    catch (err) { 
        res.status(400).send(err.toString())
    }
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
    let user_token = gen_uuid()

    const insert_data = await mysql_db.query('insert into users (name,email,password,guid) values (?,?,?,?)',{
        replacements:[body.name,body.email,hashed_password,user_token],
        type: QueryTypes.INSERT})

    res.status(200).send('User Added Successfully')
}

// checks if a user with required name&password exists in db
const userindb = async (body)=>{

    let user = await mysql_db.query(`select * from users where email = ? && name = ?`,{
        replacements:[body.email,body.name],
        type: QueryTypes.SELECT
    })

    return user
}

const updateuser = async (req,res)=>{

    let user_exists = req.user

    let Q = `UPDATE users set `
    let setFields = []

    let pm = true

    for (const key of Object.keys(user_exists)) {
        if (key != "password") {
            setFields.push(`${key} = "${user_exists[key]}"`)
        }
        else{
            let password_match = await bcrypt.compare(body.password,user_exists.password)
            if (!password_match){
                pm = false
                return
            }
            else{
                setFields.push(`${password} = "${await bcrypt.hash(user_exists[key])}"`)
            }
        }
    }    

    if (!pm){
        return res.status(401).send("Password doesn't match")
    }

    Q += setFields.join(",")
    Q += ' where name = ?'

    console.log(Q)

    const result = await mysql_db.query(Q,{
        replacements:[user_exists.name],
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
    adduser2,
    updateuser,
    resourceerror,loginuser
}