/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Verify that RevisionCounter increments if the configuration data within an Asset has been modified.
    Step 1: Check if any configuration data within the Asset can be modified
    Step 2: If yes, read out the Attribute Value of the Property RevisionCounter
    Step 3: Modify the configuration data
    Step 4: Read the Attribute Value of RevisionCounter again and compare with the value from Step 2
*/

function test() {
    notImplemented( "This test case is intended to be executed manually." );
    return ( true );
}

Test.Execute( { Procedure: test } );