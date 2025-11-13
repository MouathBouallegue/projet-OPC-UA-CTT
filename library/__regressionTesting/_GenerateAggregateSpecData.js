include( "./library/__regressionTesting/_AggregateTestData.js" );

function GenerateAggregateSpecData() {

    /*
        Aggregate
            Forward[]
                Historian
                    Test
                    Spec103
                    Spec104
            Reverse[]
                Historian
                    Test
                    Spec103
                    Spec104
    */

    this.Combined = new KeyPairCollection();
    this.Aggregates = new KeyPairCollection();
    this.AggregateData = null;
    this.Rows = [];

    this.Run = function ( aggregateData ) {

        this.AggregateData = aggregateData;
        this.Initialize();
        this.Generate();

        this.Rows.forEach( function( line ){ print( line ) ;});
    }

    this.Initialize = function(){
        var testData = this.GetTestData();
        var spec103 = this.GetTestCases( this.AggregateData.spec103Data ); 
        var spec104 = this.GetTestCases( this.AggregateData.spec104Data );
        var map = this.Aggregates;
        testData.forEach( function( testCase ){
            var name = testCase.AggregateName;
            if ( !map.Contains( name ) ){
                map.Set( name, name );
            }
        } );

        var combined = this.Combined;
        map.Iterate( function( aggregateName, aggregateData, args ) {
            
            var thisObject = args.This;

            var aggregateTestData = {
                Forward: new KeyPairCollection(),
                Reverse: new KeyPairCollection()
            };

            combined.Set( aggregateName, aggregateTestData );

            testData.forEach( function( testCase ){
                if ( testCase.AggregateName == aggregateName ){

                    var historianCase = {
                        Name: testCase.DataSetName,
                        TestCase: testCase,
                        Spec103: null,
                        Spec104: null,
                    };

                    var holder = aggregateTestData.Forward;
                    var reverse = thisObject.IsReverse( testCase );
                    if ( reverse ){
                        holder = aggregateTestData.Reverse;
                    }

                    for ( var index = 0; index < spec103.length; index++ ){
                        var specTestCase = spec103[ index ];
                        if ( specTestCase.AggregateName == testCase.AggregateName && 
                            specTestCase.DataSetName == testCase.DataSetName && 
                            thisObject.IsReverse( specTestCase ) == reverse ){
                            historianCase.Spec103 = specTestCase;
                            break;
                        }
                    }
                    for ( var index = 0; index < spec104.length; index++ ){
                        var specTestCase = spec104[ index ];
                        if ( specTestCase.AggregateName == testCase.AggregateName && 
                            specTestCase.DataSetName == testCase.DataSetName && 
                            thisObject.IsReverse( specTestCase ) == reverse ){
                            historianCase.Spec104 = specTestCase;
                            break;
                        }
                    }

                    holder.Set( testCase.DataSetName, historianCase );
                }
            } )

        },{ This:this } );
    }

    this.Generate = function(){
        this.Rows.push( "Aggregate,Historian,Direction,Index,Time,Value,StatusCode,104 Value,104 Quality,Mantis,Resolved,Manually Resolved,Note" );

        this.Combined.Iterate( function( aggregateName, testCases, args ){
            args.This.GenerateAggregate( testCases.Forward );
        },{This: this});
        this.Combined.Iterate( function( aggregateName, testCases, args ){
            args.This.GenerateAggregate( testCases.Reverse );
        },{This: this});
    }

    this.GenerateAggregate = function( testCases ){
        testCases.Iterate( function( dataSetName, testCase, args ){
            args.This.GenerateAggregateTestCase( testCase )
        },{This: this});
    }

    this.GenerateAggregateTestCase = function( testCases ){

        var testCase = testCases.TestCase;
        var direction = this.IsReverse( testCase ) ? "Reverse" : "Forward";
        this.Rows.push( "" );
        this.Rows.push( 
            testCase.AggregateName + "," + 
            testCase.DataSetName + "," + 
            direction );

        for ( var index = 0; index < testCase.Values.Value.length; index++ ){
            this.Rows.push( this.GenerateAggregateTestCaseRow( index, testCases ) );
        } 
    }

    this.GenerateAggregateTestCaseRow = function( index, testCase ){

        var testCaseRow = testCase.TestCase.Values.Value[ index ];
        // Mantis, Resolved, Manually Resolved, Note
        var mantis = this.GetPropertyValue( testCaseRow, "Mantis" );
        var resolved = this.GetPropertyValue( testCaseRow, "Resolved" );
        var manualResolve = this.GetPropertyValue( testCaseRow, "ManuallyResolved" );
        var note = this.GetPropertyValue( testCaseRow, "Note" );
        var trailer = mantis + "," + resolved + "," + manualResolve + "," + '"' + note + '"'; 

        return ",,," + 
            index + "," +
            testCaseRow.Timestamp + "," +
            this.GetValue( testCaseRow ) + "," + 
            '"' + testCaseRow.Quality + '",' + 
            this.GetSpecString( testCaseRow, index, testCase.Spec104 ) +
            trailer;
    }

    this.GetPropertyValue = function( testCaseRow, variable ){
        var value = "";

        if ( isDefined( testCaseRow[ variable ] ) ){
            value = testCaseRow[ variable ];
        }
        return value;
    }

    this.GetValue = function( row ){
        value = "";
        if ( isDefined( row.Value ) ){
            value = row.Value;
        }
        return value;
    }

    this.AreValuesEqual = function( one, two ){
        var oneVal = parseFloat( one );
        var twoVal = parseFloat( two );


        return ( oneVal === twoVal || one === two );
    }

    this.GetSpecString = function( testCaseRowData, index, specData ){
        var specString = ",,";
        if ( isDefined( specData ) ){
            if ( index < specData.Values.Value.length ){
                var specRow = specData.Values.Value[ index ];
                var specValue = "";
                var specQuality = ""
                var testCaseRowValue = this.GetValue( testCaseRowData );
                var specRowValue = this.GetValue( specRow );
                if ( !this.AreValuesEqual( this.GetValue( testCaseRowData ), this.GetValue( specRow ) ) ){
                    specValue = this.GetValue( specRow );
                    if ( specValue.length == 0 ){
                        specValue = "Null";
                    }
                }
                if ( !this.AreValuesEqual( testCaseRowData.Quality, specRow.Quality ) ){
                    specQuality = '"' + specRow.Quality + '"';
                }
                specString = specValue + "," + specQuality + ",";
            }
        }
        return specString;
    }

    this.GetTestData = function(){
        return this.GetTestCases( this.AggregateData.testData );
    }

    this.GetTestCases = function( rootData ){
        return rootData.ProcessedDataSets.DataSet;
    }

    this.IsReverse = function( testCase ){
        var isReverse = false;
        if ( isDefined( testCase.TimeFlowsBackwards ) && testCase.TimeFlowsBackwards ){
            isReverse = true;
        } 
        return isReverse;
    }
}

var aggregateData = new AggregateTestData();
var generate = new GenerateAggregateSpecData();
generate.Run( aggregateData );





