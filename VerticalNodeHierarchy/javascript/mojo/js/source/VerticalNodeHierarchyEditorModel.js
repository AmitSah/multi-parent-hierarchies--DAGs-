(function () { 
    if (!mstrmojo.plugins.VerticalNodeHierarchy) {
        mstrmojo.plugins.VerticalNodeHierarchy = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.vi.models.editors.CustomVisEditorModel",
        "mstrmojo.array"
    );
	
	var $WT = mstrmojo.vi.models.editors.CustomVisEditorModel.WIDGET_TYPE;

    mstrmojo.plugins.VerticalNodeHierarchy.VerticalNodeHierarchyEditorModel = mstrmojo.declare(
        mstrmojo.vi.models.editors.CustomVisEditorModel,
        null,
        {
            scriptClass: "mstrmojo.plugins.VerticalNodeHierarchy.VerticalNodeHierarchyEditorModel",
            cssClass: "VerticalNodeHierarchyeditormodel",
            getCustomProperty: function getCustomProperty(){
				






}
})}());
//@ sourceURL=VerticalNodeHierarchyEditorModel.js