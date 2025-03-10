//-----Controle de turnos e fluxo do jogo
let jogadorPergaminhos = 0;
let iaPergaminhos = 0;
const scrolls = [
  { stat: "hp", value: 10, icon: "scroll+HP.png", type: "bonus" },
  { stat: "chakra", value: 10, icon: "scroll+Chk.png", type: "bonus" },
  { stat: "taijutsu", value: 10, icon: "scroll+Tai.png", type: "bonus" },
  { stat: "genjutsu", value: 10, icon: "scroll+Gen.png", type: "bonus" },
  { stat: "ninjutsu", value: 10, icon: "scroll+Nin.png", type: "bonus" },
  { stat: "defense", value: 10, icon: "scroll+Def.png", type: "bonus" },
  { stat: "speed", value: 10, icon: "scroll+Spd.png", type: "bonus" },
  { stat: "hp", value: -10, icon: "scroll-HP.png", type: "penalty" },
  { stat: "chakra", value: -10, icon: "scroll-Chk.png", type: "penalty" },
  { stat: "taijutsu", value: -10, icon: "scroll-Tai.png", type: "penalty" },
  { stat: "genjutsu", value: -10, icon: "scroll-Gen.png", type: "penalty" },
  { stat: "ninjutsu", value: -10, icon: "scroll-Nin.png", type: "penalty" },
  { stat: "defense", value: -10, icon: "scroll-Def.png", type: "penalty" },
  { stat: "speed", value: -10, icon: "scroll-Spd.png", type: "penalty" },
];

const fases = [
  "inicio",
  "formacao",
  "compra",
  "preparacao",
  "suporte",
  "combate",
  "novoLider",
];
let estadoAtual = "inicio";
let jutsusDatabase = []; // Variável global para armazenar os jutsus carregados
let jogadorMao = []; // Cards na mão do jogador
let jogadorTime = []; // Cards no campo do jogador
let iaMao = []; // Cards na mão da IA
let iaTime = []; // Cards no campo da IA
let chakraUsado = false; //Controlar uso de chakra por turno
let turnosSemLider = 0; //Controla o empate
let arrayDescarteIA = [];
let arrayDescartePlayer = [];
let currentCardIndex = 0;
let currentDiscardPile = arrayDescartePlayer;
let suporteIAExecutado = false; // Variável de controle global
let jogadorField = [];
let iaField = [];

function iniciarCampoDeBatalha() {
  //console.log("Iniciando o campo de batalha...");
  document.getElementById(
    "player-name-display"
  ).innerText = `Time ${jogadorNome}`;
  document.getElementById(
    "player-name-hand"
  ).innerText = `Mão de ${jogadorNome}`;
  document.getElementById(
    "player-name-deck"
  ).innerText = `Deck de ${jogadorNome}`;
  document.getElementById("player-scroll-count").innerText = jogadorPergaminhos;
  document.getElementById("ia-scroll-count").innerText = iaPergaminhos;

  // Inicialização ao carregar a página
  document.addEventListener("DOMContentLoaded", () => {
    atualizarBotoes(); // Configura a aparência inicial dos botões
  });
  document.addEventListener("DOMContentLoaded", () => {
    gsap.from("#player-area", {
      duration: 1.5,
      y: 50,
      opacity: 0,
      ease: "power2.out",
    });
  });

  // Inicializa as mãos vazias
  jogadorMao = [];
  iaMao = [];

  // Verifica integridade inicial dos baralhos
  console.log("Deck original J1:", jogadorBaralho.cards);
  console.log("Deck original IA:", iaBaralho.cards);

  // Embaralhar os baralhos do jogador e da IA
  //console.log("Embaralhando baralhos...");
  const originalJogadorBaralho = [...jogadorBaralho.cards];
  const originalIaBaralho = [...iaBaralho.cards];

  embaralharBaralho(jogadorBaralho.cards);
  embaralharBaralho(iaBaralho.cards);

  // Verificar se o baralho foi embaralhado
  const jogadorEmbaralhado =
    JSON.stringify(jogadorBaralho.cards) !==
    JSON.stringify(originalJogadorBaralho);
  const iaEmbaralhado =
    JSON.stringify(iaBaralho.cards) !== JSON.stringify(originalIaBaralho);

  if (!jogadorEmbaralhado || !iaEmbaralhado) {
    console.error("Falha no embaralhamento de um ou ambos os baralhos.");
  }

  formarMaoInicial(jogadorBaralho.cards, jogadorMao, iaBaralho.cards, iaMao);

  renderizarMao(jogadorMao);

  renderizarMaoIA(iaMao);

  estadoAtual = "formacao";
  console.log("Estado do jogo ajustado para:", estadoAtual);
  atualizarBotoes();
  initializeDragAndDrop();
}
function embaralharBaralho(baralho) {
  if (!Array.isArray(baralho) || baralho.length === 0) {
    console.error("Baralho inválido para embaralhar:", baralho);
    return;
  }

  //console.log("Baralho antes do embaralhamento:", JSON.stringify(baralho));

  // Implementação de embaralhamento usando Fisher-Yates Shuffle
  for (let i = baralho.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Índice aleatório de 0 a i
    [baralho[i], baralho[j]] = [baralho[j], baralho[i]]; // Troca de elementos
    console.log("Baralho embaralhado.");
  }

  //console.log("Baralho após o embaralhamento:", JSON.stringify(baralho));
}
function formarMaoInicial(baralhoJogador, maoJogador, baralhoIA, maoIA) {
  console.log("Iniciando formação de mãos...");
  let tentativas = 0; // Contador para evitar loops infinitos
  let maoJogadorCompleta = false; // Controle da mão do Jogador
  let maoIACompleta = false; // Controle da mão da IA

  // Função para verificar se uma mão tem pelo menos um Ninja Estágio 1
  function temNinjaEstagio1(mao) {
    return mao.some((card) => card.type === "Ninja" && card.stage === 1);
  }

  // Valida se os baralhos são arrays válidos
  if (!Array.isArray(baralhoJogador) || !Array.isArray(baralhoIA)) {
    console.error("Os baralhos devem ser arrays válidos.");
    return;
  }

  // Cópias dos baralhos para evitar modificações diretas
  let copiaBaralhoJogador = [...baralhoJogador];
  let copiaBaralhoIA = [...baralhoIA];

  // Loop para formar as mãos até que ambas estejam corretas ou atinja o limite de tentativas
  while ((!maoJogadorCompleta || !maoIACompleta) && tentativas < 10) {
    console.log(`Tentativa ${tentativas + 1}:`);

    // Processa a mão do Jogador
    if (!maoJogadorCompleta) {
      maoJogador.length = 0; // Limpa a mão anterior
      maoJogador.push(...copiaBaralhoJogador.splice(0, 7)); // Retira os 5 primeiros cards do baralho

      if (!temNinjaEstagio1(maoJogador)) {
        // Devolve os cards ao final do baralho e tenta de novo
        copiaBaralhoJogador.push(...maoJogador);
        maoJogador.length = 0;
      } else {
        // Se tiver Ninja 1, finaliza a mão
        maoJogadorCompleta = true;
      }
    }

    // Processa a mão da IA
    if (!maoIACompleta) {
      maoIA.length = 0; // Limpa a mão anterior
      maoIA.push(...copiaBaralhoIA.splice(0, 7)); // Retira os 5 primeiros cards do baralho

      if (!temNinjaEstagio1(maoIA)) {
        // Devolve os cards ao final do baralho e tenta de novo
        copiaBaralhoIA.push(...maoIA);
        maoIA.length = 0;
      } else {
        // Se tiver Ninja 1, finaliza a mão
        maoIACompleta = true;
      }
    }

    tentativas++; // Incrementa o contador de tentativas
  }

  // Verificação final para garantir que ambas as mãos estão corretas
  if (!maoJogadorCompleta || !maoIACompleta) {
    console.error("Não foi possível formar mãos válidas após 20 tentativas.");
    return;
  }

  // Atualiza os baralhos originais com as cópias finais
  baralhoJogador.length = 0;
  baralhoJogador.push(...copiaBaralhoJogador);

  baralhoIA.length = 0;
  baralhoIA.push(...copiaBaralhoIA);

  //console.log("Mão inicial do Jogador:", maoJogador);
  //console.log("Baralho do Jogador após formação:", baralhoJogador);
  //console.log("Mão inicial da IA:", maoIA);
  //console.log("Baralho da IA após formação:", baralhoIA);
}

function renderizarMao(mao) {
  const maoContainer = document.getElementById("maoJ1");
  maoContainer.innerHTML = ""; // Limpa a mão antes de renderizar

  const idsExcluidos = [
    ...Array.from(document.querySelectorAll(".field-slot img")).map(
      (card) => card.id
    ),
    ...Array.from(document.querySelectorAll("#player-discard-slot img")).map(
      (card) => card.id
    ),
  ];

  const cardsNaMao = mao.filter((card) => !idsExcluidos.includes(card.idCard));

  cardsNaMao.forEach((card) => {
    const cardElement = document.createElement("img");
    cardElement.src = card.photo;
    cardElement.alt = card.name || "Card";
    cardElement.id = card.idCard;
    cardElement.classList.add("hand-card");
    cardElement.draggable = true; // Habilita o drag and drop
    cardElement.addEventListener("dragstart", dragStartHandler);
    cardElement.dataset.jogador = "J1"; // ✅ Definindo dono do card

    if (card.type === "Ninja") {
      Object.assign(cardElement.dataset, {
        type: card.type,
        idCard: card.idCard,
        regN: card.regN,
        name: card.name,
        stage: card.stage || 1,
        bloqEvo: card.stage || 1,
        hpInicial: card.hp || 0,
        chakraInicial: card.chakra || 0,
        hp: card.hp || 0,
        chakra: card.chakra || 0,
        taijutsu: card.taijutsu || 0,
        genjutsu: card.genjutsu || 0,
        ninjutsu: card.ninjutsu || 0,
        defense: card.defense || 0,
        speed: card.speed || 0,
        katon: card.katon || 0,
        fuuton: card.fuuton || 0,
        raiton: card.raiton || 0,
        doton: card.doton || 0,
        suiton: card.suiton || 0,
        katonOriginal: card.katon || 0,
        fuutonOriginal: card.fuuton || 0,
        raitonOriginal: card.raiton || 0,
        dotonOriginal: card.doton || 0,
        suitonOriginal: card.suiton || 0,
        supSkill: card.supSkill || null,
        costSupSkill: card.costSupSkill || 0,
        chanceSkill: card.chanceSkill || 0,
        jutsus: JSON.stringify(card.jutsus || []),
      });
    } else if (card.type === "Tool") {
      Object.assign(cardElement.dataset, {
        type: card.type,
        effect:
          typeof card.effect === "string"
            ? card.effect
            : JSON.stringify(card.effect || ""),
      });
    } else if (card.type === "Chakra") {
      Object.assign(cardElement.dataset, {
        type: card.type,
        effect:
          typeof card.effect === "string"
            ? card.effect
            : JSON.stringify(card.effect || ""),
        natureChakra: card.natureChakra || "Nenhum", // ✅ Adicionando atributo natureChakra
      });
    }

    maoContainer.appendChild(cardElement);
  });
}
function renderizarMaoIA(maoIA) {
  const maoContainerIA = document.getElementById("maoIA");

  if (!maoContainerIA) {
    console.error("❌ Erro: Elemento 'maoIA' não encontrado no DOM.");
    return;
  }

  if (!Array.isArray(maoIA) || maoIA.length === 0) {
    console.warn("⚠️ A mão da IA está vazia ou não é um array válido.");
    //maoContainerIA.innerHTML = "<p class='empty-hand'>IA sem cartas na mão</p>";
    return;
  }

  console.log(`🎴 Renderizando ${maoIA.length} cards na mão da IA...`);
  /*
  // 🔹 Captura IDs já usados no campo ou descarte
  const idsExcluidosIA = [
      ...Array.from(document.querySelectorAll('.field-slot img')).map(card => card.id),
      ...Array.from(document.querySelectorAll('#ia-discard-slot img')).map(card => card.id)
  ];
  console.log("📌 idsExcluidosIA antes da filtragem:", idsExcluidosIA);

  // 🔹 Filtrar apenas os cards que não estão no campo nem no descarte
  const cardsNaMaoIA = maoIA.filter(card => !idsExcluidosIA.includes(card.idCard));
  console.log("📌 cardsNaMaoIA depois da filtragem:", cardsNaMaoIA);
*/
  // 🔹 Limpa a área antes de renderizar
  maoContainerIA.innerHTML = "";

  maoIA.forEach((card) => {
    if (!card || !card.idCard) {
      console.warn("⚠️ Card inválido encontrado na mão da IA:", card);
      return;
    }

    const cardElement = document.createElement("img");
    cardElement.src = card.photo || "imagens/card_placeholder.png";
    cardElement.alt = card.name || "Card da IA";
    cardElement.id = card.idCard;
    cardElement.classList.add("hand-card-ia");
    cardElement.draggable = false;
    cardElement.dataset.jogador = "IA";

    // 🔹 Garantia de que o ID está correto
    //console.log(`🃏 Criando card ${card.name || "Desconhecido"} com id: ${card.idCard}`);

    // Define os atributos do card dependendo do tipo
    if (card.type === "Ninja") {
      Object.assign(cardElement.dataset, {
        type: card.type,
        idCard: card.idCard,
        regN: card.regN,
        name: card.name,
        stage: card.stage || 1,
        hpInicial: card.hp || 0,
        chakraInicial: card.chakra || 0,
        hp: card.hp || 0,
        chakra: card.chakra || 0,
        taijutsu: card.taijutsu || 0,
        genjutsu: card.genjutsu || 0,
        ninjutsu: card.ninjutsu || 0,
        defense: card.defense || 0,
        speed: card.speed || 0,
        katon: card.katon || 0,
        fuuton: card.fuuton || 0,
        raiton: card.raiton || 0,
        doton: card.doton || 0,
        suiton: card.suiton || 0,
        katonOriginal: card.katonOriginal || card.katon || 0,
        fuutonOriginal: card.fuutonOriginal || card.fuuton || 0,
        raitonOriginal: card.raitonOriginal || card.raiton || 0,
        dotonOriginal: card.dotonOriginal || card.doton || 0,
        suitonOriginal: card.suitonOriginal || card.suiton || 0,
        supSkill: card.supSkill || null,
        costSupSkill: card.costSupSkill || 0,
        chanceSkill: card.chanceSkill || 0,
        jutsus: JSON.stringify(card.jutsus || []),
      });
    } else if (card.type === "Tool") {
      Object.assign(cardElement.dataset, {
        type: card.type,
        effect:
          typeof card.effect === "string"
            ? card.effect
            : JSON.stringify(card.effect || ""),
      });
    } else if (card.type === "Chakra") {
      Object.assign(cardElement.dataset, {
        type: card.type,
        effect:
          typeof card.effect === "string"
            ? card.effect
            : JSON.stringify(card.effect || ""),
        natureChakra: card.natureChakra || "Nenhum", // ✅ Adicionando atributo natureChakra
      });
    }
    // 🔹 Adiciona o card à mão da IA
    maoContainerIA.appendChild(cardElement);
  });
}

function restaurarImagemCard(card) {
  if (card.dataset.originalSrc) {
    card.src = card.dataset.originalSrc; // Restaura a photo original
    delete card.dataset.originalSrc; // Remove o dado temporário
  }
}

function encerrarFormacao() {
  //console.log("Encerrando fase de formação...");

  // Recupera o líder do jogador
  const playerLeaderSlot = document.getElementById("player-leader-slot");
  const leaderCard = playerLeaderSlot.querySelector("img");

  // Verifica se o card do líder é um Ninja Estágio 1
  if (leaderCard) {
    const leaderType = leaderCard.getAttribute("data-type"); // Usa getAttribute para acessar atributos
    const leaderStage = parseInt(leaderCard.getAttribute("data-stage"), 10);
    /*
    console.log(`Líder no slot encontrado:`, leaderCard);
    console.log(`Tipo do líder: ${leaderType}`);
    console.log(`Estágio do líder: ${leaderStage}`);
*/
    if (leaderType === "Ninja" && leaderStage === 1) {
      alert("Formação do time concluída!");

      // Adiciona a variável bloqEvo aos cards no campo
      const allCardsInField = document.querySelectorAll(".field-slot img");
      allCardsInField.forEach((card) => {
        card.setAttribute("data-bloq-evo", "0"); // Bloqueia a evolução inicialmente
      });
      // Inicia a escolha do time pela IA
      escolherTimeIA();

      return; // Encerrar a função aqui
    }
  }

  alert("O Líder deve ser um Ninja Estágio 1!");
}
//-----Turno de Compra
function turnoDeCompraIA() {
  //console.log("Iniciando turno de compra da IA...");
  atualizarBotoes();

  // Verifica a quantidade de cards no deck da IA
  const deckIA = iaBaralho.cards;
  const maoIA = iaMao;

  if (deckIA.length > 2) {
    const comprado = comprarCard(deckIA, maoIA, "ia-deck-slot");
    if (comprado) {
      renderizarMaoIA(maoIA); // Atualiza a mão da IA
    }
    console.log("A IA comprou 1 card do deck");
    turnoDeCompraJ1();
  } else if (deckIA.length === 2) {
    const comprado = comprarCard(deckIA, maoIA, "ia-deck-slot");
    if (comprado) {
      renderizarMaoIA(maoIA); // Atualiza a mão da IA
    }
    alert("A IA só possui mais 1 card no deck");
    turnoDeCompraJ1();
  } else if (deckIA.length === 1) {
    const comprado = comprarCard(deckIA, maoIA, "ia-deck-slot");
    if (comprado) {
      renderizarMaoIA(maoIA); // Atualiza a mão da IA
    }
    alert("IA não possui mais cards no deck");
    turnoDeCompraJ1();
  } else {
    alert("IA não pode comprar: deck vazio");
    turnoDeCompraJ1();
  }
}
function turnoDeCompraJ1() {
  //console.log("Iniciando turno de compra do jogador...");

  // Verifica a quantidade de cards no deck do jogador
  const deckJ1 = jogadorBaralho.cards;
  const maoJ1 = jogadorMao;

  if (deckJ1.length > 2) {
    const comprado = comprarCard(deckJ1, maoJ1, "player-deck-slot");
    if (comprado) {
      renderizarMao(maoJ1); // Atualiza a mão do jogador
    }
    console.log(`${jogadorNome} comprou 1 card do deck`);
    encerrarTurno();
  } else if (deckJ1.length === 2) {
    const comprado = comprarCard(deckJ1, maoJ1, "player-deck-slot");
    if (comprado) {
      renderizarMao(maoJ1); // Atualiza a mão do jogador
    }
    alert(`${jogadorNome} só possui mais 1 card no deck`);
    encerrarTurno();
  } else if (deckJ1.length === 1) {
    const comprado = comprarCard(deckJ1, maoJ1, "player-deck-slot");
    if (comprado) {
      renderizarMao(maoJ1); // Atualiza a mão do jogador
    }
    alert(`${jogadorNome} não possui mais cards no deck`);
    encerrarTurno();
  } else {
    alert(`${jogadorNome} não pode comprar: deck vazio`);
    encerrarTurno();
  }
}
// Função para adicionar um card na mão e remover do deck
function comprarCard(deck, mao, deckSlotId) {
  if (deck.length === 0) return null; // Sem cards no deck

  if (!Array.isArray(mao)) {
    console.error(
      "Erro: mao não é um array válido em comprarCard(). Redefinindo..."
    );
    mao = [];
  }

  const card = deck.shift(); // Remove o card do topo do deck
  const isCardInField = Array.from(
    document.querySelectorAll(".field-slot img")
  ).some((fieldCard) => fieldCard.id === card.idCard);

  if (!isCardInField) {
    mao.push(card); // Adiciona na mão se o card não estiver no campo
  } else {
    console.warn(
      `Card ${card.idCard} já está no campo, não será adicionado à mão.`
    );
  }

  // Atualiza a photo do deck
  const deckSlot = document.getElementById(deckSlotId);
  if (deck.length === 0) {
    deckSlot.innerHTML = ""; // Remove a photo se o deck está vazio
  }

  return card;
}

//-----Preparação
function turnoDePreparacao() {
  console.log("Iniciando turno de preparação...");
  //estadoAtual = "preparacao";
  //console.log("Fase:",estadoAtual);
  incrementarBloqEvo(); // Incrementa bloqEvo
  atualizarBotoes(); // Atualiza os botões novamente
  configurarEventosDeDuploClique(); //Ativa ver cards da IA
  initializeDragAndDrop();
}
function encerrarPreparacao() {
  if (estadoAtual !== "preparacaoIA") {
    alert("Você só pode encerrar o turno durante a preparação!");
    return;
  }
  console.log("Finalizando turno de preparação...");
  chakraUsado = false; // Reseta o controle de uso de Chakra
  // Reseta o uso de Tools em todos os ninjas no campo
  const ninjasNoCampo = document.querySelectorAll(
    '.field-slot img[data-type="Ninja"]'
  );
  ninjasNoCampo.forEach((ninja) => {
    ninja.dataset.toolUsado = "false";
  });
  estadoAtual = "suporte";
  decidirOrdemHabilidadesSuporte();
}
// Função para atualizar os botões com base no estado atual
function atualizarBotoes() {
  document.getElementById("fase-atual").innerText = traduzirFase(estadoAtual);
}
// Exemplo de função para encerrar o turno atual e ir para o próximo
function encerrarTurno() {
  if (estadoAtual === "formacao") {
    console.log("Turno de formação do J1 encerrado!");
    estadoAtual = "form.IA"; // Transição para a formação da IA
    encerrarFormacao(); // Função específica para encerrar a formação
  } else if (estadoAtual === "compra") {
    alert("Turno de compra encerrado!");
    estadoAtual = "preparacao"; // Transição para a fase de preparação
    turnoDePreparacao(); // Função específica para o início da preparação
  } else if (estadoAtual === "preparacao") {
    console.log("Turno de preparação encerrado!");
    estadoAtual = "preparacaoIA"; // Transição para a fase de combate
    acaoPreparacaoIA(); // Função específica para encerrar a preparação
  } else if (estadoAtual === "preparacaoIA") {
    console.log("Turno de preparação IA encerrado!");
    encerrarPreparacao(); // Função específica para encerrar a preparação
  } else if (estadoAtual === "suporte") {
    console.log("Encerrando Suporte");
    if (!suporteIAExecutado) {
      console.log(
        "IA ainda não executou as habilidades de suporte. Iniciando..."
      );
      escolherHabilidadesSuporteIA();
      encerrarTurno();
    } else {
      console.log(
        "IA já executou as habilidades de suporte. Avançando para a fase de combate..."
      );
      estadoAtual = "combate";
      iniciarTurnoCombate();
    }
  } else if (estadoAtual === "combate") {
    console.log("Iniciando dano de combate");
    encerrarCombate(); // Função específica para calcular dano
  } else if (estadoAtual === "novoLider") {
    console.log("Iniciando escolha do novo lider");
    estadoAtual = "premio"; // Transição para a fase de prêmio
    encerrarTurno(); // Função específica para encerrar combate
  } else if (estadoAtual === "premio" || estadoAtual === "liderAusente") {
    console.log("Turno de prêmio encerrado!");
    // Reseta a marcação de habilidade usada e limpa a marcação de paralyze para todos os ninjas no campo
    const todosNinjasCampo = document.querySelectorAll(".field-slot img");
    todosNinjasCampo.forEach((ninja) => {
      if (ninja.dataset.habUsada === "true") {
        ninja.dataset.habUsada = "false";
        console.log(
          `Resetando habilidade usada para o ninja ${ninja.dataset.name}.`
        );
      }
      if (ninja.dataset.paralyze === "true") {
        ninja.dataset.paralyze = "false";
        console.log(`Removendo Paralyze do ninja ${ninja.dataset.name}.`);
        ninja.dataset.speed =
          ninja.dataset.speedOriginal || ninja.dataset.speed; // Restaura a speed original, se aplicável
      }
    });

    estadoAtual = "compra";
    turnoDeCompraIA(); // Avança para o próximo estágio
  } else if (estadoAtual === "fim") {
    console.log("Encerrando Jogo");
    return;
  }

  // Atualiza os botões após a mudança de estado
  atualizarBotoes();
}
// Função de clique para os botões
function handleClick(novoEstado) {
  // Validação para encerrar a formação: verifica se o slot do líder está vazio
  if (estadoAtual === "formacao" && novoEstado === "formacao") {
    const liderSlot = document.querySelector("#player-leader-slot img");
    if (!liderSlot) {
      alert("Você deve selecionar um líder antes de encerrar a formação.");
      return; // Aborta se o líder não estiver definido
    }
  }
  // Mapeia os estados que exigem confirmação para encerrar
  const estadosComConfirmacao = {
    formacao: "Deseja encerrar o turno de formação?",
    preparacao: "Deseja encerrar o turno de preparação?",
    combate: "Deseja iniciar o combate?",
    novoLider: "Confirmar novo lider?",
  };

  if (novoEstado === estadoAtual) {
    // Verifica se o estado atual exige confirmação
    const mensagem = estadosComConfirmacao[estadoAtual];
    if (mensagem) {
      const confirmar = confirm(mensagem);
      if (confirmar) {
        encerrarTurno(); // Chama a função de encerrar turno
      }
    }
    return; // Sai se o botão ativo for clicado novamente
  }

  // Troca para o estado clicado
  trocarEstado(novoEstado);
}
// Controle de Fases
//document.getElementById("fase-atual").innerText = traduzirFase(estadoAtual);

// Manipular o botão de desistência
document.getElementById("btn-desistir").addEventListener("click", () => {
  const confirmar = confirm(
    "Você tem certeza que deseja desistir? A IA será declarada vencedora."
  );
  if (confirmar) {
    declararVitoriaIA();
  }
});

// Manipular o botão de próxima fase
document.getElementById("btn-proxima-fase").addEventListener("click", () => {
  const confirmar = confirm(
    `Deseja encerrar a fase "${traduzirFase(
      estadoAtual
    )}" e avançar para a próxima?`
  );
  if (confirmar) {
    encerrarTurno();
  }
});

// Função para traduzir o name da fase
function traduzirFase(fase) {
  const traducoes = {
    inicio: "Formando a Vila",
    formacao: "Formação do Time",
    compra: "Invocando Recurso",
    preparacao: "Equipando Time",
    suporte: "Hab. de Suporte",
    combate: "Ações de Combate",
    novoLider: "Escolher Novo Líder",
  };
  return traducoes[fase] || fase;
}
// Função para encerrar o jogo
function encerrarJogo() {
  estadoAtual = "encerrado";
  document.getElementById("fase-atual").innerText = "Jogo Encerrado";
  alert("Obrigado por jogar!");
  // Adicione lógica para encerrar o jogo (desativar botões, etc.)
  return;
}
//----Encerrar
function iniciarTurnoCombate() {
  console.log("Iniciando turno de combate...");
  atualizarBotoes();

  // Reduz HP dos ninjas com a marcação de Poising
  const todosNinjas = document.querySelectorAll(".field-slot img");
  todosNinjas.forEach((ninja) => {
    if (ninja.dataset.poising === "true") {
      const hpAtual = parseInt(ninja.dataset.hp, 10);
      const hpInicial = parseInt(ninja.dataset.hpInicial, 10);

      if (hpAtual > 0) {
        const reducao = Math.ceil(hpInicial * 0.1); // 10% do HP inicial
        ninja.dataset.hp = Math.max(0, hpAtual - reducao); // Garante que o HP não fique negativo
        console.log(
          `Ninja ${ninja.dataset.name} com Poising: HP reduzido em ${reducao}. HP atual: ${ninja.dataset.hp}`
        );

        // Atualiza atributos se o ninja for o líder
        if (ninja.closest("#player-leader-slot")) {
          console.log(
            `Atualizando atributos do líder do jogador devido ao Poising.`
          );
          atualizarAtributosLider(ninja);
        } else if (ninja.closest("#ia-leader-slot")) {
          console.log(
            `Atualizando atributos do líder da IA devido ao Poising.`
          );
          atualizarAtributosLiderIA(ninja);
        }

        // Remove o ninja do campo se ele foi derrotado
        if (parseInt(ninja.dataset.hp, 10) === 0) {
          console.log(
            `Ninja ${ninja.dataset.name} foi derrotado devido ao effect de Poising.`
          );
          adicionarAoDescarte(ninja); // Função para remover o ninja do campo
        }
      }
    }
  });

  const liderJogador = document.querySelector("#player-leader-slot img");
  const liderIA = document.querySelector("#ia-leader-slot img");

  console.log(
    "Líder Atual IA:",
    liderIA ? liderIA.dataset.name : "Não encontrado"
  );
  console.log(
    "Líder Atual Jogador:",
    liderJogador ? liderJogador.dataset.name : "Não encontrado"
  );

  if (!liderJogador && !liderIA) {
    console.log("Ambos os slots de líder estão vazios.");
    turnosSemLider++;
    if (turnosSemLider >= 3) {
      acordoPaz();
    } else {
      encerrarTurno();
    }
    return;
  }

  if (liderJogador && !liderIA) {
    console.log("Jogador possui um líder, IA não.");
    turnosSemLider = 0; // Reseta o contador
    resgatePremioJ1();
    return;
  }

  if (liderIA && !liderJogador) {
    console.log("IA possui um líder, Jogador não.");
    turnosSemLider = 0; // Reseta o contador
    resgatePremioIA();
    return;
  }

  if (liderJogador && liderIA) {
    console.log("Ambos os líderes estão presentes.");
    turnosSemLider = 0; // Reseta o contador
    atualizarDropdownAcoes();
    atualizarDropdownAcoesIA();
  }
}

// 🏆 Verifica a condição de vitória
function verificarCondicaoVitoria() {
  const scrollsJ1 = parseInt(
    document.getElementById("player-scroll-count").textContent,
    10
  );
  const scrollsIA = parseInt(
    document.getElementById("ia-scroll-count").textContent,
    10
  );

  if (scrollsJ1 >= 6) {
    declararVitoriaJ1();
  } else if (scrollsIA >= 6) {
    declararVitoriaIA();
  } else {
    return false; // Se ninguém venceu ainda, retorna falso
  }
  return true; // Se alguém venceu, retorna verdadeiro
}
// 🎖️ Resgate de Pergaminho para o JOGADOR
function resgatePremioJ1() {
  console.log("🎖️ Jogador derrotou um ninja!");

  const playerScrollCount = document.getElementById("player-scroll-count");
  const scrollSelecionado = scrolls[Math.floor(Math.random() * scrolls.length)];

  if (scrollSelecionado.type === "bonus") {
    aplicarEfeitoScrollEquipe("J1", scrollSelecionado);
  } else {
    aplicarEfeitoScrollEquipe("IA", scrollSelecionado); // Penalidade aplicada ao adversário
  }

  adicionarScrollVisual("player-scrolls", scrollSelecionado.icon);
  playerScrollCount.textContent =
    parseInt(playerScrollCount.textContent, 10) + 1;

  if (!verificarCondicaoVitoria()) {
    // Se ainda não venceu, muda para a fase de escolha do novo líder da IA
    estadoAtual = "novoLider";
    escolherNovoLiderIA();
  }
}

// 🎖️ Resgate de Pergaminho para a IA
function resgatePremioIA() {
  console.log("🎖️ IA derrotou um ninja!");

  const iaScrollCount = document.getElementById("ia-scroll-count");
  const scrollSelecionado = scrolls[Math.floor(Math.random() * scrolls.length)];

  if (scrollSelecionado.type === "bonus") {
    aplicarEfeitoScrollEquipe("IA", scrollSelecionado);
  } else {
    aplicarEfeitoScrollEquipe("J1", scrollSelecionado); // Penalidade aplicada ao adversário
  }

  adicionarScrollVisual("ia-scrolls", scrollSelecionado.icon);
  iaScrollCount.textContent = parseInt(iaScrollCount.textContent, 10) + 1;

  if (!verificarCondicaoVitoria()) {
    // Se ainda não venceu, muda para a fase de escolha do novo líder do J1
    estadoAtual = "novoLider";
    escolherNovoLiderJ1();
  }
}

// 📜 Aplica o efeito do scroll a todos os ninjas do time (Líder e Suportes)
function aplicarEfeitoScrollEquipe(jogador, scroll) {
  console.log(
    `📜 Aplicando efeito do scroll ${scroll.stat} (${scroll.value}) para o time ${jogador}`
  );

  const ninjas = document.querySelectorAll(
    `#${jogador === "J1" ? "player" : "ia"}-area img, #${
      jogador === "J1" ? "player" : "ia"
    }-supports img`
  );

  ninjas.forEach((ninja) => aplicarEfeitoScroll(ninja, scroll));

  // ✅ O efeito também precisa ser aplicado a ninjas que ENTREM no campo depois
  document.addEventListener("ninjaAdicionado", (event) => {
    if (event.detail.jogador === jogador) {
      console.log(
        `🔄 Aplicando efeito retroativo do scroll em novo ninja do ${jogador}:`,
        event.detail.ninja
      );
      aplicarEfeitoScroll(event.detail.ninja, scroll);
    }
  });
}

// ✨ Aplica o efeito do Scroll a um Ninja específico
function aplicarEfeitoScroll(ninja, scroll) {
  if (!ninja) return;

  const statAtual = parseInt(ninja.dataset[scroll.stat] || 0);
  const novoValor = statAtual + scroll.value;

  console.log(
    `🔹 ${ninja.dataset.name} teve ${scroll.stat} alterado de ${statAtual} para ${novoValor}`
  );
  ninja.dataset[scroll.stat] = novoValor;
}

// 📌 Adiciona o ÍCONE do scroll na interface
function adicionarScrollVisual(areaId, icon) {
  const scrollContainer = document.getElementById(areaId);
  if (!scrollContainer) return;

  const scrollImg = document.createElement("img");
  scrollImg.src = `imagens/${icon}`;
  scrollImg.alt = "Scroll";
  scrollImg.classList.add("scroll-icon");

  scrollContainer.appendChild(scrollImg);
}
// Declara vitória do Jogador
function declararVitoriaJ1() {
  console.log("🏆 Jogador venceu ao coletar 6 scrolls de bônus!");
  alert("🏆 Jogador venceu!");
  encerrarJogo();
}

// Declara vitória da IA
function declararVitoriaIA() {
  console.log("💀 IA venceu ao aplicar 6 penalidades no jogador!");
  alert("💀 IA venceu!");
  encerrarJogo();
}

function escolherNovoLiderJ1() {
  alert("Promova um suporte para ser o lider");
  atualizarBotoes(); // Atualiza os botões novamente
  configurarEventosDeDuploClique(); //Ativa ver cards da IA
  initializeDragAndDrop();
}
function acordoPaz() {
  console.log("Acordo de paz chamado.");
  // Lógica para acordo de paz
}

function atualizarDropdownAcoes() {
  const liderAtual = document.querySelector("#player-leader-slot img");
  if (!liderAtual) {
    console.warn("Nenhum ninja líder está no slot de líder do jogador.");
    return;
  }

  // Obter os atributos do ninja líder
  const taijutsu = parseInt(liderAtual.dataset.taijutsu) || 0;
  const defense = parseInt(liderAtual.dataset.defense) || 0;
  const speed = parseInt(liderAtual.dataset.speed) || 0;

  // Tenta converter os jutsus armazenados no dataset
  let jutsus = [];
  try {
    jutsus = JSON.parse(liderAtual.dataset.jutsus || "[]");
    if (!Array.isArray(jutsus)) jutsus = [];
  } catch (error) {
    console.error("Erro ao carregar jutsus do ninja líder:", error);
    jutsus = [];
  }
  console.log("Jutsus do líder atual:", jutsus);

  const dropdownOfensiva = document.getElementById("j1-offensive-action");
  const dropdownDefensiva = document.getElementById("j1-defensive-action");

  dropdownOfensiva.innerHTML = "";
  dropdownDefensiva.innerHTML = "";

  // Adiciona opções básicas de ataque, defesa e esquiva
  const opcoesBasicas = [
    { value: "taijutsu", text: `Lançar shuriken/kunai (${taijutsu})` },
    { value: "defense", text: `Proteger-se (${defense})` },
    { value: "speed", text: `Desviar (${speed})` },
  ];

  opcoesBasicas.forEach((opcao) => {
    const option = document.createElement("option");
    option.value = opcao.value;
    option.textContent = opcao.text;
    if (opcao.value === "taijutsu") {
      dropdownOfensiva.appendChild(option);
    } else {
      dropdownDefensiva.appendChild(option);
    }
  });

  // Adiciona os jutsus corretamente ao dropdown correspondente
  jutsus.forEach((jutsu) => {
    if (!jutsu || !jutsu.nameJutsu || !jutsu.usage) {
      console.warn("⚠️ Jutsu inválido encontrado:", jutsu);
      return;
    }

    const option = document.createElement("option");
    option.value = jutsu.nameJutsu;
    option.textContent = `${jutsu.nameJutsu} (${jutsu.typeJutsu}) - Power: ${jutsu.powerJutsu}`;

    // 🔹 Adiciona ao dropdown correto baseado na propriedade 'usage'
    const usage = jutsu.usage.toLowerCase();

    if (usage === "of") {
      dropdownOfensiva.appendChild(option);
    }

    if (usage === "df" || usage === "ev") {
      dropdownDefensiva.appendChild(option);
    }
    if (usage === "both") {
      dropdownOfensiva.appendChild(option);
      dropdownDefensiva.appendChild(option.cloneNode(true));
    }
  });

  console.log("Dropdowns atualizados com ações do ninja líder.");
}
function atualizarDropdownAcoesIA() {
  const liderAtualIA = document.querySelector("#ia-leader-slot img");
  if (!liderAtualIA) {
    console.warn("Nenhum ninja líder está no slot de líder da IA.");
    return;
  }

  // Obter atributos do ninja líder da IA
  const taijutsu = parseInt(liderAtualIA.dataset.taijutsu) || 0;
  const defense = parseInt(liderAtualIA.dataset.defense) || 0;
  const speed = parseInt(liderAtualIA.dataset.speed) || 0;

  // Obter os jutsus da IA, garantindo que seja um array válido
  let jutsusIA = [];
  try {
    jutsusIA = JSON.parse(liderAtualIA.dataset.jutsus || "[]");
    if (!Array.isArray(jutsusIA)) jutsusIA = [];
  } catch (error) {
    console.error("Erro ao carregar jutsus da IA:", error);
    jutsusIA = [];
  }
  console.log("Jutsus do líder atual da IA:", jutsusIA);

  const dropdownOfensivaIA = document.getElementById("ia-offensive-action");
  const dropdownDefensivaIA = document.getElementById("ia-defensive-action");

  dropdownOfensivaIA.innerHTML = "";
  dropdownDefensivaIA.innerHTML = "";

  // Adiciona ações básicas da IA
  const opcoesBasicasIA = [
    { value: "taijutsu", text: `Ataque Simples (${taijutsu})` },
    { value: "defense", text: `Proteger-se (${defense})` },
    { value: "speed", text: `Desviar (${speed})` },
  ];

  opcoesBasicasIA.forEach((opcao) => {
    const option = document.createElement("option");
    option.value = opcao.value;
    option.textContent = opcao.text;
    if (opcao.value === "taijutsu") {
      dropdownOfensivaIA.appendChild(option);
    } else {
      dropdownDefensivaIA.appendChild(option);
    }
  });

  // Adiciona os jutsus da IA corretamente
  jutsusIA.forEach((jutsu) => {
    if (!jutsu || !jutsu.nameJutsu || !jutsu.usage) {
      console.warn("Jutsu inválido encontrado para IA:", jutsu);
      return;
    }

    const option = document.createElement("option");
    option.value = jutsu.nameJutsu;
    option.textContent = `${jutsu.nameJutsu} (${jutsu.typeJutsu}) - Power: ${jutsu.powerJutsu}`;

    const usage = jutsu.usage.toLowerCase();

    if (usage === "of") {
      dropdownOfensivaIA.appendChild(option);
    }

    if (usage === "df" || usage === "ev") {
      dropdownDefensivaIA.appendChild(option);
    }
    if (usage === "both") {
      dropdownOfensivaIA.appendChild(option);
      dropdownDefensivaIA.appendChild(option.cloneNode(true));
    }
  });

  console.log("Dropdowns da IA atualizados com ações do ninja líder.");
}

function encerrarCombate() {
  //alert('Encerrar combate');
  configurarEventosDeDuploClique();
  const ofensivaJ1 = document.getElementById("j1-offensive-action").value;
  const defensivaJ1 = document.getElementById("j1-defensive-action").value;

  const liderAtual = document.querySelector("#player-leader-slot img");
  if (!liderAtual) {
    console.warn("Nenhum ninja líder está no slot de líder do jogador.");
    return;
  }

  if (ofensivaJ1 && defensivaJ1) {
    // Validar escolha do jogador
    if (
      !validarEscolhaAcoes(
        document.getElementById("j1-offensive-action"),
        liderAtual
      )
    )
      return;
    if (
      !validarEscolhaAcoes(
        document.getElementById("j1-defensive-action"),
        liderAtual
      )
    )
      return;

    // Jogador escolheu as ações, agora a IA escolhe suas ações
    escolherAcoesIA();
  } else {
    alert("Escolha uma ação ofensiva e uma ação defensiva.");
  }
}
//------Escolher ações
function validarRequisitosChakra(chakraReq, atributos) {
  for (const [key, value] of Object.entries(chakraReq)) {
    if ((atributos[key] || 0) < value) {
      console.warn(
        `Requisito não atendido: ${key} precisa de ${value}, mas possui ${
          atributos[key] || 0
        }.`
      );
      return false;
    }
  }
  return true;
}
function validarEscolhaAcoes(elementoDropdown, lider) {
  const opcaoSelecionada = elementoDropdown.value;
  console.log(`Validando ação: ${opcaoSelecionada} para o líder: ${lider.alt}`);

  // Definição de ações básicas
  const acoesBasicas = ["taijutsu", "defense", "speed"];
  if (acoesBasicas.includes(opcaoSelecionada)) {
    return true; // Ações básicas são sempre válidas
  }

  // Buscar o jutsu selecionado
  const jutsus = JSON.parse(lider.dataset.jutsus || "[]");
  const jutsuSelecionado = jutsus.find(
    (jutsu) => jutsu.nameJutsu === opcaoSelecionada.split(" (")[0]
  );

  if (!jutsuSelecionado) {
    console.error("Jutsu selecionado não encontrado.");
    return false;
  }

  // Validar o custo de chakra
  const chakraCost = jutsuSelecionado.chakraCost || 0;
  const chakraAtual = parseInt(lider.dataset.chakra) || 0;

  if (chakraAtual < chakraCost) {
    console.warn("Chakra insuficiente para usar este jutsu.");
    return false;
  }

  // Calcular os atributos de chakra
  const katon = parseInt(lider.dataset.katon) || 0;
  const fuuton = parseInt(lider.dataset.fuuton) || 0;
  const raiton = parseInt(lider.dataset.raiton) || 0;
  const doton = parseInt(lider.dataset.doton) || 0;
  const suiton = parseInt(lider.dataset.suiton) || 0;

  const atributosChakra = {
    katon,
    fuuton,
    raiton,
    doton,
    suiton,
    totalNature: katon + fuuton + raiton + doton + suiton, // Soma total dos elementos
  };

  // Validar os requisitos de chakra do jutsu
  const chakraReq = jutsuSelecionado.chakraReq || {};
  if (!validarRequisitosChakra(chakraReq, atributosChakra)) {
    console.warn("Requisitos de chakra não atendidos.");
    return false;
  }

  return true;
}
//------Encerrar escolha das ações
//------Inicio Modal Descarte
function openModal(discardPile, title) {
  currentDiscardPile = discardPile;
  currentCardIndex = 0;
  document.getElementById("modal-title").textContent = title; // Atualiza o título do modal
  document.getElementById("discardModal").style.display = "block";
  showCard(currentCardIndex);
}
function closeModal() {
  document.getElementById("discardModal").style.display = "none";
}
function showCard(index) {
  //console.log(`Mostrando card no índice: ${index}`);

  if (index >= 0 && index < currentDiscardPile.length) {
    const cardDisplay = document.getElementById("cardDisplay");
    const cardData = currentDiscardPile[index]; // O objeto da carta

    if (!cardData || typeof cardData !== "object") {
      console.error("❌ Dados inválidos no descarte:", cardData);
      return;
    }

    const cardId = cardData.id || cardData.idCard; // Extraindo o ID corretamente

    //console.log(`🔍 Tentando exibir card com ID: ${cardId}`);

    if (!cardId) {
      console.error(
        "❌ ID da carta não encontrado dentro do objeto:",
        cardData
      );
      return;
    }

    const cardElement = document.getElementById(cardId);

    if (cardElement) {
      //console.log(`✅ Elemento do card encontrado: ${cardElement.outerHTML}`);
      cardDisplay.innerHTML = cardElement.outerHTML;
    } else {
      console.error(`❌ Card com ID ${cardId} não encontrado no DOM.`);
    }
  }
}

document
  .getElementById("player-discard-slot")
  .addEventListener("click", () =>
    openModal(arrayDescartePlayer, "Descarte J1")
  );
document
  .getElementById("ia-discard-slot")
  .addEventListener("click", () => openModal(arrayDescarteIA, "Descarte IA"));

const closeDiscardModalButton = document.getElementById("closeDiscardModal");
if (closeDiscardModalButton) {
  closeDiscardModalButton.addEventListener("click", closeModal);
} else {
  console.error("Botão de fechar do modal de descarte não encontrado.");
}

document.getElementById("prevCard").addEventListener("click", () => {
  currentCardIndex =
    currentCardIndex > 0 ? currentCardIndex - 1 : currentDiscardPile.length - 1;
  showCard(currentCardIndex);
});
document.getElementById("nextCard").addEventListener("click", () => {
  currentCardIndex =
    currentCardIndex < currentDiscardPile.length - 1 ? currentCardIndex + 1 : 0;
  showCard(currentCardIndex);
});

// Fechar modal ao clicar fora dele
window.addEventListener("click", (event) => {
  if (event.target == document.getElementById("discardModal")) {
    closeModal();
  }
});

//------Inicio Modal Card
function configurarEventosDeDuploClique() {
  const cards = document.querySelectorAll("#maoJ1 img, .field-slot img");
  //console.log("Total de cards encontrados:", cards.length);

  cards.forEach((card) => {
    //console.log("Adicionando evento de duplo clique para o card:", card);
    card.addEventListener("dblclick", () => openCardDetailModal(card));
  });
}
let ultimaClasseRemovida = null; // Variável para armazenar a classe removida
let cardAtual = null; // Variável para armazenar o card aberto no modal

function openCardDetailModal(card) {
  // console.log("Abrindo modal para o card:", card);

  // Salva o card atual para referência ao fechar
  cardAtual = card;

  // Verifica e salva a classe original (se era field-card ou hand-card)
  if (card.classList.contains("field-card")) {
    ultimaClasseRemovida = "field-card";
    card.classList.remove("field-card");
  } else if (card.classList.contains("hand-card")) {
    ultimaClasseRemovida = "hand-card";
    card.classList.remove("hand-card");
  } else {
    ultimaClasseRemovida = null; // Caso não tenha nenhuma dessas classes
  }

  if (!card.src) {
    console.error("Card src não encontrado.");
    return;
  }

  const katon = parseInt(card.getAttribute("data-chakra-fogo")) || 0;
  const fuuton = parseInt(card.getAttribute("data-chakra-vento")) || 0;
  const raiton = parseInt(card.getAttribute("data-chakra-raio")) || 0;
  const doton = parseInt(card.getAttribute("data-chakra-terra")) || 0;
  const suiton = parseInt(card.getAttribute("data-chakra-agua")) || 0;
  const somaChakras = katon + fuuton + raiton + doton + suiton;

  document.getElementById("card-name").textContent =
    card.getAttribute("data-name");
  document.getElementById("card-image").src = card.src;
  document.getElementById("chakra-fogo").textContent = katon;
  document.getElementById("chakra-vento").textContent = fuuton;
  document.getElementById("chakra-raio").textContent = raiton;
  document.getElementById("chakra-terra").textContent = doton;
  document.getElementById("chakra-agua").textContent = suiton;
  document.getElementById("soma-chakras").textContent = somaChakras;

  document.getElementById("cardDetailModal").style.display = "block";
  console.log("Modal aberto com sucesso.");
}

function closeCardDetailModal() {
  document.getElementById("cardDetailModal").style.display = "none";

  // Restaurar a classe removida ao fechar o modal
  if (cardAtual && ultimaClasseRemovida) {
    cardAtual.classList.add(ultimaClasseRemovida);
    console.log(
      `Classe ${ultimaClasseRemovida} restaurada para o card ${cardAtual.id}.`
    );
  }

  // Resetar variáveis
  ultimaClasseRemovida = null;
  cardAtual = null;

  console.log("Modal fechado.");
}
configurarEventosDeDuploClique();
document
  .getElementById("closeCardDetailModal")
  .addEventListener("click", closeCardDetailModal);
// Fechar modal ao clicar fora dele
window.addEventListener("click", (event) => {
  if (event.target == document.getElementById("cardDetailModal")) {
    closeCardDetailModal();
  }
});
//------Fim modal card
function debugEstadoJogo() {
  const liderAtualIA = document.querySelector("#ia-leader-slot img");
  const liderAtualJ1 = document.querySelector("#player-leader-slot img");

  console.log("Estado do Jogo:", estadoAtual);
  console.log(
    "Líder IA:",
    liderAtualIA ? liderAtualIA.dataset.name : "Não encontrado"
  );
  console.log(
    "Líder Jogador:",
    liderAtualJ1 ? liderAtualJ1.dataset.name : "Não encontrado"
  );
  console.log("Ações IA:", {
    ofensiva: document.getElementById("ia-offensive-action")?.value,
    defensiva: document.getElementById("ia-defensive-action")?.value,
  });
  console.log("Ações Jogador:", {
    ofensiva: document.getElementById("j1-offensive-action")?.value,
    defensiva: document.getElementById("j1-defensive-action")?.value,
  });
  console.log("IA usou Hab. de Sup. nesse turno?", suporteIAExecutado);
  console.log("Qtde de hab. sup. usada no turno:", habilidadesUsadas);
}
// Criar botão dentro da área de suporte
document.addEventListener("DOMContentLoaded", () => {
  const playerSupports = document.getElementById("player-supports");
  if (!playerSupports) {
    console.error(
      "❌ Erro: Não foi possível encontrar a div #player-supports."
    );
    return;
  }

  // Criar o botão
  const botao = document.createElement("button");
  botao.id = "botao-ativar-habilidade";
  botao.textContent = "Ativar Habilidade";
  botao.classList.add("habilidade-botao");
  botao.style.display = "none"; // Começa invisível

  // Adicionar dentro da div de suportes do jogador
  playerSupports.appendChild(botao);
});

let suporteSelecionado = null;
let botaoVisivel = false;

function configurarBotaoHabilidade() {
  const botao = document.getElementById("botao-ativar-habilidade");

  if (!botao) {
    console.error("❌ Botão de ativar habilidade não encontrado.");
    return;
  }

  document
    .querySelectorAll("#player-supports .field-slot img")
    .forEach((ninja) => {
      ninja.addEventListener("mouseenter", (e) => {
        if (estadoAtual !== "suporte") return;

        console.log(`🔹 Mouse sobre o ninja de suporte: ${ninja.dataset.name}`);
        suporteSelecionado = ninja;

        const slotPai = ninja.closest(".field-slot");
        if (!slotPai) return;

        slotPai.appendChild(botao);
        botao.style.display = "block";
      });

      ninja.addEventListener("dblclick", () => openCardDetailModal(ninja));
    });

  // ✅ Evita múltiplas chamadas, removendo qualquer evento duplicado antes de adicionar um novo
  botao.replaceWith(botao.cloneNode(true));
  document
    .getElementById("botao-ativar-habilidade")
    .addEventListener("click", () => {
      if (suporteSelecionado) {
        ativarHabilidadeSuporte(suporteSelecionado);
      }
    });

  // 🚀 Evita que o botão desapareça quando o mouse estiver sobre ele
  botao.addEventListener("mouseenter", () => {
    botao.style.display = "block";
  });

  // 🚀 Oculta o botão apenas se o mouse sair tanto do ninja quanto do botão
  botao.addEventListener("mouseleave", () => {
    botao.style.display = "none";
  });

  document
    .querySelectorAll("#player-supports .field-slot img")
    .forEach((ninja) => {
      ninja.addEventListener("mouseleave", () => {
        if (!botao.matches(":hover")) {
          botao.style.display = "none";
        }
      });
    });
}

// Chamar a função após carregar a página
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(configurarBotaoHabilidade, 1000);
});

function voltarConfigJogo() {
  window.location.href = "iniciar_jogo.html";
}
// Chamar a função de carregamento quando a página iniciar
// Recuperar os dados do localStorage
const jogadorNome = localStorage.getItem("jogadorNome");
const jogadorBaralho = JSON.parse(localStorage.getItem("jogadorBaralho"));
const iaBaralho = JSON.parse(localStorage.getItem("iaBaralho"));

// Carrega as imagens dos decks do localStorage
const jogadorDeckImage = localStorage.getItem("jogadorDeckImage");
const iaDeckImage = localStorage.getItem("iaDeckImage");

// Aplica a photo do deck da IA aos cards da mão da IA
if (iaDeckImage) {
  const handCardsIA = document.querySelectorAll(".hand-card-ia");
  handCardsIA.forEach((card) => {
    card.style.backgroundImage = `url('${iaDeckImage}')`;
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";
    card.style.backgroundRepeat = "no-repeat";
  });
}

// Seleciona os elementos de photo das miniaturas dos decks
const jogadorDeckImgElement = document.getElementById("player-deck-img");
const iaDeckImgElement = document.getElementById("ia-deck-img");

// Atualiza as imagens das miniaturas dos decks
if (jogadorDeckImage && jogadorDeckImgElement) {
  jogadorDeckImgElement.src = jogadorDeckImage;
} else {
  console.warn(
    "Imagem do deck do jogador não encontrada. Exibindo photo padrão."
  );
}

if (iaDeckImage && iaDeckImgElement) {
  iaDeckImgElement.src = iaDeckImage;
} else {
  console.warn("Imagem do deck da IA não encontrada. Exibindo photo padrão.");
}

// Exibir o name do jogador e preparar o campo de batalha
window.onload = function () {
  if (!jogadorNome || !jogadorBaralho || !iaBaralho) {
    alert("Erro: Informações do jogador ou dos baralhos estão ausentes.");
    window.location.href = "iniciar_jogo.html"; // Redireciona de volta
    return;
  }

  iniciarCampoDeBatalha();

  // Chame essa função sempre que precisar reconfigurar os eventos
  configurarEventosDeDuploClique();
};
