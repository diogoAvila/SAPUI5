sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.h12f10161-us_3.dashboardTabelas.controller.AnaliseDeDados", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5d2490b700160954c5f85bec";
			var cliente = oEvent.getParameter("data").cliente;
			var oModel = this.getOwnerComponent().getModel();

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

			var oFilter = [];
			var oTable = this.getView().byId("tab_indicadores");
			var oBinding = oTable.getBinding("items");

			var partnerFilter = cliente;
			var length = 10;
			while (partnerFilter.length < length) {
				partnerFilter = '0' + partnerFilter;
			}

			var filterPartner = new sap.ui.model.Filter("partner", sap.ui.model.FilterOperator.EQ, partnerFilter);

			var filterArr = [filterPartner];
			var finalFilter = new sap.ui.model.Filter({
				filters: filterArr,
				and: true
			});

			oBinding.filter(finalFilter);

			oModel.read(
				"/ZFI_DASHBOARD_BALANCO_CAMPOSSet", {
					filters: filterArr,
					success: function (oData, response) {
						var oModelAno = this.getView().getModel("IndFinAno");
						var dataBalanco,
							dataTitulo;
						var objectBal = [],
							objectIr = [];
						var titulo;

						for (var cont = 0; cont < oData.results.length; cont++) {

							dataBalanco = {
								"descr_campo": oData.results[cont].descr_campo,
								"valor_ano1": oData.results[cont].valor_ano1,
								"valor_ano2": oData.results[cont].valor_ano2,
								"valor_ano3": oData.results[cont].valor_ano3
							};

							switch (oData.results[cont].campo) {
							case "ANO":
								oModelAno.setProperty("/ano1", oData.results[cont].valor_ano1);
								oModelAno.setProperty("/ano2", oData.results[cont].valor_ano2);
								oModelAno.setProperty("/ano3", oData.results[cont].valor_ano3);
								break;
							case "MARGEM_BRUTA":
							case "MARGEM_OPERACIONAL":
							case "MARGEM_LIQUIDA":
							case "TAXA_ROI":
							case "TAXA_ROE":
							case "GIRO_ATIVO":
							case "LIQUIDEZ_CORRENTE":
							case "LIQUIDEZ_SECA":
							case "LIQUIDEZ_GERAL":
							case "CAPITAL_CIRC_LIQ":
							case "PART_CAPITAL_TERC":
							case "CAPITAL_PROPRIO":
							case "ENDIVIDAMENTO_PL":
							case "ENDIVIDAMENTO_FIN":
							case "ENDIVIDAMENTO_CP":
							case "ENDIVIDAMENTO_LP":

								if (oData.results[cont].campo === "MARGEM_BRUTA" ||
									oData.results[cont].campo === "LIQUIDEZ_CORRENTE" ||
									oData.results[cont].campo === "PART_CAPITAL_TERC") {

									if (oData.results[cont].campo === "MARGEM_BRUTA") {
										titulo = "RENTABILIDADE";
									} else if (oData.results[cont].campo === "LIQUIDEZ_CORRENTE") {
										titulo = "LIQUIDEZ";
									} else {
										titulo = "ENDIVIDAMENTO";
									}

									dataTitulo = {
										"descr_campo": titulo,
										"valor_ano1": " ",
										"valor_ano2": " ",
										"valor_ano3": " "
									};
									objectBal.push(dataTitulo);
								}

								objectBal.push(dataBalanco);
								break;

							case "BENS_TOTAIS":
							case "BENS_IMOVEIS":
							case "AREA_HA":
							case "VALOR_AREA":
							case "DIVIDA":
							case "IMOVEL_EXPLORADO":
							case "RECEITAS":
							case "DESPESAS":
							case "RESULTADOS":
							case "PREJUIZOS_ACUMULADOS":
							case "DIVIDA_ATIV_RURAL":
							case "BOVINOS_QTDE":
							case "BOVINOS_RS":
							case "RECEITA_POR_DIVIDA":
							case "BENS_POR_DIVIDAS":
							case "BENS_AGRIANUAL_DIV":
							case "RECEITA_OPERACIONAL":
							case "CUSTO_OPER_EFETIVO":
							case "RESULTADO_OPER_BRUTO":
							case "DESPESAS_INVESTIMENTOS":
							case "RESULTADO_LIQ":
							case "MARGEM_OPER":
							case "MARGEM_LIQUIDA_IRPF":
							case "LIQUIDEZ_OPER":
							case "PRAZO_REC_VENDAS":
								objectIr.push(dataBalanco);
								break;

							default:
								// code block
							}
						}
						var jsonIndFin = new sap.ui.model.json.JSONModel();
						jsonIndFin.setData(objectBal);
						this.getView().setModel(jsonIndFin, "IndFinan");
						//this.getView().byId("TabIndFin").setModel(jsonIndFin, "IndFinan");

						var jsonIr = new sap.ui.model.json.JSONModel();
						jsonIr.setData(objectIr);
						this.getView().setModel(jsonIr, "DadosIr");
						//this.getView().byId("TabDadosIr").setModel(jsonIr, "DadosIr");

					}.bind(this)
				}
			);
			oModel.read(
				"/ZFI_DASHBOARD_BUDGET_ANOSet", {
					filters: filterArr,
					success: function (oData, response) {
						var dataBudgetAno;
						var objectBudgetAno = [];

						dataBudgetAno = {
							"orcado": oData.results[0].orcado,
							"realizado": oData.results[0].realizado,
							"pendente": oData.results[0].pendente
						};

						var jsonBudgetAno = new sap.ui.model.json.JSONModel();
						jsonBudgetAno.setData(dataBudgetAno);
						this.getView().setModel(jsonBudgetAno, "BudgetAno");
					}.bind(this)
				}
			);

			oModel.read(
				"/ZFI_DASHBOARD_BUDGET_CULTURASet", {
					filters: filterArr,
					success: function (oData, response) {

						var dataBudgetCultura;
						var objectBudgetCultura = [];

						for (var cont = 0; cont < oData.results.length; cont++) {

							dataBudgetCultura = {
								"cod_cultura": oData.results[cont].cod_cultura,
								"desc_cultura": oData.results[cont].desc_cultura,
								"valor": oData.results[cont].valor,
								"percentual": oData.results[cont].percentual
							};
							objectBudgetCultura.push(dataBudgetCultura);
						}

						var jsonBudgetCultura = new sap.ui.model.json.JSONModel();
						jsonBudgetCultura.setData(objectBudgetCultura);
						this.getView().setModel(jsonBudgetCultura, "BudgetCultura");
					}.bind(this)
				}
			);

			oModel.read(
				"/ZFI_DASHBOARD_BALANCO_VARIACAOSet", {
					filters: filterArr,
					success: function (oData, response) {
						var oModelBalAno = this.getView().getModel("BalAno");
						var dataBalVar;
						var objectDre = [],
							objectAtivo = [],
							objectPassivo = [];
						var cont,
							totAtivoAno1,
							totAtivoAno2,
							totAtivoAno3,
							totPassivoAno1,
							totPassivoAno2,
							totPassivoAno3;

						for (cont = 0; cont < oData.results.length; cont++) {
							if (oData.results[cont].campo === "ATIVO") {
								totAtivoAno1 = oData.results[cont].valor_ano1;
								totAtivoAno2 = oData.results[cont].valor_ano2;
								totAtivoAno3 = oData.results[cont].valor_ano3;
							} else
							if (oData.results[cont].campo === "PASSIVO") {
								totPassivoAno1 = oData.results[cont].valor_ano1;
								totPassivoAno2 = oData.results[cont].valor_ano2;
								totPassivoAno3 = oData.results[cont].valor_ano3;
							}
						}
						for (var cont = 0; cont < oData.results.length; cont++) {
							dataBalVar = {
								"descr_campo": oData.results[cont].descr_campo,
								"valor_ano1": oData.results[cont].valor_ano1,
								"valor_ano2": oData.results[cont].valor_ano2,
								"valor_ano3": oData.results[cont].valor_ano3,
								"analise_v_ano1": oData.results[cont].analise_v_ano1,
								"analise_v_ano2": oData.results[cont].analise_v_ano2,
								"analise_v_ano3": oData.results[cont].analise_v_ano3,
								"analise_h": oData.results[cont].analise_h,
								"variacao": oData.results[cont].variacao
							};

							switch (oData.results[cont].campo) {
							case "ANO":
								oModelBalAno.setProperty("/ano1", oData.results[cont].valor_ano1);
								oModelBalAno.setProperty("/ano2", oData.results[cont].valor_ano2);
								oModelBalAno.setProperty("/ano3", oData.results[cont].valor_ano3);
								break;
							case "RECEITA_VENDAS":
							case "LUCRO_BRUTO":
							case "LUCRO_OPER":
							case "LUCRO_ANTES_IR":
							case "LUCRO_LIQ_EXER":

								objectDre.push(dataBalVar);
								break;
							case "CIRCULANTE":
							case "REALIZAVEL_LP":
							case "PERMANENTE":

								objectAtivo.push(dataBalVar);
								if (oData.results[cont].campo === "PERMANENTE") {
									dataBalVar = {
										"descr_campo": "TOTAL DO ATIVO",
										"valor_ano1": totAtivoAno1,
										"valor_ano2": totAtivoAno2,
										"valor_ano3": totAtivoAno3
									};
									objectAtivo.push(dataBalVar);
								}
								break;
							case "CIRCULANTE_PASS":
							case "EXIGIVEL_LP":
							case "PATRIMONIO_LIQ":
							case "CAPITAL_SOCIAL":
								objectPassivo.push(dataBalVar);

								if (oData.results[cont].campo === "CAPITAL_SOCIAL") {
									dataBalVar = {
										"descr_campo": "TOTAL DO PASSIVO",
										"valor_ano1": totPassivoAno1,
										"valor_ano2": totPassivoAno2,
										"valor_ano3": totPassivoAno3
									};
									objectPassivo.push(dataBalVar);
								}
								break;
							default:
							}
						}
						var jsonDre = new sap.ui.model.json.JSONModel();
						jsonDre.setData(objectDre);
						this.getView().setModel(jsonDre, "BalDre");

						var jsonAtivo = new sap.ui.model.json.JSONModel();
						jsonAtivo.setData(objectAtivo);
						this.getView().setModel(jsonAtivo, "BalAtivo");

						var jsonPassivo = new sap.ui.model.json.JSONModel();
						jsonPassivo.setData(objectPassivo);
						this.getView().setModel(jsonPassivo, "BalPassivo");

					}.bind(this)
				}
			);
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

		formataValor: function (oEvt) {

			if (oEvt !== undefined && oEvt !== " ") {
				if (oEvt.slice(oEvt.length - 1, oEvt.length) === "-") {
					var value = oEvt.slice(0, oEvt.length - 1);
					if (!isNaN(value)) {
						value = parseFloat(value) * -1;
						oEvt = parseFloat(value).toFixed(2);
					}
				} else {
					if (!isNaN(oEvt)) {
						oEvt = parseFloat(oEvt).toFixed(2);
					}
				}
				var oLocale = new sap.ui.core.Locale("pt-BR");
				var oFormatOptions = {
					maxFractionDigits: 2
				};
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions, oLocale);
				oEvt = oFloatFormat.format(oEvt);
				return oEvt;
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
			var filters = [];
			var path = this.getView().getObjectBinding().getPath();

			this.getView().getModel("parecer").setProperty("/parecer", "");
			this.getOwnerComponent().getModel().read(
				path, {
					urlParameters: {
						"$expand": "to_parecer"
					},
					success: function (oData, response) {
						var sParecer = "";

						var oDados = oData.to_parecer;
						if (oDados.results.length > 0) {
							for (var i = 0; i < oDados.results.length; i++) {
								sParecer = sParecer + oDados.results[i].parecer;
							}
						}
						this.getView().getModel("parecer").setProperty("/parecer", sParecer);

					}.bind(this),
					error: function (error) {
						this.getView().getModel("parecer").setProperty("/parecer", "");
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
			var filters = [];

			var path = this.getView().getObjectBinding().getPath();

			this.getView().getModel("cincoC").setProperty("/cinco_c", "");
			this.getOwnerComponent().getModel().read(path, {
				urlParameters: {
					"$expand": "to_cinco_c"
				},
				success: function (oData, response) {
					var sTexto = "";
					var oDados = oData.to_cinco_c;

					if (oDados.results.length > 0) {
						for (var i = 0; i < oDados.results.length; i++) {
							sTexto = sTexto + oDados.results[i].cinco_c;
						}
					}
					this.getView().getModel("cincoC").setProperty("/cinco_c", sTexto);

				}.bind(this)

			});

			if (!this.oDialog5C) {
				this.oDialog5C = sap.ui.xmlfragment("com.sap.build.h12f10161-us_3.dashboardTabelas.view.texto5C");
				this.getView().addDependent(this.oDialog5C);
			}
			this.oDialog5C.bindObject(path).open();
		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("AnaliseDeDados").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}

	});
}, /* bExport= */ true);