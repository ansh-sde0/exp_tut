const _ = require('lodash')

let db = [{'id': 0,'name':'ansh','email':'ansh.tyagi@mylofamily.com'},{'id': 1,'name':'vansh','email':'vansh.tyagi@mylofamily.com'}]
let qdb = {'id':0}

let filteredData = db.filter((data) => {
    let keys = Object.keys(qdb);
    for (let i = 0; i < keys.length; i++) {
      if (data[keys[i]] !== qdb[keys[i]]) {
        return false;
      }
    }
    return true;
  });

console.log(filteredData)
