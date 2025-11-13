include( "./library/ServiceBased/Helpers.js" );

notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
stopCurrentUnit();
const _CUNAME="Address Space Events";
/*var _ItemsWithEventNotifiers = [];

if( ! Test.Connect() ) {
    addError( "Unable to connect and establish a session");
    stopCurrentUnit();
}
else {
    //Define trigger functions for the configured trigger Nodes
    var eventTriggerItems = MonitoredItem.fromSettings(["/Server Test/NodeIds/Events/TriggerNode01", "/Server Test/NodeIds/Events/TriggerNode02"], undefined, Attribute.NodeClass);
    if (!isDefined(eventTriggerItems) || eventTriggerItems.length === 0) { addSkipped("Not enough event trigger node items configured."); stopCurrentUnit(); }

    // determine the type of the triggers
    if (!ReadHelper.Execute({ NodesToRead: eventTriggerItems })) { addError("Unable to read trigger nodes. Aborting test."); stopCurrentUnit(); }
    for (var i = 0; i < eventTriggerItems.length; i++) {
        eventTriggerItems[i].AttributeId = Attribute.Value;                                   // change the attribute to .Value
        if (eventTriggerItems[i].Value.Value.toInt32() == NodeClass.Variable) {
            ReadHelper.Execute({ NodesToRead: eventTriggerItems[i] });                      // read the value, so that we have it
            eventTriggerItems[i].OriginalValue = eventTriggerItems[i].Value.Value.clone();    // remember the initial value so we can revert to it later
            eventTriggerItems[i].invokeTrigger = function () {
                UaVariant.Increment( { Item: this } );                                 // increment the value
                if (WriteHelper.Execute({ NodesToWrite: this })) {                     // write the value to the server
                    addLog("Trigger has been writen successful.");
                }
            }
        }
        else if (eventTriggerItems[i].Value.Value.toInt32() == NodeClass.Method) {
            this.parentObject = init_GetMethodParent(init_GetMethodParent(this));
            eventTriggerItems[i].invokeTrigger = function () {
                if (!isDefined(this.parentObject)) {
                    if (CallHelper.Execute({ MethodsToCall: [{ MethodId: this.NodeId, ObjectId: this.parentObject.NodeId }] })) {
                        break;
                    }
                }
            }
        }
        else eventTriggerItems[i].invokeTrigger = function () { return (true); }
    }//for i...
    print( "\n\n\n***** CONFORMANCE UNIT '" + _CUNAME + "' TESTING BEGINS ******\n" );
} //activateSession */