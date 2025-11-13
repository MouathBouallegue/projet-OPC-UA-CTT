include( "./library/__regressionTesting/_AggregateTestData.js" );

function TestAggregates() {

    this.TestData = null;
    this.StartTime = null;
    this.EndTime = null;
    this.Raw = null;
    this.Processed = null;
    this.NumberOfItems = 1;
    this.ThrowError = true;

    this.run = function ( dataHelper ) {
        // Used to validate test cases against the spec
        //dataHelper.ValidateTestData();

        this.Initialize( dataHelper );

        this.CreateRawRequestReponse();
        this.CreateAggregateRequests();

        var rawDataEarliestToLatest = false;
        var rawDataLatestToEarliest = true;

        var runAll = true;
        var runReversedData = false;
        var runError = true;

        var runSingleAggregate = false;
        if ( runSingleAggregate ){
            runAll = false;
            runError = false;
        }

        if ( runAll ){
            this.RunTests( rawDataEarliestToLatest );
            if ( runReversedData ){
                this.RunTests( rawDataLatestToEarliest );
            }
            if ( runError ){
                this.RunErrorTests();
            }
        }else{
            var runFullSet = false;
            var aggregateName = "DurationInStateNonZero";
            var historianName = "Historian4";
            var direction = rawDataEarliestToLatest;

            if ( runFullSet ){
                for ( var index = 1; index <= 5; index ++ ){
                    this.RunSingleTest(aggregateName, "Historian" + index, direction);  
                }
            }else{
                this.RunSingleTest(aggregateName, historianName, direction);
            }
        }

        ClearRawDataCacheHelper.Execute();

        print( "done" );
    }

    this.Initialize = function ( dataHelper ) {
        this.StartTime = new UaDateTime;
        this.StartTime.addDays( 2 );
        this.EndTime = new UaDateTime( this.StartTime );
        this.EndTime.addSeconds( 100 );
        this.Raw = dataHelper.CreateRawDataSets( this.StartTime );
        this.Processed = dataHelper.CreateProcessedDataSets( this.StartTime );
    }

    this.CreateRawRequestReponse = function () {

        var keys = this.Raw.Keys();

        for ( var index = 0; index < keys.length; index++ ) {
            var dataset = this.Raw.Get( keys[ index ] );
            dataset.HistoryItems = this.GetHistoryReadValueIds();
            dataset.Request = this.GetRawRequest( dataset.HistoryItems );
            dataset.Response = this.GetRawResponse( dataset, false );
            dataset.ReversedResponse = this.GetRawResponse( dataset, true )
        }
    }

    this.GetHistoryReadValueIds = function () {

        var nodeIds = this.GetItemNodeIds();
        var historyReadValueIds = new UaHistoryReadValueIds( nodeIds.length );

        for ( var index = 0; index < nodeIds.length; index++ ) {
            var nodeId = nodeIds[ index ];

            var historyReadValueId = new UaHistoryReadValueId();
            historyReadValueId.NodeId = nodeId;
            historyReadValueIds[ index ] = historyReadValueId;
        }

        return historyReadValueIds;
    }

    this.GetItemNodeIds = function () {
        var items = [];
        for ( var index = 0; index < this.NumberOfItems; index++ ) {
            items.push( UaNodeId.fromString( "ns=11;s=Node" + index ) );
        }
        return items;
    }

    this.GetRawRequest = function ( items ) {

        var rawRequest = {
            NodesToRead: items,
            HistoryReadDetails: UaReadRawModifiedDetails.New(
                {
                    IsReadModified: false,
                    StartTime: this.StartTime,
                    EndTime: this.EndTime,
                    NumValuesPerNode: 0,
                    ReturnBounds: false
                } ),
            TimestampsToReturn: TimestampsToReturn.Both,
            ReleaseContinuationPoints: false,
            Debug: true
        };

        var readRequest = new UaHistoryReadRequest.New( rawRequest );

        return readRequest;
    }

    this.GetRawResponse = function ( dataSet, reversed ) {

        var historyReadResults = new UaHistoryReadResults( this.NumberOfItems );

        for ( var index = 0; index < this.NumberOfItems; index++ ) {

            var valuesToUse = dataSet.DataValues;

            if ( reversed ) {
                var reversedRawData = new UaDataValues( dataSet.DataValues.length );
                var lastIndex = dataSet.DataValues.length - 1;

                for ( var valueIndex = 0; valueIndex < dataSet.DataValues.length; valueIndex++ ) {
                    var value = new UaDataValue( dataSet.DataValues[ valueIndex ] );
                    reversedRawData[ lastIndex - valueIndex ] = value;
                }
                valuesToUse = reversedRawData;
            }

            var historyData = new UaHistoryData();
            historyData.DataValues = valuesToUse;

            var extensionObject = new UaExtensionObject();
            extensionObject.setHistoryData( historyData );

            var historyReadResult = new UaHistoryReadResult();
            historyReadResult.HistoryData = extensionObject;

            historyReadResults[ index ] = historyReadResult;
        }

        return historyReadResults;
    }

    this.CreateAggregateRequests = function () {

        for ( var index = 0; index < this.Processed.length; index++ ) {
            var testCase = this.Processed[ index ];
            var rawDataName = testCase.DataSetName;
            var rawHistorian = this.Raw.Get( rawDataName );

            var items = rawHistorian.HistoryItems;

            var aggregates = new UaNodeIds( items.length );

            for ( var aggregateIndex = 0; aggregateIndex < items.length; aggregateIndex++ ) {
                aggregates[ aggregateIndex ] = new UaNodeId( testCase.Aggregate.Type );
            }

            var useSlopedExtrapolation = false;
            if ( testCase.UseSlopedExtrapolation == "true" ) {
                useSlopedExtrapolation = true;
            }

            var treatUncertainAsBad = false;
            if ( testCase.TreatUncertainAsBad == "true" ) {
                treatUncertainAsBad = true;
            }

            var aggregateConfiguration = UaAggregateConfiguration.New( {
                UseServerCapabilitiesDefaults: true,
                TreatUncertainAsBad: treatUncertainAsBad,
                PercentDataBad: parseInt( testCase.PercentBad ),
                PercentDataGood: parseInt( testCase.PercentGood ),
                UseSlopedExtrapolation: useSlopedExtrapolation
            } );

            var processedDetails = new UaReadProcessedDetails();
            if ( this.isReversed( testCase ) ) {
                processedDetails.StartTime = this.EndTime;
                processedDetails.EndTime = this.StartTime;
            } else {
                processedDetails.StartTime = this.StartTime;
                processedDetails.EndTime = this.EndTime;
            }
            processedDetails.ProcessingInterval = parseInt( testCase.ProcessingInterval );
            processedDetails.AggregateType = aggregates;
            processedDetails.AggregateConfiguration = aggregateConfiguration;


            var readProcessedDetails = new UaExtensionObject();
            readProcessedDetails.setReadProcessedDetails( processedDetails );

            var readRequest = new UaHistoryReadRequest();
            readRequest.NodesToRead = items;
            readRequest.HistoryReadDetails = readProcessedDetails;
            readRequest.TimestampsToReturn = TimestampsToReturn.Source;
            readRequest.ReleaseContinuationPoints = false;
            readRequest.Debug = true;

            testCase.AggregateRequest = readRequest;
        }
    }

    this.RunSingleTest = function ( aggregate, dataSet, reversedRawData ) {
        var idDictionary = new KeyPairCollection();

        for ( var index = 0; index < this.Processed.length; index++ ) {
            var testCase = this.Processed[ index ];
            var run = false;

            var reversedTestCase = this.isReversed( testCase );
            if ( reversedRawData && reversedTestCase ) {
                run = true;
            } else if ( !reversedRawData && !reversedTestCase ) {
                run = true;
            }

            if ( testCase.AggregateName == aggregate &&
                testCase.DataSetName == dataSet && run ) {
                this.RunTest( idDictionary, testCase, reversedRawData );
            }
        }
    }

    this.RunTests = function ( reversedRawData ) {

        var idDictionary = new KeyPairCollection();
        var passedTests = 0;
        var failedCount = 0;
        for ( var index = 0; index < this.Processed.length; index++ ) {
            var testCase = this.Processed[ index ];
            if ( this.SupportedAggregate( testCase.AggregateName, testCase ) ) {

                print( passedTests + " tests have passed so far " + failedCount + " have failed" );
                if ( this.RunTest( idDictionary, testCase, reversedRawData ) ) {
                    passedTests++;
                } else {
                    failedCount++;
                }
            }
        }
        print( "Run Tests Complete: " + passedTests + " tests have passed " + failedCount + " have failed" );
    }

    this.RunTest = function ( idDictionary, testCase, reversedRawData ) {

        var rawHistorian = this.Raw.Get( testCase.DataSetName );

        var result = this.ExecuteTest( idDictionary, testCase, rawHistorian, reversedRawData );

        var passed = false;

        if ( result.status == true ) {
            print( "Execute " + testCase.DataSetName + ":" + testCase.AggregateName + ": forward " + !this.isReversed( testCase ) +
                " succeeded, cached id = " + result.rawDataId );
            passed = this.ValidateResults( testCase, rawHistorian, result );
        } else {
            print( "Execute " + testCase.DataSetName + ":" + testCase.AggregateName + ": forward " + !this.isReversed( testCase ) +
                " Failed" );
        }
        return passed;
    }

    this.ExecuteTest = function ( idDictionary, testCase, rawHistorian, reversedRawData ) {
        var result = null;

        var stepped = false;
        if ( testCase.Stepped == "true" ) {
            stepped = true;
        }

        if ( idDictionary.Contains( testCase.DataSetName ) ) {
            result = ExecuteAggregateQueryCachedHelper.Execute( {
                RawDataId: idDictionary.Get( testCase.DataSetName ),
                AggregateRequest: testCase.AggregateRequest,
                Stepped: stepped
            } );
        } else {

            var responseToUse = rawHistorian.Response;
            if ( reversedRawData ) {
                responseToUse = rawHistorian.ReversedResponse;
            }

            result = ExecuteAggregateQueryReadResultsHelper.Execute( {
                RawRequest: rawHistorian.Request,
                RawResults: responseToUse,
                AggregateRequest: testCase.AggregateRequest,
                Stepped: stepped
            } );

            if ( result.status == true ) {
                idDictionary.Set( testCase.DataSetName, result.rawDataId );
            }
        }

        return result;
    }

    this.ValidateResults = function ( testCase, rawHistorian, result ) {

        var historyReadResults = result.results;

        print( "Got history results, number of results = " + historyReadResults.length +
            " should be " + this.NumberOfItems );

        for ( var index = 0; index < historyReadResults.length; index++ ) {
            var historyReadResult = historyReadResults[ 0 ];

            print( "Result status = " + historyReadResult.StatusCode.toString() );

            var historyData = historyReadResult.HistoryData.toHistoryData();
            var historyValues = historyData.DataValues;

            return this.ValidateAggregate( historyValues, testCase, rawHistorian );

        }
    }

    this.equals = function ( actual, test, testCase ) {
        var equals = false;
        if ( actual.equals( test ) ) {
            equals = true;
        } else {

            if ( actual.StatusCode.equals( test.StatusCode ) &&
                actual.SourceTimestamp.equals( test.SourceTimestamp ) ) {

                var result = Math.abs( actual.Value - test.Value );
                if ( result < 0.0005 ) {
                    equals = true;
                }
            }
        }

        return equals;
    }

    this.ValidateAggregate = function ( historyValues, testCase, rawHistorian ) {

        print( "Got " + historyValues.length + " history Values" );

        var failedIndexes = [];
        var reversedIndexes = [];
        var lastIndex = testCase.UsableValues.length - 1;
        var failed = false;
        if ( historyValues.length == testCase.UsableValues.length ) {
            for ( var resultIndex = 0; resultIndex < historyValues.length; resultIndex++ ) {
                var actualValue = historyValues[ resultIndex ];
                var testValue = testCase.UsableValues[ resultIndex ];

                if ( !this.equals( actualValue, testValue, testCase ) ) {
                    failed = true;
                    failedIndexes.push( resultIndex );
                    reversedIndexes.push( lastIndex - resultIndex );
                }

                // Debugging
                // print("Index " + resultIndex + " Expected: " + this.GetDataValueString(testValue));
                // print("Actual Value: " + this.GetDataValueString(actualValue));
            }
        } else {
            throw ( "Unexpected length Differences" );
        }

        if ( failed ) {

            print( "Aggregate Test " + testCase.DataSetName + ":" + testCase.AggregateName +
                ": forward " + !this.isReversed( testCase ) + " failed" );

            for ( var failedIndex = 0; failedIndex < failedIndexes.length; failedIndex++ ) {
                var index = failedIndexes[ failedIndex ];
                var actualValue = historyValues[ index ];
                var testValue = testCase.UsableValues[ index ];

                var indexValue = index;
                if ( this.isReversed( testCase ) ) {
                    indexValue = index + " [" + reversedIndexes[ failedIndex ] + "] ";
                }

                print( "Index " + indexValue + " Expected: " + this.GetDataValueString( testValue ) );
                print( "Actual Value: " + this.GetDataValueString( actualValue ) );
            }
            if ( this.ThrowError ){
                throw ( "Stop and Fix" );
            }
        } else {
            print( "Test " + index + " Passed " );
        }

        return !failed;
    }

    this.GetDataValueString = function ( value ) {
        var message =
            " Value = " + value.Value.toString() +
            " status = " + value.StatusCode.toString() +
            " server timestamp = " + value.ServerTimestamp.toString();
        return message;
    }

    this.isReversed = function ( testCase ) {
        var isReversed = false;

        if ( isDefined( testCase.TimeFlowsBackwards ) &&
            testCase.TimeFlowsBackwards == 'true' ) {
            isReversed = true;
        }
        return isReversed;
    }

    this.SupportedAggregate = function ( aggregate, testCase ) {

        // Used to debug specific aggregates
        var supported = false;

        if ( this.isReversed( testCase ) ) {
            if (
                aggregate == "Average" ||
                aggregate == "Interpolative" ||
                aggregate == "Minimum" ||
                aggregate == "Maximum" ||
                aggregate == "MinimumActualTime" ||
                aggregate == "MaximumActualTime" ||
                aggregate == "Range" ||
                aggregate == "Minimum2" ||
                aggregate == "Maximum2" ||
                aggregate == "MinimumActualTime2" ||
                aggregate == "MaximumActualTime2" ||
                aggregate == "Range2" ||
                aggregate == "TimeAverage" ||
                aggregate == "TimeAverage2" ||
                aggregate == "Total" ||
                aggregate == "Total2" ||
                aggregate == "AnnotationCount" ||
                aggregate == "Count" ||
                aggregate == "DurationInStateZero" ||
                aggregate == "DurationInStateNonZero" ||
                aggregate == "NumberOfTransitions" ||
                aggregate == "Start" ||
                aggregate == "End" ||
                aggregate == "StartBound" ||
                aggregate == "EndBound" ||
                aggregate == "Delta" ||
                aggregate == "DeltaBounds" ||
                aggregate == "DurationGood" ||
                aggregate == "DurationBad" ||
                aggregate == "PercentGood" ||
                aggregate == "PercentBad" ||
                aggregate == "WorstQuality" ||
                aggregate == "WorstQuality2" ||
                aggregate == "StandardDeviationSample" ||
                aggregate == "VarianceSample" ||
                aggregate == "StandardDeviationPopulation" ||
                aggregate == "VariancePopulation"
            ) {
                supported = true;
            }
        } else {
            // Run forward all the time
            supported = true;
        }
        return supported;
    }

    this.RunErrorTests = function () {
        this.RunBadCacheId();
        this.RunBadRawRequest();
        this.RunBadRawResponse();
        this.RunBadPercentages();
        this.RunBadAggregateId();
    }

    this.RunBadCacheId = function () {
        // get a request
        var testCase = this.Processed[ 0 ];

        print( "Run Bad Cache Id test - query should fail" );

        var result = ExecuteAggregateQueryCachedHelper.Execute( {
            RawDataId: -1,
            AggregateRequest: testCase.AggregateRequest,
            Stepped: true
        } );

        if ( result.status == true ) {
            throw ( "RunBadCacheId call should have failed" );
        }
    }

    this.RunBadRawRequest = function () {
        var testCase = this.Processed[ 0 ];
        var raw = this.Raw.Get( testCase.DataSetName );

        var items = [];
        var request = this.GetRawRequest( items );

        var result = ExecuteAggregateQueryReadResultsHelper.Execute( {
            RawRequest: request,
            RawResults: raw.Response,
            AggregateRequest: testCase.AggregateRequest,
            Stepped: true,
            Cache: false
        } );

        if ( isDefined( result.results ) ) {
            if ( result.results[ 0 ].StatusCode.StatusCode != StatusCode.BadNodeIdUnknown ) {
                throw ( "RunBadRawRequest internal aggregate should have failed" );
            }
        } else {
            throw ( "RunBadRawRequest call should have passed" );
        }
    }

    this.RunBadRawResponse = function () {
        // Just need the raw response with bad history data
        var testCase = this.Processed[ 0 ];
        var raw = this.Raw.Get( testCase.DataSetName );

        var historyReadResults = new UaHistoryReadResults( this.NumberOfItems );
        for ( var index = 0; index < this.NumberOfItems; index++ ) {

            var notHistoryData = new UaReadProcessedDetails();
            var extensionObject = new UaExtensionObject();
            extensionObject.setReadProcessedDetails( notHistoryData );

            var historyReadResult = new UaHistoryReadResult();
            historyReadResult.HistoryData = extensionObject;

            historyReadResults[ index ] = historyReadResult;
        }

        var result = ExecuteAggregateQueryReadResultsHelper.Execute( {
            RawRequest: raw.Request,
            RawResults: historyReadResults,
            AggregateRequest: testCase.AggregateRequest,
            Stepped: true,
            Cache: false
        } );

        if ( isDefined( result.results ) ) {
            if ( result.results[ 0 ].StatusCode.StatusCode != StatusCode.BadIndexRangeNoData ) {
                throw ( "RunBadRawResponse internal aggregate should have failed" );
            }
        } else {
            throw ( "RunBadRawResponse call should have passed" );
        }
    }

    this.RunBadPercentages = function () {
        // using a negative number will set percentages to 100 - value is unsigned.
        this.RunBadPercentage( -1 );
        this.RunBadPercentage( 101 );
    }

    this.RunBadPercentage = function ( percentage ) {
        var testCase = this.Processed[ 0 ];
        var raw = this.Raw.Get( testCase.DataSetName );

        var modifyRequest = testCase.AggregateRequest.clone();
        var details = modifyRequest.HistoryReadDetails.toReadProcessedDetails();
        details.AggregateConfiguration.PercentDataBad = percentage;
        details.AggregateConfiguration.PercentDataGood = percentage;

        var modifyDetails = new UaExtensionObject();
        modifyDetails.setReadProcessedDetails( details );

        modifyRequest.HistoryReadDetails = modifyDetails;

        var result = ExecuteAggregateQueryReadResultsHelper.Execute( {
            RawRequest: raw.Request,
            RawResults: raw.Response,
            AggregateRequest: modifyRequest,
            Stepped: true,
            Cache: false
        } );

        if ( isDefined( result.results ) ) {
            if ( result.results[ 0 ].StatusCode.StatusCode != StatusCode.Good ) {
                throw ( "RunBadPercentage internal aggregate should have passed" );
            }
        } else {
            throw ( "RunBadPercentage call should have passed" );
        }


    }

    this.RunBadAggregateId = function () {
        var testCase = this.Processed[ 0 ];
        var raw = this.Raw.Get( testCase.DataSetName );

        var modifyRequest = testCase.AggregateRequest.clone();
        var details = modifyRequest.HistoryReadDetails.toReadProcessedDetails();

        var aggregates = new UaNodeIds( this.NumberOfItems );
        for ( var aggregateIndex = 0; aggregateIndex < this.NumberOfItems; aggregateIndex++ ) {
            aggregates[ aggregateIndex ] = new UaNodeId( Identifier.ReadRawModifiedDetails );
        }

        details.AggregateType = aggregates;

        var modifyDetails = new UaExtensionObject();
        modifyDetails.setReadProcessedDetails( details );

        modifyRequest.HistoryReadDetails = modifyDetails;

        var result = ExecuteAggregateQueryReadResultsHelper.Execute( {
            RawRequest: raw.Request,
            RawResults: raw.Response,
            AggregateRequest: modifyRequest,
            Stepped: true,
            Cache: false
        } );

        if ( isDefined( result.results ) ) {
            if ( result.results[ 0 ].StatusCode.StatusCode != StatusCode.BadHistoryOperationInvalid ) {
                throw ( "RunBadAggregateId should have failed" );
            }
        } else {
            throw ( "RunBadAggregateId call should have passed" );
        }
    }

    this.RunBadAggregateRequest = function () {
        var testCase = this.Processed[ 0 ];
        var raw = this.Raw.Get( testCase.DataSetName );

        // Create a history read for raw data
        var badAggregateRequest = this.GetRawRequest( raw.HistoryItems );

        var result = ExecuteAggregateQueryReadResultsHelper.Execute( {
            RawRequest: raw.Request,
            RawResults: raw.Response,
            AggregateRequest: badAggregateRequest,
            Stepped: true,
            Cache: false
        } );

        if ( result.status == true ) {
            throw ( "RunBadAggregateRequest should have failed" );
        }
    }

    this.RunEmptyAggregateRequest = function () {
        var testCase = this.Processed[ 0 ];
        var raw = this.Raw.Get( testCase.DataSetName );

        // Create a history read for raw data
        var emptyAggregateRequest = new UaHistoryReadRequest()

        var result = ExecuteAggregateQueryReadResultsHelper.Execute( {
            RawRequest: raw.Request,
            RawResults: raw.Response,
            AggregateRequest: emptyAggregateRequest,
            Stepped: true,
            Cache: false
        } );

        if ( result.status == true ) {
            throw ( "RunEmptyAggregateRequest should have failed" );
        }

    }
}

var dataHelper = new AggregateTestData();
var testAggregates = new TestAggregates();
testAggregates.run( dataHelper );





