const { QueryTypes } = require('sequelize')
const mysql_db = require('../database/mysql_db')
const redis = require('../database/redis')
const async = require('async');

module.exports = async (req,res,next)=>{

    try{
        let auth = await async.autoInject({

            check_guid: async ()=>{
                
                const user_guid = req.headers.authorization

                if (!user_guid){
                    throw new Error ('You need a token')
                }
                return {'user_guid':user_guid}
            },

            check_userinredis: async (check_guid)=>{

                let user;
                let user_guid = check_guid['user_guid']

                let redisKey = `${'mylo'}${user_guid}`

                const redis_data = await redis.get(redisKey)
                console.log(redis_data)

                if (redis_data){
                    user = JSON.parse(redis_data)
                    console.log('hello i am in redis')
                }
                return {'user':user,'user_guid':user_guid,'redisKey':redisKey}
            },
            
            check_mysql: async (check_userinredis)=>{

                let user = check_userinredis['user']
                let user_guid = check_userinredis['user_guid']
                let redisKey = check_userinredis['redisKey']

                if (!user){
                    user = await mysql_db.query(`select * from users where guid = ?`,{
                        replacements:[user_guid],
                        type:QueryTypes.SELECT
                    })
                
                    if (!user?.length){
                        throw new Error ('Invalid token')
                    }
                    await redis.set(redisKey, JSON.stringify(user[0]), "EX", 600)
                }
                return {'user':user[0]}
            }
        
        })
        
        req.user = auth.check_mysql['user']
        next()
    }
    catch (err){
        res.status(400).send(err.toString())
    }
}

