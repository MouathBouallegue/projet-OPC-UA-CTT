/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call EstablishControl with an unauthorized user.
*/

function Test_Err_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ExpectedResults = [new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied )];             
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        // Create Session with UserTokenType Anonymous (expected unauthorized user)
        CU_Variables.SessionThread.End();
        Test.Disconnect();
        if( Test.Connect( { SkipActivateSession: true } ) ) {
            if( ActivateSessionHelper.Execute( {
                Session: Test.Session,
                UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                    Session: Test.Session.Session,
                    UserCredentials: new UserCredentials( { Policy: UserTokenType.Anonymous } )
                } )
            } ) ) {
                
                InstanciateHelpers( { Session: Test.Session } );
                
                for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
                    // Call EstablishControl method with an unauthorized user.
                    if( isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ) {
                        TC_Variables.nothingTested = false;
                        var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], null, undefined, TC_Variables.ExpectedResults );
                    }
                    else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no EstablishControl method. Skipping node." );
                    if( !TC_Variables.Result ) break;
                }
                if( TC_Variables.nothingTested ) {
                    addSkipped( "No ControlGroup exposing EstablishControl method found. Skipping test." );
                    TC_Variables.Result = false;
                }
        
            }
            else {
                addError( "ActivateSession with UserTokenType Anonymous failed. Aborting test." );
                TC_Variables.Result = false;
            }
            Test.Disconnect();
        }
        Test.Connect();
        CU_Variables.SessionThread.Start( { Session: Test.Session } );
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_Err_002 } );