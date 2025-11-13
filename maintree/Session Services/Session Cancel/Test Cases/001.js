/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Calls Cancel() */

function cancel001() {
    CancelHelper.Execute( { RequestHandle: 1, ServiceResult:  new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNothingToDo ] ) } );
    return( true );
}

Test.Execute( { Procedure: cancel001 } );