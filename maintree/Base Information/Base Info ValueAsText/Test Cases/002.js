/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Subscribe to ValueAsText property. */

Test.Execute( { Debug: true, Procedure: function test() { 
    // we don't want to scan the address space unnecessarily if its been done already; if not, then invoke test #1
    if( _parentsOfValueAsTextProperty.length == 0 ) include( "./maintree/Base Information/Base Info ValueAsText/Test Cases/001.js" );
    if( _parentsOfValueAsTextProperty.length == 0 ) return( false );

    // let's get the values of the enumeration
    var enumerationValues = null;
    if( !TranslateBrowsePathsToNodeIdsHelper.Execute( { UaBrowsePaths: UaBrowsePath.New( { StartingNode: _parentsOfValueAsTextProperty[0], RelativePathStrings: [ "EnumValues" ] } ) } ) ) return( false );
    if( !Assert.GreaterThan( 0, TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets.length, "'EnumValues' not found on Node '" + _parentsOfValueAsTextProperty + "' which should not be possible for an enumerated type." ) ) return( false );
    enumerationValues = MonitoredItem.fromNodeIds( TranslateBrowsePathsToNodeIdsHelper.Response.Results[0].Targets[0].TargetId.NodeId )[0];
    if( !ReadHelper.Execute( { NodesToRead: enumerationValues } ) ) return( false );

    // now to convert the response into something we can actually use...
    var uaEnumValues = enumerationValues.Value.Value.toExtensionObjectArray();
    if( uaEnumValues == null ) return( false );
    var actualEnumValues = [];
    for( var i=0; i<uaEnumValues.length; i++ ) actualEnumValues[i] = uaEnumValues[i].toEnumValueType();
    // actualEnumValues now contains data we can use directly via script

    // we need the parent node (that owns the property) because we're going to write new values to it...
    var parentItem   = MonitoredItem.fromNodeIds( _parentsOfValueAsTextProperty[0] )[0];
    ReadHelper.Execute( { NodesToRead: parentItem } );
    // we also need to "reset" the value so that we can loop through all values causing a data-change
    parentItem.Value.Value = UaVariant.New( { Value: actualEnumValues[1].Value, Type: parentItem.Value.Value.DataType } );
    WriteHelper.Execute( { NodesToWrite: parentItem, ReadVerification: false } );


    // now to do our subscription
    var propertyItem = MonitoredItem.fromNodeIds( _propertyNodes[0] )[0];
    var subscription = new Subscription();
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) ) {
        // just subscribe to the property; we'll use the parent to write to only.
        if( CreateMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToCreate: propertyItem } ) ) {
            PublishHelper.WaitInterval( { SubscriptionId: subscription, Items: [ propertyItem ] } );
            PublishHelper.Execute();
            Assert.True( PublishHelper.CurrentlyContainsData(), "Expected the initial data-change for the subscription." );


            // now to change the values of our enumerated type and then observe the changes to our ValueAsText subscription
            for( var i=0; i<actualEnumValues.length; i++ ) {
                // change the value and write to it...
                parentItem.Value.Value = UaVariant.New( { Value: actualEnumValues[i].Value, Type: parentItem.Value.Value.DataType } );
                WriteHelper.Execute( { NodesToWrite: parentItem, ReadVerification: false } );

                // wait, call publish and make sure we have a data-change
                PublishHelper.WaitInterval( { Subscription: subscription } );
                PublishHelper.Execute();
                if( Assert.True( PublishHelper.CurrentlyContainsData(), "Publish expected to return data." ) ) {
                    // compare the text equals what the enum value says it should
                    Assert.Equal( actualEnumValues[i].DisplayName.Text, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.toLocalizedText().Text );
                }//publish
            }//test loop

            // cleanup
            DeleteMonitoredItemsHelper.Execute( { SubscriptionId: subscription, ItemsToDelete: [ propertyItem ] } );
        }// create monitored items
        // cleanup
        DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    }// create subscription
    else return( false );

    return( true );
} } );