/*  Test prepared by Ingenieurbuero Allmendinger; info@allmendinger.de
    Description: In a loop, call CreateSession() until the maximum number of sessions is reached; call CreateSession once more.
    Expected Result: Service result = Good for all sessions except the last one (which exceeds the max # supported) which is Bad_TooManySessions.
    */

Test.Execute( {
    Procedure: function test() {
        // Due to CTT limitations, the maximum number of created sessions will be 950
        var maxSessions = ( Settings.ServerTest.Capabilities.MaxSupportedSessions == 0 || Settings.ServerTest.Capabilities.MaxSupportedSessions > 950 ) ? 950 : Settings.ServerTest.Capabilities.MaxSupportedSessions;
        var sessions = [];
        var result = true;

        // First step: Create the maximum supported number of sessions. Each session in a separate SecureChannel.
        for( var i = 0; i < maxSessions; i++ ) {
            var session = SessionCreator.Connect( {
                CreateSession: { ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadTooManySessions, StatusCode.Good] ) },
                ActivateSession: { ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadSessionIdInvalid, StatusCode.Good] ) }
            } );
            if( session.result && Assert.Equal( StatusCode.Good, session.session.Response.ResponseHeader.ServiceResult.StatusCode, "", "", false, true ) ) {
                sessions.push( session );
            }
            else break;
        }//for i...

        // If Auditing is supported and Tests are selected, then the CTT already have 1 session created. Therefore, the number of sessions must be updated if this is the case.
        if( isDefined( Test.Audit ) && Test.Audit.Started ) {
            if( sessions.length < maxSessions - 1 ) {
                addError( "Server unable to open as many sessions as claimed (Expected: " + maxSessions + ", but got: " + ( sessions.length + 1 ) + "). Please check Setting / Capabilities / Max Supported Sessions" );
                result = false;
            }
            else if( sessions.length == maxSessions ) {
                if( maxSessions == 950 ) {
                    addSkipped( "Successfully validated " + ( maxSessions + 1 ) + " sessions, but the server supports more sessions than the CTT. Please validate the correct behavior for exceeding the maximum supported sessions manually." );
                    result = false;
                }
                else {
                    addWarning( "The server returned Good when trying to create more sessions (" + ( sessions.length + 1 ) + ") than supported. Please check Setting / Capabilities / Max Supported Sessions." );
                    result = false;
                }
            }
        }
        else {
            result = Assert.Equal( maxSessions, sessions.length, "Server unable to open as many sessions as claimed. Please check Setting / Capabilities / Max Supported Sessions" );
        }

        // If the maximum number of sessions are successfully created, then now try to create another one. The server must support MaxSessions + 1 SecureChannel, so that it can return the appropriate error code.
        if( result ) {
            var session = SessionCreator.Connect( {
                CreateSession: { ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadTooManySessions, StatusCode.Good] ) },
                ActivateSession: { ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadSessionIdInvalid, StatusCode.Good] ) }
            } );

            if( session.result ) {
                if( Assert.Equal( StatusCode.BadTooManySessions, session.session.Response.ResponseHeader.ServiceResult.StatusCode, "", "", false, true ) ) addSuccessMessage( "The maximum number of supported sessions have been created and the server returned the expected error code when trying to create more sessions." );
                else {
                    // else means that the server returned Good and more sessions were created successfull than claimed to be supported (either by the server or the CTT)
                    sessions.push( session );
                    if( maxSessions < Settings.ServerTest.Capabilities.MaxSupportedSessions || Settings.ServerTest.Capabilities.MaxSupportedSessions == 0 ) {
                        addSkipped( "Successfully validated " + maxSessions + " sessions, but the server supports more sessions than the CTT. Please validate the correct behavior for exceeding the maximum supported sessions manually." );
                    }
                    else {
                        addWarning( "The server returned Good when trying to create more sessions (" + sessions.length + ") than supported. Please check Setting / Capabilities / Max Supported Sessions." );
                        result = false;
                    }
                }
            }
            else {
                addError( "The server returned an unexpected error when trying to create more sessions than supported by the server." );
                result = false;
            }
        }

        // Cleanup. Close all opened SecureChannels and Sessions.
        for( var i = 0; i < sessions.length; i++ ) SessionCreator.Disconnect( sessions[i] );

    return( result );
    }
} );