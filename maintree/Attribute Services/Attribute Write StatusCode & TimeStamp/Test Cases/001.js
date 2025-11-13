/*  Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Write to a single valid Node a VTQ by passing the Value and Quality only. */

function write582010() {
    var item = scalarNodes[0].clone();
    ReadHelper.Execute( { NodesToRead: item } );
    UaVariant.Increment( { Item: item } );
    item.Value.StatusCode.StatusCode = StatusCode.GoodOverload;
    item.Value.Set = "Value;StatusCode";
    WriteHelper.Execute( { NodesToWrite: item, OperationResults: WriteExpectedResult } );
    if( WriteHelper.Response.Results[0].StatusCode === StatusCode.BadWriteNotSupported ) {
        addSkipped( "Write to StatusCode is not supported. Skipping conformance unit." );
        stopCurrentUnit();
        return( false );
    }
    else VQTsupport = UaVQTSupport.Value | UaVQTSupport.StatusCode;
    return( true );
}

Test.Execute( { Procedure: write582010 } );