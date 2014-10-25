var vows = require('vows'),
    assert = require('assert'),
    q = require('q'),
    when = require('when'),
    Promise = require('promise'),
    jsonPromise = require('json-promise');

var test = vows.describe('stringify function');
var batch = {}

// Default test topic. Stringify a data structure using the provided JSON object,
// then parse the string result back to a data structure.
function topic( data, JSON ) {
    return function() {
        var cb = this.callback;
        JSON.stringify( data )
        .then(function( json ) {
            cb( false, JSON.parse( json ) );
        });
    }
}

// Resolve a dotted JS value reference against a base object.
function getValue( obj, ref ) {
    ref = ref.split('.');
    return ref.reduce(function( result, name ) {
        return result == undefined ? undefined : result[name];
    }, obj );
}

// Add a new value test to the test context.
function addValueTest( context, ref, value ) {
    context[ref] = function( err, result ) {
        assert.equal( getValue( result, ref ), value );
    }
}

// Construct tests for each of the supported promises libraries.
makeTest('q', q, jsonPromise.use( q ) );
makeTest('when', when, jsonPromise.use( when ) );
makeTest('Promise', Promise.resolve, jsonPromise.use( Promise ) );

// Make a JSON serialize test for a specific promises modules.
function makeTest( moduleName, promise, JSON ) {

    var person = {
        firstName: promise("John"),
        lastName: "Doe",
        age: promise(32),
        eyeColor: "blue",
        family:  {
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
