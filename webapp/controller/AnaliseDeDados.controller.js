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
						expand: "to_cliente,to_fornecedores,to_garantia,to_faturamento,to_balanco,to_culturas,to_pos_cliente,to_grupo_finan,to_hist_vendas,to_integrantes,to_socio_integrante,to_contratos"
					}
				});
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("OrdemDeVendas", true);
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

		onGetParecer: function (oEvent) {
			debugger;

			var filters = [];

			var path = this.getView().getObjectBinding().getPath();
			var cliente = path.substr(25, 7);

			filters.push(new sap.ui.model.Filter({
				path: "partner",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: cliente
			}));

			// filters.push(cliente);

			this.getOwnerComponent().getModel().read(
				"/ZFI_DASHBOARD_DETALHES", {
					filters: filters,
					urlParameters: {
						"$expand": "to_parecer"
					},
					success: function (oData, response) {
						var json = new sap.ui.model.json.JSONModel();
						var sParecer = "";
						var oDados = oData.results;

						for (var i = 0; i < oDados[0].to_parecer.results.length; i++) {
							sParecer = sParecer + oDados[0].to_parecer.results[i].parecer;
						}
						oData.results[0].to_parecer.results[0].parecer = sParecer;

						json.setData(oData.results[0].to_parecer.results[0]);
						this.getView().setModel(json, "parecer");
					}.bind(this)
				}
			);

			if (!this.oDialogParecer) {
				this.oDialogParecer = sap.ui.xmlfragment("com.sap.build.h12f10161-us_3.dashboardTabelas.view.parecerCredito");
				this.getView().addDependent(this.oDialogParecer);
			}
			this.oDialogParecer.bindObject(path).open();
		},
		
			onGet5c: function (oEvent) {
			debugger;

			var filters = [];

			var path = this.getView().getObjectBinding().getPath();
			var cliente = path.substr(25, 7);

			filters.push(new sap.ui.model.Filter({
				path: "partner",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: cliente
			}));

			this.getOwnerComponent().getModel().read(
				"/ZFI_DASHBOARD_DETALHES", {
					filters: filters,
					urlParameters: {
						"$expand": "to_cinco_c"
					},
					success: function (oData, response) {
						var json = new sap.ui.model.json.JSONModel();
						var sTexto = "";
						var oDados = oData.results;

						for (var i = 0; i < oDados[0].to_cinco_c.results.length; i++) {
							sTexto = sTexto + oDados[0].to_cinco_c.results[i].cinco_c;
						}
						oData.results[0].to_cinco_c.results[0].cinco_c = sTexto;

						json.setData(oData.results[0].to_cinco_c.results[0]);
						this.getView().setModel(json, "5C");
					}.bind(this)
				}
			);

			if (!this.oDialogParecer) {
				this.oDialogParecer = sap.ui.xmlfragment("com.sap.build.h12f10161-us_3.dashboardTabelas.view.texto5C");
				this.getView().addDependent(this.oDialogParecer);
			}
			this.oDialogParecer.bindObject(path).open();
		},

		_onLinkPress: function (oEvent) {

			var sDialogName = "Dialog2";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new Dialog2(this.getView());
				this.mDialogs[sDialogName] = oDialog;

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