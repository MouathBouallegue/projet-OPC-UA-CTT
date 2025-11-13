/*  Test prepared by Shane Kurr : shane.kurr@opcfoundation.org; 
    Description:Create half as many sessions as are claimed to be supported; e.g. create 5-sessions if the Server claims to support 10. For each session,
    create 5 subscriptions, with 1 monitored item each. Then, call Publish once per subscription, per session. */

// Set Constants
const SUBSCRIPTION_COUNT = 5;
const PUBLISH_QUEUE_SIZE = 5;
const MAX_SUBSCRIPTIONS = Settings.ServerTest.Capabilities.MaxSupportedSubscriptions;

// Get number of sessions and subscriptions from settings, set constant
var SessionCount = Math.ceil( Settings.ServerTest.Capabilities.MaxSupportedSessions / 2 );
if( SessionCount == 0 ) { print( "Forcing # sessions to 5." ); SessionCount = 5; } // arbitrarily set session count to 5.

if ( MAX_SUBSCRIPTIONS < SessionCount * 5 ) {   
    SessionCount = Math.ceil( MAX_SUBSCRIPTIONS / 5);
    addWarning("Not enough subscriptions for all sessions. Reducing session amount to " + SessionCount);
}
const PUBLISH_CALLBACKS_NEEDED = SessionCount * 5;

// Create global variables
var PublishQueueIsFull = false;
var NumDataChangeNotifications = 0;
var PublishCounter = 0;
var CallbackTotal = 0;

// Create global 2 dimensional arrays to hold subscription ID's according to session by row, one is only for reference later
var SubscriptionIDs = new Array( SessionCount );
var ReferenceSubIDs = new Array( SessionCount );
for (var i = 0; i < SessionCount; i++ ){
    SubscriptionIDs[i] = new Array( SUBSCRIPTION_COUNT );
    ReferenceSubIDs[i] = new Array( SUBSCRIPTION_COUNT );
}

function publishCallback(response, callbackData)
{
    for (var subID = 0; subID < SubscriptionIDs.length; subID++)
    {
        var index = SubscriptionIDs[subID].indexOf( parseInt( response.SubscriptionId ) );
        if (index != -1)
        {
            SubscriptionIDs[subID].splice( index, 1 );
            numPublishRequests--;
            NumDataChangeNotifications++;
            CallbackTotal++;
        }
    }
}

function publishCallback001( response, callbackData ) {
    publishCallback(response, callbackData)
}// function publishCallback001( response, callbackData )

function publishCallback002( response, callbackData ) {
    publishCallback(response, callbackData)
}// function publishCallback002( response, callbackData )

function publishCallback003( response, callbackData ) {
    publishCallback(response, callbackData)
}// function publishCallback003( response, callbackData )

function publishCallback004( response, callbackData ) {
    publishCallback(response, callbackData)
}// function publishCallback004( response, callbackData )

function publishCallback005( response, callbackData ) {
    publishCallback(response, callbackData)
}// function publishCallback005( response, callbackData )

function pubMin05003() {
    var result = true;

    // Check if the server supports at least 5 subscriptions. If not skip test.
    if ( MAX_SUBSCRIPTIONS < SUBSCRIPTION_COUNT) {
        addSkipped("Server supports less than 5 Subscriptions. Check Settings! Aborting testing.");
        return( false );
    }

   // create array of publish callback functions
    var publishCallback = [
        publishCallback001,
        publishCallback002,
        publishCallback003,
        publishCallback004,
        publishCallback005
        ];

    var sessions = [];
    var subscriptionObject = [];
    var WriteHelpers = [];
    var ReadHelpers = [];
    var CreateSubscriptionHelpers = [];
    var publishTotal = 0;

    // Create monitored item to be added to each subscription
    // var MonitoredItems = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.NumericSettings );
    var MonitoredItems = MonitoredItem.fromSettingsExt( { Settings: Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, Writable: true, SkipCreateSession: true } );
    if( MonitoredItems === undefined || MonitoredItems === null || MonitoredItems.length === 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }

    // 1. Create Sessions, if failed, then clean up and end test
    for( var i=0; i<SessionCount; i++ ) {
        // create session and check for validity
        sessions[i] = SessionCreator.Connect( { InstanciateHelpers: false } );
        if( !sessions[i].result ) {
            addError( "Session #" + i + "is not connected" );
            result = false;
        }
        // if create or activate session fails, close out sessions and end test
        if( !result ) {
            for( var j=0; j<i; j++ ) {
                SessionCreator.Disconnect( sessions[j] );
            }
            return( result );
        }
        // add read and write helper to the session
        WriteHelpers[i] = new WriteService( sessions[i].session );
        ReadHelpers[i] = new ReadService( sessions[i].session );
    }

    //2. Create Subscriptions 3. add monitored item to each subscription, if fail then clean up and end test
    // outer loop to cycle through sessions
    for( var s=0; s<SessionCount; s++ ) {
        CreateSubscriptionHelper = new CreateSubscriptionService( sessions[s].session );
        CreateMonitoredItemsHelper = new CreateMonitoredItemsService( sessions[s].session ); //create instance of helper object for the session
        // inner loop to cycle through each subscription
        for( var i=0; i<SUBSCRIPTION_COUNT; i++ ) {
            // create subscription object with altered publishing interval
            subscriptionObject[ ( s * SUBSCRIPTION_COUNT ) + i] = new Subscription2( { PublishingInterval:5000, RequestedLifetimeCount:1000, MaxKeepAliveCount:1 } );
            if( !CreateSubscriptionHelper.Execute( { Subscription: subscriptionObject[ ( s * SUBSCRIPTION_COUNT ) + i ], Session: sessions[s].session } ) ) {
                addLog( "Create subscription failed" );
                result = false;
                var subBreak = i;
                var sessionBreak = s;
                break;
            }
            SubscriptionIDs[s][i] = subscriptionObject[ ( s * SUBSCRIPTION_COUNT ) + i ].SubscriptionId;
            ReferenceSubIDs[s][i] = subscriptionObject[ ( s * SUBSCRIPTION_COUNT ) + i ].SubscriptionId;
            if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: MonitoredItems, SubscriptionId: subscriptionObject[ ( s * SUBSCRIPTION_COUNT ) + i ] } ) ) { 
                addLog( "Create monitored items failed" );
                result = false;
                var subBreak = i;
                var sessionBreak = s;
                break;
            }
        }// close inner loop
        if( !result ) break; // break outer for loop if any failure in inner loop
    }// close outer loop

    // Clean up monitored items and subscriptions, then end test, if either failed in previous block
    if( !result ) {
        // Loop through sessions and remove subscriptions and monitored items
        for( var s=0; s<sessionBreak; s++ ) {
            var DeleteSubscriptionsHelper = new DeleteSubscriptionService( sessions[s].session );
            for( var i=0; i<SUBSCRIPTION_COUNT; i++ ) {
                DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionObject[ ( s * SUBSCRIPTION_COUNT ) + i ] } );
            }
            DeleteSubscriptionsHelper = null;
            SessionCreator.Disconnect( sessions[s] );
        }
        // Remove subscription and monitored items in session where failure occurred
        var DeleteSubscriptionsHelper = new DeleteSubscriptionService( sessions[sessionBreak].session );
        for( var i=0; i<subBreak; i++ ) {
            DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionObject[ ( sessionBreak * SUBSCRIPTION_COUNT ) + i ] } );
        }
        SessionCreator.Disconnect( sessions[sessionBreak] );
        return( result );
    }

    // Read the node, then increment the value and issue the write to cause the Data Change
    if( !ReadHelpers[0].Execute( { NodesToRead: MonitoredItems[0] } ) ) {
        addError( "Read failed" );
        result = false;
    }
    else{
        var cachedValue = MonitoredItems[0].Value;
        UaVariant.Increment( { Item: MonitoredItems[0] } );
        if( !WriteHelpers[0].Execute( { NodesToWrite: MonitoredItems[0], ReadVerification: false } ) ) {
            addError( "Write failed" );
            result = false;
        }
    }

    if( result ){
        // Change timeout setting to 5 * default timeout setting
        var timeoutHintSettingValue = parseInt( readSetting( "/Server Test/Session/DefaultTimeoutHint" ).toString(), 10 );
        print( "Default timeout setting: " + timeoutHintSettingValue + "; multiplying by 5." );
        timeoutHintSettingValue *= 5;

        // 4. Call publish and verify callback for each subscription
        // set timeout and call Publish for each session 5 times
        for ( var s=0; s<SessionCount; s++ ) {
            // reset counters for new session
            numPublishRequests = 0;
            NumDataChangeNotifications = 0;
            PublishCounter = 0;
            var timeExpires = UaDateTime.utcNow();
            timeExpires.addSeconds( 30 );
            addLog( "Calling Publish for subscriptions in session " + ( s + 1 ) );
            while( PublishCounter < SUBSCRIPTION_COUNT ) {
                // exit loop for taking too long?
                if( timeExpires < UaDateTime.utcNow() ) {
                    addWarning( "Exiting loop early. Test taking too long. Waited 30 seconds." );
                    break;
                }
                // create new publish request
                if( numPublishRequests < PUBLISH_QUEUE_SIZE ) {
                    // queue publish request
                    var publishRequest = new UaPublishRequest;
                    sessions[s].session.Session.buildRequestHeader( publishRequest.RequestHeader );
                    publishRequest.RequestHeader.TimeoutHint = timeoutHintSettingValue;
                    numPublishRequests++;
                    // just use the publish counter as callback data
                    // we could also define any type of object and use that as callback data - now it's just a number
                    sessions[s].session.Session.beginPublish( publishRequest, publishCallback[PublishCounter], PublishCounter );
                    publishTotal++;
                    addLog( "Publish called for subscription: " + ( ReferenceSubIDs[s][PublishCounter] ) );
                    PublishCounter++;
                }
                else PublishQueueIsFull = true;
                // prevent CPU racing
                wait( 10 );
            }
        }

        // allow remaining Publish requests to come back...
        PublishQueueIsFull = false;
        addLog( "Issued all Publish calls... now waiting for the outstanding calls to complete..." );
        var maxWaitingTime = 200 * SessionCount; // assume 200ms per Session to complete the test
        if ( maxWaitingTime < 60000 ) maxWaitingTime = 60000; // but we wait a minimum of 1 minute
        timeExpires = UaDateTime.utcNow();
        timeExpires.addMilliSeconds( maxWaitingTime );
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
        if( !WriteHelpers[0].Execute( { NodesToWrite: MonitoredItems[0], ReadVerification: false } ) ) {
            addError( "Write failed" );
            return( false );
        }
    }// Close if block containing publish code

    // For each session, delete monitored items and subscriptions, and then close each session
    for( s=0; s<SessionCount; s++ ) { // 's' for Session
        var DeleteMonitoredItemsHelper = new DeleteMonitoredItemsService( sessions[s].session );
        var DeleteSubscriptionsHelper = new DeleteSubscriptionService( sessions[s].session );
        // just delete the subscriptions
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscriptionObject.slice( ( s * SUBSCRIPTION_COUNT ), ( ( s + 1) * SUBSCRIPTION_COUNT ) ) } );
        DeleteMonitoredItemsHelper = null;
        DeleteSubscriptionsHelper = null;
        SessionCreator.Disconnect( sessions[s] );
    }// for outer
    
    // Check to see if all subscriptions received a call-back, print message if any left in SubscriptionIDs array
    for( var i=0; i<SubscriptionIDs.length; i++) {
        if( Assert.Equal( 0, SubscriptionIDs[i].length, "Following subscriptions did not receive callback in session " + (i+1) + ": " + SubscriptionIDs[i]  ) ) {          
            result = false;
        }
    }

    // Print test summary
    addLog( "Test completed" );
    addLog( "Number of sessions: " + SessionCount + "\n" + "Number of Subscriptions Per Session: " + SUBSCRIPTION_COUNT );
    addLog( "Number of Publish calls: " + publishTotal + "\n" + "Number of Callbacks Received: " + CallbackTotal );

    return( result );
}

Test.Execute( { Procedure: pubMin05003 } );