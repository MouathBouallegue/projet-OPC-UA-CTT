
function WhereClauseCreatorService(){


    this.CreateEmptyWhereClause = function(){
        var whereClause = new UaContentFilter();
        whereClause.Elements = new UaContentFilterElements();

        return whereClause;
    }

    // Create Filter Elements
    this.CreateTwoOperandFilterElement = function( filterOperator, name, value ){
        
        var element = new UaContentFilterElement();
        element.FilterOperator = filterOperator;
        element.FilterOperands = new UaExtensionObjects();
        element.FilterOperands[0] = this.CreateSimpleAttributeOperand( name );
        element.FilterOperands[1] = this.CreateLiteralOperand( value );

        return element;
    }

    this.CreateSingleOperandFilterElement = function( filterOperator, index ){

        var element = new UaContentFilterElement();
        element.FilterOperator = filterOperator;
        element.FilterOperands = new UaExtensionObjects();
        element.FilterOperands[0] = this.CreateElementOperand( index );

        return element;
    }

    this.CreateSimpleOperandFilterElement = function( filterOperator, name ){
        
        var element = new UaContentFilterElement();
        element.FilterOperator = filterOperator;
        element.FilterOperands = new UaExtensionObjects();
        element.FilterOperands[0] = this.CreateSimpleAttributeOperand( name );

        return element;
    }

    this.CreateBetweenOperandFilterElement = function( name, lowValue, highValue ){
    
        var element = new UaContentFilterElement();
        element.FilterOperator = FilterOperator.Between;
        element.FilterOperands = new UaExtensionObjects();
        element.FilterOperands[0] = this.CreateSimpleAttributeOperand( name );
        element.FilterOperands[1] = this.CreateLiteralOperand( lowValue );
        element.FilterOperands[2] = this.CreateLiteralOperand( highValue );

        return element;
    }

    this.CreateOfTypeOperandFilterElement = function( type ){

        var element = new UaContentFilterElement();
        element.FilterOperator = FilterOperator.OfType;
        element.FilterOperands = new UaExtensionObjects();
        element.FilterOperands[0] = this.CreateLiteralOperand( type );

        return element;
    }

    // Create Operands

    this.CreateSimpleAttributeOperand = function( value ){
        var simpleOperandValue = this.CreateSimpleOperand( value );

        var simpleOperandObject = new UaExtensionObject();
        simpleOperandObject.setSimpleAttributeOperand( simpleOperandValue );

        return simpleOperandObject;
    }

    this.CreateLiteralOperand = function( value ){
        var literalOperandValue = new UaLiteralOperand( );
        literalOperandValue.Value = value;

        var literalOperandObject = new UaExtensionObject( );
        literalOperandObject.setLiteralOperand(  literalOperandValue );

        return literalOperandObject;
    }

    this.CreateElementOperand = function( index ){
        var elementOperandValue = new UaElementOperand();
        elementOperandValue.Index = index;

        var elementOperandObject = new UaExtensionObject();
        elementOperandObject.setElementOperand( elementOperandValue );

        return elementOperandObject;
    }

    this.CreateSimpleOperand = function( name ){
        return UaSimpleAttributeOperand.New(
            { 
                AttributeId: Attribute.Value, 
                BrowsePath: this.GetBrowsePath( name ),
                TypeDefinitionId: new UaNodeId( Identifier.BaseEventType )
             } );
    }

    this.GetBrowsePath = function( name ){
        var nameType = typeof( name );

        var browsePath = [];
        if ( nameType == "object" ){
            for( var index = 0; index < name.length; index++ ){
                browsePath.push( UaQualifiedName.New( { Name: name[index] } ) );
            }
        }else if ( nameType == "string" ){
            browsePath.push( UaQualifiedName.New( { Name: name } ) );
        }

        return browsePath;
    }
};