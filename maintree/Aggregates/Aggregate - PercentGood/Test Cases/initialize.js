include( "./maintree/Aggregates/Aggregate - Average/Test Cases/initialize.js" );
include( "./library/ServiceBased/AttributeServiceSet/HistoryRead/HAAggregateHelper.js" );

var AggregateHelper = new AggregateHelperService();

var CUVariables = AggregateHelper.Initialize( "PercentGood" );
