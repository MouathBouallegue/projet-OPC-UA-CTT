/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: 2 active subscriptions; acknowlegding first only. Call Publish on 2nd subscription.
    Revision History:
        2012-09-14 NP: Initial version */

var sub1, sub2;
var skippedSequenceNumbers = [];

function removeSub2FromPublishRequest() { 
    print( "Intercepting Publish() invocation in function: removeSub2FromPublishRequest" );
    print( "Publish().Request.SubscriptionAcknowledgements length (before): " + PublishHelper.Request.SubscriptionAcknowledgements.length + "\n\n" );
    var z=0;
    var newAcks = new UaSubscriptionAcknowledgements();
    for( var i=0; i<PublishHelper.Request.SubscriptionAcknowledgements.length; i++ ) {
        if( sub2.SubscriptionId !== PublishHelper.Request.SubscriptionAcknowledgements[i].SubscriptionId ) {
            newAcks[z++] = PublishHelper.Request.SubscriptionAcknowledgements[i];
        }
        else skippedSequenceNumbers.push( PublishHelper.Request.SubscriptionAcknowledgements[i].SequenceNumber );
    }//for i...
    PublishHelper.Request.SubscriptionAcknowledgements = newAcks;
    print( "Publish().Request.SubscriptionAcknowledgements length (after): " + PublishHelper.Request.SubscriptionAcknowledgements.length + "\n\n" );
}//removeSub2FromPublishRequest


function Republish020() { 
    
    // check if writable default static item is defined
    if( !isDefined( writableDefaultStaticItem ) || writableDefaultStaticItem.length == 0 ) {
        addSkipped( "No writable scalar nodes defined. Check settings: /Server Test/NodeIds/Static/All Profiles/Scalar." );
        return( false );
    }
    
    // create both subscriptions
    sub1 = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: sub1 } ) ) return( false );

    sub2 = new Subscription();
    if( !CreateSubscriptionHelper.Execute( { Subscription: sub2 } ) ) {
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: sub1 } );
    }

    // now to add items to both subscriptions
    var itemSub1 = MonitoredItem.Clone( writableDefaultStaticItem );
    var itemSub2 = MonitoredItem.Clone( writableDefaultStaticItem );
    if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: itemSub1, SubscriptionId: sub1 } ) ) {

        if( CreateMonitoredItemsHelper.Execute( { ItemsToCreate: itemSub2, SubscriptionId: sub2 } ) ) { 

            // read the value of itemSub1, so that we can then increment it in our testing 
            ReadHelper.Execute( { NodesToRead: itemSub1 } );

            // setup a hook on the Publish helper so that we can directly modify the subscription acknowldgements 
            PublishHelper.HookBeforeCall = removeSub2FromPublishRequest;

            /* in a loop of 6 we will: 
                    a) write to all items
                    b) call Publish() and ONLY acknowledge SequenceNumber in sub1 */
            for( var i=0; i<6; i++ ) {
                UaVariant.Increment( { Item: itemSub1 } );
                WriteHelper.Execute( { NodesToWrite: itemSub1, ReadVerification: false } );
                // call Publish() - twice, once per subscription
                for( var p=0; p<2; p++ ) PublishHelper.Execute();
            }//for i...


            // we can now call Republish() to obtain the SequenceNumbers that were not previously acknowledged 
            for( var i=0; i<skippedSequenceNumbers.length; i++ ) {
                // call Republish, and check that we have received the data change notification
                RepublishHelper.Execute( { RetransmitSequenceNumber: skippedSequenceNumbers.pop(), SubscriptionId: sub2, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadMessageNotAvailable ] ) } );
                if( RepublishHelper.Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadMessageNotAvailable ) { 
                    addNotSupported( "Republish" );
                    break;
                }
                else {
                    if( Assert.True( RepublishHelper.CurrentlyContainsData(), "Republish() failed to retrieve the data-change notification.", "Republish() successfully retrieved SequenceNumber: " + RepublishHelper.Request.RetransmitSequenceNumber ) ) { 
                        Assert.Equal( RepublishHelper.Request.RetransmitSequenceNumber, RepublishHelper.Response.NotificationMessage.SequenceNumber, "Republish() returned the wrong SequenceNumber." );
                    }//RepublishHelper.CurrentlyContainsData
                    else addError( "Republish did not return any results. ServiceResult: " + republishResponse.ResponseHeader.ServiceResult );
                }
            }//for i...

            // clean-up 
            DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: itemSub2, SubscriptionId: sub2 } ) ;
            PublishHelper.HookBeforeCall = null;
        }// CreateMonitoredItems - sub2

        // clean-up
        DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: itemSub1, SubscriptionId: sub1 } );
    }//CreateMonitoredItems - sub1

    // clean-up
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: [ sub1, sub2 ] } );
    return( true );
}//Republish020


Test.Execute( { Procedure: Republish020 } );