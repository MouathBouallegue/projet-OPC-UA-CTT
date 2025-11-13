/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the server exposes all preconfigured SubscribedDataSets
         Step 1: Browse all SubscriberCapabilities Objects existing in the AutomationComponent
                 and read the values of the PreconfiguredSubscribedDataSets array variables
                 (Hint: SubscriberCapabilities Objects may exist in the AutomationComponent,
                 FunctionalEntity or OutputFolders)
         Step 2: Browse the SubscribedDataSets folder and sub-folders of the PublishSubscribe
                 Object
         Step 3: Read the BrowseNames of all SubscribedDataSets
         Step 4: In a loop compare all BrowseNames of PreconfiguredDataSets identified in
                 Step 1 with BrowseNames of SubscribedDataSets identified in Step 3
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse all SubscriberCapabilities Objects existing in the AutomationComponent
    //         and read the values of the PreconfiguredSubscribedDataSets array variables
    if( CU_Variables.AllPreconfiguredSubscribedDataSets.length > 0 ) {
        // Step 2: Step 2: Browse the SubscribedDataSets folder and sub-folders of the PublishSubscribe Object
        var subscribedDataSets = GetStandaloneSubscribedDataSetsFromSubscribedDataSetFolder( { SubscribedDataSetFolder: new MonitoredItem( new UaNodeId( Identifier.PublishSubscribe_SubscribedDataSets ) ) } );
        if( subscribedDataSets.length > 0 ) {
            // Step 3: Read the BrowseNames of all SubscribedDataSets
            var allSDSBrowseNames = [];
            for( var sds=0; sds<subscribedDataSets.length; sds++ ) {
                subscribedDataSets[sds].AttributeId = Attribute.BrowseName;
                if( ReadHelper.Execute( { NodesToRead: subscribedDataSets[sds] } ) ) {
                    allSDSBrowseNames.push( subscribedDataSets[sds].Value.Value.toQualifiedName().Name );
                }
                else TC_Variables.Result = false;
            }
            // Step 4: In a loop compare all BrowseNames of PreconfiguredDataSets identified in
            //         Step 1 with BrowseNames of SubscribedDataSets identified in Step 3
            for( var i=0; i<CU_Variables.AllPreconfiguredSubscribedDataSets.length; i++ ) {
                if( !ArrayContains( allSDSBrowseNames, CU_Variables.AllPreconfiguredSubscribedDataSets[i] ) ) {
                    addError( "Did not find preconfigured SubscribedDataSet '" + CU_Variables.AllPreconfiguredSubscribedDataSets[i] + "' in the PublishSubscribe.SubscribedDataSets folder of the server" );
                    TC_Variables.Result = false;
                }
            }
        }
        else {
            addError( "Step 2: No SubscribedDataSets exposed in the PublishSubscribe.SubscribedDataSets folder of the server" );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Step 1: No SubscriberCapabilities with PreconfiguredSubscribedDataSets containing at least one PreconfiguredSubscribedDataSet variable found" );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );