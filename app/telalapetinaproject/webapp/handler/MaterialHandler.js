sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel"
], function (UI5Object, JSONModel) {
    "use strict";

    return UI5Object.extend("telalapetinaproject.handler.MaterialHandler", { // Substitua "seu.app" pelo namespace real do seu projeto

        // Construtor recebe a View para podermos manipular os modelos dela
        constructor: function (oView) {
            this._oView = oView;
        },

        // Função 1: Cadastrar a MODEL na página definindo a entidade tableMaterial
        registerModel: function () {
            const oInitialData = {
                tableMaterial: [] // Propriedade requisitada inicialmente vazia
            };
            const oViewModel = new JSONModel(oInitialData);
            
            // Define o modelo na View com o nome "viewModel"
            this._oView.setModel(oViewModel, "viewModel");
        },

        // Função 2: Carregar dados da tabela no model
        loadTableData: function () {
            // Pegamos o modelo OData V4 principal (configurado no manifest.json)
            const oDataModel = this._oView.getModel(); 
            const oViewModel = this._oView.getModel("viewModel");

            // No OData V4, usamos o bindList para ler dados programaticamente
            const oListBinding = oDataModel.bindList("/Materiais");

            // Requisita os dados do backend
            oListBinding.requestContexts(0, Infinity).then(function (aContexts) {
                // Mapeia os contextos retornados para objetos Javascript puros
                const aData = aContexts.map(function (oContext) {
                    return oContext.getObject();
                });

                // Alimenta a nossa propriedade tableMaterial com os dados do backend
                oViewModel.setProperty("/tableMaterial", aData);
            }).catch(function (oError) {
                console.error("Erro ao carregar materiais:", oError);
            });
        }

    });
});