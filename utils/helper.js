function isInteger(str) {
    if (typeof str !== 'string') {
      return false;
    }
  
    const num = Number(str);
  
    if (Number.isInteger(num) && num >= 0) {
      return true;
    }
  
    return false;
}

module.exports = {isInteger}
