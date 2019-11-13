	sap.ui.define(["sap/ui/core/mvc/Controller",
			"sap/m/MessageBox",
			"sap/ui/model/json/JSONModel",
			"./utilities",
			"sap/ui/core/routing/History",
			"sap/ui/Device",
			"sap/ui/model/Filter"
		], function (BaseController, MessageBox, JSONModel, Utilities, History, Device, Filter) {
			"use strict";
			var hasError = "";

			return BaseController.extend("com.sap.build.h12f10161-us_3.dashboardOrdem.controller.OrdemDeVendas", {
				getObs: function (oEvt) {
					var oModel = this.getView().getModel();
					var path = oEvt.getSource().getBindingContext().getPath();
					var key = path.substr(1);
					var values = oModel.oData[key];
					var changes = oEvt.getSource().getModel().getPendingChanges()[key];
					values.Status_aprov = changes.Status_aprov;
					values.Observacao = changes.Observacao;

					oModel.update(path, values, {
						method: "PUT",
						success: function (data) {},
						error: function (e) {
							var error = e.responseText;

							var jsonError = JSON.parse(error);
							var sMessage = " ";
							var errorDetails = jsonError.error.innererror.errordetails;

							if (errorDetails) {
								for (var i = 0, len = errorDetails.length; i < len; i++) {
									var message = errorDetails[i].message + "\n\n";
									sMessage += message;
								}
								MessageBox.error(
									sMessage, {
										actions: [sap.m.MessageBox.Action.OK],
										styleClass: "sapUiSizeCompact"
									}
								);
							}
						}
					});
					this.oDialogObs.close();
				},

				saveObservation: function () {
					this.getObs();
				},

				getDialog: function (id) {
					if (!this.oDialogObs) {
						this.oDialogObs = sap.ui.xmlfragment("com.sap.build.h12f10161-us_3.dashboardOrdem.view.observation", this);
						this.getView().addDependent(this.oDialogObs);
						this.oDialogObs.idRow = id;
					}
					return this.oDialogObs;
				},

				onOpenDialog: function (oEvent) {
					var path = oEvent.getSource().getBindingContext().getPath();
					var id = path.substr(1);

					var bloqueio = this.getView().getModel().oData[id].Bloqueio;
					if (bloqueio != "R") {
						if (!this.oDialogObs) {
							this.oDialogObs = sap.ui.xmlfragment("com.sap.build.h12f10161-us_3.dashboardOrdem.view.observation", this);
							this.getView().addDependent(this.oDialogObs);
						}
						this.oDialogObs.bindObject(path).open();
					} else {
						if (this.getView().getModel().hasPendingChanges()) {
							this.getView().getModel().resetChanges();
						}
						sap.m.MessageBox.error("Não é possível liberar ordem com bloqueio de remessa");
					}
				},

				handleRouteMatched: function (oEvent) {
					var sAppId = "App5d2490b700160954c5f85bec";

					var oParams = {};

					if (oEvent.mParameters.data.context) {
						this.sContext = oEvent.mParameters.data.context;
					}

					var oPath;

					if (this.sContext) {
						oPath = {
							path: "/" + this.sContext,
							parameters: oParams
						};
						this.getView().bindObject(oPath);
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

				onCellClick: function (oEvt) {
					var oBindingContext = oEvt.getParameter("rowBindingContext").getObject();
					var cliente = oBindingContext.Cliente;
					var item = oBindingContext.Item;
					var ordem = oBindingContext.Ordem;

					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("AnaliseDeDados", {
						cliente: cliente,
						ordem: ordem,
						item: item
					});

				},

				doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
					var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
					var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

					var sEntityNameSet;
					if (sPath !== null && sPath !== "") {
						if (sPath.substring(0, 1) === "/") {
							sPath = sPath.substring(1);
						}
						sEntityNameSet = sPath.split("(")[0];
					}
					var sNavigationPropertyName;
					var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

					if (sEntityNameSet !== null) {
						sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(
							sEntityNameSet,
							sRouteName);
					}
					if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
						if (sNavigationPropertyName === "") {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						} else {
							oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
								if (bindingContext) {
									sPath = bindingContext.getPath();
									if (sPath.substring(0, 1) === "/") {
										sPath = sPath.substring(1);
									}
								} else {
									sPath = "undefined";
								}

								// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
								if (sPath === "undefined") {
									this.oRouter.navTo(sRouteName);
								} else {
									this.oRouter.navTo(sRouteName, {
										context: sPath,
										masterContext: sMasterContext
									}, false);
								}
							}.bind(this));
						}
					} else {
						this.oRouter.navTo(sRouteName);
					}

					if (typeof fnPromiseResolve === "function") {
						fnPromiseResolve();
					}
				},

				init: function (oEvt) {
					var columnsLength = oEvt.getSource().getTable().getColumns().length;

					for (var i = 0; i < columnsLength; i++) {
						if (i === 0) {
							oEvt.getSource().getTable().getColumns()[i].setWidth('15rem');
						} else {
							oEvt.getSource().getTable().getColumns()[i].setWidth('10rem');
						}
					}
				},
				beforeRebindTable: function (oEvt) {
					var filters = [];

					filters = oEvt.getParameter("bindingParams").filters;

					this.getOwnerComponent().getModel().read(
						"/ZFI_DASHBOARD_VALOR_FATURAR", {
							filters: filters,
							success: function (oData, response) {
								var json = new sap.ui.model.json.JSONModel();
								json.setData(oData.results);
								this.getView().setModel(json, "ValorFaturar");
							}.bind(this)
						}
					);

				},

				onInit: function () {
					this._mViewSettingsDialogs = {};
					this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					this.oRouter.getTarget("OrdemDeVendas").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

					var oModel = new sap.ui.model.json.JSONModel('/sap/opu/odata/sap/ZFI_GW_DASH_OV/');
					this.getView().setModel(oModel, "OrdemVenda");
				},

				onExit: function () {

					// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
					var aControls = [{
						"controlId": "tOrdemVenda",
						"groups": ["rows"]
					}];
					for (var i = 0; i < aControls.length; i++) {
						var oControl = this.getView().byId(aControls[i].controlId);
						if (oControl) {
							for (var j = 0; j < aControls[i].groups.length; j++) {
								var sAggregationName = aControls[i].groups[j];
								var oBindingInfo = oControl.getBindingInfo(sAggregationName);
								if (oBindingInfo) {
									var oTemplate = oBindingInfo.template;
									oTemplate.destroy();
								}
							}
						}
					}

				},

			});
		},
		/* bExport= */
		true);