/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Browse the ServerCapabilities Object and check that the MaxInactiveLockTime
                 Property is exposed.
*/

function Test_016() {
    if( !isDefined( CU_Variables.Test.ServerCapabilities.MaxInactiveLockTime ) ) {
        addError( "ServerCapabilities does not expose MaxInactiveLockTime" );
        return( false );
    }
    return( true );
}

Test.Execute( { Procedure: Test_016 } );