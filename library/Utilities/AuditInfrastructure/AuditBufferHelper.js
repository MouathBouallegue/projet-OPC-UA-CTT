/*    This class object is responsible for calling the GetBuffer() service and for also
      performing any validation etc.*/

function AuditBufferHelperClass() {

    this.eventValuesToString = function ( event, attributes, indent ) {
        var eventLines = [];
        var eventLineCounter = 0;
        if ( attributes == undefined || attributes == null || attributes.length == undefined || attributes.length == 0 ) return;
        if ( event == undefined || event == null || event.EventFields == undefined || event.EventFields.length == undefined || event.EventFields.length == 0 ) return;
        if ( !isDefined( indent ) ) indent = 0;
        if ( attributes.length !== event.EventFields.length ) return;
        for ( var index = 0; index < attributes.length; index++ ) {
            var fieldLine = "";
            for ( var indentIndex = 0; indentIndex < indent; indentIndex++ ) {
                fieldLine += "\t";
            }
            if ( isDefined( attributes[ index ].BrowsePath ) ) {
                fieldLine += "[" + index + "]: " + attributes[ index ].BrowsePath[ 0 ].Name + ": " + event.EventFields[ index ];
            } else {
                fieldLine += "[" + index + "]: " + attributes[ index ] + ": " + event.EventFields[ index ];
            }

            eventLines[ eventLineCounter++ ] = fieldLine;
        }

        return eventLines;
    }

    this.ValuesToString = function ( caller, results, selectClauses ) {
        var lines = [];
        var lineIndex = 0;

        if ( !isDefined( results ) || !isDefined( results.status ) || !isDefined( selectClauses ) ) {
            lines[ lineIndex++ ] = "No results or select clauses";
            return lines;
        }

        if ( results.status != true ) {
            lines[ lineIndex++ ] = caller + " Status is Bad";
            return lines;
        }

        if ( !isDefined( results.events ) ) {
            lines[ lineIndex++ ] = caller + " Status is Good, but no events";
            return lines;
        }

        var eventBuffers = results.events;

        lines[ lineIndex++ ] = caller + " contains " + eventBuffers.length + " events ";

        for ( var eventIndex = 0; eventIndex < eventBuffers.length; eventIndex++ ) {
            var event = eventBuffers[ eventIndex ];
            if ( isDefined( event.EventFieldList ) ) {
                lines[ lineIndex++ ] = "Event #" + ( 1 + eventIndex ) + " of " + eventBuffers.length + " ID = [" + event.EventHandle + "]";
                var eventLines = this.eventValuesToString( event.EventFieldList, selectClauses, 1 );
                lines.push.apply( lines, eventLines );
                lineIndex = lines.length;
            }
        }

        return lines;
    };
}

var AuditBufferHelper = new AuditBufferHelperClass();




