print( "\t**** Node Management Delete Node END ****" );
Test.Disconnect();
print( Test.Stats() );
Test.ResetStats();
Test.PostTestFunctions = [];
AddNodeIdsHelper.PostServiceCallFunction = null;
UaDateTime.CountDown( { Msecs: 6000, Message: "Delete Node CU wait 6-seconds" } );