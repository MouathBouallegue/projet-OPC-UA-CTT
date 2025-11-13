/*    This class object is responsible for calling the DropAuditRecord() service and for also
      performing any validation etc.*/

      function DropAuditRecordService( args ) {
        this.Name = "DropAuditRecord";
        this.Session = null;
        this.Request = null;
        this.Response = null;
        this.UaStatus = null;
    
        if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
        if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
        else this.Session = args.Session;
    
    
        /* DropAuditRecord values.
              Parameters are: 
                  ThreadId - ThreadId to make the request against
                  SubscriptionId - Subscription to make the request against
                  ClientId - ClientId of the event monitoredItem
                  EventEntries - Array of UInt32 Event Handles to remove
                  SuppressMessaging  = do not log messages
                  SuppressWarnings   = do not long warnings
                  PreHook            = function to invoke immediately before the Service call
                  PostHook           = function to invoke immediately after the Server call
                  */
        this.Execute = function( args ) {
            // parameter validation
            if( !isDefined( args ) ) throw( this.Name + "::Execute() args not specified." );
            if( !isDefined( args.ThreadId ) ) throw( this.Name + " ThreadId not specified." );
            if( !isDefined( args.SubscriptionId ) ) throw( this.Name + " SubscriptionId not specified." );
            if( !isDefined( args.ClientId ) ) throw( this.Name + " ClientId not specified." );
            if( !isDefined( args.EventEntries ) ) throw( this.Name + " EventEntries not specified." );
            if( !isDefined( args.EventEntries.length && args.EventEntries.length == 0 ) ) throw( this.Name + " EventEntries is empty" );
            if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
            if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
            if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;
    
            ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );
    
            // define the write headers
            this.Request  = new UaDropAuditRecordRequest();
            this.Response  = new UaDropAuditRecordResponse();
            this.Request.ThreadId = args.ThreadId;
            this.Request.SubscriptionId = args.SubscriptionId;
            this.Request.ClientId = args.ClientId;
    
            for( var index = 0; index < args.EventEntries.length; index++ ) {
                this.Request.EventEntries[index] = args.EventEntries[index];
            }
    
            var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
    
            var result = false;
            // issue the command while processing any hooks before/after
            if( isDefined( args.PreHook ) ) args.PreHook();
            this.UaStatus = session.dropAuditRecord( this.Request, this.Response );
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
            // check result
            if( this.UaStatus.isGood() ) {
                print( "DropAuditRecord succeeded" );
                result = true;
            }
            else {
                addError( "DropAuditRecord() failed, status " + this.UaStatus, this.UaStatus );
            }
            // if the call failed then register that 
            if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
            return( result );
        };//DropAuditRecord

        this.ValuesAsString = function(  ){
            var lines = [];

            if ( this.UaStatus.isGood()){
                lines.push( "DropAuditRecord succeeded.  All desired Expected events have been removed" );
            }else{
                lines.push( "DropAuditRecord failed.  There were entries that were not able to be deleted" );
                if ( this.Response.StatusCodes.length == this.Request.EventEntries.length){
                    for ( var index = 0; index < this.Request.EventEntries.length; index++ ){
                        lines.push( "Index [" + index + "] Removal of " + this.Request.EventEntries[index] + 
                            " status = " + this.Response.StatusCodes[index].toString() );
                    }
                }else{
                    lines.push( "DropAuditRecord results does not equal the length of the requested events to drop" );
                }
            }

            return lines;
        };
    }
    
    
    
    
    