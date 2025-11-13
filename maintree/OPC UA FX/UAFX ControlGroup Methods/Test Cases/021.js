/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Call the EstablishControl Method with LockContext parameter set to NULL.
*/

function Test_021() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    TC_Variables.ApplicationUri = Test.Session.Request.ClientDescription.ApplicationUri;
    
    if( CU_Variables.ControlGroupType_Instances.length > 0 ) {
        for( var i=0; i<CU_Variables.ControlGroupType_Instances.length; i++ ) {
            // Call the EstablishControl Method with LockContext parameter set to NULL
            if( isDefined( CU_Variables.ControlGroupType_Instances[i].EstablishControl ) ) {
                TC_Variables.nothingTested = false;
                var callResult = callEstablishControlMethod( CU_Variables.ControlGroupType_Instances[i], null );
                if( callResult.success ) {
                    // LockStatus shall be 0(OK)
                    if( !Assert.Equal( 0, callResult.LockStatus, "Received unexpected result for LockStatus" ) ) TC_Variables.Result = false;
                    // IsControlled flag shall be TRUE
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].IsControlled } ) ) {
                        if( !Assert.Equal( true, CU_Variables.ControlGroupType_Instances[i].IsControlled.Value.Value.toBoolean(), "Received unexpected value for IsControlled flag" ) ) TC_Variables.Result = false;
                    }
                    // LockingClient of ListToBlock and ListToRestrict shall be the ApplicationUri of the Client session
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.LockingClient } ) ) {
                        if( !CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.LockingClient.Value.Value.isEmpty() ) {
                            if( !Assert.Equal( TC_Variables.ApplicationUri, CU_Variables.ControlGroupType_Instances[i].ListToBlock.Lock.LockingClient.Value.Value.toString(), "Received unexpected value for ListToBlock.Lock.LockingClient" ) ) TC_Variables.Result = false;
                        }
                        else {
                            addError( "Value of ListToBlock.Lock.LockingClient of ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' is empty." );
                            TC_Variables.Result = false;
                        }
                    }
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.ControlGroupType_Instances[i].ListToRestrict.Lock.LockingClient } ) ) {
                        if( !CU_Variables.ControlGroupType_Instances[i].ListToRestrict.Lock.LockingClient.Value.Value.isEmpty() ) {
                            if( !Assert.Equal( TC_Variables.ApplicationUri, CU_Variables.ControlGroupType_Instances[i].ListToRestrict.Lock.LockingClient.Value.Value.toString(), "Received unexpected value for ListToRestrict.Lock.LockingClient" ) ) TC_Variables.Result = false;
                        }
                        else {
                            addError( "Value of ListToRestrict.Lock.LockingClient of ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' is empty." );
                            TC_Variables.Result = false;
                        }
                    }
                }
                else {
                    addError( "Calling EstablishControl method on ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' was not successful." );
                    TC_Variables.Result = false;
                    break;
                }
            }
            else addLog( "ControlGroupType instance '" + CU_Variables.ControlGroupType_Instances[i].NodeId + "' has no EstablishControl method. Skipping node." );
            if( !TC_Variables.Result ) break;
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No ControlGroupType instance exposes the EstablishControl method. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No instance of type 'ControlGroupType' found in address space. Skipping test." );
        TC_Variables.result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_021 } );