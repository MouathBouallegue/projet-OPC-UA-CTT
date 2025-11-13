/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the ServerDiagnostics.EnabledFlag toggle does not increment session counters. */

Test.Execute( { Procedure: function test() {
    // STEP 1 & 4
    // first, read the enabledFlag state. We don't care about the value at this point...
    if( ReadHelper.Execute( { NodesToRead: [ _enabledFlagNode, _cumulSessionCountNode ] } ) ) {
        _enabledFlagNode.InitialValue = _enabledFlagNode.Value.Value.clone();
        _cumulSessionCountNode.InitialValue = _cumulSessionCountNode.Value.Value.clone();

        // STEP 2
        // now invert the value; hopefully this will work; if not then exit gracefully
        UaVariant.Increment( { Item: _enabledFlagNode } );
        if( WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, ReadVerification: false, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadUserAccessDenied, StatusCode.BadNotWritable ] ) } ) ) {
            if( WriteHelper.Response.Results[0].isGood() ) {

                // STEP 3
                // toggle the enabledFlag and read the cumulative session count value
                for( var i=0; i<3; i++ ) {
                    UaVariant.Increment( { Item: _enabledFlagNode } );
                    // we need to be smart BECAUSE the static variable may not be readable if the EnabledFlag=false!
                    var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
                    if( _enabledFlagNode.Value.Value.toBoolean() == false ) expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNotReadable );
                    // do the write...
                    if( WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, ReadVerification: false } ) ) {
                        ReadHelper.Execute( { NodesToRead: _cumulSessionCountNode, OperationResults: expectedResult } );
                        // we need to be smart again because the cumulative session count might not be readable!
                        if( _enabledFlagNode.Value.Value.toBoolean() == true ) Assert.Equal( _cumulSessionCountNode.InitialValue, _cumulSessionCountNode.Value.Value, "Cumulative session count has grown even though we have not added more sessions." );
                        else Assert.Equal( null, _cumulSessionCountNode.Value.Value, "Expected the CumulativeSessionCount value to be <null>" );
                    }
                }

                // STEP 4
                // reset to the original value
                _enabledFlagNode.Value.Value = _enabledFlagNode.InitialValue.clone();
                WriteHelper.Execute( { NodesToWrite: _enabledFlagNode } );

            }
            else addSkipped( "Unable to write to the EnabledFlag node. Aborting test." );
        }//write
    }
    return( true );
} } );