/* Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Repetitively call CreateMonitoredItems/DeleteMonitoredItems in a loop of 1k. */ // CHANGE: 10k to 1k

function createDeleteMonitoredItemsLoop() {
    const LOOPMAX = 1000;
    const MAXSECS = 60;

    if (scalarItems[0] === undefined || scalarItems[0] === null) {
        addSkipped("No Scalar Numerics are defined. Skipping test case.");
        return (false);
    }
    // use the existing subscription - initialize.js
    var endTime = UaDateTime.utcNow();
    endTime.addSeconds( MAXSECS );
    for( var i=0; i<LOOPMAX; i++) {
        // create the scalarItems; break loop if the call fails
        if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: scalarItems, SubscriptionId: MonitorBasicSubscription, SuppressMessaging: true } ) ) {
            addError( "Exiting loop (iteration: " + i + ") on CreateMonitoredItems." );
            break;
        }//if CreateMonitoredItems

        // delete the scalarItems; break loop if call fails
        if( !DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: scalarItems, SubscriptionId: MonitorBasicSubscription, SuppressMessaging: true } ) ) {
            addError( "Exiting loop (iteration: " + i + ") on DeleteMonitoredItems." );
            break;
        }// if DeleteMonitoredItems

        // on every 250th iteration call Publish() just to avoid subscription timeout
        if( i % 250 === 0 ) PublishHelper.Execute();
        if( i % 20  === 0 ) print( "... CreateMonitoredItems[1000]/DeleteMonitoredItems[1000] iteration # " + i );

        // how are we doing on time? has our max allowed time-frame transpired?
        if( UaDateTime.utcNow() > endTime ) { print( MAXSECS + " seconds reached.\nCompleted " + i + " iterations of CreateMonitoredItems/DeleteMonitoredItems.\nBreaking from loop." ); break; }
    }//for i...

    // call Publish() to and ack any sequenceNumbers received, but not acknowledged.
    PublishHelper.Execute();
    return( true );
}//function createDeleteMonitoredItemsLoop()

Test.Execute( { Procedure: createDeleteMonitoredItemsLoop } );