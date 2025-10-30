// --- Passo 3.1: Importar as bibliotecas do Firebase ---
// Para um ambiente web simples, você usará importações como esta
// quando usar módulos ES6 (que é o que o Firebase recomenda hoje).

// Se você estiver apenas copiando e colando, terá que usar o CDN no HTML.
// Para simplificar agora, vamos usar um script de inicialização direto:

// IMPORTANTE: Se você estiver usando um ambiente local (como VS Code Live Server),
// a maneira mais fácil de usar o Firebase SDK é adicionar essas linhas no final
// do seu index.html, antes da tag </script src="app.js">.

/*
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
*/
// Por enquanto, vamos manter tudo em app.js para explicar a lógica.

// ** Substitua este objeto pelos seus dados do Passo 1.3 **
const firebaseConfig = {
  apiKey: "AIzaSyCdUQVGtl-PVu_CIuY79AQresZuQlo1nZo",
  authDomain: "inscritos-9ce96.firebaseapp.com",
  projectId: "inscritos-9ce96",
  storageBucket: "inscritos-9ce96.firebasestorage.app",
  messagingSenderId: "123531299441",
  appId: "1:123531299441:web:15a474ec1eb6979c1e29d0",
  measurementId: "G-DXXM8LPDJG"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const messageDisplay = document.getElementById('message');
    
    // Funções auxiliares para lidar com campos de rádio
    const getRadioValue = (name) => {
        const selected = form.elements[name].value;
        return selected === 'Sim'; // Converte "Sim" para true e "Não" ou "" para false
    };

    // Coleta dos dados
    const isAbbaFamily = getRadioValue('abbaFamily');
    const isFamilyGroup = getRadioValue('familyGroup');
    const hasFoodRestriction = getRadioValue('foodRestriction');
    const hasHealthCondition = getRadioValue('healthCondition');
    const isMinor = getRadioValue('isMinor');
    const isPrevCamp = getRadioValue('prevCamp');
    
    // Estrutura o objeto de dados a ser enviado ao Firestore
    const formData = {
        // DADOS PESSOAIS
        nomeCompleto: form.fullName.value,
        email: form.email.value,
        idade: parseInt(form.age.value),
        telefone: form.phone.value,
        endereco: form.address.value,

        // AFILIAÇÃO
        pertenceABBApai: isAbbaFamily,
        // Se 'Não', armazena o nome da igreja. Se 'Sim', armazena 'N/A' ou vazio.
        nomeIgreja: isAbbaFamily ? '' : form.churchName.value,
        
        // EXPERIÊNCIA ANTERIOR
        participouAcampAnterior: isPrevCamp,
        expectativasAtendidas: isPrevCamp ? getRadioValue('expectationsMet') : null,
        
        // GRUPO FAMILIAR (4 ou mais)
        fazParteGrupoFamiliar: isFamilyGroup,
        // Só coleta se fazParteGrupoFamiliar for 'Sim'
        detalhesGrupo: isFamilyGroup ? {
            tamanhoGrupo: parseInt(form.groupSize.value),
            nomesIntegrantes: form.groupNames.value.split('\n').filter(n => n.trim() !== ''),
            vinculoDesconto: getRadioValue('discountLink'),
        } : null,
        
        // LOGÍSTICA E SAÚDE
        metodoPagamento: form.paymentMethod.value,
        
        restricaoAlimentar: hasFoodRestriction,
        restricaoAlimentarDescricao: hasFoodRestriction ? form.foodRestrictionDesc.value : '',

        condicaoSaudeAlergia: hasHealthCondition,
        condicaoSaudeAlergiaDescricao: hasHealthCondition ? form.healthConditionDesc.value : '',
        
        // MENOR DE IDADE
        menorDeIdade: isMinor,
        // Só coleta se menorDeIdade for 'Sim'
        responsavel: isMinor ? {
            nome: form.responsibleName.value,
            telefone: form.responsiblePhone.value,
        } : null,

        // MARKETING
        comoSoube: form.howDidYouKnow.value,
        
        // DADOS DE CONTROLE DA ADM (Inicialização)
        dataCadastro: firebase.firestore.FieldValue.serverTimestamp(),
        statusPagamento: "PENDENTE", 
        adminNotes: "", // Lembretes para os ADMs
    };

    // Exibe mensagem de carregamento
    messageDisplay.style.color = 'blue';
    messageDisplay.textContent = 'Enviando inscrição...';

    // Envia os dados para a coleção 'inscricoes'
    db.collection("inscricoes").add(formData)
    .then((docRef) => {
        messageDisplay.style.color = 'green';
        messageDisplay.textContent = `Inscrição realizada com sucesso!`;
        form.reset(); // Limpa o formulário após o sucesso
        // Esconde todos os campos condicionais após o reset
        toggleField('churchField', false);
        toggleField('expectationsField', false);
        toggleField('groupDetailsField', false);
        toggleField('foodRestrictionDescField', false);
        toggleField('healthConditionDescField', false);
        toggleField('responsibleField', false);
    })
    .catch((error) => {
        console.error("Erro ao adicionar documento: ", error);
        messageDisplay.style.color = 'red';
        messageDisplay.textContent = 'Erro ao enviar inscrição. Por favor, tente novamente.';
    });
});