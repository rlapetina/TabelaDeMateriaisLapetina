sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",       
    "sap/m/MessageToast"         
], function (UI5Object, JSONModel, Fragment, MessageToast) {
    "use strict";

    return UI5Object.extend("telalapetinaproject.handler.MaterialHandler", { // Substitua "seu.app" pelo namespace real do seu projeto

        // Construtor recebe a View para podermos manipular os modelos dela
        constructor: function (oView) {
            this._oView = oView;
        },

        // Função 1: Cadastrar a MODEL na página definindo a entidade tableMaterial
        registerModel: function () {
            const oInitialData = {
                tableMaterial: [], // Propriedade requisitada inicialmente vazia
                novoMaterial: {
                    NumMat: "",
                    Nome: "",
                    Descr: ""
                }    
            };
            const oViewModel = new JSONModel(oInitialData);
            
            // Define o modelo na View com o nome "viewModel"
            this._oView.setModel(oViewModel, "viewModel");
        }, //registerModel: function () {

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
        }, //loadTableData: function () {

        // Filtro
        filtrarMateriais: function () {
            const oViewModel = this._oView.getModel("viewModel");
            const sQuantidade = oViewModel.getProperty("/filtroQuantidade");

            if (!sQuantidade) {
                this.loadTableData();
                return;
            }

            const oDataModel = this._oView.getModel();
            
            // 1ª CORREÇÃO: Usar o nome exato da função do backend
            const oFunction = oDataModel.bindContext("/filtroMateriais(...)");
            
            // 2ª CORREÇÃO: Usar o nome exato do parâmetro do backend
            oFunction.setParameter("Qtd", parseInt(sQuantidade, 10));

            oFunction.execute().then(function () {
                const oContext = oFunction.getBoundContext();
                const aResultados = oContext.getObject().value || oContext.getObject(); 
                
                oViewModel.setProperty("/tableMaterial", aResultados);
                
            }).catch(function (oError) {
                console.error("Erro ao executar o filtro:", oError);
            });
        }, //filtrarMateriais: function () {

        abrirDialogCadastro: function () {
            const oView = this._oView;

            // Se o pop-up ainda não foi criado na memória, nós o carregamos
            if (!this._oDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "telalapetinaproject.view.MaterialDialog", // Caminho do Fragment
                    controller: oView.getController() // Faz os botões do pop-up conversarem com a Controller da View
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    oView.addDependent(this._oDialog);
                    this._oDialog.open();
                }.bind(this));
            } else {
                // Se já existe, apenas abre
                this._oDialog.open();
            }
        }, // abrirDialogCadastro: function () {

        fecharDialogCadastro: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
        }, //fecharDialogCadastro: function () {

        salvarNovoMaterial: function () {
            const oViewModel = this._oView.getModel("viewModel");
            const oNovoMaterial = oViewModel.getProperty("/novoMaterial");

            // 1. Validação do Front-end
            if (!oNovoMaterial.NumMat || !oNovoMaterial.Nome || !oNovoMaterial.Descr) {
                MessageToast.show("Por favor, preencha todos os campos obrigatórios.");
                return; // Para a execução aqui
            }

            // 2. Prepara a chamada da Action do OData V4
            const oDataModel = this._oView.getModel();
            const oAction = oDataModel.bindContext("/adicionarMaterial(...)");
            
            // 3. Passa os parâmetros digitados para o backend
            oAction.setParameter("NumMat", oNovoMaterial.NumMat);
            oAction.setParameter("Nome", oNovoMaterial.Nome);
            oAction.setParameter("Descr", oNovoMaterial.Descr);

            // 4. Executa a requisição (POST)
            oAction.execute().then(function () {
                // Captura a mensagem de sucesso que fizemos no service.js do CAP
                const oContext = oAction.getBoundContext();
                const sMensagem = oContext.getObject().value || "Material salvo com sucesso!";
                
                MessageToast.show(sMensagem);
                
                // Limpa o formulário, fecha o pop-up e recarrega a tabela
                oViewModel.setProperty("/novoMaterial", { NumMat: "", Nome: "", Descr: "" });
                this.fecharDialogCadastro();
                this.loadTableData();

            }.bind(this)).catch(function (oError) {
                // Em caso de erro (ex: material duplicado validado lá no CAP)
                MessageToast.show("Erro: " + oError.message);
            });
        } //salvarNovoMaterial: function () {

    });
});