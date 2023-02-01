const async = require('async');
const { result } = require('lodash');
const { cons } = require('lodash-contrib');

var AsyncSquaringLibrary = {
    squareExponent: 2,
    square: function(number, callback){
        var result = Math.pow(number, this.squareExponent);
        setTimeout(function(){
            callback(null, result);
        }, 200);
    }
};
let arr = [1,2,3]

async.map(arr, AsyncSquaringLibrary.square.bind(AsyncSquaringLibrary), function(err, result) {
    
    return result

});
console.log(arr)

