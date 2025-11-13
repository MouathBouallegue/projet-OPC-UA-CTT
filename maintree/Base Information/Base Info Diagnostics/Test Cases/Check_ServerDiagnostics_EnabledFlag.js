/*  Test prepared by Nathan Pocock: compliance@opcfoundation.org
    Description: Check the ServerDiagnostics.EnabledFlag . */

Test.Execute( { Procedure: function test() {
    this.doSessionAndDiagRead = function() {
        // close the session and create a new one.
        CloseSessionHelper.Execute( { Session: Test.Session } );
        Test.Session = new CreateSessionService( { Channel: Test.Channel } );
        Test.Session.Execute();
        ActivateSessionHelper.Execute( { Session: Test.Session } );
        InstanciateHelpers( { Session: Test.Session.Session, DiscoverySession: Test.DiscoverySession } );

        // enable the diagnostics before trying to read a session count
        if( _enabledFlagNode.Value.Value.toBoolean() == false ) {
            UaVariant.Increment( { Item: _enabledFlagNode } );
            WriteHelper.Execute( { NodesToWrite: _enabledFlagNode } );
        }
        // get the value of the diags
        ReadHelper.Execute( { NodesToRead: [ _enabledFlagNode, _cumulSessionCountNode ] } );
        Assert.GreaterThan( _cumulSessionCountNode.InitialValue, _cumulSessionCountNode.Value.Value, "CumulativeSessionCount expected to have grown" );
    }

    // STEP 1 & 4
    // first, read the enabledFlag state. We don't care about the value at this point...
    if( ReadHelper.Execute( { NodesToRead: [ _enabledFlagNode, _cumulSessionCountNode ] } ) ) {
        _enabledFlagNode.InitialValue = _enabledFlagNode.Value.Value.clone();
        _cumulSessionCountNode.InitialValue = _cumulSessionCountNode.Value.Value.clone();

        // STEP 2
        // now invert the value; hopefully this will work; if not then exit gracefully
        UaVariant.Increment( { Item: _enabledFlagNode } );
        if( WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadUserAccessDenied, StatusCode.BadNotWritable ] ) } ) ) {
            if( WriteHelper.Response.Results[0].isGood() ) {

                // STEP 3
                // set the value to false, if not already set
                if( _enabledFlagNode.Value.Value.toBoolean() == true ) {
                    UaVariant.Increment( { Item: _enabledFlagNode } );
                    WriteHelper.Execute( { NodesToWrite: _enabledFlagNode } );
                }

                // STEP 5
                // close the session and create a new one when diagnostics is diaabled.
                this.doSessionAndDiagRead();

                // STEP 6
                // close the session and create a new one when diagnostics is enabled.
                this.doSessionAndDiagRead();
                
            }
            else addSkipped( "Unable to write to the EnabledFlag node. Aborting test." );
        }//write
    }
    return( true );
} } );