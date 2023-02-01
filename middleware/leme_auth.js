const { QueryTypes } = require('sequelize')
const mysql_db = require('../database/mysql_db')
const redis = require('../database/redis')

module.exports = async (req,res,next)=>{

    let user;

    const user_guid = req.headers.authorization

    if (!user_guid){
        return res.status(401).send('You need a token')
    }

    let redisKey = `${req.body.name}${user_guid}`

    const redis_data = await redis.get(redisKey)

    if (redis_data){
        user = JSON.parse(redis_data)
        console.log('hello i am in redis')
        console.log(user)
    }

    if (!user){
        user = await mysql_db.query(`select * from users where guid = ?`,{
            replacements:[user_guid],
            type:QueryTypes.SELECT
        })
    
        if (!user?.length){
            return res.status(404).send('Invalid token')
        }
        await redis.set(redisKey, JSON.stringify(user[0]), "EX", 30000)
    }

    req.user = user[0]
    next()
}

