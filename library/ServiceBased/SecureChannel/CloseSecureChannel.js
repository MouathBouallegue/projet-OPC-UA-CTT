
function CloseSecureChannelService( args ) {
    this.Name = "CloseSecureChannel";
    this.UaStatus = null;

    this.Execute = function( args ) {
        if( !isDefined( args ) ) throw( "CloseSecureChannel::Execute() args not specified" );
        if( !isDefined( args.Channel ) ) throw( "CloseSecureChannel::Execute() args.Channel not specified" );
        if( isDefined ( args.Channel.Channel ) ) args.Channel = args.Channel.Channel; // make sure we are pointing to the channel object, not the helper!
        if( !isDefined( args.Channel.IsConnected ) ) throw( "CloseSecureChannel::Execute() args.Channel type mismatch. Could not find property 'IsConnected'." );
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        // invoke the disconnect, if connected
        if( args.Channel.IsConnected ) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            this.UaStatus = args.Channel.disconnect();
            CheckUserStop();
            this.PushAuditRecord( this.UaStatus );
            // prepare an output message to summarize the call
            var msg = this.Name + "(); Result = " + this.UaStatus;
            if( !args.SuppressMessaging ) addLog( msg );
            if( !args.SuppressMessaging ) print( msg );
            if( isDefined( args.PostHook ) ) args.PostHook();
            // any post validation needed?
            if( isDefined( args.ServiceResult ) ) { 
                var result = args.ServiceResult.containsStatusCode( this.UaStatus );
                if( !result ) addError( "CloseSecureChannel().Result received " + this.UaStatus.toString() + ", but expected any one of the following:\n\t" + args.ServiceResult.ExpectedResults.toString(), this.UaStatus );
            }
        }// connected already?
        return( !args.Channel.IsConnected );
    }

    this.PushAuditRecord = function( status ){
        var index = 0;
        var count = 4;
        var names = new UaQualifiedNames( count );
        var values = new UaVariants( count );

        var eventType = new UaNodeId( Identifier.AuditChannelEventType );
        names[ index ].Name = "EventType";
        values[ index ].setNodeId( eventType );

        index++;
        var auditEntryId = "";
        names[ index ].Name = "ClientAuditEntryId";
        values[ index ].setString( auditEntryId );

        index++;
        names[ index ].Name = "Status";
        values[ index ].setBoolean( status );

        index++;
        names[ index ].Name = "Time";
        values[ index ].setDateTime( UaDateTime.utcNow() );

        Test.PushAuditRecord(
            {
                AuditEventType: eventType,
                AuditEntryId: auditEntryId,
                PropertyNames: names,
                PropertyValues: values
            }
        );
    }
}