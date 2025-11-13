/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Client fails to create a session due to invalid criteria, such as bad arguments or using an incorrect login etc.
    Expectation:    The audit event generated for each failed call.
*/

function auditingBaseACSET004() {

    var expectedResults = Test.Audit.GetAllAuditEventParams();
    var TC_Variables = new Object();
    // Tested Type
    TC_Variables.Type = new UaNodeId( Identifier.AuditCreateSessionEventType );
    // Expected Status
    TC_Variables.Status = new UaVariant();
    TC_Variables.Status.setBoolean( false );

    // Was any test script executed which would create an audit event of the AuditCreateSessionEventType?
    if ( expectedResults.length > 0 ) {
        print( "There were " + expectedResults.length + " expected events" );
        for ( var lvb = 0; lvb < expectedResults.length; lvb++ ) {
            if ( !expectedResults[lvb].AuditEventType.equals( TC_Variables.Type ) || !expectedResults[lvb].PropertyValues[2].equals( TC_Variables.Status ) ) {
                expectedResults.splice( lvb, 1 );
                lvb--;
            }
        }
        print( expectedResults.length + " of the expected events should be of the AuditCreateSessionEventType." );
    }

    if ( expectedResults.length == 0 ) {
        addSkipped( "There was no test case selected in this test run which would cause an audit event which can be used for this test case." );
    }
    else {
        if ( !auditEventTypeSupported( TC_Variables.Type ) ) {
            return ( false );
        }

        for ( var lvc = 0; lvc < expectedResults.length; lvc++ ) {
            var event = filterList( ["EventType", "EventId", "SourceNode", "SourceName", "Time", "ReceiveTime", "Message", "Severity"], [expectedResults[lvc]] )[0];

            if ( !isDefined( event ) || event.length < 1 ) {
                continue;
            }

            validateBaseEventType( { ReceivedEvent: event, ExpectedResult: expectedResults[lvc], SourceName: "Session/CreateSession", SourceNode: new UaNodeId( Identifier.Server ) } );

            event = filterList( ["EventType", "ActionTimeStamp", "Status", "ServerId", "ClientAuditEntryId", "ClientUserId"], [expectedResults[lvc]] )[0];

            if ( !isDefined( event ) || event.length < 1 ) {
                continue;
            }

            validateAuditEventType( { ReceivedEvent: event, ExpectedResult: expectedResults[lvc], ClientUserId: "System/CreateSession" } );

            event = filterList( ["EventType", "SessionId"], [expectedResults[lvc]] )[0];

            if ( !isDefined( event ) || event.length < 1 ) {
                continue;
            }

            validateAuditSessionEventType( { ReceivedEvent: event, ExpectedResult: expectedResults[lvc], SessionIdIsNull: true } );

            event = filterList( ["EventType", "SecureChannelId", "ClientCertificate", "ClientCertificateThumbprint", "RevisedSessionTimeout"], [expectedResults[lvc]] )[0];

            if ( !isDefined( event ) || event.length < 1 ) {
                continue;
            }

            validateAuditCreateSessionEventType( { ReceivedEvent: event, ExpectedResult: expectedResults[lvc] } );
        }
    }
    return ( true );
}

Test.Execute( { Procedure: auditingBaseACSET004 } );