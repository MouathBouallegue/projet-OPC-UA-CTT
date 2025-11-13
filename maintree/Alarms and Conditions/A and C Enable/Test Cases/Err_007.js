/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.org

    Description: 
        Disable a condition instance that the user does not have access to.
    
    Requirements:
        Condition has access-rights preventing the user access.
    
    Expectation:
        Server rejects request - BadUserAccessDenied

    How this test works:
        Manual Test
        
*/

function Err_007 () {

    notImplemented( "This is a manual test case and requires multiple users with differing access rights" );

    return true;
}

Test.Execute( { Procedure: Err_007 } );
