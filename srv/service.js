const cds = require('@sap/cds');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(async function () {
   
    // --- Handler filtroMateriais ---
this.on('filtroMateriais',async (req) => { 

      const { Materiais } = this.entities ;

   if (!req.data.Qtd || req.data.Qtd <= 0 ) {
     return req.error(400,'Quantidade deve ser maior que zero')

   }

   const VariavelQty = req.data.Qtd;

  // const { curso } = req.data 

try {
            // 3. Executa a consulta no banco de dados local
            // Equivalente a: SELECT * FROM Materiais LIMIT VariavelQty
            const resultados = await SELECT.from(Materiais).limit(VariavelQty);
            
            // 4. Retorna os dados para quem chamou a API
            return resultados;
            
        } catch (error) {
            return req.error(500, 'Erro ao buscar materiais: ${error.message}');
        }

}); // fecha this.on('filtroMateriais',async (req) => {



// --- Handler adicionarMaterial ---
    this.on('adicionarMaterial', async (req) => {
        const { NumMat, Nome, Descr } = req.data;

      const { Materiais } = this.entities ;

        // 1. Validação de campos obrigatórios
        if (!NumMat || !Nome || !Descr) {
            // req.error já retorna a mensagem de erro formatada para o usuário e interrompe o fluxo
            return req.error(400, 'Validação falhou: Os campos NumMat, Nome e Descr são obrigatórios.');
        }

        // 2. Validar se o material (NumMat) já existe (Evitar duplicados)
        // Faz um SELECT procurando apenas por aquele número de material
        const materialExistente = await SELECT.one.from(Materiais).where({ NumMat: NumMat });
        
        if (materialExistente) {
            return req.error(400, `O material com o código '${NumMat}' já está cadastrado.`);
        }

        try {
            // 3. Obter o último ID para criar o sequencial
            // Busca o maior ID cadastrado na tabela
            const ultimoRegistro = await SELECT.one.from(Materiais).columns('ID').orderBy('ID desc');
            
            // Se existir um último registro, soma 1. Se a tabela estiver vazia, o ID será 1.
            const novoID = (ultimoRegistro && ultimoRegistro.ID) ? ultimoRegistro.ID + 1 : 1;

            // 4. Inserir o novo registro no banco de dados
            await INSERT.into(Materiais).entries({
                ID: novoID,
                NumMat: NumMat,
                Nome: Nome,
                Descr: Descr
            });

            // 5. Retornar mensagem de sucesso
            return `Sucesso: Material '${Nome}' cadastrado com o ID ${novoID}.`;

        } catch (error) {
            return req.error(500, `Erro interno ao cadastrar o material: ${error.message}`);
        }
    }); //fecha   this.on('adicionarMaterial', async (req) =>



}) // fecha  module.exports = cds.service.impl(async function