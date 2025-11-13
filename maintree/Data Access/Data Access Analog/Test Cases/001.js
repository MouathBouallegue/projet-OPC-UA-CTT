/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Read value attribute of an analog node of each of the following data type: 
        Double, Float, Int16, UInt16, Int32, UInt32, Int64, UInt64. Perform each read separately. */

function read613001() {
    // Analog type nodes array
    var items = MonitoredItem.GetRequiredNodes( { Settings: Settings.ServerTest.NodeIds.Static.DAProfile.AnalogItemType.NumericSettings, Number: maxMonitoredItems } );
    // Check that we are covering all the data types as required by this test
    // check the data-types of the results 
    for( var i=0; i<items.length; i++ ) {
        ReadHelper.Execute( { NodesToRead: items[i] } );
        var dt = UaNodeId.GuessType( items[i].NodeSetting );
        Assert.Equal( dt, items[i].Value.Value.DataType,
                "Read() returned a value that was not of the expected data-type.",
                "Read() validated Analog node of data-type: " + BuiltInType.toString( dt ) );
    }//for i
    return( true );
}// function read613001() 

Test.Execute( { Procedure: read613001 } );