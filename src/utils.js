/**
 * @param {Array<Array>} arrays 
 * @returns {Array}
 */
function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

export { zip }