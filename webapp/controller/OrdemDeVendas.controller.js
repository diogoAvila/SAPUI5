	sap.ui.define(["sap/ui/core/mvc/Controller",
			"sap/m/MessageBox",
			"sap/ui/model/json/JSONModel",
			"./Dialog3",
			"sap/m/Dialog",
			"./utilities",
			"sap/ui/core/routing/History",
			"sap/ui/Device",
			"sap/ui/model/Filter"
		], function (BaseController, MessageBox, JSONModel, Dialog3, Dialog, Utilities, History, Device, Filter) {
			"use strict";
			var hasError = "";

			return BaseController.extend("com.sap.build.h12f10161-us_3.dashboardTabelas.controller.OrdemDeVendas", {
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
						this.oDialogObs = sap.ui.xmlfragment("com.sap.build.h12f10161-us_3.dashboardTabelas.view.observation", this);
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
							this.oDialogObs = sap.ui.xmlfragment("com.sap.build.h12f10161-us_3.dashboardTabelas.view.observation", this);
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

				createViewSettingsDialog: function (sDialogFragmentName) {
					var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

					if (!oDialog) {
						oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
						this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

						if (Device.system.desktop) {
							oDialog.addStyleClass("sapUiSizeCompact");
						}
					}
					return oDialog;
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
					debugger;

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

				_onOverflowToolbarButtonPress: function (oEvent) {
					debugger;
					this.mSettingsDialogs = this.mSettingsDialogs || {};
					var sSourceId = oEvent.getSource().getId();
					var oDialog = this.mSettingsDialogs["Filter1"];

					var confirmHandler = function (oConfirmEvent) {
						debugger;
						var self = this;
						var oBindingData = {};
						// /* Grouping */
						// if (oConfirmEvent.getParameter("groupItem")) {
						// 	var sPath = oConfirmEvent.getParameter("groupItem").getKey();
						// 	oBindingData.groupby = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("groupDescending"), true)];
						// } else {
						// 	// Reset the group by
						// 	oBindingData.groupby = null;
						// }

						// /* Sorting */
						// if (oConfirmEvent.getParameter("sortItem")) {
						// 	var sPath = oConfirmEvent.getParameter("sortItem").getKey();
						// 	oBindingData.sorters = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("sortDescending"))];
						// }

						/* Filtering */
						oBindingData.filters = [];
						var oFilter;

						var mSimpleFilters = {},
							sKey;

						for (sKey in oConfirmEvent.getParameter("filterKeys")) {
							var aSplit = sKey.split("___");
							var sPath = aSplit[1];
							var sValue1 = aSplit[2];
							var oFilterInfo = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.EQ, sValue1);

							// Creating a map of filters for each path
							if (!mSimpleFilters[sPath]) {
								mSimpleFilters[sPath] = [oFilterInfo];
							} else {
								mSimpleFilters[sPath].push(oFilterInfo);
							}
						}

						for (var path in mSimpleFilters) {
							// All filters on a same path are combined with a OR
							oBindingData.filters.push(new sap.ui.model.Filter(mSimpleFilters[path], false));
						}

						aCollections.forEach(function (oCollectionItem) {
							var oCollection = self.getView().byId(oCollectionItem.id);
							var oBindingInfo = oCollection.getBindingInfo(oCollectionItem.aggregation);
							var oBindingOptions = this.updateBindingOptions(oCollectionItem.id, oBindingData, sSourceId);
							if (oBindingInfo.model === "kpiModel") {
								oCollection.getObjectBinding().refresh();
							} else {
								oCollection.bindAggregation(oCollectionItem.aggregation, {
									model: oBindingInfo.model,
									path: oBindingInfo.path,
									parameters: oBindingInfo.parameters,
									template: oBindingInfo.template,
									templateShareable: true,
									sorter: oBindingOptions.sorters,
									filters: oBindingOptions.filters
								});
							}
						}, this);
					}.bind(this);

					// function resetFiltersHandler() {
					// 	// oDialog.getModel().setProperty("/Ordem/vValue", "");
					// 	// oDialog.getModel().setProperty("/Pedido/vValueGT", "");
					// }

					function updateDialogData(filters) {
						var mParams = {
							context: oReferenceCollection.getBindingContext(),
							success: function (oData) {
								var oJsonModelDialogData = {};
								// Loop through each entity
								oData.results.forEach(function (oEntity) {
									// Add the distinct properties in a map
									for (var oKey in oEntity) {
										if (!oJsonModelDialogData[oKey]) {
											oJsonModelDialogData[oKey] = [oEntity[oKey]];
										} else if (oJsonModelDialogData[oKey].indexOf(oEntity[oKey]) === -1) {
											oJsonModelDialogData[oKey].push(oEntity[oKey]);
										}
									}
								});
								var oDialogModel = oDialog.getModel();

								if (!oDialogModel) {
									oDialogModel = new sap.ui.model.json.JSONModel();
									oDialog.setModel(oDialogModel);
								}
								oDialogModel.setData(oJsonModelDialogData);
								oDialog.open();
							}
						};
						var sPath;

						var sModelName = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).model;
						// In KPI mode for charts, getBindingInfo would return the local JSONModel
						if (sModelName === "kpiModel") {
							sPath = oReferenceCollection.getObjectBinding().getPath();
						} else {
							sPath = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).path;
						}
						mParams.filters = filters;
						oModel.read(sPath, mParams);
					}

					if (!oDialog) {
						oDialog = sap.ui.xmlfragment({
							fragmentName: "com.sap.build.h12f10161-us_3.dashboardTabelas.view.Filter1"
						}, this);
						oDialog.attachEvent("confirm", confirmHandler);
						// oDialog.attachEvent("resetFilters", resetFiltersHandler);

						this.mSettingsDialogs["ViewSettingsDialog"] = oDialog;
					}

					var aCollections = [];

					aCollections.push({
						id: "tOrdemVenda",
						aggregation: "rows"
					});

					var oReferenceCollection = this.getView().byId(aCollections[0].id);
					var oSourceBindingContext = oReferenceCollection.getBindingContext();
					var oModel = oSourceBindingContext ? oSourceBindingContext.getModel() : this.getView().getModel();

					// toggle compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
					var designTimeFilters = this.mBindingOptions && this.mBindingOptions[aCollections[0].id] && this.mBindingOptions[aCollections[0]
							.id]
						.filters && this.mBindingOptions[aCollections[0].id].filters[undefined];
					updateDialogData(designTimeFilters);
				},

				updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
					this.mBindingOptions = this.mBindingOptions || {};
					this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

					var aSorters = this.mBindingOptions[sCollectionId].sorters;
					var aGroupby = this.mBindingOptions[sCollectionId].groupby;

					// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
					if (oBindingData) {
						if (oBindingData.sorters) {
							aSorters = oBindingData.sorters;
						}
						if (oBindingData.groupby || oBindingData.groupby === null) {
							aGroupby = oBindingData.groupby;
						}
						// 1) Update the filters map for the given collection and source
						this.mBindingOptions[sCollectionId].sorters = aSorters;
						this.mBindingOptions[sCollectionId].groupby = aGroupby;
						this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
						this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
					}

					// 2) Reapply all the filters and sorters
					var aFilters = [];
					for (var key in this.mBindingOptions[sCollectionId].filters) {
						aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
					}

					// Add the groupby first in the sorters array
					if (aGroupby) {
						aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
					}

					var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
					return {
						filters: aFinalFilters,
						sorters: aSorters
					};
				}
			});
		},

		/* bExport= */
		true);