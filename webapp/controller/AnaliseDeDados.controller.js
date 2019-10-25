sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./Dialog2",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Dialog2, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.h12f10161-us_3.dashboardTabelas.controller.AnaliseDeDados", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5d2490b700160954c5f85bec";
			var cliente = oEvent.getParameter("data").cliente;
			if (cliente) {

				this.getView().bindObject({
					path: "/ZFI_DASHBOARD_DETALHES('" + oEvent.getParameter("data").cliente + "')",
					parameters: {
						expand: "to_cliente,to_fornecedores,to_garantia,to_faturamento,to_balanco,to_culturas"
					}
				});
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("OrdemDeVendas", true);
				// 
			}

		},
		_onPageNavButtonPress: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("default", true);
			}

		},
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		_onLinkPress: function (oEvent) {

			var sDialogName = "Dialog2";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new Dialog2(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		_onLinkPress1: function () {
			return new Promise(function (fnResolve) {
				var sTargetPos = "center center";
				sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
				sap.m.MessageToast.show("Irá te levar ao S4", {
					onClose: fnResolve,
					duration: 0 || 3000,
					at: sTargetPos,
					my: sTargetPos
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		// _onOverflowToolbarButtonPress: function (oEvent) {

		// 	this.mSettingsDialogs = this.mSettingsDialogs || {};
		// 	var sSourceId = oEvent.getSource().getId();
		// 	var oDialog = this.mSettingsDialogs["ViewSettingsDialog1"];

		// 	var confirmHandler = function (oConfirmEvent) {
		// 		var self = this;
		// 		var sFilterString = oConfirmEvent.getParameter('filterString');
		// 		var oBindingData = {};

		// 		/* Grouping */
		// 		if (oConfirmEvent.getParameter("groupItem")) {
		// 			var sPath = oConfirmEvent.getParameter("groupItem").getKey();
		// 			oBindingData.groupby = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("groupDescending"), true)];
		// 		} else {
		// 			// Reset the group by
		// 			oBindingData.groupby = null;
		// 		}

		// 		/* Sorting */
		// 		if (oConfirmEvent.getParameter("sortItem")) {
		// 			var sPath = oConfirmEvent.getParameter("sortItem").getKey();
		// 			oBindingData.sorters = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("sortDescending"))];
		// 		}

		// 		/* Filtering */
		// 		oBindingData.filters = [];
		// 		// The list of filters that will be applied to the collection
		// 		var oFilter;
		// 		var vValueLT, vValueGT;

		// 		// Simple filters (String)
		// 		var mSimpleFilters = {},
		// 			sKey;
		// 		for (sKey in oConfirmEvent.getParameter("filterKeys")) {
		// 			var aSplit = sKey.split("___");
		// 			var sPath = aSplit[1];
		// 			var sValue1 = aSplit[2];
		// 			var oFilterInfo = new sap.ui.model.Filter(sPath, "EQ", sValue1);

		// 			// Creating a map of filters for each path
		// 			if (!mSimpleFilters[sPath]) {
		// 				mSimpleFilters[sPath] = [oFilterInfo];
		// 			} else {
		// 				mSimpleFilters[sPath].push(oFilterInfo);
		// 			}
		// 		}

		// 		for (var path in mSimpleFilters) {
		// 			// All filters on a same path are combined with a OR
		// 			oBindingData.filters.push(new sap.ui.model.Filter(mSimpleFilters[path], false));
		// 		}

		// 		aCollections.forEach(function (oCollectionItem) {
		// 			var oCollection = self.getView().byId(oCollectionItem.id);
		// 			var oBindingInfo = oCollection.getBindingInfo(oCollectionItem.aggregation);
		// 			var oBindingOptions = this.updateBindingOptions(oCollectionItem.id, oBindingData, sSourceId);
		// 			if (oBindingInfo.model === "kpiModel") {
		// 				oCollection.getObjectBinding().refresh();
		// 			} else {
		// 				oCollection.bindAggregation(oCollectionItem.aggregation, {
		// 					model: oBindingInfo.model,
		// 					path: oBindingInfo.path,
		// 					parameters: oBindingInfo.parameters,
		// 					template: oBindingInfo.template,
		// 					templateShareable: true,
		// 					sorter: oBindingOptions.sorters,
		// 					filters: oBindingOptions.filters
		// 				});
		// 			}

		// 			// Display the filter string if necessary
		// 			if (typeof oCollection.getInfoToolbar === "function") {
		// 				var oToolBar = oCollection.getInfoToolbar();
		// 				if (oToolBar && oToolBar.getContent().length === 1) {
		// 					oToolBar.setVisible(!!sFilterString);
		// 					oToolBar.getContent()[0].setText(sFilterString);
		// 				}
		// 			}
		// 		}, this);
		// 	}.bind(this);

		// 	function resetFiltersHandler() {

		// 	}

		// 	function updateDialogData(filters) {
		// 		var mParams = {
		// 			context: oReferenceCollection.getBindingContext(),
		// 			success: function (oData) {
		// 				var oJsonModelDialogData = {};
		// 				// Loop through each entity
		// 				oData.results.forEach(function (oEntity) {
		// 					// Add the distinct properties in a map
		// 					for (var oKey in oEntity) {
		// 						if (!oJsonModelDialogData[oKey]) {
		// 							oJsonModelDialogData[oKey] = [oEntity[oKey]];
		// 						} else if (oJsonModelDialogData[oKey].indexOf(oEntity[oKey]) === -1) {
		// 							oJsonModelDialogData[oKey].push(oEntity[oKey]);
		// 						}
		// 					}
		// 				});

		// 				var oDialogModel = oDialog.getModel();

		// 				if (!oDialogModel) {
		// 					oDialogModel = new sap.ui.model.json.JSONModel();
		// 					oDialog.setModel(oDialogModel);
		// 				}
		// 				oDialogModel.setData(oJsonModelDialogData);
		// 				oDialog.open();
		// 			}
		// 		};
		// 		var sPath;
		// 		var sModelName = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).model;
		// 		// In KPI mode for charts, getBindingInfo would return the local JSONModel
		// 		if (sModelName === "kpiModel") {
		// 			sPath = oReferenceCollection.getObjectBinding().getPath();
		// 		} else {
		// 			sPath = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).path;
		// 		}
		// 		mParams.filters = filters;
		// 		oModel.read(sPath, mParams);
		// 	}

		// 	if (!oDialog) {
		// 		oDialog = sap.ui.xmlfragment({
		// 			fragmentName: "com.sap.build.h12f10161-us_3.dashboardTabelas.view.ViewSettingsDialog1"
		// 		}, this);
		// 		oDialog.attachEvent("confirm", confirmHandler);
		// 		oDialog.attachEvent("resetFilters", resetFiltersHandler);

		// 		this.mSettingsDialogs["ViewSettingsDialog1"] = oDialog;
		// 	}

		// 	var aCollections = [];

		// 	aCollections.push({
		// 		id: "sap_Responsive_Page_0-content-sap_m_IconTabBar-1560258768827-items-sap_m_IconTabFilter-3-content-sap_ui_layout_BlockLayout-1560274698582-content-sap_ui_layout_BlockLayoutRow-1-content-sap_ui_layout_BlockLayoutCell-1-content-build_simple_Table-1",
		// 		aggregation: "items"
		// 	});

		// 	var oReferenceCollection = this.getView().byId(aCollections[0].id);
		// 	var oSourceBindingContext = oReferenceCollection.getBindingContext();
		// 	var oModel = oSourceBindingContext ? oSourceBindingContext.getModel() : this.getView().getModel();

		// 	// toggle compact style
		// 	jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
		// 	var designTimeFilters = this.mBindingOptions && this.mBindingOptions[aCollections[0].id] && this.mBindingOptions[aCollections[0].id]
		// 		.filters && this.mBindingOptions[aCollections[0].id].filters[undefined];
		// 	updateDialogData(designTimeFilters);

		// },
		// updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
		// 	this.mBindingOptions = this.mBindingOptions || {};
		// 	this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

		// 	var aSorters = this.mBindingOptions[sCollectionId].sorters;
		// 	var aGroupby = this.mBindingOptions[sCollectionId].groupby;

		// 	// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
		// 	if (oBindingData) {
		// 		if (oBindingData.sorters) {
		// 			aSorters = oBindingData.sorters;
		// 		}
		// 		if (oBindingData.groupby || oBindingData.groupby === null) {
		// 			aGroupby = oBindingData.groupby;
		// 		}
		// 		// 1) Update the filters map for the given collection and source
		// 		this.mBindingOptions[sCollectionId].sorters = aSorters;
		// 		this.mBindingOptions[sCollectionId].groupby = aGroupby;
		// 		this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
		// 		this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
		// 	}

		// 	// 2) Reapply all the filters and sorters
		// 	var aFilters = [];
		// 	for (var key in this.mBindingOptions[sCollectionId].filters) {
		// 		aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
		// 	}

		// 	// Add the groupby first in the sorters array
		// 	if (aGroupby) {
		// 		aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
		// 	}

		// 	var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
		// 	return {
		// 		filters: aFinalFilters,
		// 		sorters: aSorters
		// 	};

		// },
		// getCustomFilter: function (sPath, vValueLT, vValueGT) {
		// 	if (vValueLT !== "" && vValueGT !== "") {
		// 		return new sap.ui.model.Filter([
		// 			new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT),
		// 			new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT)
		// 		], true);
		// 	}
		// 	if (vValueLT !== "") {
		// 		return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT);
		// 	}
		// 	return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT);

		// },
		// getCustomFilterString: function (bIsNumber, sPath, sOperator, vValueLT, vValueGT) {
		// 	switch (sOperator) {
		// 	case sap.ui.model.FilterOperator.LT:
		// 		return sPath + (bIsNumber ? ' (Less than ' : ' (Before ') + vValueLT + ')';
		// 	case sap.ui.model.FilterOperator.GT:
		// 		return sPath + (bIsNumber ? ' (More than ' : ' (After ') + vValueGT + ')';
		// 	default:
		// 		if (bIsNumber) {
		// 			return sPath + ' (More than ' + vValueGT + ' and less than ' + vValueLT + ')';
		// 		}
		// 		return sPath + ' (After ' + vValueGT + ' and before ' + vValueLT + ')';
		// 	}

		// },
		_onLinkPress2: function (oEvent) {

			var sDialogName = "Dialog2";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new Dialog2(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		_onLinkPress3: function () {
			return new Promise(function (fnResolve) {
				var sTargetPos = "center center";
				sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
				sap.m.MessageToast.show("Irá te levar ao S4", {
					onClose: fnResolve,
					duration: 0 || 3000,
					at: sTargetPos,
					my: sTargetPos
				});
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("AnaliseDeDados").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}

	});
}, /* bExport= */ true);