function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZFI_GW_DASH_OV_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}