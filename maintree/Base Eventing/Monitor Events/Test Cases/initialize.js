include( "./library/ServiceBased/Helpers.js" );

const CUNAME="Monitor Events"
notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
stopCurrentUnit();

/*if (Test.Connect()) {
    //Define trigger functions for the configured trigger Nodes
    var eventTriggerItems = MonitoredItem.fromSettings(["/Server Test/NodeIds/Events/TriggerNode01", "/Server Test/NodeIds/Events/TriggerNode02"], undefined, Attribute.NodeClass);
    if( !isDefined( eventTriggerItems ) || eventTriggerItems.length === 0 ) { addSkipped( "Not enough event trigger node items configured." ); stopCurrentUnit(); }

    // determine the type of the triggers
    if( !ReadHelper.Execute( { NodesToRead: eventTriggerItems } ) ) { addError( "Unable to read trigger nodes. Aborting test." ); stopCurrentUnit(); }
    for (var i = 0; i < eventTriggerItems.length; i++) {
        eventTriggerItems[i].AttributeId = Attribute.Value;                                   // change the attribute to .Value
        if (eventTriggerItems[i].Value.Value.toInt32() == NodeClass.Variable) {
            ReadHelper.Execute({ NodesToRead: eventTriggerItems[i] });                      // read the value, so that we have it
            eventTriggerItems[i].OriginalValue = eventTriggerItems[i].Value.Value.clone();    // remember the initial value so we can revert to it later
            eventTriggerItems[i].invokeTrigger = function () {
                UaVariant.Increment( { Item: this } );                                 // increment the value
                return (WriteHelper.Execute({ NodesToWrite: this }));                      // write the value to the server
            }
        }
        else if (eventTriggerItems[i].Value.Value.toInt32() == NodeClass.Method) {
            this.parentObject = init_GetMethodParent(init_GetMethodParent(this));
            eventTriggerItems[i].invokeTrigger = function () {
                if (!isDefined(this.parentObject)) {
                    return (CallHelper.Execute({ MethodsToCall: [{ MethodId: this.NodeId, ObjectId: this.parentObject.NodeId }] }));
                }
            }
        }
        else eventTriggerItems[i].invokeTrigger = function () { return (true); }
    }//for i...
    print( "\n\n\n***** CONFORMANCE UNIT '" + CUNAME + "' TEST SCRIPTS STARTING ******\n" );
}
else stopCurrentUnit();*/