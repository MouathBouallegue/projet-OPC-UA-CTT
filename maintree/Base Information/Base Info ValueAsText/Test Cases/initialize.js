include( "./library/ServiceBased/Helpers.js" );
include( "./library/Base/array.js" );
include( "./library/Information/InfoFactory.js" );

const CU_NAME = "\n\n\n***** CONFORMANCE UNIT 'Base Info ValueAsText' TESTING ";

var _parentsOfValueAsTextProperty = [];
var _propertyNodes = [];

if( !Test.Connect() ) {
    addError( "Unable to connect to Server. Check settings." );
    stopCurrentUnit();
}

print( CU_NAME + " BEGINS ******\n" );