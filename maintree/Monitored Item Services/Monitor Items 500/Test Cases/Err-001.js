/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Request 500 items in a subscription. This is a 2-part test:
            part 1: try to add 600 items into a single CreateMonitoredItems call. If that fails withBad_TooManyOperations then do part 2
            part 2: in a loop, call CreateMonitoredItems specifying the max # items per call until the total # of items exceeds the servers capabilities by 100. */

function createMonitoredItems500() {
    // create too many items
    var tooManyItems = [];
    for( var i=0; i<100; i++ ) tooManyItems.push( MonitoredItem.Clone( originalItems500[i] ) );
    tooManyItems = tooManyItems.concat( originalItems500 );
    var expectedResults = [];
    for( var i=0; i<tooManyItems.length; i++) {
        if( i < originalItems500.length ) {
            expectedResults.push(new ExpectedAndAcceptedResults( [ StatusCode.Good ] ) );
        }
        else {
            expectedResults.push(new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadTooManyMonitoredItems, StatusCode.BadMonitoredItemIdInvalid ] ) );
        }
    }
    if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: tooManyItems, TimestampsToReturn: TimestampsToReturn.Server, SubscriptionId: defaultSubscription, ServiceResult: expectedResults[0], OperationResults: expectedResults, SuppressMessaging: false } ) ) return( false );

    if( CreateMonitoredItemsHelper.Response.length < 1 ) {
        // did we get an error? if so, proceed to step 2
        if( CreateMonitoredItemsHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
            // iterate thru all results, we expected Good for the first 500 items, and the rest can be good or Bad_TooManyMonitoredItems
            for( var i = 0; i < CreateMonitoredItemsHelper.Response.Results.length; i++ ) {
                var currResult = CreateMonitoredItemsHelper.Response.Results[i].StatusCode.StatusCode;
                if( i < 500 ) Assert.Equal( StatusCode.Good, currResult, "CreateMonitoredItems.Response.Results[" + i + "].StatusCode was expected to be Good, since it is within the first 500 items that are required to be supported by this Conformance unit." );
                else {
                    if( !( currResult === StatusCode.Good || currResult === StatusCode.BadTooManyMonitoredItems ) ) {
                        addError( "CreateMonitoredItems().Response.Results[" + i + "].StatusCode is " + currResult + ". Expected Good or Bad_TooManyMonitoredItems." );
                    }
                }
            }// for i
        }
    }
    else {
        var checkedMonitoredItems = 0;
        for( var j=0; j<CreateMonitoredItemsHelper.Response.length; j++ ) {
            // did we get an error? if so, proceed to step 2
            if( CreateMonitoredItemsHelper.Response[j].ResponseHeader.ServiceResult.isGood() ) {
                // iterate thru all results, we expected Good for the first 500 items, and the rest can be good or Bad_TooManyMonitoredItems
                for( var i = 0; i < CreateMonitoredItemsHelper.Response[j].Results.length; i++ ) {
                    var currResult = CreateMonitoredItemsHelper.Response[j].Results[i].StatusCode.StatusCode;
                    if( checkedMonitoredItems < 500 ) Assert.Equal( StatusCode.Good, currResult, "CreateMonitoredItems.Response[" + j + "].Results[" + i + "].StatusCode was expected to be Good, since it is within the first 500 items that are required to be supported by this Conformance unit." );
                    else {
                        if( !( currResult === StatusCode.Good || currResult === StatusCode.BadTooManyMonitoredItems ) ) {
                            addError( "CreateMonitoredItems().Response[" + i + ".Results[" + j + "].StatusCode is " + currResult + ". Expected Good or Bad_TooManyMonitoredItems." );
                        }
                    }
                    checkedMonitoredItems++;
                }// for i
            }
        }
    }
    // clean-up
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: tooManyItems, SubscriptionId: defaultSubscription, MaxItemsPerCall: gServerCapabilities.OperationLimits.MaxMonitoredItemsPerCall, SuppressMessaging: true, OperationResults: expectedResults } );
    return( true );
}

Test.Execute( { Procedure: createMonitoredItems500 } );