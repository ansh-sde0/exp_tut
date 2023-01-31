// Functions but using callbacks ^_^

const adduser = (req,res)=>{

    let body = req.body;

    validcrediantials(body.name,body.email)
        .then((vc)=>{
            if (!vc.state){
                return res.status(400).send(vc.msg);
            }
            
            if (!body.password.length){
                return res.status(400).send("Password can't be empty");
            }

            return emailexists(body.email);
        })
        .then((emailexists)=>{
            if (emailexists){
                return res.status(400).send('A User already exists with this Email address');
            }

            return bcrypt.hash(body.password,10);
        })
        .then((hashed_password)=>{
            return mysql_db.query('insert into mylo_users (name,email,password) values (?,?,?)',{
                replacements:[body.name,body.email,hashed_password],
                type: QueryTypes.INSERT});
        })
        .then(()=>{
            res.status(200).send('User Added Successfully');
        })
        .catch((err)=>{
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

const getusers = (req, res) => {
    mysql_db.query('select name,email from users', { type: QueryTypes.SELECT })
        .then(all_users => {
            return res.status(200).send(all_users)
        })
        .catch(error => {
            console.error(error)
            return res.status(500).send(error)
        })
}
