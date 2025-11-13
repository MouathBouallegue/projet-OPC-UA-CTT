/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request encoding DefaultXML. */

function createMonitoredItems002() {
    notImplemented("Please test this conformance unit manually.");
    notImplemented("Needs a complex type");
    return 0;
    var expectedResults = [];
    for( var i=0; i<originalScalarItems.length; i++ ) {
        var qn = new UaQualifiedName();
        qn.Name = "Default XML";
        originalScalarItems[i].DataEncoding = qn;

        expectedResults.push( new ExpectedAndAcceptedResults( [ StatusCode.BadDataEncodingInvalid ] ) );
    }//for i

    CreateMonitoredItemsHelper.Execute( { 
            ItemsToCreate: originalScalarItems,
            TimestampsToReturn: TimestampsToReturn.Server, 
            SubscriptionId: defaultSubscription, 
            OperationResults: expectedResults
            } );
    
    // clean-up
    if( createMonItemsResp.Results[0].StatusCode.isGood() )
    {
        DeleteMonitoredItemsHelper.Execute( {
            ItemsToDelete: originalScalarItems, 
            SubscriptionId: defaultSubscription } );
    }
    return( true );
}


Test.Execute( { Procedure: createMonitoredItems002 } );