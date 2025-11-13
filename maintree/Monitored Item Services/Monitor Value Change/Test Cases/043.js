/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Create a MonitoredItem of every supported array data type, while specifying an IndexRange where the lower bound is inside the array size but the upper bound is outside of the array size.
                    In such a scenario the server is required to provide the partial result it has.
    Expectation:    Service result is `Good`
                    Operation level result is `Good`
                    Server returns a partial result starting from the specified lower index until the last element of the array.
    Note:           This test case only applies, when the server supports arrays.
 */

function monitorValueChanges043() {
    var TC_Variables=new Object();
    TC_Variables.result=true;
    TC_Variables.NumberOfValidItems=1;
    TC_Variables.ExpectedArray=[];
    TC_Variables.ActualArray=[];

    // Get the multi dimensional array nodes from CTT settings
    TC_Variables.Arrays=MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Arrays.Settings );
    if( TC_Variables.Arrays.length<1 ) {
        TC_Variables.Arrays=MonitoredItem.fromNodeIds( [new UaNodeId.fromString( Identifier.Server_ServerCapabilities_ServerProfileArray.toString() )] );
    }

    // Can we use the configured arrays for this test?
    ReadHelper.Execute( { NodesToRead: TC_Variables.Arrays } );
    for( var i=TC_Variables.Arrays.length-1; i>-1; i-- ) {
        if( ReadHelper.Response.ResponseHeader.ServiceResult.isNotGood() ) return ( false );
        if( ReadHelper.Response.Results[i].StatusCode.isNotGood() ) {
            addSkipped( "The node configured as array: '"+TC_Variables.Arrays[i].NodeSetting+"', can not be used for testing. Reading the value attribute failed." );
            TC_Variables.Arrays.splice( i, 1 );
        }
        else if( TC_Variables.Arrays[i].Value.Value.getArraySize() < TC_Variables.NumberOfValidItems ) {
            addSkipped( "The node configured as array: '"+TC_Variables.Arrays[i].NodeSetting+"', can not be used for testing. Array is too short." );
            TC_Variables.Arrays.splice( i, 1 );
        }
    }
    if( TC_Variables.Arrays.length<1 ) {
        addSkipped( "There are no nodes that can be used for testing. Aborting." );
        return ( true );
    }

    // Specify the IndexRange
    for( var i=0; i<TC_Variables.Arrays.length; i++ ) {
        TC_Variables.Arrays[i].IndexRange=TC_Variables.Arrays[i].Value.Value.getArraySize()-TC_Variables.NumberOfValidItems+":"+( TC_Variables.Arrays[i].Value.Value.getArraySize()+10 );
        print( "Configuring NodeId "+TC_Variables.Arrays[i].NodeId.toString()+" with IndexRange="+TC_Variables.Arrays[i].IndexRange );
    }
    // Now create the monitoredItems
    CreateMonitoredItemsHelper.Execute( { ItemsToCreate: TC_Variables.Arrays, SubscriptionId: MonitorBasicSubscription } );
    if( CreateMonitoredItemsHelper.Response.ResponseHeader.ServiceResult.isNotGood() ) return ( false );
    for( var i=TC_Variables.Arrays.length-1; i>-1; i-- ) {
        if( CreateMonitoredItemsHelper.Response.Results[i].StatusCode.isNotGood() ) {
            TC_Variables.Arrays.splice( i, 1 );
        }
    }
    if( TC_Variables.Arrays.length<1 ) {
        addSkipped( "The creation of all MonitoredItems failed." );
        return ( false );
    }

    // Call Publish: Expecting the initial data
    PublishHelper.WaitInterval( { Items: TC_Variables.Arrays, Subscription: MonitorBasicSubscription } );
    PublishHelper.Execute();
    if( Assert.True( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial values." ) ) {
        var counter=0;
        while( PublishHelper.CurrentlyContainsData()&&counter<TC_Variables.Arrays.length ) {
            PublishHelper.WaitInterval( { Items: TC_Variables.Arrays, Subscription: MonitorBasicSubscription } );
            PublishHelper.Execute();
            counter++;
        }
        // now to compare the value in the Publish response to the value read,
        for( var t=0; t<PublishHelper.ReceivedDataChanges.length; t++ ) {
            for( var i=0; i<PublishHelper.ReceivedDataChanges[t].MonitoredItems.length; i++ ) {
                for( var s=0; s<TC_Variables.Arrays.length; s++ ) {
                    if( TC_Variables.Arrays[s].ClientHandle==PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].ClientHandle ) {
                        TC_Variables.ExpectedArray=[];
                        TC_Variables.ActualArray=[];
                        // get the 3 values into variables
                        for( var u=0; u<GetArrayTypeToNativeType( PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value ).length; u++ ) {
                            TC_Variables.ActualArray.push( GetArrayTypeToNativeType( PublishHelper.ReceivedDataChanges[t].MonitoredItems[i].Value.Value )[u] );
                        }
                        for( var v=( GetArrayTypeToNativeType( TC_Variables.Arrays[s].Value.Value ).length-TC_Variables.NumberOfValidItems ); v<GetArrayTypeToNativeType( TC_Variables.Arrays[s].Value.Value ).length; v++ ) {
                            TC_Variables.ExpectedArray.push( GetArrayTypeToNativeType( TC_Variables.Arrays[s].Value.Value )[v] );
                        }
                        print( "\tSame? "+Assert.Equal( TC_Variables.ExpectedArray, TC_Variables.ActualArray, "The requested array element was not returned" )+"; Original='"+TC_Variables.ExpectedArray+"' vs Now='"+TC_Variables.ActualArray+"'" );
                    }
                }
            }
        }
    }
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: TC_Variables.Arrays, SubscriptionId: MonitorBasicSubscription } );
    return ( TC_Variables.result );
}

Test.Execute( { Procedure: monitorValueChanges043 } );
