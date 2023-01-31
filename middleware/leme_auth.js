const { QueryTypes } = require('sequelize')
const mysql_db = require('../database/mysql_db')

module.exports = async (req,res,next)=>{

    const user_guid = req.headers.authorization

    if (!user_guid){
        return res.status(401).send('You need a token')
    }

    let user = await mysql_db.query(`select * from users where guid = ?`,{
        replacements:[user_guid],
        type:QueryTypes.SELECT
    })

    if (!user?.length){
        return res.status(404).send('Invalid token')
    }

    req.user = user[0]
    next()
}

