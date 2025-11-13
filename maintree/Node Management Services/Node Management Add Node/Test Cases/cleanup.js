print( "\t**** Node Management Add Node END ****" );
Test.Disconnect();
print( Test.Stats() );
Test.ResetStats();
Test.PostTestFunctions = [];
AddNodeIdsHelper.PostServiceCallFunction = null;
UaDateTime.CountDown( { Msecs: 6000, Message: "Add Node CU wait 6-seconds" } );