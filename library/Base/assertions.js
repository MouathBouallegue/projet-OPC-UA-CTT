/* FUNCTION LIST 
    Assert:
        ValueInValues = function( valueSought, valueSelection, badMessage, goodMessage ) {
        True  = function( expectedResult, message, successMessage, suppressMessage ) {
        False = function( expectedResult, message, successMessage, suppressMessage ) {
        Equal = function( expectedResult, actualResult, message, optionalGoodMessage, asWarning ) {
        NotEqual        = function( var1, var2, message, okMessage ) {
        CoercedEqual    = function( expectedResult, actualResult, message ) {
        DurationEquals  = function( StartTime, EndTime, [Msecs|Seconds|Minutes|Hours|Days|Years} )
        DurationExceeds = function( StartTime, EndTime, [Msecs|Seconds|Minutes|Hours|Days|Years} )
        ArraysEqual = function( expectedResult, actualResult, message ) {
        InRange     = function( expectedMin, expectedMax, actualValue, message, showAsWarning, suppress )
        GreaterThan = function( expectedMin, actualValue, message, altMessage ) {
        LessThan    = function( expectedMax, actualValue, message ) {
        IsNull      = function( actual, message ) {
        StringNotNullOrEmpty = function( actual, message, suppress ) {
        NodeIdsEqual         = function( expectedNodeId, actualNodeId, message ) {
        NodeIdIsNull( actualNodeId, message )
        NodeIdNotNull( actualNodeId, message )
        ExpandedNodeIdsEqual( expectedNodeId, actualNodeId, message )
        ExpandedNodeIdIsNull( actualNodeId, message )
        ExpandedNodeIdNotNull( actualNodeId, message )
        QualifiedNamesEqual( expectedName, actualName, message )
        QualifiedNameIsNull( actualName, message )
        QualifiedNameNotNull( actualName, message )
        LocalizedTextsEqual( expectedText, actualText, message )
        LocalizedTextIsNull( actualText, message )
        StatusCodeIs( expectedStatusCode, actualUaStatusCode, message )
        StatusCodeIsIn( statusCodeArray, statusCode )
        StatusCodeIsOneOf = function( expectedStatusCodes, actualStatusCode, message ) */

const LOGWARNING = true;

/** @namespace */
var Assert = new Object();

Assert.ValueInValues = function( valueSought, valueSelection, badMessage, goodMessage ) {
    if( !isDefined( [ valueSought, valueSelection ] ) ) return( false );
    if( !isDefined( valueSelection.length ) ) valueSelection = [ valueSelection ];
    var isEqual = false;
    for( var i=0; i<valueSelection.length; i++ ) {
        try { isEqual = valueSought.equals( valueSelection[i] ); }
        catch( e ) { isEqual = ( valueSought == valueSelection[i] ); }
        if( isEqual ) break; 
    }
    if( !isEqual && isDefined( badMessage ) ) addError( badMessage );
    else if( isDefined( goodMessage ) ) print( goodMessage );
}// Assert.ValueInValues( valueSought, valueSelection, message )

/**
 * Verifies an expected result to be true and prints an error message if not.
 * 
 * @param {boolean} expectedResult - Defines the expected value to be verified.
 * @param {string} message - (Optional) Error message to be printed if expectedResult is not true.
 * @param {string} successMessage - (Optional) Log message to be printed if expectedResult is true.
 * @param {boolean} suppressMessage - (Optional) If set to true, messages will be suppressed. By default, messages are printed.
 *
 * @returns True if expectedResult is true, false otherwise.
 */
Assert.True = function( expectedResult, message, successMessage, suppressMessage ) {
    if( !isDefined( message ) ) message = "Expected <true>, but got <" + expectedResult + ">";
    if( !expectedResult ) if( !( isDefined( suppressMessage ) && suppressMessage ) ) addError( message );
    if( isDefined( successMessage ) && successMessage.length > 0 ) if( !( isDefined( suppressMessage ) && suppressMessage ) ) addLog( successMessage );
    return expectedResult;
}// Assert.True( expectedResult, message, successMessage )

/**
 * Verifies an expected result to be false and prints an error message if not.
 *  
 * @param {boolean} expectedResult - Defines the expected value to be verified.
 * @param {string} message - (Optional) Error message to be printed if expectedResult is not false.
 * @param {string} successMessage - (Optional) Log message to be printed if expectedResult is false.
 * @param {boolean} suppressMessage - (Optional) If set to true, messages will be suppressed. By default, messages are printed.
 *
 * @returns True if expectedResult is false, false otherwise.
 */
Assert.False = function( expectedResult, message, successMessage, suppressMessage ) {
    if( !isDefined( message ) ) message = "Expected <false>, but got <" + expectedResult + ">";
    return Assert.True( !expectedResult, message, successMessage, suppressMessage );
}// Assert.False( expectedResult, message, successMessage )

Assert.Equal = function( expectedResult, actualResult, message, optionalGoodMessage, asWarning, suppressMessage ) {
    var isEqual = true;
    if( !isDefined( expectedResult ) && !isDefined( actualResult ) ) return( true );
    if( !isDefined( expectedResult ) || !isDefined( actualResult ) ) return( false );
    var errMessage = "";
    if( message !== null && message !== undefined && message !== "" ) errMessage = message;
    else message = "";
    // array handling
    // in case this is an variant and no javascript array, we need to gain the length in a different manner
    if ( isDefined( expectedResult.ArrayType ) ) {
        expectedResult.length = expectedResult.getArraySize();
    }
    if ( isDefined( actualResult.ArrayType ) ) {
        actualResult.length = actualResult.getArraySize();
    }
    // now check the array
    if( expectedResult.length && actualResult.length > 0 && typeof ( expectedResult ) != "string" ) {
        if( expectedResult.length == actualResult.length ) {
            for( var i = 0; i < expectedResult.length; i++ ) {
                if( !Assert.Equal( expectedResult[i], actualResult[i], undefined, undefined, undefined, true ) ) {
                    isEqual = false;
                    errMessage += " \nExpected <" + expectedResult[i] + "> at index <" + i + "> but got <" + actualResult[i] + ">.";
                }
            }
        }
        else {
            isEqual = false;
            errMessage += " \nArray length differs. Expected <" + expectedResult.length + ">, but got <" + actualResult.length + ">.";
        }
    } // if
    // scalar
    else {
        // we need a special handling for DateTime values because servers are allowed to truncate the value
        var isDateTime = false;
        // if results are UaVariants
        if( expectedResult.DataType == BuiltInType.DateTime && actualResult.DataType == BuiltInType.DateTime ) isDateTime = true;
        if( expectedResult.DataType == Identifier.UtcTime && actualResult.DataType == Identifier.UtcTime ) isDateTime = true;
        // if results are UaDateTime objects
        if( !isDateTime ) {
            try {
                expectedResult.addSeconds( 0 );
                actualResult.addSeconds( 0 );
                isDateTime = true;
            }
            catch( e ) { };
        }
        if( isDateTime ) {
            isEqual = Assert.DateTimeEqual( expectedResult, actualResult );
        }
        else {
            try { isEqual = expectedResult.equals( actualResult ); }
            catch( e ) { isEqual = ( expectedResult === actualResult ); }
        }
    } // else
    if( !isEqual ) {
        if( expectedResult.toString() === "NaN" || actualResult.toString() === "NaN" ) isEqual = expectedResult.toString() === actualResult.toString();
        if( !isEqual ) {
            errMessage += " \nExpected <" + expectedResult + "> but got <" + actualResult + ">.";
        }
    }
    if( suppressMessage != true ) {
        if( isDefined( asWarning ) && asWarning === true && errMessage != message ) addWarning( errMessage );
        else if( errMessage != message ) addError( errMessage );
        if( isEqual && optionalGoodMessage !== undefined && optionalGoodMessage !== null && optionalGoodMessage.length > 0 ) addLog( optionalGoodMessage );
    }
    // delete the temporary lengths we stored
    delete actualResult.length;
    delete expectedResult.length;
    return isEqual;
}// Assert.Equal( expectedResult, actualResult, message, optionalGoodMessage, asWarning )

Assert.NotEqual = function( var1, var2, message, okMessage ) {
    var isEqual = true;
    if( var1.equals !== undefined ) isEqual = var1.equals( var2 );
    else {
        isEqual = var1 == var2;
        if( isEqual ) {
            var errMessage = "";
            if( message !== null && message !== undefined ) errMessage = message;
            errMessage += "\nExpected other than <" + var1 + "> but got <" + var2 + ">. ";
            addError( errMessage );
        }
        else if( isDefined( okMessage ) ) addLog( okMessage );
    }
    return( ! isEqual );
}// Assert.NotEqual( var1, var2, message, okMessage )

Assert.CoercedEqual = function( expectedResult, actualResult, message ) {
    var isEqual = false;
    // we need a special handling for DateTime values because servers are allowed to truncate the value
    var isDateTime = false;
    // if results are UaVariants
    if( expectedResult.DataType == BuiltInType.DateTime || actualResult.DataType == BuiltInType.DateTime ) isDateTime = true;
    if( expectedResult.DataType == Identifier.UtcTime || actualResult.DataType == Identifier.UtcTime ) isDateTime = true;
    // if results are UaDateTime objects
    if( !isDateTime ) {
        try {
            expectedResult.addSeconds( 0 );
            isDateTime = true;
        }
        catch( e ) {
            try {
                actualResult.addSeconds( 0 );
                isDateTime = true;
            }
            catch( e ) { };
        };
    }
    if( isDateTime ) {
        isEqual = Assert.DateTimeEqual( expectedResult, actualResult );
    }
    else if( expectedResult.equals !== undefined ) {
        try { isEqual = expectedResult.equals( actualResult ); }
        catch ( e ) { }
    }
    else isEqual = ( expectedResult == actualResult );
    if( !isEqual ) {
        var errMessage = "";
        if( message !== null && message !== undefined && message !== "" ) errMessage = message;
        addError( "Expected <" + expectedResult + "> but got <" + actualResult + ">." + errMessage );
    }
    return isEqual;
}// Assert.CoercedEqual( expectedResult, actualResult, message )

Assert.ArraysEqual = function( expectedResult, actualResult, message ) {
    addWarning( "This is an obsolete function. Use Assert.Equal instead." );
    var isEqual = false;
    if( Assert.Equal( expectedResult.length, actualResult.length, message + " Array lengths differ.") ) {
        if( expectedResult.isEmpty !== undefined ) Assert.Equal( expectedResult, actualResult, message + " Array content differs." );
        else {
            for( var i = 0; i < expectedResult.length; i++ ) {
                isEqual = Assert.Equal( expectedResult[i], actualResult[i], message + " Array content differs at index " + i);
            }
        }
    }
    else if( ( expectedResult.length < 10 ) && ( actualResult.length < 10 ) ) addError( "Expected array: " + expectedResult + "; Actual array: " + actualResult );
    return isEqual;
}// Assert.ArraysEqual( expectedResult, actualResult, message )

Assert.InRange = function( expectedMin, expectedMax, actualValue, message, showAsWarning, suppress ) {
    if( !isDefined( suppress ) ) suppress = false;
    var localMessage = ( isDefined( message )? ( message + " \n" ) : "" );
    var result = false;
    // NaN comparisons always evaluate to false, so check not in range instead of out of range
    if( !( expectedMin <= actualValue ) ) localMessage += "Expected a value greater than <" + expectedMin + "> and less than <" + expectedMax + ">; but received <" + actualValue + ">. ";
    else if( !( expectedMax >= actualValue ) ) localMessage += "Expected a value less than <" + expectedMax + "> and greater than <" + expectedMin + "> but received <" + actualValue + ">. ";
    else result = true;
    if( !result && localMessage !== "" ) {
        if( showAsWarning !== undefined && showAsWarning !== null && showAsWarning === true && !suppress ) addWarning( localMessage );
        else if( !suppress ) addError( localMessage );
    }
    return result;
}// Assert.InRange( expectedMin, expectedMax, actualValue, message, showAsWarning )

Assert.GreaterThan = function( expectedMin, actualValue, message, altMessage ) {
    var result = false;
    expectedMin = UaVariantToSimpleType( expectedMin );
    actualValue = UaVariantToSimpleType( actualValue );
    if( expectedMin >= actualValue ) addError( "Expected a value greater than <" + expectedMin + "> but got <" + actualValue + ">. " + message );
    else {
        result = true;
        if( isDefined( altMessage ) )addLog( altMessage );
    }
    return( result );
}// Assert.GreaterThan( expectedMin, actualValue, message, altMessage )

Assert.LessThan = function( expectedMax, actualValue, message, altMessage ) {
    var result = false;
    if( expectedMax <= actualValue ) addError( "Expected a value less than <" + expectedMax + "> but got <" + actualValue + ">. " + message );
    else {
        if( isDefined( altMessage ) ) addLog( altMessage );
        result = true;
    }
    return( result );
}// Assert.LessThan( expectedMax, actualValue, message )

Assert.IsNull = function( actual, message ) {
    if( actual === null || actual === undefined ) return( true );
    else {
        addError( "Expected null but got <" + actual + ">. " + message );
        return( false );
    }
}// Assert.IsNull( actual, message )

Assert.StringNotNullOrEmpty = function( actual, message, suppress ) {
    if( actual === undefined || actual === null || actual === "" ) {
        var msg = isDefined( message )? ( message + " " ): "String is emtpy or null.";
        if( !( isDefined( suppress ) && suppress ) ) addError( msg );
        return false;
    }
    return true;
}// Assert.StringNotNullOrEmpty( actual, message ) 

Assert.NodeIdsEqual = function( expectedNodeId, actualNodeId, message ) {
    var match = false;
    try { match = expectedNodeId.equals( actualNodeId ); }
    catch (e) { }
    if( !match ) addError( "Expected <" + expectedNodeId + "> but got <" + actualNodeId + ">. " + message );
    return match;
}// function AssertNodeIdsEqual( expectedNodeId, actualNodeId, message )

Assert.NodeIdIsNull = function( actualNodeId, message ) {
    if( !actualNodeId.equals( new UaNodeId() ) ) addError( "NodeId is not a null NodeId: " + actualNodeId + ". " + message );
}// Assert.NodeIdIsNull( actualNodeId, message )

Assert.NodeIdNotNull = function( actualNodeId, message, suppress ) {
    if( actualNodeId === null ) {
        if( isDefined( suppress ) && !suppress ) addError( "NodeId is null. " + message );
        return false;
    }
    else if( actualNodeId === undefined ) {
        if( isDefined( suppress ) && !suppress ) addError( "NodeId is undefined. " + message );
        return false;
    }
    else if( actualNodeId === "" ) {
        if( isDefined( suppress ) && !suppress ) addError( "NodeId is an empty string. " + message );
        return( false );
    }
    else if( actualNodeId.equals( new UaNodeId() ) ) {
        if( isDefined( suppress ) && !suppress ) addError( "NodeId is a null NodeId. " + message );
        return false;
    }
    return true;
}// Assert.NodeIdNotNull( actualNodeId, message )

Assert.ExpandedNodeIdsEqual = function( expectedNodeId, actualNodeId, message ) {
    if( !expectedNodeId.equals( actualNodeId ) ) {
        addError( "Expected <" + expectedNodeId + "> but got <" + actualNodeId + ">. " + message );
        return false;
    }
    return true;
}// Assert.ExpandedNodeIdsEqual( expectedNodeId, actualNodeId, message )

Assert.ExpandedNodeIdIsNull = function( actualNodeId, message ) {
    if( !actualNodeId.equals( new UaExpandedNodeId() ) ) addError( "ExpandedNodeId is not a null ExpandedNodeId: " + actualNodeId + ". " + message );
}// Assert.ExpandedNodeIdIsNull( actualNodeId, message )

Assert.ExpandedNodeIdNotNull = function( actualNodeId, message ) {
    if( actualNodeId === null ) addError( "ExpandedNodeId is null. " + message );
    else if( actualNodeId.equals( new UaExpandedNodeId() ) ) addError( "ExpandedNodeId is a null ExpandedNodeId. " + message );
}// Assert.ExpandedNodeIdNotNull( actualNodeId, message )

Assert.QualifiedNamesEqual = function( expectedName, actualName, message ) {
    if( !expectedName.equals( actualName ) ) {
        addError( "Expected <" + expectedName + "> but got <" + actualName + ">. " + message );
        return false;
    }
}// Assert.QualifiedNamesEqual( expectedName, actualName, message )

Assert.QualifiedNameIsNull = function( actualName, message ) {
    if( !actualName.equals( new UaQualifiedName() ) ) addError( "QualifiedName is not a null QualifiedName. " + message );
}// Assert.QualifiedNameIsNull( actualName, message )

Assert.QualifiedNameNotNull = function( actualName, message ) {
    if( actualName === null ) addError( "QualifiedName is null. " + message );
    else if( actualName.equals( new UaQualifiedName() ) ) addError( "QualifiedName is a null QualifiedName. " + message );
}// Assert.QualifiedNameNotNull( actualName, message )

Assert.LocalizedTextsEqual = function( expectedText, actualText, message ) {
    if( !expectedText.equals( actualText ) ) {
        addError( "Expected <" + expectedText + "> but got <" + actualText + ">. " + message );
        return false;
    }
}// Assert.LocalizedTextsEqual( expectedText, actualText, message )

Assert.LocalizedTextIsNull = function( actualText, message ) {
    if( !actualText.equals( new UaLocalizedText() ) ) {
        addError( "LocalizedText is not a null LocalizedText. " + message );
    }
}// Assert.LocalizedTextIsNull( actualText, message )

Assert.StatusCodeIs = function( expectedStatusCode, actualUaStatusCode, message, successMessage ) {
    // was 'expectedStatusCode' our ExpectedAndAccepted object? if so, use its features instead!
    var result = false;
    if( isDefined( expectedStatusCode.containsStatusCode ) ) result = expectedStatusCode.containsStatusCode( actualUaStatusCode );
    else if( actualUaStatusCode.StatusCode === expectedStatusCode ) result = true;
    if( !result ) addError( ( isDefined( message ) ? message + " " : "" ) + "Received: " + actualUaStatusCode + ". " + expectedStatusCode.toString(), actualUaStatusCode );
    else if( isDefined( successMessage ) ) 
        addLog( successMessage );
    return( result );
}// Assert.StatusCodeIs( expectedStatusCode, actualUaStatusCode, message )

Assert.StatusCodeIsIn = function( statusCodeArray, statusCode ) {
    for( var j in statusCodeArray ) if( statusCode.StatusCode == statusCodeArray[j].StatusCode ) return true;
    return false;
}// Assert.StatusCodeIsIn( statusCodeArray, statusCode )

Assert.StatusCodeIsOneOf = function( expectedStatusCodes, actualStatusCode, message, okMessage ) {
    if( !isDefined( expectedStatusCodes ) ) expectedStatusCodes = new ExpectedAndAcceptedResults( StatusCode.Good );
    // check if result matches any of the expected status code
    var match = Assert.StatusCodeIsIn( expectedStatusCodes.ExpectedResults, actualStatusCode );
    if( match ) {
        if( isDefined( okMessage ) ) addLog( okMessage + " Received: " + actualStatusCode, actualStatusCode );
    }
    else {
        // check if result matches any of the accepted status codes
        match = Assert.StatusCodeIsIn( expectedStatusCodes.AcceptedResults, actualStatusCode );
        if( !isDefined( message ) ) message = "";
        if( match ) {
            if( isDefined( okMessage ) ) addWarning( okMessage + ": " + actualStatusCode + " but " + expectedStatusCodes.toString() + " was expected", actualStatusCode );
        }
        else addError( message + " Expected: " + expectedStatusCodes.ExpectedResults.toString() + " but received: " + actualStatusCode, actualStatusCode );
    }
    return match;
}// function AssertStatusCodeIsOneOf( expectedStatusCodes, actualStatusCode, message )

// args: StartTime, EndTime, Msecs, Secs, Hours, Days, Years
Assert.DurationEquals = function( args ) {
    if( args === null ) throw( "args not specified." );
    if( args.StartTime === null ) throw( "args.StartTime not specified." );
    if( args.EndTime === null ) throw( "args.EndTime not specified." );
    if( args.Debug === undefined ) args.Debug = false;
    if( args.Debug ) print( "DurationExceeds(\n\tStart: " + args.StartTime + "\n\tEnd: " + args.EndTime + "\n\tUnit: " + ( args.Msec !== undefined ? args.Msec + " ms" : "" ) + ( args.Seconds !== undefined ? args.Seconds + " sec" : "" ) + ( args.Minutes !== undefined ? args.Minutes + " mins" : "" ) + ( args.Hours !== undefined ? args.Hours + " hours" : "" ) + ( args.Days !== undefined ? args.Days + " days" : "" ) + ( args.Years !== undefined ? args.Years + " years" : "" ) );
    if( args.Msecs !== undefined ) { if( args.Debug ) print( "\tmsecs..." ); return( args.StartTime.msecsTo( args.EndTime ) === args.Msecs ); }
    else if( args.Seconds !== undefined ) { if( args.Debug ) print( "\tseconds..." ); return( args.StartTime.secsTo( args.EndTime ) === args.Seconds ); }
    else if( args.Hours !== undefined ) { if( args.Debug ) print( "\thours..." ); return( args.StartTime.hoursTo( args.EndTime ) === args.Hours ); }
    else if( args.Days !== undefined ) { if( args.Debug ) print( "\tdays..." ); return( args.StartTime.daysTo( args.EndTime ) === args.Days ); }
    else if( args.Years !== undefined ) { if( args.Debug ) print( "\tyears..." ); return( args.StartTime.daysTo( args.EndTime ) === args.Years * 365 ); }
    return( false );
}

// args: StartTime, EndTime, Msecs, Secs, Hours, Days, Years
Assert.DurationExceeds = function( args ) {
    if( args === null ) throw( "args not specified." );
    if( args.StartTime === null ) throw( "args.StartTime not specified." );
    if( args.EndTime === null ) throw( "args.EndTime not specified." );
    if( args.Debug === undefined ) args.Debug = false;
    if( args.Debug ) print( "DurationExceeds(\n\tStart: " + args.StartTime + "\n\tEnd: " + args.EndTime + "\n\tUnit: " + ( args.Msec !== undefined ? args.Msec + " ms" : "" ) + ( args.Seconds !== undefined ? args.Seconds + " sec" : "" ) + ( args.Minutes !== undefined ? args.Minutes + " mins" : "" ) + ( args.Hours !== undefined ? args.Hours + " hours" : "" ) + ( args.Days !== undefined ? args.Days + " days" : "" ) + ( args.Years !== undefined ? args.Years + " years" : "" ) );
    if( args.Msecs !== undefined ) { if( args.Debug ) print( "\tmsecs..." ); return( args.StartTime.msecsTo( args.EndTime ) > args.Msecs ); }
    else if( args.Seconds !== undefined ) { if( args.Debug ) print( "\tseconds..." ); return( args.StartTime.secsTo( args.EndTime ) > args.Seconds ); }
    else if( args.Hours !== undefined ) { if( args.Debug ) print( "\thours..." ); return( args.StartTime.hoursTo( args.EndTime ) > args.Hours ); }
    else if( args.Days !== undefined ) { if( args.Debug ) print( "\tdays..." ); return( args.StartTime.daysTo( args.EndTime ) > args.Days ); }
    else if( args.Years !== undefined ) { if( args.Debug ) print( "\tyears..." ); return( args.StartTime.daysTo( args.EndTime ) > args.Years * 365 ); }
    return( false );
}

/**
 * Compares two DateTime values but allowes that the actualResult parameter is truncated. The function does not throw errors.
 * 
 * @param {any} expectedResult - The expected value
 * @param {any} actualResult - The actual value
 * @param {Boolean} suppressMessage - Suppress any log messages
 * 
 * @returns isEqual - A Boolean that indicates whether both values are the same
 */
Assert.DateTimeEqual = function( expectedResult, actualResult, suppressMessage ) {
    var isEqual = false;
    try { isEqual = expectedResult.equals( actualResult ); }
    catch( e ) { }
    if( isEqual == false ) {
        /* exDTVAlueString and reDTValueString will look like this
         * 0         1         2
         * 012345678901234567890123
         * 2021-07-02T13:34:31.599Z
         * |Year (4)
         *      | Month (2)
         *          | Day (2)
         *           | T (1) = Time follows
         *             | HOUR(2)
         *                | MINUTES (2)
         *                  | SECONDS (2)
         *                    | MILISECONDS (3)
         *                       | Z (1) = Time base UTC
         * YEAR(4)-MONTH(2)-DAY(2)THOUR(2):MINUTES(2):SECONDS(2).MILISECONDS(3)Z
        */
        var exDTValueString = expectedResult.toString();
        var reDTValueString = actualResult.toString();
        var msg = "";
        // Truncating is allowed, but a resolution of 1 second is expected.
        for( var s = exDTValueString.length - 1; s > 8; s-- ) {
            if( exDTValueString.substr( 0, s ) == reDTValueString.substr( 0, s ) ) {
                isEqual = true;
                switch( s ) {
                    case 23: msg = "The server did not truncate the written value."; break;
                    case 22: msg = "The server truncated the written value with a resolution of 10 ms."; break;
                    case 21: msg = "The server truncated the written value with a resolution of 100 ms."; break;
                    case 20: msg = "The server truncated the written value with a resolution of 1 s."; break;
                    case 18: msg = "The server truncated the written value with a resolution of 10 s."; break;
                    case 17: msg = "The server truncated the written value with a resolution of 1 min."; break;
                    case 15: msg = "The server truncated the written value with a resolution of 10 min."; break;
                    case 14: msg = "The server truncated the written value with a resolution of 1 h."; break;
                    case 12: msg = "The server truncated the written value with a resolution of 10 h."; break;
                    case 11: msg = "The server truncated the written value with a resolution of 1 d."; break;
                    default: {
                        msg = "The server truncated the value with an unexpected resolution.";
                        isEqual = false;
                        break;
                    }
                }
                if( isEqual && s < 20 ) {
                    addError( msg + " Written Value: " + exDTValueString + " has been truncated to a resolution below the expectation. Received: " + reDTValueString );
                    isEqual = false;
                    break;
                }
            }
            else if( !isNaN( reDTValueString[s] ) && reDTValueString[s] != "0" ) {
                msg = "Received an unexpected value.";
                isEqual = false;
                break;
            }
            if( isEqual == true ) break;
        }
        if( suppressMessage != true ) {
            addLog( msg + " Written Value: " + exDTValueString + ", received: " + reDTValueString );
        }
    }
    return ( isEqual );
}


function AssertNotNullLocalizedText( actualText, message ) {
    if( actualText === null ) {
        addError( "LocalizedText is null. " + message );
    }
    else if( actualText.equals( new UaLocalizedText() ) ) {
        addError( "LocalizedText is a null LocalizedText. " + message );
    }
}// function AssertNotNullLocalizedText( actualText, message )



// BrowseName equality comparison
function AssertBrowseNamesEqual( expectedName, actualName, message ) {
    var result = ( expectedName.NamespaceIndex == actualName.NamespaceIndex );
    result = result && ( expectedName.Name == actualName.Name );
    if ( !result ) {
        addError( "Expected <" + expectedName + "> but got <" + actualName + ">. " + message );
    }
    return result;
}// function AssertBrowseNamesEqual( expectedName, actualName, message )


    
// Empty DiagnosticInfos
function AssertDiagnosticInfosEmpty( diagnosticInfos ) {
    if( diagnosticInfos.length !== 0 ) {
        addError( "DiagnosticInfos are not empty. DiagnosticInfos: " + diagnosticInfos );
    }
}// function AssertDiagnosticInfosEmpty( diagnosticInfos )





// Checks the specified value is of the expected Type
function AssertUaValueOfType( expectedType, uaVariantValue ) 
{
    return( Assert.Equal( expectedType, uaVariantValue.DataType, "Expected type <" + BuiltInType.toString( expectedType ) + "> but received <" + BuiltInType.toString( uaVariantValue.DataType ) + ">" ) );
}

// Checks the subscriptions objects (/Library/Base/Subscription) to see which subscriptions are
// enabled/disabled and compares to what the Publish object (/Library/ServiceBased/Subscription/Publish/Publish)
// has received.
function AssertSubscriptionCallbacks( subscriptions, publishObject )
{
    // now check which subscriptions provided dataChanges
    var subscriptionFound = false;
    print( "\nAssertSubscriptionCallbacks for " + subscriptions.length + " subscriptions... There are " + publishObject.SubscriptionIds.length + " subscriptionIds in the queue of received DataChanges." );
    for( var s=0; s<subscriptions.length; s++ )
    {
        for( var i=0; i<publishObject.SubscriptionIds.length; i++ )
        {
            if( subscriptions[s].SubscriptionId ===  publishObject.SubscriptionIds[i] )
            {
                Assert.Equal( true, subscriptions[s].PublishingEnabled, "DataChanges for subscription: " + subscriptions[s].SubscriptionId + " (enabled=" + subscriptions[s].PublishingEnabled + " ) expected." );
                subscriptionFound = true;
                break;
            }
        }
        if( !subscriptionFound )
        {
            Assert.Equal( false, subscriptions[s].PublishingEnabled, "Did not receive dataChanges for Enabled subscription: " + subscriptions[s].SubscriptionId );
        }
    }
}

function AssertReferencesContainsBrowseName( references, browseName, message, isOptional, successMessage )
{
    var result = false;
    for( var r=0; r<references.length; r++ )
    {
        if( references[r].BrowseName.Name == browseName )
        {
            if( isDefined( successMessage ) ) addLog( successMessage );
            result = true;
            break;
        }
    }// for r...
    if( isOptional !== undefined && isOptional !== null && isOptional === true )
    {
        if( !result )
        {
            addLog( "Could not find OPTIONAL BrowseName '" + browseName + "' in any of the specified references." );
        }
    }
    else
    {
        if( !Assert.True( result, "Could not find '" + browseName + "' in any of the specified references." ) )
        {
            if( message !== undefined && message !== null )
            {
                addError( message );
            }
        }
    }
    return( result );
}

function AssertReferencesContainsReferenceTypeId( references, referenceTypeId, message, isOptional, successMessage )
{
    var result = false;
    for( var r=0; r<references.length; r++ )
    {
        if( references[r].ReferenceTypeId.equals( referenceTypeId ) )
        {
            if( isDefined( successMessage ) ) addLog( successMessage );
            result = true;
            break;
        }
    }//for r
    if( isOptional !== undefined && isOptional !== null && isOptional === true )
    {
        if( !result )
        {
            addLog( "Could not find OPTIONAL ReferenceType '" + referenceTypeId + "' in any of the specified references." );
        }
    }
    else
    {
        if( !Assert.True( result, "Could not find ReferenceType '" + referenceTypeId + "' in any of the specified references." ) )
        {
            if( message !== undefined && message !== null )
            {
                addError( message );
            }
        }
    }
    return( result );
}

function AssertIsNumeric( value, message )
{
    var result = true;
    if( value !== undefined && value !== null && value !== "" )
    {
        var inError = false;
        var foundNumeric = value.match( "(\\d*)" )[1];
        if ( foundNumeric == undefined || foundNumeric == null || foundNumeric == "" )
        {
            inError = true;
        }
        if( foundNumeric !== value )
        {
            inError = true;
        }
        if( inError )
        {
            var optionalMessage = "";
            if( message !== undefined && message !== null && message !== "" )
            {
                optionalMessage = message;
            }
            addError( "Value '" + value + "' is not numeric! " + optionalMessage );
            result = false;
       }
    }
    return( result );
}

function AssertSettingGood( settingName, message, logAsSkipped ) {
    var result = false;
    if( settingName !== undefined && settingName !== null && settingName !== "" ) {
        var settingValue = readSetting( settingName );
        if( settingValue !== undefined && settingValue !== null && settingValue.toString().length > 0 ) result = true;
    }
    if( !result ) {
        var errMessage = "Setting not configured: '" + settingName + "'.";
        if( message !== undefined && message !== null && message.length > 0 ) errMessage += message;
        if( logAsSkipped !== undefined && logAsSkipped !== null && logAsSkipped === true ) addSkipped( errMessage );
        else _warning.store( errMessage );
    }
    return( result );
}

function AssertOptionalSetting( settingName, message, isDataType )
{
    var result = false;
    if( settingName !== undefined && settingName !== null && settingName !== "" )
    {
        var settingValue = readSetting( settingName );
        if( settingValue !== undefined && settingValue !== null && settingValue.toString().length > 0 )
        {
            result = true;
        }
    }
    if( !result )
    {
        var errMessage = "Setting not configured: '" + settingName + "'.";
        if( message !== undefined && message !== null && message.toString().length > 0 )
        {
            errMessage += message;
        }
        if( isDataType !== undefined && isDataType !== null && isDataType === true )
        {
            _dataTypeUnavailable.store( settingName );
        }
        else
        {
            _warning.store( errMessage );
        }
    }
    return( result );
}

function AssertOptionalDataTypeSetting( settingName, message )
{
    return( AssertOptionalSetting( settingName, message, true ) );
}

/*
    Parameters:
        valueReceived:    the value received when reading the Node's value 
        valueSent:        the value that was written to the Server 
        precisionValue:   the level of precision the Server supports for the Node 
        errMessage:       an optional error message to be reported 
*/
function AssertValueWithinPrecision( valueReceived, valueSent, precisionValue, errMessage )
{
    valueReceived = parseFloat( valueReceived );
    valueSent = parseFloat( valueSent );
    precisionValue = parseInt( precisionValue );
    print( "AssertValueWithinPrecision:\n\tValue Received: " + valueReceived + 
        "\n\tValue Sent: " + valueSent + "\n\tPrecision: " + precisionValue );
    var left = ( Math.abs( valueSent - valueReceived ) );
        print(" \tAbs( " + valueSent + " - " + valueReceived + " ) = " + left );
    var valueToPrec = valueSent.toFixed( precisionValue );
    var right = (Math.abs( valueSent - valueToPrec ));
        print( "\tAbs( " + valueSent + " - trunc( " + valueSent + ", " + precisionValue + " )) = " + right );
    var diff = left <= right;
        print( "\tResult (" + left + " <= " + right + ") = " + diff );
    if( !diff )
    {
        if( errMessage !== undefined && errMessage !== null && errMessage.length !== 0 )
        {
            addError( errMessage );
        }
        else
        {
            addError( "The value received differs by more than the ValuePrecision configured. ValuePrecision=" + precisionValue + "; ValueReceived: " + valueReceived + " vs. Written: " + valueSent );
        }
    }
    return( diff );
}

function AssertBitmaskSameOrRestricted( parentBitmask, childBitmask, message )
{
    if( parentBitmask !== childBitmask )
    {
        for( var i=0; i<32; i++ )
        {
            var nodeClassMask = 1 << i;
            // check if parent does not have the bit set
            var parentBitSet = parentBitmask & nodeClassMask;
            var childBitSet = childBitmask & nodeClassMask;
            if( !parentBitSet && childBitSet )
            {
                addError( "Child mask has abilities that are not specified in the Parent mask for bit # " + nodeClassMask + " (" + Attribute.toString( nodeClassMask ) + ").\n\tParent Mask: " + parentBitmask + "\n\t Child Mask: " + childBitmask + "\t(See UA Part 3 clause 5.2.8 UserWriteMask)" + ( message !== undefined ? "\n" + message : "" ) );
                return( false )
            };
        }
    }
    return( true );
}



function AssertStringInStrings( stringSought, stringsArray, errMessage, okMessage ) {
    var result = false;
    if( isDefined( stringSought ) && isDefined( stringsArray ) && isDefined( stringsArray.length ) ) {
        for( var i=0; i<stringsArray.length; i++ ) {
            if( stringsArray[i] === stringSought ) {
                result = true;
                if( isDefined( okMessage ) ) addLog( okMessage );
                break;
            }
        }
    }
    if( !result ) {
        addError( errMessage + " String ''" + stringSought + "' not found in array of strings:\n\t" + stringsArray.toString() );
    }
    return( result );
}// function AssertStringInStrings( stringSought, stringsArray, errMessage, okMessage )