var list =[];
var obj = { first: "John", last: "Doe" };
    // Visit non-inherited enumerable keys
    Object.keys(obj).forEach(function(key) {
        console.log(key);
        list.push(key);
    });

console.log(list);




