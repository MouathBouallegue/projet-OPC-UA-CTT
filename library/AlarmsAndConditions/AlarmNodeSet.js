include( "./library/Information/NodeSet2.xml/NodeSetUtility.js" );

/**
 * Implementation of a nodeset specifically for Alarming
 * This object should only handle the creation and direction to the nodeset.
 */
function AlarmNodeSet() {

    this.NodeSetUtility = null;

    /**
     * Retrieve the Nodeset utility
     * @returns {object}
     */
    this.GetNodeSetUtility = function () {
        this.CreateNodeSet();
        return this.NodeSetUtility;
    }

    /**
     * Retrieve the Alarm Nodeset Map
     * @returns {KeyPairCollection}
     */
    this.GetNodeSet = function () {
        return this.GetNodeSetUtility().GetNodeSet();
    }

    /**
     * Create the Alarm Nodeset Map
     */
    this.CreateNodeSet = function () {
        if ( !isDefined( this.NodeSetUtility ) ) {
            this.NodeSetUtility = new NodeSetUtility();
            this.NodeSetUtility.GetNodeSet();
        }
    }
}
