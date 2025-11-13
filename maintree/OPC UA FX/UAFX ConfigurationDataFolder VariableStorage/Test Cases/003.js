/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check that variables stored with SetStoredVariables are available after
                 power cycle of the product.
         Step 1: Browse the ConfigurationData folder for any volatile (AccessLevelEx NonVolatile
                 bit = FALSE) variables with an Organizes reference.
         Step 2: Read the Values of the Variables from Step 1.
         Step 3: Call the SetStoredVariables Method and provide the  NodeId of the Variables
                 from Step 1 as input argument VariablesToStore.
         Step 4: Power cycle the product.
         Step 5: Read the ConfigurationData and verify that the values match with the values
                 read in Step 2.
         Step 6: Repeat previous steps 1-5 with the maximum number of supported VariablesToStore.
*/

function Test_003() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is intended to be executed manually" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );