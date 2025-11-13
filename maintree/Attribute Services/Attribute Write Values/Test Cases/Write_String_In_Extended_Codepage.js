/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to a string variable; specify a value within the extended code-page */
include( "./library/Information/InfoFactory.js" );

function test() {
    var stringItem = MonitoredItem.fromSettingsExt( { Settings: [ "/Server Test/NodeIds/Static/All Profiles/Scalar/String" ], Writable: true, SkipCreateSession: true } )[0];
    if( !isDefined( stringItem ) ) { addSkipped( "No String node configured in settings or not writable." ); return( false ); }

    // read the initial value so that we can put it back at the end of the test
    if( !ReadHelper.Execute( { NodesToRead: stringItem } ) ) return( false );
    stringItem.OriginalValue = stringItem.Value.Value.clone();

    // write the new value with an extended character
    var testString = "水Boy";
    stringItem.Value.Value.setString( testString );
    if( WriteHelper.Execute( { NodesToWrite: stringItem, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadDecodingError ] ) } ) ) {
        // if Good, then ok...
        // but if Bad, then it better be because the STRING is not a native UA string, but a subtype instead!
        if( WriteHelper.Response.Results[0].isBad() ) {

            // query the type of this node and see if it is a subtype of string
            if( stringItem.Value.Value.DataType == BuiltInType.String ) {
                addError( "Native UA data type 'String' was unable to process string value '" + testString + "'" );
                return( false );
            }

            // ok, so it's not a String type... let's see if this type derives from string...
            if( _checkInheritence( { ChildNodeId:  new UaNodeId( stringItem.Value.Value.DataType ),
                                     ParentNodeId: new UaNodeId( Identifier.String ) } ) ) addWarning( "Data type derives from String, but was unable to decode the value '" + testString + "', which is acceptable." );
            else addWarning( "Data type does not derive from String, and must be verified manually." );
        }
    }

    return( true );
}
// *** REMOVE '!' ON 21 AND 18
Test.Execute( { Debug: true, Procedure: test } );