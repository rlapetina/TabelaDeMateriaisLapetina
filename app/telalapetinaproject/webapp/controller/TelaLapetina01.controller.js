//sap.ui.define([
//    "sap/ui/core/mvc/Controller"
//], (Controller) => {
//    "use strict";
//
//    return Controller.extend("telalapetinaproject.controller.TelaLapetina01", {
//        onInit() {
//        }
//   });
//});

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "telalapetinaproject/handler/MaterialHandler" // Importe o Handler (Ajuste o "seu/app" para o seu namespace usando barras '/' )
], function (Controller, MaterialHandler) {
    "use strict";

    return Controller.extend("telalapetinaproject.controller.TelaLapetina01", {

        onInit: function () {
            // Pegamos o Router do aplicativo
            const oRouter = this.getOwnerComponent().getRouter();
            
            // Atrela a execução da função _onRouteMatched quando a rota desta view for acessada
            // "RouteView1" é o nome padrão da rota criada pelo template no manifest.json. Verifique o seu lá se necessário.
            oRouter.getRoute("RouteTelaLapetina01").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            // 1. Instancia o Handler passando a View atual
            this.oMaterialHandler = new MaterialHandler(this.getView());
            
            // 2. Chama a função para registrar a Model (tableMaterial)
            this.oMaterialHandler.registerModel();
            
            // 3. Chama a função para buscar no backend e preencher a Model
            this.oMaterialHandler.loadTableData();
        },

        // O gatilho do botão
        onPressFiltrar: function () {
            // Avisa o Handler para rodar a lógica de filtro que acabamos de criar
            this.oMaterialHandler.filtrarMateriais();
        } ,
        
        onPressNovoMaterial: function () {
            this.oMaterialHandler.abrirDialogCadastro();
        },

        onPressSalvarMaterial: function () {
            this.oMaterialHandler.salvarNovoMaterial();
        },

        onPressCancelarMaterial: function () {
            this.oMaterialHandler.fecharDialogCadastro();
        }

    });
});