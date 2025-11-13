/*  Test prepared by Shane Kurr: shane.kurr@opcfoundation.org;
   Description: Create 10 subscriptions. Add a MonitoredItem to each subscription.Call Publish 10 times and check for callbacks */

// Set Constants
const SUBSCRIPTION_COUNT = 10;
const PUBLISH_QUEUE_SIZE = 3;
const PUBLISH_CALLBACKS_NEEDED = 10;

// Create global variables
var PublishQueueIsFull = false;
var NumDataChangeNotifications = 0;
var CallbackTotal = 0;
var numPublishRequests = 0;

// Create global array to hold subscription ID's
var SubscriptionIDs = new Array( SUBSCRIPTION_COUNT );

function publishCallback( response, callbackData ) {
    // Check array for subscription ID, if present, then remove it
    var index = SubscriptionIDs.indexOf( parseInt( response.SubscriptionId ) );
    SubscriptionIDs.splice( index, 1 );
    numPublishRequests--;
    NumDataChangeNotifications++;
    CallbackTotal++;
}// function publishCallback( response, callbackData )

function pubMin10001() {
    var result = true;
    var subscriptionObject = [];
    var items = [];
    var publishTotal = 0;
    var publishCounter = 0;
    var referenceSubIDs = new Array( SUBSCRIPTION_COUNT );

    // Create monitored item to be added to each subscription
    var MonitoredItems = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } );
    if( !isDefined( MonitoredItems ) || MonitoredItems.length === 0 ) return( false );

    // Create Subscriptions and add monitored item to each subscription, if fail then skip rest of test and clean up
    // loop to cycle through each subscription
    for( var i=0; i<SUBSCRIPTION_COUNT; i++ ) {
        // create subscription object with altered publishing interval
        subscriptionObject[i] = new Subscription2( { PublishingInterval:5000, RequestedLifetimeCount:10, MaxKeepAliveCount:1 } );
        if( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionObject[i], Session: Test.Session } ) ) {
            print( "Create subscription failed" );
            result = false;
            break;
        }
        SubscriptionIDs[i] = subscriptionObject[i].SubscriptionId;
        referenceSubIDs[i] = subscriptionObject[i].SubscriptionId;
        items[i] = MonitoredItem.Clone( MonitoredItems );
        if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: MonitoredItems, SubscriptionId: subscriptionObject[i] } ) ) { 
            print( "Create monitored items failed" );
            result = false;
            break;
        }
    }// close subscription loop

    // Read the node, then increment the value and issue the write to cause the Data Change
    if( result ) {
        if( !ReadHelper.Execute( { NodesToRead: MonitoredItems[0] } ) ) {
            addError( "Read failed" );
            result = false;
        }
        else{
            var cachedValue = MonitoredItems[0].Value;
            UaVariant.Increment( { Item: MonitoredItems[0] } );
            if( !WriteHelper.Execute( { NodesToWrite: MonitoredItems[0], ReadVerification: false } ) ) {
                addError( "Write failed" );
                result = false;
            }
        }
    }

    // Publish code
    if( result ){
        // Change timeout setting to 5 * default timeout setting
        var timeoutHintSettingValue = parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ).toString(), 10 );
        print( "Default timeout setting: " + timeoutHintSettingValue + "; multiplying by 5." );
        timeoutHintSettingValue *= 5;

        // Call publish and verify callback for each subscription
        // set timeout and call Publish 10 times
        var timeExpires = UaDateTime.utcNow();
        timeExpires.addSeconds( 30 );
        while( publishCounter < SUBSCRIPTION_COUNT ) {
            // exit loop for taking too long?
            if( timeExpires < UaDateTime.utcNow() ) {
                addWarning( "Exiting loop early. Test taking too long. Waited 30 seconds." );
                break;
            }
            // create new publish request
            if( numPublishRequests < PUBLISH_QUEUE_SIZE ) {
                // queue publish request
                var publishRequest = new UaPublishRequest;
                Test.Session.Session.buildRequestHeader( publishRequest.RequestHeader );
                publishRequest.RequestHeader.TimeoutHint = timeoutHintSettingValue;
                numPublishRequests++;
                // just use the publish counter as callback data
                // we could also define any type of object and use that as callback data - now it's just a number
                Test.Session.Session.beginPublish( publishRequest, publishCallback, publishCounter );
                publishTotal++;
                print( "Publish called for subscription: " + ( referenceSubIDs[publishCounter] ) );
                publishCounter++;
            }
            else PublishQueueIsFull = true;
            // prevent CPU racing
            wait( 10 );
        }
        // allow remaining Publish requests to come back...
        PublishQueueIsFull = false;
        print( "Issued all Publish calls... now waiting for the outstanding calls to complete..." );
        timeExpires = UaDateTime.utcNow();
        timeExpires.addSeconds( 60 );
        while( CallbackTotal < PUBLISH_CALLBACKS_NEEDED ) {
            // exit loop for taking too long?
            if( timeExpires < UaDateTime.utcNow() ) {
                addWarning( "Exiting loop early. Test taking too long. Waited 60 seconds." );
                break;
            }
            // small delay so as to prevent CPU overload; also prevent thread-block.
            wait( 100 );
        }
        // Revert altered item's value to cached value
        MonitoredItems[0].Value = cachedValue;
        if( !WriteHelper.Execute( { NodesToWrite: MonitoredItems[0], ReadVerification: false } ) ) {
            addError( "Write failed" );
            return( false );
        }
    }// Close if block containing publish code

    // For each session, delete subscriptions and then close each session
    DeleteSubscriptionsHelper.Execute( { Session: Test.Session, SubscriptionIds: subscriptionObject } );

    // Check to see if all subscriptions received a call-back, print message if any left in SubscriptionIDs array
    if( Assert.Equal( 0, SubscriptionIDs.length, "Following subscriptions did not receive callback" + ": " + SubscriptionIDs  ) ) {
        result = false;
    }

    // Print test summary
    addLog( "\nTest completed" );
    addLog( "Number of Subscriptions: " + SUBSCRIPTION_COUNT );
    addLog( "Number of Publish calls: " + publishTotal + "\n" + "Number of Callbacks Received: " + CallbackTotal );

    return( result );
}

Test.Execute( { Procedure: pubMin10001 } );