include( "./library/Base/safeInvoke.js" );
include( "./library/Base/UaVariantToSimpleType.js" );

var CUVariables = new Object();

// we need a list of items that support history; quit the CU if we don't have any
CUVariables.Items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.HAProfile.Scalar.Settings );
CUVariables.ArrayItems = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.HAProfile.Arrays.OneD );
if( !isDefined( CUVariables.Items.length ) || CUVariables.Items.length === 0 ) { 
    addError( "No History items configured. Check settings." ); 
    stopCurrentUnit(); 
}
else {

// Connect to the UA Server using default parameters (settings)
if( !Test.Connect() ) { addError( "Unable to connect to Server. Aborting tests." ); stopCurrentUnit(); }
else {
        // Start SessionThread
        CUVariables.SessionThread = new SessionThread();
        CUVariables.SessionThread.Start( { Session: Test.Session } );
    
        CUVariables.Debug = gServerCapabilities.Debug;

        // create a function to reset all items after each test:
        CUVariables.ResetItems = function() {
            if( CUVariables.Debug ) print( "\n\t***** Clearing ContinuationPoints on all Items *****" );
            for( var i=0; i<CUVariables.Items.length; i++ ) CUVariables.Items[i].ContinuationPoint = null;
            for( var i=0; i<CUVariables.ArrayItems.length; i++ ) CUVariables.ArrayItems[i].ContinuationPoint = null;
        };

        // attach the above function to the post-test handler
        Test.PostTestFunctions[0] = CUVariables.ResetItems;

        // get the initial values for each of our historical items
        var startTime = new UaDateTime();
        startTime.addMilliSeconds( 1 );
        CUVariables.HistoryReadParameters = { 
              NodesToRead: CUVariables.Items,
              TimestampsToReturn: TimestampsToReturn.Source,
              ReleaseContinuationPoints: false,
              HistoryReadDetails: UaReadRawModifiedDetails.New(
                                      { IsReadModified: false,
                                        StartTime: startTime, 
                                        EndTime: UaDateTime.utcNow(),
                                        NumValuesPerNode: 0, 
                                        ReturnBounds: false } ),
              Debug: CUVariables.Debug };

        if( !Assert.True( HistoryReadHelper.Execute( CUVariables.HistoryReadParameters ), "Unable to obtain initial history values. Please check settings." ) ) stopCurrentUnit();

        // do some initial analysis of the data to help with tests in this CU.
        // record the first & last date in history for each item, and store that value within the item in property FirstValueInHistory.
        for( var i=0; i<CUVariables.Items.length; i++ ) {
            CUVariables.Items[i].RawValues = CUVariables.Items[i].Value.clone();
            CUVariables.Items[i].RawValues.parent = CUVariables.Items[i].RawValues;
            CUVariables.Items[i].RawValues.FirstRecord = function() { return( this.parent[0] ); }
            CUVariables.Items[i].RawValues.LastRecord = function() { return( this.parent[ this.parent.length - 1 ] ); }
            CUVariables.Items[i].FirstValueInHistory = OPCF.HA.Analysis.Find.Date.First( { RawData: CUVariables.Items[i].Value, Debug: CUVariables.HistoryReadParameters.Debug } ).clone();
            CUVariables.Items[i].LastValueInHistory = OPCF.HA.Analysis.Find.Date.Last( { RawData: CUVariables.Items[i].Value, Debug: CUVariables.HistoryReadParameters.Debug } ).clone();
            CUVariables.Items[i].FirstRecord = function() { return( this.Value[0] ); }
            CUVariables.Items[i].LastRecord = function() { return( this.Value[ this.Value.length - 1 ] ); }
            print( "Items[" + i + "].FirstDateInHistory=" + CUVariables.Items[i].FirstValueInHistory.SourceTimestamp + "; LastDateInHistory=" + CUVariables.Items[i].LastValueInHistory.SourceTimestamp );
        }
        
        // splice out items with less than 3 records of history data
        for( var i=0; i<CUVariables.Items.length; i++ ) if( CUVariables.Items[i].RawValues.length < 3 ) { CUVariables.Items.splice( i, 1 ); i--; }
        
        // check if there are items left after splicing
        if( CUVariables.Items.length == 0 ) {
            addSkipped( "No history items with at least 3 records found. Check settings ('/Server Test/NodeIds/Static/HA Profile/Scalar'). Skipping CU." );
            stopCurrentUnit();
        }
        else {
            // do the same for the ArrayItems if configured
            if( isDefined( CUVariables.ArrayItems.length ) && CUVariables.ArrayItems.length > 0 ) { 
                // read array item history data
                CUVariables.HistoryReadParameters.NodesToRead = CUVariables.ArrayItems;
                Assert.True( HistoryReadHelper.Execute( CUVariables.HistoryReadParameters ), "Unable to obtain initial history values of the configured array items. Tests will be skipped. Please check settings." );
            
                // do some initial analysis of the data to help with tests in this CU.
                // record the first & last date in history for each item, and store that value within the item in property FirstValueInHistory.
                for( var i=0; i<CUVariables.ArrayItems.length; i++ ) {
                    CUVariables.ArrayItems[i].RawValues = CUVariables.ArrayItems[i].Value.clone();
                    CUVariables.ArrayItems[i].RawValues.parent = CUVariables.ArrayItems[i].RawValues;
                    CUVariables.ArrayItems[i].RawValues.FirstRecord = function() { return( this.parent[0] ); }
                    CUVariables.ArrayItems[i].RawValues.LastRecord = function() { return( this.parent[ this.parent.length - 1 ] ); }
                    CUVariables.ArrayItems[i].FirstValueInHistory = OPCF.HA.Analysis.Find.Date.First( { RawData: CUVariables.ArrayItems[i].Value, Debug: CUVariables.HistoryReadParameters.Debug } ).clone();
                    CUVariables.ArrayItems[i].LastValueInHistory = OPCF.HA.Analysis.Find.Date.Last( { RawData: CUVariables.ArrayItems[i].Value, Debug: CUVariables.HistoryReadParameters.Debug } ).clone();
                    CUVariables.ArrayItems[i].FirstRecord = function() { return( this.Value[0] ); }
                    CUVariables.ArrayItems[i].LastRecord = function() { return( this.Value[ this.Value.length - 1 ] ); }
                    print( "ArrayItems[" + i + "].FirstDateInHistory=" + CUVariables.ArrayItems[i].FirstValueInHistory.SourceTimestamp + "; LastDateInHistory=" + CUVariables.ArrayItems[i].LastValueInHistory.SourceTimestamp );
                }
            }
        }

        /**
         * Function to get items exceeding a certain number of history records (optionally containing arrays of a certain minimum length)
         * 
         * @param {Number} numRecords - (Optional) Number of history records the items should contain at least (default=10)
         * @param {Number} minArraySize - (Optional) If set, the function will return only one-dimensional array items where the first 'numRecords' of records are all at least of the given size
         * 
         * @returns {object[]} Returns an array of items matching the given criteria (scalar items if minArraySize=undefined, one-dimensional array items otherwise).
         */
        CUVariables.ItemsHistoryCountExceeds = function( numRecords, minArraySize ) {
            if( !isDefined( numRecords ) ) numRecords = 10;
            var values = [];
            
            if( !isDefined( minArraySize ) ) {
                // return scalar items
                for( var i=0; i<CUVariables.Items.length; i++ ) {
                    if( CUVariables.Items[i].RawValues.length >= numRecords ) values.push( CUVariables.Items[i] );
                }
            }
            else {
                // return one-dimensional array items
                for( var i=0; i<CUVariables.ArrayItems.length; i++ ) {
                    if( CUVariables.ArrayItems[i].RawValues.length >= numRecords ) {
                        var usable = true;
                        for( var j=0; j<numRecords; j++ ) if( CUVariables.ArrayItems[i].RawValues[j].Value.getArraySize() < minArraySize ) { usable = false; break; }
                        if( usable ) values.push( CUVariables.ArrayItems[i] );
                    }
                }
            }
            
            return( values );
        }
        
        CUVariables.ResetItems();
        
    }
}