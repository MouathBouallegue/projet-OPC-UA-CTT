include("./library/Information/BuildLocalCacheMap.js");

/**
 * Object is to retrieve the Server Model map from the CTT.
 * This provides the ability to search the model for any information desired.
 */
function ObjectModelHelper() {

    this.Name = "ObjectModelHelper";

    this.rootNodeId = new UaNodeId(Identifier.RootFolder);
    this.ServerNodeIdString = new UaNodeId(Identifier.Server).toString();

    /**
     * Build and retrieve the Searchable Object Model
     * @returns Searchable Object Model
     */
    this.GetObjectModel = function () {

        if (!isDefined(Test.ObjectModel) || Test.ObjectModel.length == 0) {

            var model = new BuildLocalCacheMapService();

            // This builds the model.
            var map = model.GetModelMap();

            var objectModel = getObjectModel();

            // check check check
            if ( !isDefined(objectModel)){
                addError("Unable to build Object Model - Unable to proceed");
                stopCurrentUnit();
            }else{
                Test.ObjectModel = objectModel;
            }
        }

        return Test.ObjectModel;
    }

    /**
     * Finds all objects that meet the search criteria.  
     * @param {NodesToSearch} List of NodeIds in string format.  Can be empty, which searches the entire object model
     * @param {NodeClass} Look for specific NodeClass.
     * @param {NodeClasses} Look for specific NodeClasses.  Can be empty, which searches the entire object model.
     * Can be multiple node classes, in which case, will return both types requested.
     * @param {AttributeValues} List of Attributes to filter by.  
     * If there are multiple attribute values, then both attributes require equality.
     * @param {ReferenceDescriptions} List of ReferenceDescriptions to filter by.  
     * If there are multiple reference descriptions defined, then both reference descriptions require equality.
     * For a ReferenceDescription, only partial parameters are required.  
     * For example IsForward = true, and BrowseName = "MyPointName"
     * @returns A list of Node Id Strings that meet the criteria
     */
    this.FindEntries = function (args) {

        if (!isDefined(args.NodesToSearch)) args.NodesToSearch = [];

        var nodeClasses = new UaUInt32s();

        if (isDefined(args.NodeClasses) && isDefined(args.NodeClasses.length)) {
            var actualIndex = 0;
            for (var index = 0; index < args.NodeClasses.length; index++) {
                var nodeClass = args.NodeClasses[index];
                if (this.IsNumber(nodeClass)) {
                    nodeClasses[actualIndex] = nodeClass;
                    actualIndex++;
                }
            }
        } else if (isDefined(args.NodeClass)) {
            if (this.IsNumber(args.NodeClass)) {
                nodeClasses[0] = args.NodeClass;
            }
        }

        // UaAttributeValues must be passed in, as there is a lot of setup
        if (!isDefined(args.AttributeValues)) args.AttributeValues = new UaAttributeValues();
        // UaReferenceDescriptions must be passed in, as there is a lot of setup
        if (!isDefined(args.ReferenceDescriptions)) args.ReferenceDescriptions = new UaReferenceDescriptions();

        var objectModel = this.GetObjectModel();
        if ( isDefined(objectModel)){
            return objectModel.findEntries(
                args.NodesToSearch,
                nodeClasses,
                args.AttributeValues,
                args.ReferenceDescriptions);
        }else{
            return [];
        }
    }

    /**
     * Finds Reference Descriptions for specified nodeIdString that meet the search criteria.  
     * @param {Search} NodeId in string format.
     * @param {SearchDefinitions} UaReferenceDescriptions object that contains the definitions to search for.  
     * @returns UaReferenceDescriptions for the search criteria.  There will be 
     * one returned ReferenceDescription for each SearchDefinition.
     */
    this.FindReferences = function (args) {
        if (!isDefined(args)) { return new UaReferenceDescriptions(); }
        args.Multiple = false;
        return this.FindReferencesInternal(args);
    }


    /**
     * Finds Reference Descriptions for specified nodeIdString that meet the search criteria.  
     * @param {Search} NodeId in string format.
     * @param {SearchDefinitions} UaReferenceDescriptions object that contains the definitions to search for.
     * There can be only one search definition  
     * @returns UaReferenceDescriptions for the search criteria.  There could 0 - many results.
     */
    this.FindAllReferences = function (args) {
        if (!isDefined(args)) { return new UaReferenceDescriptions(); }
        args.Multiple = true;
        return this.FindReferencesInternal(args);
    }

    /**
     * Finds Reference Descriptions for specified nodeIdString that meet the search criteria.  
     * @param {Search} NodeId in string format.
     * @param {Multiple} Look for multiple ReferenceDescriptions.  If True, there can be only one Search Definition.
     * if False, there can be multiple Search Definitions
     * @param {SearchDefinitions} UaReferenceDescriptions object that contains the definitions to search for.
     * @returns UaReferenceDescriptions for the search criteria.  If Multiple is false, there will be 
     * one returned ReferenceDescription for each SearchDefinition.  If Multiple is true, there could 0 - many results.
     */
    this.FindReferencesInternal = function (args) {
        var results = new UaReferenceDescriptions();

        if (isDefined(args) && isDefined(args.Search) && this.IsString(args.Search)) {
            if (isDefined(args.Multiple)) {
                if (isDefined(args.SearchDefinitions)) {
                    var objectModel = this.GetObjectModel();
                    if ( isDefined(objectModel)){
                        objectModel.findReferenceDescriptions(args.Search,
                            args.Multiple,
                            args.SearchDefinitions,
                            results);
                    }
                } else {
                    addError("Missing SearchDefinitions parameter for findReferenceDescriptions");
                }
            } else {
                addError("Missing Multiple parameter for findReferenceDescriptions");
            }
        } else {
            addError("Invalid Use of Search Parameter for findReferenceDescriptions");
        }

        return results;
    }

    /**
     * Get the object with Attributes and ReferenceDescriptions
     * @param {string} NodeId in string format.
     * @returns Object containing Attributes and ReferenceDescriptions
     */
    this.GetObject = function (nodeIdString) {
        var objectModel = this.GetObjectModel();
        if ( isDefined(objectModel)){
            return objectModel.find(nodeIdString);
        }
    }

    this.IsNumber = function (check) {
        return (typeof (check) == "number");
    }

    this.IsString = function (check) {
        return (typeof (check) == "string");
    }

    this.Test = function () {

        // Common Empty Variables
        var emptyNodeClasses = [];
        var emptyAttributeValues = new UaAttributeValues();
        var emptyReferenceDescriptions = new UaReferenceDescriptions();

        var objectModel = this.GetObjectModel();
        if ( !isDefined(objectModel)){
            addError("Unable To GetObjectModel");
            return;
        }
        
        {
            var viewKeysOne = this.FindEntries({ NodeClass: NodeClass.View });
            var viewKeysTwo = this.FindEntries({ NodeClasses: [NodeClass.View] });

            // For Typical server - not guaranteed to pass
            Assert.GreaterThan(0, viewKeysOne.length, "Expected at least one View (one)");
            Assert.GreaterThan(0, viewKeysTwo.length, "Expected at least one View (two)");
        }

        {
            // Find multiple node Classes
            var variableKeys = this.GetObjectModel().getNodeClassKeys(NodeClass.Variable);
            var methodKeys = this.GetObjectModel().getNodeClassKeys(NodeClass.Method);
            var objectTypeKeys = this.GetObjectModel().getNodeClassKeys(NodeClass.ObjectType);
            var totalToCheck = variableKeys.length + methodKeys.length + objectTypeKeys.length;

            var checkAgainstTotalToCheck = this.FindEntries({
                NodeClasses: [
                    NodeClass.Variable,
                    NodeClass.Method,
                    NodeClass.ObjectType]
            });

            Assert.Equal(totalToCheck, checkAgainstTotalToCheck.length);
            Assert.GreaterThan(0, checkAgainstTotalToCheck.length);
        }

        {
            // These make the assumption that there is only one node called Server
            // Find Server Object by Only BrowseName Attribute
            var serverObjectAttributeValues = new UaAttributeValues();
            var serverObjectAttributeValue = new UaAttributeValue();
            var serverObjectAttributeVariant = new UaVariant();
            var serverObjectName = new UaQualifiedName();
            serverObjectName.Name = "Server";
            serverObjectName.NamespaceIndex = 0;
            serverObjectAttributeVariant.setQualifiedName(serverObjectName);
            serverObjectAttributeValue.Value = serverObjectAttributeVariant;
            serverObjectAttributeValue.AttributeId = Attribute.BrowseName;
            serverObjectAttributeValues[0] = serverObjectAttributeValue;

            var result = this.FindEntries({
                AttributeValues: serverObjectAttributeValues
            });

            print(result);
            Assert.True(this.FindServer(result));

            // Find Server Object by Only BrowseName Attribute, and looking for NodeClass Object
            var expectOneResult = this.FindEntries({
                NodeClass: NodeClass.Object,
                AttributeValues: serverObjectAttributeValues
            });

            print(expectOneResult);
            Assert.True(this.FindServer(expectOneResult));

            // Find Server Object by Only BrowseName Attribute, and looking for NodeClass Variable
            var expectNoneResult = this.FindEntries({
                NodeClass: NodeClass.Variable,
                AttributeValues: serverObjectAttributeValues
            });

            print(expectNoneResult);
            Assert.False(this.FindServer(expectNoneResult));
        }

        {
            // Find Server Object by EventNotifier Attribute
            // This needs to be a masked search
            var eventNotifierAttributeValues = new UaAttributeValues();
            var eventNotifierAttributeValue = new UaAttributeValue();
            var eventNotifierAttributeVariant = new UaVariant();
            eventNotifierAttributeVariant.setByte(EventNotifier.SubscribeToEvents);
            eventNotifierAttributeValue.Value = eventNotifierAttributeVariant;
            eventNotifierAttributeValue.AttributeId = Attribute.EventNotifier;
            eventNotifierAttributeValues[0] = eventNotifierAttributeValue;

            var notifiers = this.FindEntries({
                AttributeValues: eventNotifierAttributeValues
            });

            print("Searching for SubscribeToEvents - Should be quite a few - including the ones that have HistoryRead - " + notifiers.length);
            notifiers.forEach(function(notifier){print(notifier);});
            var objectKeys = this.GetObjectModel().getNodeClassKeys(NodeClass.Object);
            print( "Number of objects in server " + objectKeys.length);
            var subscribeToEventsCount = notifiers.length;


            Assert.True(this.FindServer(notifiers));

            eventNotifierAttributeVariant.setByte(EventNotifier.SubscribeToEvents | EventNotifier.HistoryRead);
            eventNotifierAttributeValue.Value = eventNotifierAttributeVariant;

            var checkMask = this.FindEntries({
                AttributeValues: eventNotifierAttributeValues
            });

            print("Searching for SubscribeToEvents and HistoryRead - " + checkMask.length);
            checkMask.forEach(function(notifier){print(notifier);});
            var subscribeToEventsAndHistoryReadCount = checkMask.length;

            Assert.False(this.FindServer(checkMask));

            // Reverse the mask
            eventNotifierAttributeValue.MaskControl = false;

            var checkReverseMask = this.FindEntries({
                AttributeValues: eventNotifierAttributeValues
            });

            print("Searching for for Not SubscribeToEvents and Not HistoryRead - Find All other Objects, no server, count " + checkReverseMask.length);
            Assert.Equal(objectKeys.length - subscribeToEventsCount, checkReverseMask.length);

            Assert.False(this.FindServer(checkReverseMask));

            // Now just reverse check the History Read.  Should be the same as SubscribeToEvents
            eventNotifierAttributeVariant.setByte(EventNotifier.HistoryRead);
            eventNotifierAttributeValue.Value = eventNotifierAttributeVariant;

            var reverseMaskFind = this.FindEntries({
                AttributeValues: eventNotifierAttributeValues
            });

            print("Searching for for Not HistoryRead - Find All other Objects, including server, count " + reverseMaskFind.length);
            Assert.Equal(objectKeys.length - subscribeToEventsAndHistoryReadCount, reverseMaskFind.length);

            Assert.True(this.FindServer(reverseMaskFind));
        }

        {
            // Find Server object by looking for Auditing and NamespaceArray ReferenceDescriptions
            var serverReferenceDescriptions = new UaReferenceDescriptions();
            var auditingReferenceDescription = new UaReferenceDescription();
            auditingReferenceDescription.IsForward = true;
            auditingReferenceDescription.ReferenceTypeId = new UaNodeId(Identifier.HasProperty);
            var auditingBrowseName = new UaQualifiedName();
            auditingBrowseName.Name = "Auditing";
            auditingBrowseName.NamespaceIndex = 0;
            auditingReferenceDescription.BrowseName = auditingBrowseName;
            serverReferenceDescriptions[0] = auditingReferenceDescription;

            var namespaceArrayReferenceDescription = new UaReferenceDescription();
            namespaceArrayReferenceDescription.IsForward = true;
            namespaceArrayReferenceDescription.ReferenceTypeId = new UaNodeId(Identifier.HasProperty);
            var namespaceArrayBrowseName = new UaQualifiedName();
            namespaceArrayBrowseName.Name = "NamespaceArray";
            namespaceArrayBrowseName.NamespaceIndex = 0;
            namespaceArrayReferenceDescription.BrowseName = namespaceArrayBrowseName;
            serverReferenceDescriptions[1] = namespaceArrayReferenceDescription;

            var result = this.FindEntries({
                ReferenceDescriptions: serverReferenceDescriptions
            });

            print(result);

            Assert.True(this.FindServer(result));

            // Find Server Auditing and NamespaceArray by ReferenceDescriptions

            var findResults = this.FindReferences({
                Search: this.ServerNodeIdString,
                SearchDefinitions: serverReferenceDescriptions
            });

            Assert.Equal(2, findResults.length);
            if (findResults.length == 2) {
                print(findResults[0].DisplayName.Text);
                Assert.Equal("Auditing", findResults[0].DisplayName.Text);
                print(findResults[1].DisplayName.Text);
                Assert.Equal("NamespaceArray", findResults[1].DisplayName.Text);
            }

            // Change the name, should not find anything
            namespaceArrayBrowseName.Name = "NamespaceArrays";
            namespaceArrayReferenceDescription.BrowseName = namespaceArrayBrowseName;
            serverReferenceDescriptions[1] = namespaceArrayReferenceDescription;

            var noResult = this.FindEntries({
                ReferenceDescriptions: serverReferenceDescriptions
            });

            print(noResult);

            Assert.False(this.FindServer(noResult));

            // Just find one of the search definitions - should find auditing
            var findOneResult = this.FindReferences({
                Search: this.ServerNodeIdString,
                SearchDefinitions: serverReferenceDescriptions
            });

            Assert.Equal(2, findOneResult.length);
            if (findOneResult.length == 2) {
                print(findOneResult[0].DisplayName.Text);
                Assert.Equal("Auditing", findOneResult[0].DisplayName.Text);
                print(findOneResult[1].DisplayName.Text);
                Assert.Equal("", findOneResult[1].DisplayName.Text);
            }
        }

        {
            // Find All Server ReferenceDescriptions (HasProperty)
            var hasPropertyReferenceDescriptions = new UaReferenceDescriptions();
            var hasPropertyReferenceDescription = new UaReferenceDescription();
            hasPropertyReferenceDescription.IsForward = true;
            hasPropertyReferenceDescription.ReferenceTypeId = new UaNodeId(Identifier.HasProperty);
            hasPropertyReferenceDescriptions[0] = hasPropertyReferenceDescription;

            var findPropertyResults = this.FindAllReferences({
                Search: this.ServerNodeIdString,
                SearchDefinitions: hasPropertyReferenceDescriptions
            });

            Assert.GreaterThan(0,findPropertyResults.length);
            for (var index = 0; index < findPropertyResults.length; index++){
                print("Found Server Property " + findPropertyResults[index].NodeId.NodeId.toString() + " - " + 
                    findPropertyResults[index].BrowseName.Name);
            }

            // Find All Server ReferenceDescriptions (HasComponent)
            var hasComponentReferenceDescriptions = new UaReferenceDescriptions();
            var hasComponentReferenceDescription = new UaReferenceDescription();
            hasComponentReferenceDescription.IsForward = true;
            hasComponentReferenceDescription.ReferenceTypeId = new UaNodeId(Identifier.HasComponent);
            hasComponentReferenceDescriptions[0] = hasComponentReferenceDescription;

            var findComponentResults = this.FindAllReferences({
                Search: this.ServerNodeIdString,
                SearchDefinitions: hasComponentReferenceDescriptions
            });

            Assert.GreaterThan(0,findComponentResults.length);
            for (var index = 0; index < findComponentResults.length; index++){
                print("Found Server Component " + findComponentResults[index].NodeId.NodeId.toString() + " - " + 
                findComponentResults[index].BrowseName.Name);
            }

            // Find all with multiple referencedescriptions
            var multipleReferenceDescriptions = new UaReferenceDescriptions();
            multipleReferenceDescriptions[0] = hasPropertyReferenceDescription;
            multipleReferenceDescriptions[1] = hasComponentReferenceDescription;


            var findMultipleResults = this.FindAllReferences({
                Search: this.ServerNodeIdString,
                SearchDefinitions: multipleReferenceDescriptions
            });

            Assert.Equal(0,findMultipleResults.length);
        }
    }

    this.FindServer = function (results) {
        var found = false;
        if (isDefined(results) && isDefined(results.length)) {
            for (var index = 0; index < results.length; index++) {
                if (results[index] == this.ServerNodeIdString) {
                    found = true;
                    break;
                }
            }
        }
        return found;
    }
}




