(function () { 
    if (!mstrmojo.plugins.VerticalNodeHierarchy) {
        mstrmojo.plugins.VerticalNodeHierarchy = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.vi.models.CustomVisDropZones",
        "mstrmojo.array"
    );

    mstrmojo.plugins.VerticalNodeHierarchy.VerticalNodeHierarchyDropZones = mstrmojo.declare(
        mstrmojo.vi.models.CustomVisDropZones,
        null,
        {
            scriptClass: "mstrmojo.plugins.VerticalNodeHierarchy.VerticalNodeHierarchyDropZones",
            cssClass: "VerticalNodeHierarchydropzones",
            getCustomDropZones: function getCustomDropZones(){
  return [ 
 { 
name: "Attribute", 
maxCapacity:2, 
title:"Drag Parent Attribute Here", 
allowObjectType:1
 }, { 
name: "Metric", 
maxCapacity:1, 
title:"Drag Metric Here", 
allowObjectType:2
 }/*, { 
name: "Tooltip", 
maxCapacity:4, 
title:"Drag Metric Here", 
allowObjectType:2
 }*/
 ];},
            shouldAllowObjectsInDropZone: function shouldAllowObjectsInDropZone(zone, dragObjects, idx, edge, context) {
 








},
            getActionsForObjectsDropped: function getActionsForObjectsDropped(zone, droppedObjects, idx, replaceObject, extras) {
 








},
            getActionsForObjectsRemoved: function getActionsForObjectsRemoved(zone, objects) { 
 








},
            getDropZoneContextMenuItems: function getDropZoneContextMenuItems(cfg, zone, object, el) {
 








}
})}());
//@ sourceURL=VerticalNodeHierarchyDropZones.js