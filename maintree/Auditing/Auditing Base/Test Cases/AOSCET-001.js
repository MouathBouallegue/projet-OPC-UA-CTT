/*  Test prepared by Ing.-Buero Allmendinger: info@allmendinger.de
    Description:    Client calls OpenSecureChannel using known good/default values.
    Expectation:    An audit event is created for the successful connection.
*/

function auditingBaseAOSCET001() {

    var expectedResults = Test.Audit.GetAllAuditEventParams();
    var TC_Variables = new Object();
    // Tested Type
    TC_Variables.Type = new UaNodeId( Identifier.AuditOpenSecureChannelEventType );
    // Expected Status
    TC_Variables.Status = new UaVariant();
    TC_Variables.Status.setBoolean( true );

    // Was any test script executed which would create an audit event of the AuditOpenSecureChannelEventType?
    if ( expectedResults.length > 0 ) {
        print( "There were " + expectedResults.length + " expected events" );
        for ( var lvb = 0; lvb < expectedResults.length; lvb++ ) {
            if ( !expectedResults[lvb].AuditEventType.equals( TC_Variables.Type ) || !expectedResults[lvb].PropertyValues[2].equals( TC_Variables.Status ) ) {
                expectedResults.splice( lvb, 1 );
                lvb--;
            }
        }
        print( expectedResults.length + " of the expected events should be of the AuditOpenSecureChannelEventType." );
    }

    if ( expectedResults.length == 0 ) {
        addSkipped( "There was no test case selected in this test run which would cause an audit event which can be used for this test case." );
        return ( false );
    }

    if ( !auditEventTypeSupported( TC_Variables.Type ) ) {
        return ( false );
    }

    for ( var lvc = 0; lvc < expectedResults.length; lvc++ ) {
        var event = filterListChannel( ["EventType", "EventId", "SourceNode", "SourceName", "Time", "ReceiveTime", "Message", "Severity"], [expectedResults[lvc]], TC_Variables.Type )[0];

        if ( !isDefined( event ) || event.length < 1 ) {
            continue;
        }

        validateBaseEventType( { ReceivedEvent: event, ExpectedResult: expectedResults[lvc], SourceName: "SecureChannel/OpenSecureChannel", SourceNode: new UaNodeId( Identifier.Server ) } );

        event = filterListChannel( ["EventType", "ActionTimeStamp", "Status", "ServerId", "ClientAuditEntryId", "ClientUserId"], [expectedResults[lvc]], TC_Variables.Type )[0];

        if ( !isDefined( event ) || event.length < 1 ) {
            continue;
        }

        validateAuditEventType( { ReceivedEvent: event, ExpectedResult: expectedResults[lvc], ClientUserId: "System/OpenSecureChannel" } );

        event = filterListChannel( ["EventType", "ClientCertificate", "ClientCertificateThumbprint", "RequestType", "SecurityPolicyUri", "SecurityMode", "RequestedLifetime"], [expectedResults[lvc]], TC_Variables.Type )[0];

        if ( !isDefined( event ) || event.length < 1 ) {
            continue;
        }

        validateAuditOpenSecureChannelEventType( { ReceivedEvent: event, ExpectedResult: expectedResults[lvc] } );

    }
    return ( true );
}

Test.Execute( { Procedure: auditingBaseAOSCET001 } );