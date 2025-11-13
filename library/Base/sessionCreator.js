include( "./library/ServiceBased/Helpers.js" );

/* A Channel and Session Creator.
    
    There are only two methods, Connect and Disconnect.
    This functionality allows for a common way to create any session.
*/

var SessionCreator = new Object();
SessionCreator = {

    // This is designed to be a replacement for the safeInvoke connect/disconnect functionality,
    // which is heavily tied to the existing Channel, Session, and DiscoverySession.
    // This is being isolated so that multiple sessions, and multiple threads can be created.


    /* Connects to the UAServer using a channel and session.
       Parameters: 
           Debug (optional): 
           SkipCreateSession (optional): true = do not call createsession and consequently activatesession
           SkipActivateSession (optional): true = do not call activate session
           OpenSecureChannel (optional): passed to the OpenSecureChannel helper object
           CreateSession (optional):     passed to the CreateSession helper object 
           ActivateSession (optional):   passed to the ActivateSession helper object 
           InstantiateHelpers (optional): Creates the helper functions found in helpers.js.  This is true be default
    */
    Connect: function( args ) { 
                        if( !isDefined( args ) ) args = new Object();
                        if( !isDefined( args.Debug ) ) args.Debug = false;
                        if( !isDefined( args.SkipCreateSession ) ) args.SkipCreateSession = false;
                        if( !isDefined( args.SkipActivateSession ) ) args.SkipActivateSession = false;
                        if( !isDefined( args.InstanciateHelpers ) ) args.InstanciateHelpers = true;

                        var connectResult = new Object();
                        connectResult.result = true;

                        var channel = new OpenSecureChannelService();
                        if( !channel.Execute( args.OpenSecureChannel ) ){
                            connectResult.result = false;
                            connectResult.channel = channel;
                            return( connectResult );
                        } 
                        connectResult.channel = channel;

                        // create a discovery session
                        var discoverySession = new UaDiscovery( channel.Channel );
                        connectResult.discoverySession = discoverySession;

                        if( args.SkipCreateSession ){
                            return connectResult;
                        }

                        var session = new CreateSessionService( { Channel: channel } );
                        var createSessionParams = isDefined( args.CreateSession )? args.CreateSession : new Object();
                        createSessionParams.Session = session;
                        if( !session.Execute( createSessionParams ) ){
                            connectResult.result = false;
                            return connectResult;
                        }
                        connectResult.session = session;
                        // this.SetSession(session, args.CreateEventSession);
                        // activate a session?
                        if( args.SkipActivateSession ){
                            connectResult.result = true;
                            return connectResult;
                        }
                        if( !isDefined( args.ActivateSession ) ) args.ActivateSession = new Object();
                        args.ActivateSession.Session = session;

                        if( !ActivateSessionHelper.Execute( args.ActivateSession ) ){
                            connectResult.result = false;
                            return connectResult;
                        }
                        if ( args.InstanciateHelpers ){
                            InstanciateHelpers( { Session: session.Session, DiscoverySession: discoverySession } );
                        }
                        return connectResult;
                },

    /* Disconnects from the UAServer
       Parameters: 
           SkipCloseSession (optional): does not invoke close session
           CloseSession: an array of arguments passed directly to the CloseSession service 
            (See the CloseSession object the .Execute() parameters
    */
    Disconnect: function( args ) { 
                        if( !isDefined( args ) ) throw ( "Disconnect args not defined");
                        if ( !isDefined( args.channel ) ) throw ( "Disconnect args.channel not defined" );
                        if ( !isDefined( args.SkipCloseSession ) ) args.SkipCloseSession = false;
                        if ( !isDefined( args.session ) ) args.SkipCloseSession = true;
                        // close the channel; is it open?
                        if( !isDefined( args.channel ) || !isDefined( args.channel.Channel ) ) return( true );
                        // close the channel; pass in any received arguments
                        if( !isDefined( args.CloseSecureChannel ) ) args.CloseSecureChannel = args.channel;
                        // close the session; pass in any received arguments
                        if ( !isDefined( args.DeleteSubscriptions ) ) args.DeleteSubscriptions = true;
                        if( !args.SkipCloseSession ) {
                            if( args.session !== null ) {
                                CloseSessionHelper.Execute( { Session: args.session, DeleteSubscriptions: args.DeleteSubscriptions } );
                            }
                        }
                        if( args.channel.Channel.IsConnected ) CloseSecureChannelHelper.Execute( args.CloseSecureChannel );
                        return( true );
                    }
 }