/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Walk through the address space checking the EventNotifier for each node. */

include( "./library/Utilities/ExportAddressSpace/exportServerAddressSpace.js" );
include( "./library/Base/array.js" );

function checkEventNotifier( references, level ) {
    if( references !== undefined && references.NodeId !== undefined ) {
        var item = MonitoredItem.fromNodeIds( references.NodeId.NodeId )[0];
        item.AttributeId = Attribute.EventNotifier;
        var expectedResult = new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadAttributeIdInvalid ] );
        if( ReadHelper.Execute( { NodesToRead: item, OperationResults: expectedResult, SuppressMessaging: true } ) ) {                  // read all items' EventNotifer attribute
            if( ReadHelper.Response.Results[0].StatusCode.isGood() ) {                                                                  // result was good?
                if( EventNotifier.SubscribeToEvents == ReadHelper.Response.Results[0].Value.toByte() ) {                                // attribute found?
                    if( !IsNodeIdInArray( _ItemsWithEventNotifiers, item.NodeId ) ) _ItemsWithEventNotifiers.push( item.NodeId.clone() ); // cache unique nodeid
                }
            }// result is good?
        }// read
    }// references parameter specified
}

function test() {
    walkThroughAddressSpace( {
            Session: Test.Session,
            FileOutputFunction: checkEventNotifier,
            MaxDepth: 6,
            Exclude: [ new UaNodeId( Identifier.TypesFolder ) ],
            MaxNodeCount: 999,
            SuppressMessaging: true } );
    if( _ItemsWithEventNotifiers.length == 0 ) {
        addSkipped( "Unable to find any Nodes in the address-space that have the .EventNotifiers attribute set to 'SubscribeToEvents'. Skipping conormance unit." );
        stopCurrentUnit();
        return( false );
    }
    else return( true );
}

Test.Execute( { Procedure: this.test } );