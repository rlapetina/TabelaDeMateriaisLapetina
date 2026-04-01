using prova from '../db/schema' ;

service ProvaBTP {
  entity Materiais as projection on prova.Materiais ;

  // Função de filtro
  function filtroMateriais(Qtd : Integer) returns array of Materiais;
  
  // Action de inserção 
  action adicionarMaterial(NumMat: Integer, Nome: String(50), Descr: String(250)) returns String;
}