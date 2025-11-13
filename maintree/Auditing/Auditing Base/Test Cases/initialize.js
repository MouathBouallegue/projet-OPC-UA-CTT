include( "./library/Base/safeInvoke.js" );

var CU_Variables = new Object();
CU_Variables.ReceivedEventIds = [];

UaDateTime.CountDown( { Msecs: 5000 } );

print( "CU Auditing starting." );

function replaceStringToNull(string) {
    if (string == "Null") {
        return (null);
    }
    else {
        return (string);
    }
}

function validateBaseEventType( args ) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for (var i = 0; i < eventFields.length; i++) {
        eventFields[i] = replaceStringToNull(eventFields[i]);
    }

    // EventId
    if ( eventFields[1] == null ) {
        addError( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": The value of the EventId field is missing." );
    }
    else {
        for ( var i = 0; i < CU_Variables.ReceivedEventIds.length; i++ ) { }
        if ( eventFields[1] == CU_Variables.ReceivedEventIds[i] ) {
            addError( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Already received an audit event with the EventId: " + eventFields[1] + "." );
        }
        else {
            CU_Variables.ReceivedEventIds.push( eventFields[1] );
            print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the EventId field succeeded.")
        }
    }

    // EventType
    Assert.Equal( args.ExpectedResult.PropertyValues[0], eventFields[0], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected NodeId for the EventType.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the EventType field succeeded." );

    // SourceNode
    if ( args.SourceNode ) {
        Assert.Equal( args.SourceNode, eventFields[2].toNodeId(), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected NodeId for the SourceNode.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SourceNode field succeeded." );
    }
    else {
        if ( eventFields[2] != null ) {
            addError( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the SourceNode: " + eventFields[2] + ". Expected the value is set to null" );
        }
    }

    // SourceName
    if ( args.SourceName ) {
        Assert.Equal( args.SourceName, eventFields[3].toString(), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the SourceName.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SourceName field succeeded." );
    }
    else {
        Assert.StringNotNullOrEmpty( eventFields[3], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": SourceName shall not be empty." );
    }

    // For the fields concering times allow the server a range of +- 10 seconds
    var ttt = args.ExpectedResult.PropertyValues[3].toDateTime();
    var sss = eventFields[4].toDateTime();
    var diff = Math.abs( ttt.msecsTo( sss ) );

    // Time
    if ( Assert.LessThan( 10000, diff, "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": The difference of the value in the Time field and the TimeStamp of the request which cause the audit event is bigger than 10 Seconds. Expected a much smaller difference." ) ) {
        print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the Time field succeeded." );
    }

    // ReceiveTime
    if ( Assert.LessThan( 10000, diff, "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": The difference of the value in the ReceiveTime field and the TimeStamp of the request which cause the audit event is bigger than 10 Seconds. Expected a much smaller difference." ) ) {
        print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ReceiveTime field succeeded." );
    }
    
    // Message
    if ( Assert.StringNotNullOrEmpty( eventFields[6], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Message shall not be empty. The text of the message has to be verified manually: " + eventFields[5] ) ) {
        print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the Message field succeeded." );
    }

    // Severity
    if ( Assert.InRange( 1, 1000, eventFields[7], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Severity must be between 1-1000." ) ) {
        print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SourceName field succeeded." );
    }

    return ( true );
}

function validateAuditEventType(args) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for (var i = 0; i < eventFields.length; i++) {
        eventFields[i] = replaceStringToNull(eventFields[i]);
    }

    // For the fields concering times allow the server a range of +- 100 mSecs
    var ttt = args.ExpectedResult.PropertyValues[3].toDateTime();
    var sss = eventFields[1].toDateTime();
    var diff = Math.abs(ttt.msecsTo(sss));

    // ActionTimeStamp
    if (Assert.LessThan(100, diff, "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": The difference of the value in the ActionTimeStamp field and the TimeStamp of the request which cause the audit event is bigger than 100 mSecs. Expected a much smaller difference.")) {
        print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ActionTimeStamp field succeeded.");
    }

    // Status
    Assert.Equal(args.ExpectedResult.PropertyValues[2], eventFields[2], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the Status.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the Status field succeeded.");

    // ServerId
    if (Assert.StringNotNullOrEmpty(eventFields[3], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": ServerId shall not be empty.")) {
        print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ServerId field succeeded.");
    }

    // ClientAuditEntryId
    Assert.Equal(args.ExpectedResult.PropertyValues[1], eventFields[4], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the ClientAuditEntryId.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientAuditEntryId field succeeded.");

    // ClientUserId needs improvements in the Auditing infrastructure
    if (args.ClientUserId) {
        Assert.Equal(args.ClientUserId, eventFields[5].toString(), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientUserId failed.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientUserId field succeeded.");
    }
    else {
        if ( args.ExpectedResult.PropertyValues[5] != null && isDefined( args.ExpectedResult.PropertyValues[5] ) ) {
            switch ( args.ExpectedResult.PropertyValues[5].toString() ) {
                case "Anonymous":
                    if ( UaVariantToSimpleType( eventFields[5] ) !== undefined && UaVariantToSimpleType( eventFields[5] ) !== null && UaVariantToSimpleType( eventFields[5] ) !== "" ) {
                        addError( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Anonymous was used for Authentification so the ClientUserId should be empty. Received: " + UaVariantToSimpleType( eventFields[5] ));
                    }
                    break;
                default:
                    if (Assert.StringNotNullOrEmpty(eventFields[5], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": ClientUserId cannot be empty if not using an AnonymousIdentityToken.")) {
                        print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientUserId field succeeded.");
                    }
                    break;
            }
        }
        else {
            print("Skipping validation of the ClientUserId field.");
        }
    }

    return (true);
}

function validateAuditSessionEventType(args) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for (var i = 0; i < eventFields.length; i++) {
        eventFields[i] = replaceStringToNull(eventFields[i]);
    }

    // SessionId
    if (args.SessionIdIsNull == true) {
        if (Assert.IsNull(eventFields[1]), "SessionId is not null.") {
            print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SessionId field succeeded.");
        }
    }
    else {
        Assert.Equal( args.ExpectedResult.PropertyValues[4].toNodeId(), eventFields[1].toNodeId(), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the SessionId.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SessionId field succeeded.");
    }
    return (true);
}

function validateAuditActivateSessionEventType(args) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for (var i = 0; i < eventFields.length; i++) {
        eventFields[i] = replaceStringToNull(eventFields[i]);
    }

    // ClientSoftwareCertificates reserved for future use

    // UserIdentityToken
    if (Assert.StringNotNullOrEmpty(eventFields[2], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": UserIdentityToken cannot be empty.")) {
        print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the UserIdentityToken field succeeded.");
    }

    // SecureChannelId
    if (Assert.StringNotNullOrEmpty(eventFields[2], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": SecureChannelId cannot be empty.")) {
        print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SecureChannelId field succeeded.");
    }

    return (true);
}

function validateAuditCreateSessionEventType(args) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for (var i = 0; i < eventFields.length; i++) {
        eventFields[i] = replaceStringToNull(eventFields[i]);
    }

    // SecureChannelId
    if (Assert.StringNotNullOrEmpty(eventFields[1], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": SecureChannelId cannot be empty.")) {
        print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SecureChannelId field succeeded.");
    }

    // ClientCertificate
    Assert.Equal(args.ExpectedResult.PropertyValues[6], eventFields[2], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the ClientCertificate.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientCertificate field succeeded.");

    // ClientCertificateThumbprint
    if (args.ExpectedResult.PropertyValues[6] != null) {
        if (Assert.StringNotNullOrEmpty(eventFields[3], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": ClientCertificateThumbprint cannot be empty if a ClientCertificate has been passed.")) {
            print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientCertificateThumbprint field succeeded.");
        }
    }
    else {
        if (Assert.IsNull(eventFields[3], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": ClientThumbprint should be null if no ClientCertificate has been passed.")) {
            print("Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientCertificateThumbprint field succeeded.");
        }
    }

    // RevisedSessionTimeout
    Assert.Equal(args.ExpectedResult.PropertyValues[7].toDouble(), eventFields[4].toDouble(), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the RevisedSessionTimeout.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the RevisedSessionTimeout field succeeded.");

    return (true);
}

function validateAuditOpenSecureChannelEventType( args ) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for ( var i = 0; i < eventFields.length; i++ ) {
        eventFields[i] = replaceStringToNull( eventFields[i] );
    }

    // ClientCertificate
    Assert.Equal( args.ExpectedResult.PropertyValues[6], eventFields[1], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the ClientCertificate.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientCertificate field succeeded." );

    // ClientCertificateThumbprint
    if ( args.ExpectedResult.PropertyValues[6] != null ) {
        if ( Assert.StringNotNullOrEmpty( eventFields[2], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": ClientCertificateThumbprint cannot be empty if a ClientCertificate has been passed." ) ) {
            print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientCertificateThumbprint field succeeded." );
        }
    }
    else {
        if ( Assert.IsNull( eventFields[2], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": ClientThumbprint should be null if no ClientCertificate has been passed." ) ) {
            print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ClientCertificateThumbprint field succeeded." );
        }
    }

    // RequestType
    if ( eventFields[3] == null ) {
        addError( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": RequestType cannot be empty." );
    }

    // SecurityPolicyUri
    Assert.Equal( SecurityPolicy.policyToString( args.ExpectedResult.PropertyValues[8] ), eventFields[4].toString(), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the SecurityPolicyUri.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SecurityPolicyUri field succeeded." );

    // SecurityPolicyMode
    Assert.Equal( Number(UaVariantToSimpleType( args.ExpectedResult.PropertyValues[9] )), Number(eventFields[5]), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the SecurityPolicyMode.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the SecurityPolicyMode field succeeded." );

    // RequestedLifetime
    Assert.Equal( args.ExpectedResult.PropertyValues[10].toDouble(), eventFields[4].toDouble(), "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the RevisedSessionTimeout.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the RevisedSessionTimeout field succeeded." );

    return ( true );
}

function validateAuditCertificateEventType( args ) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for ( var i = 0; i < eventFields.length; i++ ) {
        eventFields[i] = replaceStringToNull( eventFields[i] );
    }

    // Certificate
    Assert.Equal( args.ExpectedResult.PropertyValues[6], eventFields[1], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the Certificate.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the Certificate field succeeded." );

    return ( true );
}

function validateAuditCertificateDataMismatchEventType( args ) {

    var eventFields = args.ReceivedEvent.EventFieldList.EventFields;

    for ( var i = 0; i < eventFields.length; i++ ) {
        eventFields[i] = replaceStringToNull( eventFields[i] );
    }

    // InvalidUri
    if ( Assert.StringNotNullOrEmpty( eventFields[1], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": InvaludUri shall not be empty." ) ) {
        print( "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the ServerId field succeeded." );
    }
    Assert.Equal( args.ExpectedResult.PropertyValues[13], eventFields[1], "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Received an unexpected value for the Certificate.", "Current audit event tested: " + args.ExpectedResult.PropertyValues[1] + ": Validation of the Certificate field succeeded." );

    return ( true );
}

function filterList( fields, expected ) {

    for ( var index = 0; index < expected.length; index++ ) {
        var expectedEntry = expected[index];

        var value = new UaVariant();
        value.setString( expectedEntry.AuditEntryId );

        var whereClause = Test.Audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = Test.Audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, "ClientAuditEntryId", value );

        // All I care about is the ClientAuditEntryId and the EventType
        var result = Test.Audit.FindEntryVerbose( fields, whereClause );

        if ( result.status != true || result.events.length < 1 ) {
            addError( "TestFindActualFromExpected - Unable to Find Entry for ClientAuditEntryId " + expectedEntry.AuditEntryId );
            return ( [null] );
        }

        if ( result.events.length != 1 ) {
            addError( "TestFindActualFromExpected - Unexpected number of results for ClientAuditEntryId " + expectedEntry.AuditEntryId + ", number: " + result.events.length);
        }

        var eventFields = result.events[0].EventFieldList.EventFields;
        if ( eventFields.length != fields.length ) {
            addError( "TestFindActualFromExpected - Unexpected returned fields" );
        }
    }
    return ( result.events );
}

function filterListChannel( fields, expected, type ) {

    var b = new UaVariant();
    b.setNodeId( type );

    for ( var index = 0; index < expected.length; index++ ) {
        var expectedEntry = expected[index];

        var value = new UaVariant();
        value.setString( expectedEntry.AuditEntryId );

        var whereClause = Test.Audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = Test.Audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, "ClientAuditEntryId", value );

        // All I care about is the ClientAuditEntryId and the EventType
        var result = Test.Audit.FindEntryVerbose( fields, whereClause );
        var fin = [];

        if ( isDefined( b ) && result.events.length > 0 ) {
            for ( var i = 0; i < result.events.length; i++ ) {
                if ( b.equals( UaVariantToSimpleType( result.events[i].EventFieldList.EventFields[0] ) ) ) {
                    fin.push( result.events[i] );
                }
            }
        }

        if ( result.status != true || result.events.length < 1 ) {
            addError( "TestFindActualFromExpected - Unable to Find Entry for ClientAuditEntryId " + expectedEntry.AuditEntryId );
            return ( [null] );
        }

        if ( fin.length != 1 ) {
            addError( "TestFindActualFromExpected - Unexpected number of results for ClientAuditEntryId " + expectedEntry.AuditEntryId + ", number: " + fin.length );
        }

        var eventFields = fin[0].EventFieldList.EventFields;
        if ( eventFields.length != fields.length ) {
            addError( "TestFindActualFromExpected - Unexpected returned fields" );
        }
    }
    return ( fin );
}

function validateActualFromExpected( expected ) {

    var mySelectFields = ["EventType", "ClientAuditEntryId", "ActionTimeStamp", "Status", "ServerId", "Message"];
    for ( var index = 0; index < expected.length; index++ ) {
        var expectedEntry = expected[index];

        var value = new UaVariant();
        value.setString( expectedEntry.AuditEntryId );

        var whereClause = Test.Audit.WhereClauseCreator.CreateEmptyWhereClause();
        whereClause.Elements[0] = Test.Audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, "ClientAuditEntryId", value );

        // All I care about is the ClientAuditEntryId and the EventType
        var result = Test.Audit.FindEntryVerbose( mySelectFields, whereClause );
        print( result.events );
        if ( result.status != true ) {
            addError( "TestFindActualFromExpected - Unable to Find Entry for ClientAuditEntryId " + expectedEntry.AuditEntryId );
        }

        if ( result.events.length != 1 ) {
            addError( "TestFindActualFromExpected - Unexpected number of results for ClientAuditEntryId " + expectedEntry.AuditEntryId );
        }

        var eventFields = result.events[0].EventFieldList.EventFields;
        if ( eventFields.length != mySelectFields.length ) {
            addError( "TestFindActualFromExpected - Unexpected returned fields" );
        }

        var eventType = eventFields[0].toNodeId();
        var id = eventFields[1].toString();
        var ats = eventFields[2].toDateTime();
        var status = eventFields[3].toBoolean();
        var sid = eventFields[4].toString();
        var message = eventFields[5].toString();

        if ( ats > UaDateTime.Now() ) {
            addError( "The ActionTimeStamp entry is in the future: " + ats );
        }

        if ( sid.isNull() ) {
            addError("The ServerId field is empty.")
        }

        if ( message.isNull() ) {
            addError( "The Message field is empty" );
        }

        if ( !eventType.equals( expectedEntry.AuditEventType ) ) {
            addError( "TestFindActualFromExpected - Unexpected Audit EventType looking for " + expectedEntry.AuditEntryId );
        }

        if ( id != expectedEntry.AuditEntryId ) {
            addError( "TestFindActualFromExpected - Unexpected Audit Id looking for " + expectedEntry.AuditEntryId + " got " + id );
        }
    }
    return ( result.events );
}

function cu_LoadCertificate(filename, pkiProvider) {
    var clientCertificate = new UaByteString();
    var certResult = pkiProvider.loadCertificateFromFile(filename, clientCertificate);
    if (certResult.isGood()) return (clientCertificate);
    else {
        addError(this.Name + "() LoadCertificate failed to load certificate from filename '" + filename + "'.");
        return (null);
    }
}

function auditEventTypeSupported( type ) {

    var b = new UaVariant();
    b.setNodeId( type );

    var whereClause = Test.Audit.WhereClauseCreator.CreateEmptyWhereClause();
    whereClause.Elements[0] = Test.Audit.WhereClauseCreator.CreateTwoOperandFilterElement( FilterOperator.Equals, "EventType", b );

    // All I care about is the ClientAuditEntryId and the EventType
    var result = Test.Audit.FindEntryVerbose( ["EventType"], whereClause );

    print( result.status );
    print( result.events );

    if ( result.status != true || result.events.length < 1 ) {
        addNotSupported( "TestFindActualFromExpected - Unable to Find an Entry for AuditEventType: " + type );
        return ( false );
    }

    return ( true );
}

// for this version we only care about the AuditEvents caused by the test scripts.
function filterEmptySentClientEntryIds( args ) {

    if ( args.ExpectedResults.length > 0 ) {
        for ( var lvb = 0; lvb < args.ExpectedResults.length; lvb++ ) {
            if ( args.ExpectedResults[lvb].PropertyValues[1] == null ) {
                args.ExpectedResults.splice( lvb, 1 );
                lvb--;
            }
        }
    }
    return ( args.ExpectedResults );
}