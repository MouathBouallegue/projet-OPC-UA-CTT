/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: event on invocation of method with no args */

Test.Execute( { Procedure: function() {
    // do we have a method to use? if not, skip the test
    if( Settings.ServerTest.NodeIds.Methods.NoArgs.length == 0 ) {
        addSkipped( "No method defined in settings (/NodeIds/Methods/NoArgs)" );
        return( false );
    }

    // find the method and it's parent object
    var methodName = MonitoredItem.fromNodeIds( UaNodeId.fromString( Settings.ServerTest.NodeIds.Methods.NoArgs ) )[0];
    var methodObject = GetMethodParent( methodName );
    if ( !isDefined( methodObject ) ) {
       addError( "Method's parent could not be detected." );
       return( false );
    }

    // step 1: invoke our method
    var callResult = CallHelper.Execute( {
                            MethodsToCall: [ 
                                { MethodId: new UaNodeId.fromString( methodName.NodeId.toString() ), ObjectId: new UaNodeId.fromString( methodObject.NodeId.toString() ) } ] } );

    // step 2: check if an audit event occurred
    if( Assert.True( test.lookForEvents(), "AuditUpdateMethodEventType not received when invoking method." ) ) {
        Assert.True( test.lookForEventType( UaAuditType.AuditUpdateMethodEventType ), "AuditUpdateMethodEventType not found in the Publish notification.", "Found AuditUpdateMethodEventType in the Publish response!" );
    }

    return( true );
} } );