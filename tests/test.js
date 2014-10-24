var vows = require('vows'),
    assert = require('assert'),
    q = require('q'),
    when = require('when'),
    promise = require('promise'),
    jsonPromise = require('json-promise');

var test = vows.describe('stringify function');
var batch = {}

function topic( data, JSON ) {
    return function() {
        var cb = this.callback;
        JSON.stringify( data )
        .then(function( json ) {
            cb( false, JSON.parse( json ) );
        });
    }
}
function getValue( obj, ref ) {
    ref = ref.split('.');
    return ref.reduce(function( result, name ) {
        return result == undefined ? undefined : result[name];
    }, obj );
}

function addValueTest( context, ref, value ) {
    context[ref] = function( err, result ) {
        assert.equal( getValue( result, ref ), value );
    }
}
doTest('q', q, jsonPromise.use( q ) );
doTest('when', when, jsonPromise.use( when ) );
//doTest('Promise', promise.Promise, jsonPromise.use( promise ) );

function doTest( moduleName, promise, JSON ) {

    var person = {
        firstName: promise("John"),
        lastName: "Doe",
        age: promise(32),
        eyeColor: "blue",
        family: 
            {
                mother: promise({
                    name: "Claire",
                    age: 57,
                    working: promise(true),
                    eyeColor: "blue"
                }),
                father: {
                   name: "Steven",
                   age: 60,
                   working: false,
                   eyeColor: promise("brown")
                }
            }
    };

    var context = { topic: topic( person, JSON ) };
    batch[moduleName] = context;

    addValueTest( context,'firstName','John');
    addValueTest( context,'lastName','Doe');
    addValueTest( context,'age',32);
    addValueTest( context,'eyeColor','blue');

    addValueTest( context,'family.mother.name', "Claire");
    addValueTest( context,'family.mother.age', 57);
    addValueTest( context,'family.mother.working', true);
    addValueTest( context,'family.mother.eyeColor', "blue");

    addValueTest( context,'family.father.name', "Steven");
    addValueTest( context,'family.father.age', 60);
    addValueTest( context,'family.father.working', false);
    addValueTest( context,'family.father.eyeColor', "brown");

}
test.addBatch( batch );
test.run(); // Run it
