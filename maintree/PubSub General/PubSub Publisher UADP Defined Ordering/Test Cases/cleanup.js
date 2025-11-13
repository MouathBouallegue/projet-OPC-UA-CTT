// Clean up created Connection and PublishedDataSets
if( isDefined( configResult ) && configResult.success ) {
    if( !EraseConfigElementsFromServer( CU_Variables.PublisherConfiguration ) ) {
        addError( "Failed to cleanup generated configuration elements from server. Please cleanup manually." );
    }
}
Test.Disconnect();