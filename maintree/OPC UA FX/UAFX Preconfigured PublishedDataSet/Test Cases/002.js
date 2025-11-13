/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that the server exposes all preconfigured PublishedDataSets
         Step 1: Browse all PublisherCapabilities objects existing in the AutomationComponent
                 and read the values of the PreconfiguredPublishedDataSets array variables
                 (Hint: PublisherCapabilities Objects may exist in the AutomationComponent,
                 FunctionalEntity or OutputFolders)
         Step 2: Browse the PublishedDataSets folder and sub-folders of the PublishSubscribe
                 Object
         Step 3: Read the BrowseNames of all PublishedDataSets
         Step 4: In a loop compare all BrowseNames of PreconfiguredDataSets identified in
                 Step 1 with BrowseNames of PublishedDataSets identified in Step 3
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    // Step 1: Browse all PublisherCapabilities objects existing in the AutomationComponent
    //         and read the values of the PreconfiguredPublishedDataSets array variables
    if( CU_Variables.AllPreconfiguredPublishedDataSets.length > 0 ) {
        // Step 2: Browse the PublishedDataSets folder and sub-folders of the PublishSubscribe Object
        var publishedDataSets = GetPublishedDataSetsFromDataSetFolder( { DataSetFolder: new MonitoredItem( new UaNodeId( Identifier.PublishSubscribe_PublishedDataSets ) ) } );
        if( publishedDataSets.length > 0 ) {
            // Step 3: Read the BrowseNames of all PublishedDataSets
            var allPDSBrowseNames = [];
            for( var pds=0; pds<publishedDataSets.length; pds++ ) {
                publishedDataSets[pds].AttributeId = Attribute.BrowseName;
                if( ReadHelper.Execute( { NodesToRead: publishedDataSets[pds] } ) ) {
                    allPDSBrowseNames.push( publishedDataSets[pds].Value.Value.toQualifiedName().Name );
                }
                else TC_Variables.Result = false;
            }
            // Step 4: In a loop compare all BrowseNames of PreconfiguredDataSets identified in
            //         Step 1 with BrowseNames of PublishedDataSets identified in Step 3
            for( var i=0; i<CU_Variables.AllPreconfiguredPublishedDataSets.length; i++ ) {
                if( !ArrayContains( allPDSBrowseNames, CU_Variables.AllPreconfiguredPublishedDataSets[i] ) ) {
                    addError( "Did not find preconfigured PublishedDataSet '" + CU_Variables.AllPreconfiguredPublishedDataSets[i] + "' in the PublishSubscribe.PublishedDataSets folder of the server" );
                    TC_Variables.Result = false;
                }
            }
        }
        else {
            addError( "Step 2: No PublishedDataSets exposed in the PublishSubscribe.PublishedDataSets folder of the server" );
            TC_Variables.Result = false;
        }
    }
    else {
        addError( "Step 1: No PublisherCapabilities with PreconfiguredPublishedDataSets containing at least one PreconfiguredPublishedDataSet variable found" );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );