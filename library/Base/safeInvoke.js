include( "./library/Base/assertions.js" );
include( "./library/Base/serviceRegister.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/ServiceBased/Helpers.js" );
include( "./library/Base/sessionCreator.js" );
include( "./library/Base/auditThread.js" );
include( "./library/Utilities/StopRun.js" );

/* A test framework.
   Parameters: 
       - TryFunction: the reference to the function. Must return TRUE/FALSE
       - ErrorFunction; a reference to a function to call if an error occurs; must return TRUE/FALSE 
       - FinallyFunction: a reference to a function to call in the FINALLY block.
       - Procedure: a reference to a function that does not return TRUE/FALSE */
var Test = new Object();
Test = {
    StartTime: null,
    EndTime: null,
    Duration: null,

    PreTestFunctions: [],
    PostTestFunctions: [],

    TestResult: false,

    TestsPassed: 0, 
    TestsPassedGlobal: 0,
    TestsFailed: 0, 
    TestsFailedGlobal: 0,

    Channel: null,
    Session: null,
    DiscoverySession: null,
    Audit: null,

    /* Connects to the UAServer using a channel and session.
       Parameters: 
           Debug (optional): 
           SkipCreateSession (optional): true = do not call createsession and consequently activatesession
           SkipActivateSession (optional): true = do not call activate session
           OpenSecureChannel (optional): passed to the OpenSecureChannel helper object
           CreateSession (optional):     passed to the CreateSession helper object 
           ActivateSession (optional):   passed to the ActivateSession helper object 
    */
    Connect: function( args ) { 

        var connectResult = SessionCreator.Connect( args );

        this.Channel = connectResult.channel;

        if ( connectResult.result === false ) {
            return false;
        }

        if ( isDefined( connectResult.session ) ){
            this.Session = connectResult.session;
        }

        if ( isDefined( connectResult.discoverySession ) ){
            this.DiscoverySession = connectResult.discoverySession;
        }

        return true;
    },

    /* Disconnects from the UAServer
       Parameters: 
           SkipCloseSession (optional): does not invoke close session
           CloseSession: an array of arguments passed directly to the CloseSession service (See the CloseSession object the .Execute() parameters
           EventSession (optional):     passed to create a channel and session specifically for retrieving events */

    Disconnect: function( args ) { 
        if( !isDefined( args ) ) args = new Object();
        args.channel = this.Channel;
        args.session = this.Session;

        return SessionCreator.Disconnect( args );
    },

    ConnectAudit: function( args ){
        if ( !this.Audit ){
            this.Audit = new AuditThread();
        }

        this.Audit.Start( args );
    },

    DisconnectAudit: function( args ){
        if ( this.Audit ){
            this.Audit.End();
            this.Audit = null;
        }
    },

    Execute: function( args ) {
                    if( !( isDefined( this.DONOTRUN ) && this.DONOTRUN ) ) {;
                        if( !isDefined( args ) ) throw( "Test.args not specified." );
                        if( !isDefined( args.TryFunction ) && !isDefined( args.Procedure ) ) throw( "Test.args.TryFunction and/or Procedure not specified." );
                        this.StartTime = UaDateTime.utcNow();
                        try {
                            if( this.PreTestFunctions.length > 0 ) for( var i=0; i<this.PreTestFunctions.length; i++ ) this.PreTestFunctions[i]();
                            print( "\n\n\t~~~ START OF TEST [" + args.Procedure.name + "] ~~~\n" );
                            if( isDefined( args.TryFunction ) ) this.TestResult = args.TryFunction( args.Args );
                            else if( isDefined( args.Procedure ) ) this.TestResult = args.Procedure( args.Args );
                            if( !isDefined( this.TestResult ) ) throw( "Test function did NOT return a true/false code. Please check the routine." );
                            if( this.TestResult ) this.incPass(); else this.incFail();
                            if( this.PostTestFunctions.length > 0 ) for( var i=0; i<this.PostTestFunctions.length; i++ ) this.PostTestFunctions[i]();
                            print( "\n\n\t~~~ END OF TEST [" + args.Procedure.name + "] ~~~\n" );
                        }
                        catch( ex ) {
                            //Lets prepare a string containing all available information
                            var exeptionMessage = "";
                            var userStop = false;
                            var resourceStop = false;
                            if ( typeof ( ex ) == "object" ) {
                                objectExceptionMessage = true;
                                for ( var p in ex ) {
                                    exeptionMessage += "\t" + p + ":" + ex[p] + "\n";
                                }
                            }
                            else {
                                if ( ex == USER_STOPPED_RUN ){
                                    userStop = true;
                                }else if ( ex == RESOURCE_STARVATION_ERROR ){
                                    resourceStop = true;
                                }else{  
                                    exeptionMessage = "\t message: " + ex;
                                }
                            }

                            if ( userStop ){
                                addError( "Test.Execute() encountered user interaction:\n\t" + USER_STOPPED_RUN );
                            }else if ( resourceStop ){
                                addError ("Test.Execute() encountered:\n\t" + RESOURCE_STARVATION_ERROR );
                            }else if( isDefined( args.ErrorHandler ) ) {
                                if( !args.ErrorHandler() ) {
                                    addError( "Test.Execute() encountered an unexpected error:\n" + exeptionMessage.toString() );
                                }
                            }else {
                                addError( "Test.Execute() encounted an unexpected error:\n" + exeptionMessage.toString() );
                            }

                            if( isDefined( args.Debug ) && args.Debug === true ) throw( ex );
                        }
                        finally {
                            if( isDefined( args.FinallyHandler ) ) args.FinallyHandler();
                        }
                        this.EndTime = UaDateTime.utcNow();
                        this.Duration = this.StartTime.msecsTo( this.EndTime );
                    }
                    this.DONOTRUN = false;
                }, // Execute

    Include: function( args ) { 
                    if( !isDefined( args ) ) throw( "Include.args not specified." );
                    if( !isDefined( args.File ) ) throw( "Include.args.File not specified." );
                    this.DONOTRUN = true;
                    include( args.File );
                    this.DONOTRUN = false;
                }, //Include

    PushAuditRecord: function( args ){
        var name = "Test::PushAuditRecord";

        if ( isDefined(this.Audit) && this.Audit != null ){
            return this.Audit.PushAuditRecord( args );
        }

        return false;
    },

    GetAuditEventParams: function( args ){
        var name = "Test::GetAuditEventParams";

        if ( isDefined( this.Audit ) && this.Audit != null ){
            return this.Audit.GetAuditEventParams( args );
        }

        return false;
    },

    CreateThreadAndSubscription: function ( items ){
        
        var result = { status: false, threadInfo : null };
        var thread = new SessionThread();
        if ( thread.Start() ){
            var subscription = new Subscription();
    
            if ( thread.Helpers.CreateSubscriptionHelper.Execute( 
                { Subscription: subscription, ThreadId : thread.ThreadId } ) ){
                if ( thread.Helpers.CreateMonitoredItemsHelper.Execute( 
                    { ItemsToCreate: items, 
                      SubscriptionId: subscription, // hate this.  Says its the id, but really wants the subscription
                      ThreadId : thread.ThreadId } ) ){
                    var threadObject = { Thread : thread, Subscription: subscription, Items : items };
                    result = { status : true, threadInfo : threadObject };
                }else{
                    thread.Helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: subscription } );
                        unitSubscription = null;
                        thread.End();
                        addError( "CreateThreadAndSubscription - Unable to create thread monitored Items" );
                }
            }else{
                thread.End();
                addError( "CreateThreadAndSubscription - Unable to create Thread Subscription" );
            }
                
        }else{
            addError( "CreateThreadAndSubscription - Unable to create Thread" );
        }
    
        return result;
    },

    DestroyThreadAndSubscription: function( args ){
        var result = false;
        if ( isDefined( args) && isDefined( args.Thread ) && isDefined( args.Subscription ) && isDefined( args.Items )){
            if ( args.Thread.Started === true ){
                args.Thread.Helpers.DeleteMonitoredItemsHelper.Execute( 
                    { ItemsToDelete: args.Items, SubscriptionId: args.Subscription, SuppressMessaging: true } );
                args.Thread.Helpers.DeleteSubscriptionsHelper.Execute( { SubscriptionId: args.Subscription } );
                args.Thread.End();
                result = true;
            }else{
                addError( "DestroyThreadAndSubscription - Unable to stop due to thread not started" );
            }
        }else{
            addError( "DestroyThreadAndSubscription - Invalid Arguments" );
        }
        return result;
    },



    incPass:    function() { this.TestsPassedGlobal++; this.TestsPassed++; }, 
    incFail:    function() { this.TestsFailedGlobal++; this.TestsFailed++; }, 
    ResetStats: function() { this.TestsPassed = 0;     this.TestsFailed = 0; },

    Stats: function() { return( "Tests Passed:\n\tThis CU: " + this.TestsPassed +
                                "\n\tGlobally: " + this.TestsPassedGlobal +
                                "\nTests Failed:\n\tThis CU: " + this.TestsFailed +
                                "\n\tGlobally: " + this.TestsFailedGlobal ); },
}