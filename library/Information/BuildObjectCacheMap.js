include( "./library/Base/sessionCreator.js" );
include( "./library/Utilities/PerformanceTimer/PerformanceTimer.js" );

function BuildCacheMapService () {
    this.Name = "BuildCacheMap";
    this.Request = null;
    this.Response = null;
    this.UaStatus = null;

    this.Execute = function ( args ) {
        /* Parameters
            All normal parameters for SessionCreator.Create, however it is beneficial to not create a session
                because this function prefers to create and destroy its own session
            
            UserCredentials -  UaExtensionObject containing desired UserCredentials
                If UserCredentials are found, the created session will not be activated until the user token is created.
        */

        var timer = new PerformanceTimer();

        this.Request = new UaIsSubTypeOfTypeRequest();
        this.Response = new UaIsSubTypeOfTypeResponse();
        this.Request.ItemNodeId[ 0 ] = new UaNodeId( Identifier.RootFolder );
        this.Request.TypeNodeId[ 0 ] = new UaNodeId( Identifier.FolderType );

        var keepGoing = true;
        var loopCounter = 0;
        var result = false;

        while ( keepGoing ) {

            var copyArgs = null;

            if ( isDefined( args ) ) {
                copyArgs = JSON.parse( JSON.stringify( args ) );
            }

            var sessionInformation = this.Connect( copyArgs );

            if ( sessionInformation.result === false ) {
                addError( "Could not connect to the UA Server. Aborting " + this.Name + " attempt " + loopCounter );
                stopCurrentUnit();
                keepGoing = false;
            } else {
                loopCounter++;
                print( "Calling " + this.Name + " Loop Count " + loopCounter );

                var session = isDefined( sessionInformation.session.Session ) ?
                    sessionInformation.session.Session : sessionInformation.session;

                var status = session.isSubTypeOfTypeCached( this.Request, this.Response );

                CheckUserStop();

                if ( status.isGood() ) {
                    result = true;
                    keepGoing = false;
                } else if ( status.StatusCode == StatusCode.BadUnexpectedError ) {
                    print( "Unable to build Object Cache Map.  Maximum Nodes Per Browse was reduced to zero, Unable to continue" );
                    keepGoing = false;
                } else if ( status.StatusCode == StatusCode.BadLicenseExpired || 
                    status.StatusCode == StatusCode.BadLicenseLimitsExceeded ||
                    status.StatusCode == StatusCode.BadLicenseNotAvailable  ){
                    print( "Unable to build Object Cache Map.  There is a server licensing problem. Unable to continue" );
                    keepGoing = false;
                }else{
                    print( "Unexpected error during build of Object Cache Map. Retrying Received:" + status.StatusCode );
                }
            }
            SessionCreator.Disconnect( sessionInformation );
        }

        if ( !result ) {
            addError( this.Name + " failed" );
        }

        if ( objectModelMaxNodesExceeded ){
            addWarning( this.Name + " Maximum Nodes Exceeded.  Increase MaxNodesInAddressSpaceCache setting, or add specific nodes not to include" );
        }
        if ( objectModelMissingNodeCount > 0 ){
            addError( this.Name + " Encountered " + objectModelMissingNodeCount + " Unknown NodeIds.  Address Model is broken" );
        }

        print( "Time in " + this.Name + " = " + timer.TakeReadingSeconds() + " seconds" );

        return ( result );
    }

    this.Connect = function ( args ) {

        var sessionInformation = null;

        if ( isDefined( args ) && isDefined( args.UserCredentials ) ) {
            args.SkipActivateSession = true;
            sessionInformation = SessionCreator.Connect( args );

            if ( sessionInformation.result === true ) {
                args.Session = sessionInformation.session;
                args.UserIdentityToken = UaUserIdentityToken.FromUserCredentials( {
                    Session: sessionInformation.session,
                    UserCredentials: args.UserCredentials
                } );

                var activateResult = ActivateSessionHelper.Execute( args );

                if ( !activateResult ) {
                    sessionInformation.result = false;
                }
            }
        } else {
            sessionInformation = SessionCreator.Connect( args );
        }

        return sessionInformation;
    }

    this.Test = function () {

        if ( this.Execute() &&
            this.Execute( {
                UserCredentials: UserCredentials.createFromSettings(
                    PresetCredentials.AccessGranted1,
                    UserTokenType.UserName )
            } ) ) {
            addLog( "Initial Tests Passed - Next test should fail and kill the test" );
        }

        this.Execute( {
            UserCredentials: new UserCredentials( {
                Policy: UserTokenType.UserName,
                UserName: readSetting( "/Server Test/Session/LoginNameGranted1" ),
                Password: ""
            } )
        } );
    }
}




