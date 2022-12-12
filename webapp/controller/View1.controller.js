sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library',
    'sap/m/Token',
    'sap/m/MultiInput',
    "../model/Formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.MessageToast} MessageToast
     * @param {typeof sap.ui.model.mvc.Filter} Filter
     * @param {typeof sap.ui.model.mvc.FilterOperator} FilterOperator
     */
    function (Controller, MessageBox, JSONModel, MessageToast, Filter, FilterOperator, Spreadsheet, exportLibrary, Token, MultiInput, Formatter) {
        "use strict";
        //Z_INVCULTIVOS_SRV
        //Z_SG_INVCULTIVOS_SRV
        var oDataModel = new sap.ui.model.odata.v2.ODataModel("./sap/opu/odata/sap/Z_SG_INVCULTIVOS_SRV");
        var that;
        var oSelectCultivo, oSelectTipcampo, oSelectProyecto, oSelectAdmin, oSelectZona, oSelectEtapa;
        var EdmType = exportLibrary.EdmType;
        var aFilter = [];
        var cultivos = [], tipcampos = [], proyectos = [], admins = [], zonas = [], etapas = [], aFilterAdm = [], aFilterZn = [];    
        var storage;
        var storage2;
        var storage3;
        var busyDialog = new sap.m.BusyDialog()


        return Controller.extend("aip.as.invcultivo.controller.View1", {

            formatter: Formatter,

            onInit: function () {
                oDataModel = this.getOwnerComponent().getModel("oDataService");
                this.setDefaultValues(); // Asignando valores predeterminados 

                console.log("start");

            },

            setDefaultValues: function () {

                this.loadMatchcodeCultivo();
                this.loadMatchcodeTipcampo();
                this.loadMatchcodeProyecto();
                this.onFilterAdm();
                this.onFilterZn();
                this.loadMatchcodeEtapa();
                //this.loadMatchcodeAdmin();
                //this.loadMatchcodeZona();
                
            },
            
            updateFooter: function () {

                let oTable = this.getView().byId("tblMain");
                let oRowsBinding = oTable.getBinding("rows");

                that = this;

                // cantidad de filas de tabla
                let oLength = oRowsBinding.getLength();
                that.getView().byId("txtCount").setText(that.formatter.numero(oLength));

                // suma valores de columna
                let sum = 0;
                let sum2=0;
                let oList = Object.values(oRowsBinding.oList);

                for (const row of oList) {
                    sum = sum + Number(row.Htotales);
                }
                sum = sum.toFixed(2);
                that.getView().byId("txtHtotales").setText(that.formatter.monto2(sum));
               
                
                for (const row of oList){
                    sum2 = sum2 + Number(row.Hnetas);
                    //console.log(`sum2 loop: ${sum2}`);
                }
                sum2 = sum2.toFixed(1);
                //console.log(`sum2 formatter: ${sum2}`);
                that.getView().byId("txtHnetas").setText(that.formatter.monto2(sum2));
            
            },

//------------ loadMatchcode --------------------------------------

            loadMatchcodeCultivo: function () {
                that = this;

                const handleClose = function (oEvent) {
                    that.getView().byId('txtCultivo').removeAllTokens();

                    // obtener fila seleccionada
                    let oSelectedItems = oEvent.getParameter("selectedItems");
                    let oInputMulti = that.getView().byId("txtCultivo");

                    if (oSelectedItems && oSelectedItems.length > 0) {
                        oSelectedItems.forEach(function (oItem) {
                            oInputMulti.addToken(new Token({
                                text: oItem.getTitle()
                                }));
                        });
                        // asignar valor en campo
                        //oInputMulti.setValue(oSelectedItems.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/cultivoSet", {
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "loadMatchcodeCultivo" );
                        cultivos = oSelectCultivo.getModel('oDataCultivo').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchCode Cultivo");
                    }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataCultivo>Cultivo}",
                    description: "{oDataCultivo>Descrip}"
                });

                if(!oSelectCultivo) {
                    // creación de control de ayuda de busqueda
                    oSelectCultivo = new sap.m.SelectDialog("CustDialogCultivo", {
                        title: "Cultivo",
                        liveChange: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter("Descrip", sap.ui.model.FilterOperator.Contains, sValue);
                            var oBinding = oEvent.getSource().getBinding("items");
                            oBinding.filter([oFilter]);
                        },
                        confirm: handleClose,
                        multiSelect: true,
                        rememberSelections: true,
                        showClearButton: true
                    });
                }

                // carga de datos odata en ventana
                oSelectCultivo.setModel(oModel, 'oDataCultivo');

                // asignación de valores en filas y formato de los mismos
                oSelectCultivo.bindAggregation("items", "oDataCultivo>/results", itemTemplate);
            },

            loadMatchcodeTipcampo: function () {
                that = this;

                const handleClose = function (oEvent) {
                    that.getView().byId('txtTipcampo').removeAllTokens();

                    // obtener fila seleccionada
                    let oSelectedItems = oEvent.getParameter("selectedItems");
                    let oInputMulti = that.getView().byId("txtTipcampo");

                    if (oSelectedItems && oSelectedItems.length > 0) {
                        oSelectedItems.forEach(function (oItem) {
                            oInputMulti.addToken(new Token({
                                text: oItem.getTitle()
                                }));
                        });
                        // asignar valor en campo
                        //oInput.setValue(oSelectedItem.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/tipcampoSet", {
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "loadMatchcodeTipcampo" );
                        tipcampos = oSelectTipcampo.getModel('oDataTipcampo').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchCode tipcampo");
                    }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataTipcampo>DomvalueL}",
                    description: "{oDataTipcampo>Ddtext}"
                });

                if(!oSelectTipcampo) {
                    // creación de control de ayuda de busqueda
                    oSelectTipcampo = new sap.m.SelectDialog("CustDialogTipcampo", {
                        title: "Tipo de campo",
                        liveChange: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter("Ddtext", sap.ui.model.FilterOperator.Contains, sValue);
                            var oBinding = oEvent.getSource().getBinding("items");
                            oBinding.filter([oFilter]);
                        },
                        confirm: handleClose,
                        multiSelect: true,
                        rememberSelections: true,
                        showClearButton: true
                    });
                }

                // carga de datos odata en ventana
                oSelectTipcampo.setModel(oModel, 'oDataTipcampo');

                // asignación de valores en filas y formato de los mismos
                oSelectTipcampo.bindAggregation("items", "oDataTipcampo>/results", itemTemplate);
            },

            loadMatchcodeProyecto: function () {
                that = this;

                const handleClose = function (oEvent) {
                    that.getView().byId("txtProyecto").removeAllTokens();

                    // obtener fila seleccionada
                    let oSelectedItems = oEvent.getParameter("selectedItems");
                    let oInputMulti = that.getView().byId("txtProyecto");

                    if (oSelectedItems && oSelectedItems.length > 0) {
                        oSelectedItems.forEach(function (oItem) {
                            oInputMulti.addToken(new Token({
                                text: oItem.getTitle()
                                }));
                        });
                        // asignar valor en campo
                        //oInputMulti.setValue(oSelectedItem.getTitle())
                        that.getView().byId("txtAdmin").setValue(""); 
                        that.getView().byId("txtZona").setValue("");
                    }
                    
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                    //destruye dialog
                    oSelectAdmin.destroy();
                    //filtra de acuerdo a proyecto
                    that.onFilterAdm();
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/proyectoSet", {
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "loadMatchcodeProyecto" );
                        proyectos = oSelectProyecto.getModel('oDataProyecto').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchcode proyecto");
                    }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataProyecto>cod_proy}",
                    description: "{oDataProyecto>desc}"
                });

                //if(!oSelectProyecto) {
                    // creación de control de ayuda de busqueda
                    oSelectProyecto = new sap.m.SelectDialog("CustDialogProyecto", {
                        title: "Proyecto",
                        liveChange: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter("desc", sap.ui.model.FilterOperator.Contains, sValue);
                            var oBinding = oEvent.getSource().getBinding("items");
                            oBinding.filter([oFilter]);
                        },
                        confirm: handleClose,
                        multiSelect: true,
                        rememberSelections: true,
                        showClearButton: true
                    });
                //}

                // carga de datos odata en ventana
                oSelectProyecto.setModel(oModel, 'oDataProyecto');

                // asignación de valores en filas y formato de los mismos
                oSelectProyecto.bindAggregation("items", "oDataProyecto>/results", itemTemplate);
            },

            loadMatchcodeAdmin: function () {

                that = this;

                const handleClose = function (oEvent) {
                    that.getView().byId('txtAdmin').removeAllTokens();

                    // obtener fila seleccionada
                    let oSelectedItems = oEvent.getParameter("selectedItems");
                    let oInputMulti = that.getView().byId("txtAdmin");

                    if (oSelectedItems && oSelectedItems.length > 0) {
                        oSelectedItems.forEach(function (oItem) {
                            oInputMulti.addToken(new Token({
                                text: oItem.getTitle()
                                }));
                        });
                        // asignar valor en campo
                        //oInputMulti.setValue(oSelectedItem.getTitle())
                        that.getView().byId("txtZona").setValue(""); 
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                    oSelectZona.destroy();
                    that.onFilterZn();
                };
                
                const oModel = new sap.ui.model.json.JSONModel();
                
                // invocación de servicio
                oDataModel.read("/adminSet", {
                    filters : aFilterAdm,
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "loadMatchcodeAdmin" );
                        admins = oSelectAdmin.getModel('oDataAdmin').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchcode admin");
                                            }
                });
                
                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataAdmin>Admin}",
                    description: "{oDataAdmin>Descrip}"
                })
                
                //if (!oSelectAdmin) {
                    //creación de control de ayuda de busqueda
                    oSelectAdmin = new sap.m.SelectDialog("CustDialogAdmin", {
                        title: "Administración",
                        liveChange: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter("Descrip", sap.ui.model.FilterOperator.Contains, sValue);
                            var oBinding = oEvent.getSource().getBinding("items");
                            oBinding.filter([oFilter]);
                        },
                        confirm: handleClose,
                        multiSelect: true,
                        rememberSelections: true,
                        showClearButton: true
                    });
                //}
                                
                // carga de datos odata en ventana
                oSelectAdmin.setModel(oModel, 'oDataAdmin');

                // asignación de valores en filas y formato de los mismos
                oSelectAdmin.bindAggregation("items", "oDataAdmin>/results", itemTemplate);   
      
            },

            loadMatchcodeZona: function () {

                that = this;

                const handleClose = function (oEvent) {
                    that.getView().byId('txtZona').removeAllTokens();

                    // obtener fila seleccionada
                    let oSelectedItems = oEvent.getParameter("selectedItems");
                    let oInputMulti = that.getView().byId("txtZona");

                    if (oSelectedItems && oSelectedItems.length > 0) {
                        oSelectedItems.forEach(function (oItem) {
                            oInputMulti.addToken(new Token({
                                text: oItem.getTitle()
                                }));
                        });
                        // asignar valor en campo
                        //oInputMulti.setValue(oSelectedItem.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                oDataModel.read("/zonaSet", {
                    filters : aFilterZn,
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "loadMatchcodeZona" );
                        zonas = oSelectZona.getModel('oDataZona').getData().results;
                    },
                    error: function (oError) {
                        MessageToast.show("Error matchcode zona");
                                            }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataZona>Zona}",
                    description: "{oDataZona>Descrip}"
                })

                //if (!oSelectZona) {
                    // creación de control de ayuda de busqueda
                    oSelectZona = new sap.m.SelectDialog("CustDialogZn", {
                        title: "Zona",
                        liveChange: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter("Descrip", sap.ui.model.FilterOperator.Contains, sValue);
                            var oBinding = oEvent.getSource().getBinding("items");
                            oBinding.filter([oFilter]);
                        },
                        confirm: handleClose,
                        multiSelect: true,
                        rememberSelections: true,
                        showClearButton: true
                    });
                //}
                
                // carga de datos odata en ventana
                oSelectZona.setModel(oModel, 'oDataZona');

                // asignación de valores en filas y formato de los mismos
                oSelectZona.bindAggregation("items", "oDataZona>/results", itemTemplate);
                
            },

            loadMatchcodeEtapa: function () {

                that = this;

                const handleClose = function (oEvent) {
                    that.getView().byId('txtEtapa').removeAllTokens();

                    // obtener fila seleccionada
                    let oSelectedItems = oEvent.getParameter("selectedItems");
                    let oInputMulti = that.getView().byId("txtEtapa");

                    if (oSelectedItems && oSelectedItems.length > 0) {
                        oSelectedItems.forEach(function (oItem) {
                            oInputMulti.addToken(new Token({
                                text: oItem.getTitle()
                                }));
                        });
                        // asignar valor en campo
                        //oInputMulti.setValue(oSelectedItem.getTitle())
                    }
                    // limpiar filtros (en caso de existir)
                    oEvent.getSource().getBinding("items").filter([]);
                };

                const oModel = new sap.ui.model.json.JSONModel();

                // invocación de servicio
                console.log( "Ingresa antes de invocacion servicio etapa");
                oDataModel.read("/etapaSet", {
                    success: function (oData, oResponse) {
                        oModel.setData(oData);
                        console.log( oData );
                        console.log( "loadMatchcodeEtapa" );
                        etapas = oSelectEtapa.getModel('oDataEtapa').getData().results;
                    },
                    error: function (oError) {
                        //console.log( "Error matchcode", oResponse);
                        //console.log( "error mc FrenteCosecha",this.model );
                        MessageToast.show("Error matchcode etapa");
                                            }
                });

                // formato de items de ayuda de busqueda
                var itemTemplate = new sap.m.StandardListItem({
                    title: "{oDataEtapa>Etacod}",
                    description: "{oDataEtapa>Etades}"
                })

                if (!oSelectEtapa) {
                    // creación de control de ayuda de busqueda
                    oSelectEtapa = new sap.m.SelectDialog("CustDialogEt", {
                        title: "Etapa",
                        liveChange: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            var oFilter = new sap.ui.model.Filter("Etades", sap.ui.model.FilterOperator.Contains, sValue);
                            var oBinding = oEvent.getSource().getBinding("items");
                            oBinding.filter([oFilter]);
                        },
                        confirm: handleClose,
                        multiSelect: true,
                        rememberSelections: true,
                        showClearButton: true
                    });
                }
                
                // carga de datos odata en ventana
                oSelectEtapa.setModel(oModel, 'oDataEtapa');

                // asignación de valores en filas y formato de los mismos
                oSelectEtapa.bindAggregation("items", "oDataEtapa>/results", itemTemplate);
                
            },

//----------onOpenPress---------------------------------------

            onOpenCultivoPress: function (oEvent) {
                 //remember selections
                var bRemember = true;
                oSelectCultivo.setRememberSelections(bRemember);

                console.log("bRemember");
                console.log(bRemember);

                oSelectCultivo.open(); // mostrar ventana de matchcode de frentes
            },

            onOpenTipcampoPress: function (oEvent) {
                var bRemember = true;
                oSelectTipcampo.setRememberSelections(bRemember);

                console.log("bRemember");
                console.log(bRemember);

                oSelectTipcampo.open(); // mostrar ventana de matchcode de frentes
                console.log("onOpenTipcampo despues de abrir MC Tipcampo")
            }, 

            onOpenProyectoPress: function (oEvent) {
                var bRemember = true;
                oSelectProyecto.setRememberSelections(bRemember);

                console.log("bRemember");
                console.log(bRemember);

                oSelectProyecto.open(); // mostrar ventana de matchcode
                console.log("onOpenProyectoPress despues de abrir MC de proyecto")
            },

            onOpenAdminPress: function (oEvent) {
                var bRemember = true;
                oSelectAdmin.setRememberSelections(bRemember);

                console.log("bRemember");
                console.log(bRemember);

                oSelectAdmin.open(); // mostrar ventana de matchcode
                console.log("onOpenAdminPress despues de abrir matchcode de admin" )
            },

            onOpenZonaPress: function (oEvent) {
                var bRemember = true;
                oSelectZona.setRememberSelections(bRemember);

                console.log("bRemember");
                console.log(bRemember);

                oSelectZona.open(); // mostrar ventana de matchcode
                console.log("onOpenZonaPress despues de abrir MC de zona")
            },

            onOpenEtapaPress: function (oEvent) {
                var bRemember = true;
                oSelectEtapa.setRememberSelections(bRemember);

                console.log("bRemember");
                console.log(bRemember);

                oSelectEtapa.open(); // mostrar ventana de matchcode
            },

//----------------OnChange----------------------------------

            onChangeCultivo : function ( oEvent ) {
                that = this;
                var oMultiInput = this.getView().byId("txtCultivo");
                var fValidator = function(args){
                    window.setTimeout(function(){
                        args.asyncCallback(new Token({text: args.text}));
                    },500);
                    
                    return MultiInput.WaitForAsyncValidation;
                };

                oMultiInput.addValidator(fValidator);
            },

            onChangeTipcampo : function ( oEvent ) {
                that = this;
                var oMultiInput = this.getView().byId("txtTipcampo");
                var fValidator = function(args){
                    window.setTimeout(function(){
                        args.asyncCallback(new Token({text: args.text}));
                    },500);
                    
                    return MultiInput.WaitForAsyncValidation;
                };

                oMultiInput.addValidator(fValidator);

            },

            onChangeProyecto : function ( oEvent ) {
                that = this;
                var oMultiInput = this.getView().byId("txtProyecto");
                var fValidator = function(args){
                    window.setTimeout(function(){
                        args.asyncCallback(new Token({text: args.text}));
                    },500);

                    return MultiInput.WaitForAsyncValidation;
                };
                oMultiInput.addValidator(fValidator);  
            },

           

            onChangeAdmin : function ( oEvent ) {
                that = this;
                var oMultiInput = this.getView().byId("txtAdmin");
                var fValidator = function(args){
                    window.setTimeout(function(){
                        args.asyncCallback(new Token({text: args.text}));
                    },500);
                    
                    return MultiInput.WaitForAsyncValidation;
                };

                oMultiInput.addValidator(fValidator);
            },

            onChangeZona : function ( oEvent ) {

                that = this;
                var oMultiInput = this.getView().byId("txtFrenteCosMultiG");
                var fValidator = function(args){
                    window.setTimeout(function(){
                        args.asyncCallback(new Token({text: args.text}));
                    },500);
                    
                    return MultiInput.WaitForAsyncValidation;
                };

                oMultiInput.addValidator(fValidator);
            },

            onChangeEtapa : function ( oEvent ) {

                that = this;
                var oMultiInput = this.getView().byId("txtEtapa");
                var fValidator = function(args){
                    window.setTimeout(function(){
                        args.asyncCallback(new Token({text: args.text}));
                    },500);
                    
                    return MultiInput.WaitForAsyncValidation;
                };

                oMultiInput.addValidator(fValidator); 
            },


//----------get oDATA-------------------------

            getInvcultivoData: function () {

                const oModel = new sap.ui.model.json.JSONModel();

                that = this;
                console.log("aFilter");
                console.log(aFilter);
                busyDialog.open();

                // invocación de servicio odata
                oDataModel.read("/inventario_cultivoSet", {
                    filters: aFilter,
                    success: function (oData, oResponse) {
                        MessageToast.show("Carga completa");
                        oModel.setData(oData);
                        busyDialog.close();
                        console.log( oData )
                        //console.log( oResponse)
                        console.log("ExitoGetInvCultivoData");
                        that.updateFooter(); // actualizar de datos para pie de tabla
                    },
                    error: function (oError) {
                        MessageToast.show("Error");
                        busyDialog.close();
                        console.log("Error_GetInvCultivoData");
                    }
                });

                this.getView().setModel(oModel, "oData");
            },

//----------------- onFilters---------------------------------------------

            onFilterFunction: function (oEvent) {
                                
                storage = [];

                // obtener referencias y/o valores de filtros
                //let cultivo   = this.getView().byId("txtCultivo").getValue();
                //let tipcampo  = this.getView().byId("txtTipcampo").getValue();
                //let proyecto  = this.getView().byId("txtProyecto").getValue();
                //let admin     = this.getView().byId("txtAdmin").getValue();
                //let zona      = this.getView().byId("txtZona").getValue();
                //let etapa     = this.getView().byId("txtEtapa").getValue();
               
                               
                this.getView().byId("txtCount").setText("");     // default value 
                this.getView().byId("txtHtotales").setText("");  // default value
                this.getView().byId("txtHnetas").setText("");    // default value
                

                aFilter = [];
                
                //Filtro Cultivo
                /*if (cultivo) {
                    aFilter.push(new Filter("Cultivo", FilterOperator.EQ, cultivo));
                    console.log("filtro_cultivo_aplicado")
                }*/

                //Filtro Cultivo MultiInput
                var aTokensC =  this.getView().byId("txtCultivo").getTokens();
                
                for (var i = 0; i < aTokensC.length; i++) {
                    aFilter.push(new Filter("Cultivo", FilterOperator.EQ, aTokensC[i].getProperty("text")));
                    console.log("filtro_cultivo_aplicado")
                }

                //Filtro Tipo de Campo
                /*if (tipcampo) {
                    aFilter.push(new Filter("Tipcampo", FilterOperator.EQ, tipcampo));
                    console.log("filtro_tipcampo_aplicado")
                }*/

                //Filtro Tipo de Campo MultiInput
                var aTokensTC =  this.getView().byId("txtTipcampo").getTokens();
                
                for (var i = 0; i < aTokensTC.length; i++) {
                    aFilter.push(new Filter("Tipcampo", FilterOperator.EQ, aTokensTC[i].getProperty("text")));
                    console.log("filtro_tipcampo_aplicado")
                }

                //Filtro Proyecto
                /*if (proyecto) {
                    aFilter.push(new Filter("Proyecto", FilterOperator.EQ, proyecto));
                    console.log("filtro_proyecto_aplicado")
                }*/
                
                //Filtro Proyecto MultiInput
                var aTokensP =  this.getView().byId("txtProyecto").getTokens();

                for (var i = 0; i < aTokensP.length; i++) {
                    aFilter.push(new Filter("Proyecto", FilterOperator.EQ, aTokensP[i].getProperty("text")));
                    console.log("filtro_proyecto_aplicado")
                }

                // Filtro Admin
                /*if (admin) {
                    aFilter.push(new Filter("Admin", FilterOperator.EQ, admin));
                    console.log("filtro_admin_aplicado")
                }*/

                //Filtro Admin MultiInput
                var aTokensAD =  this.getView().byId("txtAdmin").getTokens();
                for (var i = 0; i < aTokensAD.length; i++) {
                    aFilter.push(new Filter("Admin", FilterOperator.EQ, aTokensAD[i].getProperty("text")));
                    console.log("filtro_admin_aplicado")
                }

                // Filtro Zona
                /*if (zona) {
                    aFilter.push(new Filter("Zona", FilterOperator.EQ, zona));
                    console.log("filtro_zona_aplicado")
                }*/

                //Filtro Zona MultiInput
                var aTokensZN =  this.getView().byId("txtZona").getTokens();
                for (var i = 0; i < aTokensZN.length; i++) {
                    aFilter.push(new Filter("Zona", FilterOperator.EQ, aTokensZN[i].getProperty("text")));
                    console.log("filtro_zona_aplicado")
                }

                //Filtro Etapa
                /*if (etapa) {
                    aFilter.push(new Filter("Etapa", FilterOperator.EQ, etapa));
                    console.log("filtro_etapa_aplicado")
                }*/

                //Filtro Etapa MultiInput
                var aTokensET =  this.getView().byId("txtEtapa").getTokens();
                for (var i = 0; i < aTokensET.length; i++) {
                    aFilter.push(new Filter("Etapa", FilterOperator.EQ, aTokensET[i].getProperty("text")));
                    console.log("filtro_etapa_aplicado")
                }


                 storage = [...aFilter];
                if ( storage.length > 0 ) {
                    localStorage.setItem('data-temp', JSON.stringify( storage ) )
                } else {
                    localStorage.removeItem('data-temp');
                } 
                
                this.getInvcultivoData();
            },

            onFilterAdm: function (oEvent) {
                storage2 = [];
                console.log("onFilterAdm")
                aFilterAdm = [];
                //obtener valor de proyecto
                //let proyecto = this.getView().byId("txtProyecto").getValue();
                var aTokensP = this.getView().byId("txtProyecto").getTokens();
                console.log("INGRESA ONFILTER ADM")
                console.log(aTokensP)
                //aFilterAdm = [];
                /*if(proyecto) {
                    aFilterAdm.push(new Filter("Proyecto", FilterOperator.EQ, proyecto));
                }*/
                for (var i = 0; i < aTokensP.length; i++) {
                    aFilterAdm.push(new Filter("Proyecto", FilterOperator.EQ, aTokensP[i].getProperty("text")));
                }

                storage2 = [...aFilterAdm];
                if ( storage2.length > 0 ) {
                    localStorage.setItem('data-temp', JSON.stringify( storage2 ) )
                } else {
                    localStorage.removeItem('data-temp');
                } 
                this.loadMatchcodeAdmin();

            },

            onFilterZn: function (oEvent) {
                storage3 = [];
                console.log("onFilterZn")
                aFilterZn = [];
                //obtener valor de proyecto
                //let proyecto = this.getView().byId("txtProyecto").getValue();
                //let admin = this.getView().byId("txtAdmin").getValue();
                //var aTokensP = this.getView().byId("txtProyecto").getTokens();
                var aTokensP = this.getView().byId("txtProyecto").getTokens();
                var aTokensAD = this.getView().byId("txtAdmin").getTokens();
                console.log("INGRESA ONFILTER ZN")
                console.log(aTokensP)
                console.log(aTokensAD)
                //aFilterZn = [];
                /*if(proyecto) {
                    aFilterZn.push(new Filter("Proyecto", FilterOperator.EQ, proyecto));
                }
                if(admin) {
                    aFilterZn.push(new Filter("Admin", FilterOperator.EQ, admin));
                }*/
                for (var i = 0; i < aTokensP.length; i++) {
                    aFilterZn.push(new Filter("Proyecto", FilterOperator.EQ, aTokensP[i].getProperty("text")));
                }
                for (var i = 0; i < aTokensAD.length; i++) {
                    aFilterZn.push(new Filter("Admin", FilterOperator.EQ, aTokensAD[i].getProperty("text")));
                }
                storage3 = [...aFilterZn];
                if ( storage3.length > 0 ) {
                    localStorage.setItem('data-temp', JSON.stringify( storage3 ) )
                } else {
                    localStorage.removeItem('data-temp');
                } 
                this.loadMatchcodeZona();
            },


            createColumnConfig: function () {

            // definición de columnas a exportar
            var aCols = [];
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            console.log("exportar");
            
            aCols.push({ label: oResourceBundle.getText('ADMIN'),               property: 'Admin'          , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('DESC_ADM'),            property: 'DescAdm'        , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('ZONA'),                property: 'Zona'           , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('DESC_ZONA'),           property: 'DescZona'       , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('ERDAT'),               property: 'Erdat'          , type: EdmType.Date });
            aCols.push({ label: oResourceBundle.getText('TIPCAMPO'),            property: 'Tipcampo'       , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('USR00'),               property: 'Usr00'          , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('SUELO'),               property: 'Suelo'          , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('HTOTALES'),            property: 'Htotales'       , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('HNETAS'),              property: 'Hnetas'         , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('POSID'),               property: 'Posid'          , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('FEC_NAC_PLNT'),        property: 'FecNacPlnt'     , type: EdmType.Date });
            aCols.push({ label: oResourceBundle.getText('DESCRIP'),             property: 'Descrip'        , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('STATXX'),              property: 'Statxx'         , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('VARIEDAD'),            property: 'Variedad'       , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('EDAD'),                property: 'Edad'           , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('DISTANCIA'),           property: 'Distancia'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('UM_DIST'),             property: 'UmDist'         , type: EdmType.String });
            //aCols.push({ label: oResourceBundle.getText('COD_FORMA'),           property: 'CodForma'       , type: EdmType.String });
            //aCols.push({ label: oResourceBundle.getText('COD_FUENTE'),          property: 'CodFuente'      , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('RIEGO'),               property: 'Riego'          , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('FUENTE'),              property: 'Fuente'         , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('ZZBOCTM'),             property: 'Zzboctm'        , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('ZZLTLRG'),             property: 'Zzltlrg'        , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('NRO_RIEGO'),           property: 'NroRiego'       , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('REG_ULT_RIEGO'),       property: 'RegUltRiego'    , type: EdmType.Date });
            aCols.push({ label: oResourceBundle.getText('FEC_INI_AGOSTE'),      property: 'FecIniAgoste'   , type: EdmType.Date });
            aCols.push({ label: oResourceBundle.getText('EDAD_AGOSTE'),         property: 'EdadAgoste'     , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('DIAS_AGOSTE'),         property: 'DiasAgoste'     , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('FEC_MADURANTE'),       property: 'FecMadurante'   , type: EdmType.Date });
            aCols.push({ label: oResourceBundle.getText('EDAD_MADURANTE'),      property: 'EdadMadurante'  , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('SEMANA_MADURANTE'),    property: 'SemanaMadurante', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('K_CLORURO'),           property: 'KCloruro'       , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('K_AJINOFER'),          property: 'KAjinofer'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_FERT1'),          property: 'EdadFert1'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_FERT2'),          property: 'EdadFert2'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_FERT3'),          property: 'EdadFert3'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_FERT4'),          property: 'EdadFert4'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('N_UREA'),              property: 'NUrea'          , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('N_AJINOFER'),          property: 'NAjinofer'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_CTRL_MALEZA1'),   property: 'EdadCtrlMaleza1', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_CTRL_MALEZA2'),   property: 'EdadCtrlMaleza2', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_CTRL_MALEZA3'),   property: 'EdadCtrlMaleza3', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_CTRL_MALEZA4'),   property: 'EdadCtrlMaleza4', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_CTRL_MALEZA5'),   property: 'EdadCtrlMaleza5', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_CTRL_MALEZA6'),   property: 'EdadCtrlMaleza6', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('EDAD_CTRL_MALEZA7'),   property: 'EdadCtrlMaleza7', type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('LIB_AVISPA'),          property: 'LibAvispa'      , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('LIB_CRISOPA'),         property: 'LibCrisopa'     , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('LIB_MOSCA'),           property: 'LibMosca'       , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('CT_ET_ROED'),          property: 'CtEtRoed'       , type: EdmType.Number, scale: 2, delimiter: true });
            aCols.push({ label: oResourceBundle.getText('REND_PROY'),           property: 'RendProy'       , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('SAC_PROY'),            property: 'SacProy'        , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('FLORACION'),           property: 'Floracion'      , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('EP_BARRENO'),          property: 'EpBarreno'      , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('GRADO_ROYA'),          property: 'GradoRoya'      , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('CULTIVO'),             property: 'Cultivo'        , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('PROYECTO'),            property: 'Proyecto'       , type: EdmType.String });
            aCols.push({ label: oResourceBundle.getText('ETAPA'),               property: 'Etapa'          , type: EdmType.String });

            

            return aCols;
            },

            onExport: function () {

                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('tblMain');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('rows');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols, // asignación de columnas 
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'reporte_inv_cultivo.xlsx', // nombre de archivo a descargar
                    worker: true
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });

            },


        });
    });