/*    This class object is responsible for calling the Read() service and for also
      performing any validation etc. This is a quick-use class. */

function ReadService( args ) {
    this.Name = "Read";
    this.Session = null;
    this.Request = null;
    this.Response = null;
    this.readSuccess = false;
    this.settingNames = [];
    this.UaStatus = null;
    this.CallCount = 0;

    if( !isDefined( args ) ) throw( this.Name + " CTOR, arguments not specified." );
    if( !isDefined( args.Session ) ) throw( this.Name + " CTOR, session not specified." );
    else this.Session = args.Session;

    /**
     * Reads values.
     * 
     * @param {object} args An object containing all parameter
     * @param {MonitoredItem[]} args.NodesToRead - An array of 'MonitoredItem' objects to read.
     * @param {Number} args.TimestampsToReturn - (Optional) TimestampsToReturn enum.
     * @param {Number} args.MaxAge - (Optional) maxAge value.
     * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) An ExpectedAndAcceptedResults object.
     * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) An array of ExpectedAndAcceptedResults objects.
     * @param {boolean} args.SuppressMessaging - (Optional) Do not log messages
     * @param {boolean} args.SuppressWarnings - (Optional) Do not log warnings
     * @param {function} args.PreHook - (Optional) Function to invoke immediately before the Service call
     * @param {function} args.PostHook - (Optional) Function to invoke immediately after the Server call
     * @param {boolean} args.ProhibitSplitting - (Optional) Forces operations to be executed in one call
     *
     * @returns {boolean} True if call was successful, false otherwise
     */          
    this.Execute = function (args) {
        if (!isDefined(args.ProhibitSplitting)) args.ProhibitSplitting = false;
        if (!isDefined(args)) throw ("Read.js::Execute() args not specified.");
        if (!isDefined(args.NodesToRead)) args.NodesToRead = [];
        if (!isDefined(args.NodesToRead.length)) args.NodesToRead = [args.NodesToRead];
        var result = true;
        var MaxNodesPerRead = 65535;
        var NumberOfAlreadyReadValues = 0;
        var AllNodesToRead = args.NodesToRead;

        if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   var AllOperationResults = args.OperationResults;
        if (isDefined(args.SuppressBadValueStatus) && !isDefined(args.SuppressBadValueStatus.length)) args.SuppressBadValueStatus = [args.SuppressBadValueStatus];
        if (isDefined(args.SuppressBadValueStatus) && isDefined(args.SuppressBadValueStatus.length)) {
            while (args.SuppressBadValueStatus.length < AllNodesToRead.length) {
                if (isDefined(args.SuppressBadValueStatus[0])) {
                    args.SuppressBadValueStatus.push(args.SuppressBadValueStatus[0]);
                }
                else {
                    args.SuppressBadValueStatus.push(false);
                }
            }
            var AllSuppressBadValueStatus = args.SuppressBadValueStatus;
        }
        if (gServerCapabilities.OperationLimits !== null && gServerCapabilities.OperationLimits !== undefined) {
            if (gServerCapabilities.OperationLimits.MaxNodesPerRead != 0) MaxNodesPerRead = gServerCapabilities.OperationLimits.MaxNodesPerRead;
        }
        if ((MaxNodesPerRead < args.NodesToRead.length) && (args.ProhibitSplitting == false)) {
            if( isDefined( args.PreHook ) ) args.PreHook();
            args.SkipHooks = true;
            addLog("=== Read.Execute > Exceeding the limit MaxNodesPerRead on the server, splitting the read into multiple Requests.");
            // temporary variables to collect and reassemble the split requests and responses
            var tempNodesToRead = new UaReadValueIds();
            var tempResults = new UaDataValues();
            while (NumberOfAlreadyReadValues < AllNodesToRead.length) {
                var innerResult = true;
                var currentListOfNodes = [];
                var currentListOfOperationResults = [];
                var currentListOfSuppressBadValueStatus = [];
                for (var i = 0; (i < MaxNodesPerRead) && (AllNodesToRead.length > NumberOfAlreadyReadValues + i); i++) {
                    currentListOfNodes.push(AllNodesToRead[NumberOfAlreadyReadValues + i]);
                    if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length))   currentListOfOperationResults.push(AllOperationResults[NumberOfAlreadyReadValues + i]);
                    if( isDefined( args.SuppressBadValueStatus ) && isDefined( args.SuppressBadValueStatus.length ) ) currentListOfSuppressBadValueStatus.push( AllSuppressBadValueStatus[NumberOfAlreadyReadValues + i] );
                }
                if (currentListOfNodes.length == 0) break;
                args.NodesToRead = currentListOfNodes;
                if (isDefined(args.OperationResults) && isDefined(args.OperationResults.length)) args.OperationResults = currentListOfOperationResults;
                if( isDefined( args.SuppressBadValueStatus ) && isDefined( args.SuppressBadValueStatus.length ) ) args.SuppressBadValueStatus = currentListOfSuppressBadValueStatus;
                innerResult = this.ExecuteExt(args);
                result = result && innerResult ? true : false;  // validation failed, so override *this* result
                NumberOfAlreadyReadValues += currentListOfNodes.length;
                // append the split requests NodesToRead and the responses Results to a temporary variable
                var tempNodesToReadLength = tempNodesToRead.length;
                var tempResultsLength = tempResults.length;
                for( var i=0; i < this.Request.NodesToRead.length; i++ ) tempNodesToRead[tempNodesToReadLength+i] = this.Request.NodesToRead[i].clone();
                for( var i=0; i < this.Response.Results.length; i++ ) tempResults[tempResultsLength+i] = this.Response.Results[i].clone();
            }
            // set the reassembled requests NodesToRead and responses Results
            this.Request.NodesToRead = new UaReadValueIds(tempNodesToRead.length);
            this.Response.Results = new UaDataValues(tempResults.length);
            for( var i=0; i < tempNodesToRead.length; i++ ) this.Request.NodesToRead[i] = tempNodesToRead[i].clone();
            for( var i=0; i < tempResults.length; i++ ) this.Response.Results[i] = tempResults[i].clone();
            
            CheckResourceError();
            if( isDefined( args.PostHook ) ) args.PostHook();
            CheckUserStop();
        }
        else {
            return (this.ExecuteExt(args));
        }
        return (result);
    }
    
    /* Reads values.
          Parameters are: 
              NodesToRead        = an array of 'MonitoredItem' objects, to read.
              TimestampsToReturn = TimestampsToReturn enum.
              MaxAge             = maxAge value.
              ServiceResult      = an array of ExpectedAndAcceptedErrors objects.
              OperationResults   = an array of ExpectedAndAcceptedErrors objects.
              SuppressMessaging  = do not log messages
              SuppressWarnings   = do not long warnings
              PreHook            = function to invoke immediately before the Service call
              PostHook           = function to invoke immediately after the Server call
              */
    this.ExecuteExt = function( args ) {
        // parameter validation
        if( !isDefined( args ) ) throw( "Read.js::Execute() args not specified." );
        if( !isDefined( args.NodesToRead ) ) args.NodesToRead = [];
        if( !isDefined( args.NodesToRead.length ) ) args.NodesToRead = [ args.NodesToRead ];
        if( !isDefined( args.TimestampsToReturn ) ) args.TimestampsToReturn = TimestampsToReturn.Both;
        if( !isDefined( args.MaxAge ) ) args.MaxAge = 0;
        if( isDefined ( args.OperationResults ) && !isDefined( args.OperationResults.length ) ) args.OperationResults = [ args.OperationResults ];
        if( isDefined ( args.SuppressMessages ) ) args.SuppressMessaging = args.SuppressMessages;
        if( !isDefined( args.SuppressMessaging ) ) args.SuppressMessaging = false;
        if( !isDefined( args.SuppressWarnings ) )  args.SuppressWarnings = false;
        if( isDefined( args.SuppressBadValueStatus ) && !isDefined( args.SuppressBadValueStatus.length ) ) args.SuppressBadValueStatus = [args.SuppressBadValueStatus];
        
        ServiceRegister.Register( { Service: ServiceRegister.UaService( { Name: this.Name, Available: true, Tested: true } ) } );

        var result = true;

        // define the write headers
        this.Request  = new UaReadRequest();
        this.Response = new UaReadResponse();
        var session = isDefined( this.Session.Session )? this.Session.Session : this.Session;
        this.Request.RequestHeader = UaRequestHeader.New( { Session: session, ReturnDiagnostics: args.ReturnDiagnostics } );
        this.Request.TimestampsToReturn = args.TimestampsToReturn;
        this.Request.MaxAge = args.MaxAge;

        // specify the items and values to write
        var message = "";
        for( var m=0; m<args.NodesToRead.length; m++ ) {
            this.Request.NodesToRead[m].NodeId = args.NodesToRead[m].NodeId;
            this.Request.NodesToRead[m].AttributeId = args.NodesToRead[m].AttributeId;
            this.Request.NodesToRead[m].IndexRange  = args.NodesToRead[m].IndexRange;
            // encoding?
            if( isDefined( args.NodesToRead[m].DataEncoding ) ) {
                this.Request.NodesToRead[m].DataEncoding = args.NodesToRead[m].DataEncoding;
            }
        }// for m...

        // update the timestamp in the RequestHeader before sending it out
        this.Request.RequestHeader.Timestamp = UaDateTime.utcNow();

        // issue the write while processing any hooks before/after
        if( isDefined( args.PreHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PreHook();
        if( isDefined( this.Session.Session ) ) this.UaStatus = this.Session.Session.read( this.Request, this.Response );
        else this.UaStatus = session.read( this.Request, this.Response );
        CheckResourceError();
        if( isDefined( args.PostHook ) && ( !isDefined( args.SkipHooks ) || !args.SkipHooks ) ) args.PostHook();
        CheckUserStop();
        // check result
        this.readSuccess = this.UaStatus.isGood();
        if( this.UaStatus.isGood() ) {
            // check the response header is good
            result = UaResponseHeader.IsValid( { Service: this, ServiceResult: args.ServiceResult, SuppressMessaging: args.SuppressMessaging, SuppressErrors: args.SuppressErrors, ServiceInfo: "NodesToRead #" + this.Request.NodesToRead.length + "; TimestampsToReturn: " + this.Request.TimestampsToReturn + "; MaxAge: " + this.Request.MaxAge } );
            if( result && this.Response.ResponseHeader.ServiceResult.isGood() ) {
                this.settingNames = MonitoredItem.GetSettingNames( args.NodesToRead );
                if( isDefined( args.OperationResults ) ) result = checkReadError( this.Request, this.Response, args.OperationResults, this.settingNames, args.SuppressMessaging, args.SuppressWarnings, args.SuppressBadValueStatus );
                else result = checkReadValidParameter( this.Request, this.Response, this.settingNames, args.SuppressMessaging, args.SuppressWarnings, args.SuppressBadValueStatus );
                this.setMonitoredItemValues( args.NodesToRead );
            }
            else {
                // check to make sure other parameters are not specified whenever there is a Bad service result. See UA Part 4 7.30 ServiceFault.
                Assert.Equal( 0, this.Response.Results.length, this.Name + ".Response.Results are not needed when a ServiceFault is returned." );
            }
        }
        else {
            Assert.StatusCodeIsOneOf( args.ServiceResult, this.UaStatus, this.Name + " the ErrorCode in the Error Message received doesn't match the expectation.", this.Name + " the ErrorCode in the Error Message received does matches the expectation." );
            result = false;
        }
        // if the call failed then register that 
        if( !result ) ServiceRegister.SetFailed( { Name: this.Name } )
        return( result );
    };//Read


    this.setMonitoredItemValues = function( monitoredItems ) {
        if( this.Response !== undefined && this.Request !== undefined ) {
            if( monitoredItems.length == undefined ) monitoredItems = [ monitoredItems ];
            var r;
            for( r=0; r<this.Response.Results.length; r++ ) { // 'r' for Results
                // all results should be in the order of the items
                var currentDataValue = this.Response.Results[r];
                monitoredItems[r].Value = currentDataValue;
                if( currentDataValue !== null ) {
                    monitoredItems[r].DataType = currentDataValue.Value.DataType;
                    // we'll also set some other properties too
                    monitoredItems[r].ArrayUpperBound = currentDataValue.Value.getArraySize();
                    monitoredItems[r].IsArray = monitoredItems[r].ArrayUpperBound != -1;
                }
            }// for r...
            return( true );
        }
        return( false );
    };//SetMonitoredItemValues

    // prints the values received in the last Read call.
    // Optional parameters:
    //   - MaxStringSize - Applies to the VALUE attribute. If the string value exceeds this
    //                     length, then the string is truncated with an obvious message.
    this.ValuesToString = function( MaxStringSize ) {
        var values = "";
        if( this.Response !== undefined && this.Request !== undefined ) {
            var r;
            for( r=0; r<this.Response.Results.length; r++ ) { // 'r' for Results
                var valueAsString = this.Response.Results[r].Value.toString();
                if( MaxStringSize !== undefined ) {
                    if( valueAsString.length > MaxStringSize ) valueAsString = valueAsString.substring( 0, MaxStringSize ) + "... (truncated by script)";
                }
                // if not an array
                values = "NodeId: " + this.Request.NodesToRead[r].NodeId;
                if( this.settingNames !== null && this.settingNames.length == this.Request.NodesToRead.length ) values += "; (Setting: '" + this.settingNames[r] + "') ";
                values += "; Value: '" + valueAsString + "'" + "; Quality: "  +  this.Response.Results[r].StatusCode;
                // check which timestamp(s) to display
                if( this.Request.TimestampsToReturn == TimestampsToReturn.Server || this.Request.TimestampsToReturn == TimestampsToReturn.Both ) {
                    values += "; Time Server: " + this.Response.Results[r].ServerTimestamp;
                }
                if( this.Request.TimestampsToReturn == TimestampsToReturn.Source || this.Request.TimestampsToReturn == TimestampsToReturn.Both ) {
                    values += "; Time Source: " + this.Response.Results[r].SourceTimestamp;
                }
            }// for r...
        }
        return( values );
    };

    // Clears the stats
    this.Clear = function() {
        print( "Read(), clearing call count, now: " + this.CallCount + "." );
        this.CallCount = 0;
    }

    this.Print = function() {
        print( "Hello world!" );
        print( "uaStatus = " + this.uaStatus );
    }
}




// the service is expected to succeed
// one, some or all operations are expected to fail
// This function checks if the server returned the expected error codes
// Request is of Type UaReadRequest
// Response is of Type UaReadResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkReadError( Request, Response, ExpectedOperationResultsArray, NodeSettings, SuppressMessages, SuppressWarnings, SuppressBadValueStatus ) {
    if( !isDefined( SuppressMessages ) ) SuppressMessages = false;
    if( !isDefined( SuppressWarnings ) ) SuppressWarnings = false;
    if (!isDefined(SuppressBadValueStatus)) SuppressBadValueStatus = [];
    var success = true;
    // check in parameters
    if( arguments.length < 3 ) {
        addError( "function checkReadError(): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.NodesToRead.length ) {
        addError( "checkReadError: ExpectedOperationResultsArray[] (received: " + ExpectedOperationResultsArray.length +
            ") must have the same size as Request.NodesToRead[] (received: " + Request.NodesToRead.length + ")" );
        return( false );
    }
    while (SuppressBadValueStatus.length < Request.NodesToRead.length) {
        if (isDefined(SuppressBadValueStatus[0])) {
            SuppressBadValueStatus.push(SuppressBadValueStatus[0]);
        }
        else {
            SuppressBadValueStatus.push(false);
        }
    }
    // check number of results
    if( Response.Results.length !== Request.NodesToRead.length ) {
        addError( "The number of results does not match the number of NodesToRead." );
        addError( "Read.NodeToRead.length=" + Request.NodesToRead.length + " Results.length=" + Response.Results.length );
        success = false;
    }
    else {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ ) {
            var dataValue = Response.Results[i];
            var bMatch = false;
            if( SuppressBadValueStatus[i] == false ) {
                if( !ExpectedOperationResultsArray[i].containsStatusCode( Response.Results[i].StatusCode ) ) {
                    addError( "Read.Response.Results[" + i + "] received '" + Response.Results[i].StatusCode + ", but " + ExpectedOperationResultsArray[i].toString() + ", when reading NodeId: " + Request.NodesToRead[i].NodeId + " (" + Attribute.toString( Request.NodesToRead[i].AttributeId ) + ") " + ( Request.NodesToRead[i].IndexRange == "" ? "" : "; IndexRange: " + Request.NodesToRead[i].IndexRange ) );
                    success = false;
                }
            }
            else if( !Response.Results[i].StatusCode.isGood() ) {
                print( "Ignoring Value with not good StatusCode: Read.Response.Results[" + i + "] received '" + Response.Results[i].StatusCode + ", but " + ExpectedOperationResultsArray[i].toString() + ", when reading NodeId: " + Request.NodesToRead[i].NodeId + " (" + Attribute.toString( Request.NodesToRead[i].AttributeId ) + ") " + ( Request.NodesToRead[i].IndexRange == "" ? "" : "; IndexRange: " + Request.NodesToRead[i].IndexRange ) );
            }
            // check type of attribute - only the attribute value has a SourceTimestamp
            if( Request.NodesToRead[i].AttributeId == Attribute.Value ) {
                if( Request.TimestampsToReturn == TimestampsToReturn.Server || Request.TimestampsToReturn == TimestampsToReturn.Neither ) {
                    // no SourceTimestamp expected
                    if( !dataValue.SourceTimestamp.isNull() ) {
                        if( !SuppressWarnings ) addWarning( "SourceTimestamp is set for Result[" + i + "] but wasn't requested" );
                    }
                }   
            }
            // no SourceTimestamp expected
            else {
                if( !dataValue.SourceTimestamp.isNull() ) {
                    addError( "SourceTimestamp is set for Result[" + i + "] but SourceTimestamps should only be returned for a Value Attribute." );
                    success = false;
                }
            }
            // ServerTimestamp
            if( Request.TimestampsToReturn == TimestampsToReturn.Source || Request.TimestampsToReturn == TimestampsToReturn.Neither ) {                    
                if( !dataValue.ServerTimestamp.isNull() ) {
                    if( !SuppressWarnings ) addWarning( "ServerTimestamp is set for Response.Result[" + i + "] but wasn't requested. Timestamp = " + dataValue.ServerTimestamp );
                }
            }
        }
    }    
    return( success );
}// function checkReadError( Request, Response, ExpectedOperationResultsArray, NodeSettings, SuppressMessages )




// the service is expected to succeed
// all operations are expected to succeed
function checkReadValidParameter( Request, Response, NodeSettings, suppressMessaging, suppressWarnings, suppressBadValueStatus ) {
    if( !isDefined( suppressMessaging ) ) suppressMessaging = false;
    if( !isDefined( suppressWarnings ) ) suppressWarnings = false;
    if( !isDefined( suppressBadValueStatus ) ) suppressBadValueStatus = false;
    if( isDefined( suppressBadValueStatus ) && !isDefined( suppressBadValueStatus.length ) ) suppressBadValueStatus = [suppressBadValueStatus];
    var timeTolerenz = parseInt( readSetting( "/Server Test/Time Tolerance" ) ); // ms tolerance for checking the server timestamp in the datavalue
    var bSucceeded = true;
    var currentTime = UaDateTime.utcNow();
    // check in parameters
    if( arguments.length < 2 ) {
        addError( "function checkReadValidParameter(): Number of arguments must be 2!" );
        return( false );
    }
    // can we specify the node id settings when outputting messages? (preference=yes)
    var useSettings = false;
    if( NodeSettings !== undefined && NodeSettings !== null ) {
        if( NodeSettings.length == Request.NodesToRead.length ) {
            useSettings = true;
        }
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo
    if( Response.DiagnosticInfos.length !== 0 ) {
        addError( "Read.Response.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        bSucceeded = false;
    }
    while (suppressBadValueStatus.length < Request.NodesToRead.length) {
        if (isDefined(suppressBadValueStatus[0])) {
            suppressBadValueStatus.push(suppressBadValueStatus[0]);
        }
        else {
            suppressBadValueStatus.push(false);
        }
    }
    // check number of results
    if( Response.Results.length !== Request.NodesToRead.length ) {
        addError( "The number of results does not match the number of Read.NodesToRead." );
        addError( "Read.NodesToRead.length = " + Request.NodesToRead.length + " Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else {
        // check each result
        var errorMessage = "Read.Response.Results (count: " + Response.Results.length + ") with RequestHandle=" + Response.ResponseHeader.RequestHandle;
        var elementUndefinedMessages = [];
        var statusCodeMessages = [];
        var sourceTimestampMessages = [];
        var serverTimestampMessages = [];
        var reportAsError = false;
        for( var i = 0; i < Response.Results.length; i++ ) {
            var tempErrorMessage = "";
            tempErrorMessage += "\r\n\t[" + i + "] ";
            if( useSettings && NodeSettings[i].length > 0 ) {
                tempErrorMessage += " (Setting: '" + NodeSettings[i] + "') ";
            }
            else {
                tempErrorMessage += " (Request.NodesToRead[" + i + "].NodeId: '" + Request.NodesToRead[i].NodeId + "') ";
            }
            var dataValue = Response.Results[i];
            if( dataValue === null ) {
                var pushMessage = false;
                if( i < 1 ) pushMessage = true;
                else if( elementUndefinedMessages.length < 1 ) pushMessage = true;
                else if( Response.Results[i - 1] != null ) pushMessage = true;
                else if( Response.Results[i - 1] == null ) {
                    if( elementUndefinedMessages[i - 1] != "\n\t..." ) elementUndefinedMessages.push( "\n\t..." );
                }
                if( pushMessage ) elementUndefinedMessages.push( tempErrorMessage + " this element is empty/null." );
                bSucceeded = false;
            }
            // status code
            
                var pushMessage = false;
                    if( i < 1 ) pushMessage = true;
                    else if( statusCodeMessages.length < 1 ) pushMessage = true;
                    else if( Response.Results[i - 1].StatusCode.StatusCode != dataValue.StatusCode.StatusCode ) pushMessage = true;
                    else if( i == Response.Results.length - 1 ) pushMessage = true;
                    else if( Response.Results[i - 1].StatusCode.StatusCode == dataValue.StatusCode.StatusCode ) {
                        if( statusCodeMessages[statusCodeMessages.length - 1] != "\n\t..." ) statusCodeMessages.push( "\n\t..." );
            }
            if (suppressBadValueStatus[i] == false && dataValue.StatusCode.isNotGood()) reportAsError = true;
            if( pushMessage ) statusCodeMessages.push( tempErrorMessage + "StatusCode is " + dataValue.StatusCode );
                //continue;
            
            // check type of attribute - only the attribute value has a SourceTimestamp
            if( Request.NodesToRead[i].AttributeId == Attribute.Value ) {
                // SourceTimestamp
                var pushMessage = false;
                if( Request.TimestampsToReturn == TimestampsToReturn.Source || Request.TimestampsToReturn == TimestampsToReturn.Both ) {
                    if( dataValue.SourceTimestamp.isNull() ) {
                        if( i < 1 ) pushMessage = true;
                        else if( sourceTimestampMessages.length < 1 ) pushMessage = true;
                        else if( Response.Results[i - 1].SourceTimestamp.isNull() != dataValue.SourceTimestamp.isNull() ) pushMessage = true;
                        else if( i == Response.Results.length - 1 ) pushMessage = true;
                        else if( Response.Results[i - 1].SourceTimestamp.isNull() == dataValue.SourceTimestamp.isNull() ) {
                            if( sourceTimestampMessages[sourceTimestampMessages.length - 1] != "\n\t..." ) sourceTimestampMessages.push( "\n\t..." );
                        }
                        if( pushMessage ) sourceTimestampMessages.push( tempErrorMessage + "SourceTimestamp not set. Requested timestamps: " + TimestampsToReturn.toString( Request.TimestampsToReturn ) + ". Received value: " + dataValue.SourceTimestamp );
                        //bSucceeded = false;
                    }
                }
                else {
                    if( !dataValue.SourceTimestamp.isNull() ) {
                        if( suppressWarnings === false ) addWarning( tempErrorMessage + "SourceTimestamp is set but wasn't requested." );
                    }
                }
            }
            // no SourceTimestamp expected
            else {
                if( !dataValue.SourceTimestamp.isNull() ) {
                    addError( tempErrorMessage + "SourceTimestamp is set but SourceTimestamps should only be returned for a Value Attribute. See UA Part 4, Clause 7.7, sub-topic: SourceTimestamp, final sentence of the passage." );
                    bSucceeded = false;
                }
            }
            // check type of attribute - only the attribute value has a ServerTimestamp !!! while checking this in the Spec it appears to me that a ServerTimestamp always needs to be transmitted for any of the attributes. This would actually be important for the case where other attributes than the value are writeable!
            //if( Request.NodesToRead[i].AttributeId == Attribute.Value ) {
                // ServerTimestamp
                if( Request.TimestampsToReturn == TimestampsToReturn.Server || Request.TimestampsToReturn == TimestampsToReturn.Both ) {
                    if( dataValue.ServerTimestamp.isNull() ) {
                        if( i < 1 ) pushMessage = true;
                        else if( serverTimestampMessages.length < 1 ) pushMessage = true;
                        else if( Response.Results[i - 1].ServerTimestamp.isNull() != dataValue.ServerTimestamp.isNull() ) pushMessage = true;
                        else if( i == Response.Results.length - 1 ) pushMessage = true;
                        else if( Response.Results[i - 1].ServerTimestamp.isNull() == dataValue.ServerTimestamp.isNull() ) {
                            if( serverTimestampMessages[serverTimestampMessages.length - 1] != "\n\t..." ) serverTimestampMessages.push( "\n\t..." );
                        }
                        if( pushMessage ) serverTimestampMessages.push( tempErrorMessage + "ServerTimestamp not set. Requested timestamps: " + TimestampsToReturn.toString( Request.TimestampsToReturn ) + ". Value received: " + dataValue.ServerTimestamp.toString() );
                        bSucceeded = false;
                    }
                    // check that the timestamp is not older than maxage
                    else {
                        if( Request.MaxAge !== 0 ) {
                            // check the timestamps only if time synchronization checking is CHECKED
                            var doCheckTimings = readSetting( "/Server Test/Time Synchronization Checking" );
                            if( doCheckTimings != 0 ) {
                                // timestamp should not be too old
                                var msecOldAge =  parseInt( Request.MaxAge ) + parseInt( timeTolerenz );
                                if( dataValue.ServerTimestamp.msecsTo( Request.RequestHeader.Timestamp ) > msecOldAge ) {
                                    addError( tempErrorMessage + "ServerTimestamp is too old. MaxAge = " + Request.MaxAge 
                                        + "\n\tRead request sent at = " + Request.RequestHeader.Timestamp
                                        + "\n\tServerTimestamp = " + dataValue.ServerTimestamp
                                        + "\n\tAge of ServerTimestamp = " + dataValue.ServerTimestamp.msecsTo( Request.RequestHeader.Timestamp ) + " msecs");
                                    bSucceeded = false;
                                }
                            }
                        }
                    }
                }
                else {
                    if( !dataValue.ServerTimestamp.isNull() ) {
                        if( suppressWarnings === false ) addWarning( tempErrorMessage + "ServerTimestamp is set for Results[" + i + "] but wasn't requested. Requested TimestampsToReturn: '" + TimestampsToReturn.toString( Request.TimestampsToReturn ) + "'. Timestamp received: " + dataValue.ServerTimestamp );
                    }
                }
            //}
        }
        // now print the found issues
        if( elementUndefinedMessages.length > 0 ) addError( errorMessage + " undefined elements in Response.Results:" + elementUndefinedMessages.toString() );
        if( !reportAsError ) {
            if( statusCodeMessages.length > 0 ) addLog( errorMessage + " StatusCode check (suppressed):" + statusCodeMessages.toString() );
        }
        else {
            if( statusCodeMessages.length > 0 ) addError( errorMessage + " StatusCodes check:" +statusCodeMessages.toString() );
        }
        if( sourceTimestampMessages.length > 0 ) addError( errorMessage + " SourceTimestamp check:" +sourceTimestampMessages.toString() );
        if( serverTimestampMessages.length > 0 ) addError( errorMessage + " ServerTimestamp check:" +serverTimestampMessages.toString() );
    }
    return bSucceeded;
}// function checkReadValidParameter( Request, Response, NodeSettings, suppressMessaging )

function checkReadValidParameterArray( Request, Response ) {
    var isGood = true;
    if( checkReadValidParameter( Request, Response ) ) {
        // iterate thru each item in results
        for( var itemCount=0; itemCount<Response.Results.length; itemCount++ ) {
            // make sure the item is an array type
            if( Response.Results[itemCount].Value.getArraySize() < 1 ) {
                // check if a ByteArray, which comes back as a string instead
                if( Response.Results[itemCount].Value.DataType == BuiltInType.ByteString && Response.Results[itemCount].Value.toString().length > 13 ) continue;
                else if( Response.Results[itemCount].Value.getArraySize() < 0 ) {
                    addError( "Results[" + itemCount + "] is not an array" );
                    isGood = false;
                }
            }
        }// for itemCount...
        return( isGood );
    }
    else return( false );
}