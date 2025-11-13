function CreateSubscriptionService( args ) {
    this.Name = "CreateSubscription";
    this.Session  = null;
    this.Request  = null;
    this.Response = null;
    this.Thread = false;
    this.ThreadId = null;

    if( !isDefined( args ) ) throw( "CreateSubscription::constructor - args not specified." );
    if( !isDefined( args.Session ) ) throw( "CreateSubscription.js::constructor - session parameter missing." );
    else this.Session = args.Session;

    /* Invokes CreateSubscription. Parameters include: 
        Subscription: 
        ServiceResult: 
        MaxNotificationsPerPublish: 
        Priority: 
        PublishingEnabled: 
        RequestedLifetimeCount: 
        RequestedPublishingInterval: 
        RequestedMaxKeepAliveCount:
        SuppressMessaging :
        ThreadId: */
    this.Execute = function( args ) {
        // first, make sure all required parameters are here 
        if( !isDefined( args ) ){ throw( "CreateSubscription.js::Execute() parameter missing: args." ); }
        if( !isDefined( args.Subscription ) ){ 
            if( isDefined( args.SubscriptionId ) ) args.Subscription = args.SubscriptionId;
            else throw( "CreateSubscription.js::Execute() parameter missing: args.Subscription." ); 
        }

        // second, make sure any error-checking parameters are correctly configured 
        if( isDefined( args.ExpectedErrors ) ){ args.ServiceResult = args.ExpectedErrors; }
        // third, make sure any subscription control parameters are used 
        if( isDefined( args.MaxNotificationsPerPublish ) ){ args.Subscription.MaxNotificationsPerPublish = args.MaxNotificationsPerPublish; }
        if( isDefined( args.Priority ) ){ args.Subscription.Priority = args.Priority; }
        if( isDefined( args.PublishingEnabled ) ){ args.Subscription.PublishingEnabled = args.PublishingEnabled; }
        if( isDefined( args.RequestedLifetimeCount ) ){ args.Subscription.LifetimeCount = args.RequestedLifetimeCount; }
        if( isDefined( args.RequestedPublishingInterval ) ){ args.Subscription.PublishingInterval = args.RequestedPublishingInterval; }
        if( isDefined( args.RequestedMaxKeepAliveCount ) ) { args.Subscription.MaxKeepAliveCount = args.RequestedMaxKeepAliveCount; }
        if( isDefined( args.ThreadId ) ){ 
            this.Thread = true;
            this.ThreadId = args.ThreadId;
            print( "CreateSubscription found thread id " + this.ThreadId);
         }

        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        // now to invoke the call using our existing function (above)
        var result = createSubscriptionDeprecated( args.Subscription, this.Session, args.ServiceResult, args.SuppressMessaging, this.ThreadId, args.ReturnDiagnostics );
        this.Request = subscriptionReq;
        this.Response = subscriptionRes;

        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    }

}



/*
create a subscription with the parameters specified in the Subscription object
   Revision History: 
       01-Jul-2009 DEV: Initial Version
       22-Mar-2010 NP: Added "TimeoutHint" calculation
*/
var subscriptionReq;
var subscriptionRes;
function createSubscriptionDeprecated( Subscription, Session, expectedErrors, suppressMessaging, threadId, returnDiagnostics ) {
    var bSucceeded = true;
    // check in parameters
    if( arguments.length < 2 ) {
        addError( "function createSubscription(Subscription, Session): Number of arguments must be at least 2!" );
        return false;
    }

    if( Subscription.SubscriptionCreated == true ) {
        addError( "function createSubscription(Subscription, Session): Subscription is already created." );
        return false;
    }

    if( !isDefined( suppressMessaging ) ) suppressMessaging = false;
    subscriptionReq = new UaCreateSubscriptionRequest();
    subscriptionRes = new UaCreateSubscriptionResponse();
    var session = isDefined( Session.Session )? Session.Session : Session;
    session.buildRequestHeader( subscriptionReq.RequestHeader );
    subscriptionReq.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: returnDiagnostics } );
    subscriptionReq.RequestedPublishingInterval = Subscription.PublishingInterval;
    subscriptionReq.RequestedLifetimeCount = Subscription.LifetimeCount;
    subscriptionReq.RequestedMaxKeepAliveCount = Subscription.MaxKeepAliveCount;
    subscriptionReq.MaxNotificationsPerPublish = Subscription.MaxNotificationsPerPublish;
    subscriptionReq.PublishingEnabled = Subscription.PublishingEnabled;
    subscriptionReq.Priority = Subscription.Priority;

    // get the defaultTimeoutHint from the settings
    var defaultTimeoutHintSettingValue = readSetting( "/Server Test/Session/DefaultTimeoutHint" ).toString();
    subscriptionReq.RequestHeader.TimeoutHint = parseInt( defaultTimeoutHintSettingValue );

    if( !suppressMessaging ) print( "CreateSubscription Requested Parameters: " +
        "DefaultTimeoutHint: " + subscriptionReq.RequestHeader.TimeoutHint + "; PublishingInterval: " + subscriptionReq.RequestedPublishingInterval +
        "; LifetimeCount: " + subscriptionReq.RequestedLifetimeCount + "; MaxKeepAliveCount: " + subscriptionReq.RequestedMaxKeepAliveCount +
        "; PublishingEnabled: " + subscriptionReq.PublishingEnabled + "; Priority: " + subscriptionReq.Priority +
        "; MaxNotificationsPerPublish: " + subscriptionReq.MaxNotificationsPerPublish );

    var uaStatus;
    if ( isDefined(threadId) ) {
        var threadSubscriptionRequest = new UaAddSubscriptionToThreadRequest();
        var threadSubscriptionResponse = new UaAddSubscriptionToThreadResponse();

        threadSubscriptionRequest.ThreadId = threadId;
        threadSubscriptionRequest.SubscriptionRequest = subscriptionReq;
        uaStatus = session.addSubscriptionToThread(threadSubscriptionRequest, threadSubscriptionResponse);
        subscriptionRes = threadSubscriptionResponse.SubscriptionResponse;
    }else{
        uaStatus = session.createSubscription( subscriptionReq, subscriptionRes );
    }
    Subscription.ServiceResult = subscriptionRes.ResponseHeader.ServiceResult;
    if( uaStatus.isGood() ) {
        bSucceeded = UaResponseHeader.IsValid( { Service: { Name: "CreateSubscription", Request: subscriptionReq, Response: subscriptionRes }, ServiceResult: expectedErrors, SuppressMessaging: suppressMessaging } );
        if( bSucceeded ) {
            if( subscriptionRes.ResponseHeader.ServiceResult.isGood() ) {
                if(!checkCreateSubscriptionValidParameter( subscriptionReq, subscriptionRes )) bSucceeded = false;
                Subscription.RevisedPublishingInterval = subscriptionRes.RevisedPublishingInterval;
                Subscription.SubscriptionId = subscriptionRes.SubscriptionId;
                Subscription.RevisedLifetimeCount = subscriptionRes.RevisedLifetimeCount;
                Subscription.RevisedMaxKeepAliveCount = subscriptionRes.RevisedMaxKeepAliveCount;
                Subscription.SubscriptionCreated = true;
    
                //store the revised values in the Revised properties of our subscription object
                Subscription.RevisedPublishingInterval = subscriptionRes.RevisedPublishingInterval;
                Subscription.RevisedLifetimeCount      = subscriptionRes.RevisedLifetimeCount;
                Subscription.RevisedMaxKeepAliveCount  = subscriptionRes.RevisedMaxKeepAliveCount;
    
                //calculate the "TimeoutHint" and store in the Subscription object
                Subscription.TimeoutHint = 2 * ( Subscription.RevisedPublishingInterval * Subscription.RevisedMaxKeepAliveCount );
    
                if( !suppressMessaging ) print( "\tSubscriptionId: " + subscriptionRes.SubscriptionId + "; RevisedPublishingInterval: " + Subscription.RevisedPublishingInterval + 
                    "; RevisedLifetimeCount: "      + Subscription.RevisedLifetimeCount +
                    "; RevisedMaxKeepAliveCount: "  + Subscription.RevisedMaxKeepAliveCount );
            }
        }
    }
    else {
        Assert.StatusCodeIsOneOf( expectedErrors, uaStatus, "CreateSubscriptionService: the ErrorCode in the Error Message received doesn't match the expectation." );
        bSucceeded = false;
    }
    return bSucceeded;
}


// the service is expected to succeed
// all operations are expected to succeed
function checkCreateSubscriptionValidParameter( Request, Response ) {
    var bSucceeded = true;
    if( Response.RevisedPublishingInterval == 0 ) {
        addError( "The server returned an invalid RevisedPublishingInterval value of: " + Response.RevisedPublishingInterval );
        bSucceeded = false;
    }
    if( Response.RevisedMaxKeepAliveCount == 0 ) {
        addError( "The server returned an invalid RevisedMaxKeepAliveCount value of: " + Response.RevisedMaxKeepAliveCount );
        bSucceeded = false;
    }
    //make sure there is 3x multiplier between the lifetimeCount and maxKeepAlive
    if( (Response.RevisedMaxKeepAliveCount*3) > Response.RevisedLifetimeCount ) {
        addError( "The RevisedLifetimeCount should be 3x bigger than RevisedMaxKeepAliveCount. RevisedMaxKeepAliveCount=" + Response.RevisedMaxKeepAliveCount + "; RevisedLifetimeCount=" + Response.RevisedLifetimeCount );
        bSucceeded = false;
    }
    return( bSucceeded );
}// function checkCreateSubscriptionValidParameter( Request, Response )