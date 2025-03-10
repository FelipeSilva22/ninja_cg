function escolherTimeIA() {
  alert("A IA está escolhendo seu time...");

  const iaLeaderSlot = document.getElementById("ia-leader-slot");
  const iaSupportSlots = [
    document.getElementById("supIAa"),
    document.getElementById("supIAb"),
    document.getElementById("supIAc"),
  ];

  // Filtrar somente os ninjas Estágio 1 na mão da IA
  let iaNinjasEstagio1 = iaMao.filter(
    (card) => card.type === "Ninja" && card.stage === 1
  );

  if (iaNinjasEstagio1.length === 0) {
    console.warn("Nenhum ninja estágio 1 disponível na mão da IA.");
    return;
  }

  // Escolher o líder com a maior soma dos atributos relevantes
  let iaLeader = iaNinjasEstagio1.reduce((melhor, atual) =>
    calcularSomaAtributosCard(atual) > calcularSomaAtributosCard(melhor)
      ? atual
      : melhor
  );

  // Remover o líder da lista
  iaNinjasEstagio1 = iaNinjasEstagio1.filter(
    (card) => card.idCard !== iaLeader.idCard
  );

  // Alocar o líder no slot de líder
  const leaderImg = document.createElement("img");
  leaderImg.src = iaLeader.photo;
  leaderImg.alt = iaLeader.name;
  leaderImg.id = iaLeader.idCard;
  leaderImg.draggable = false;
  leaderImg.dataset.jogador = "IA"; // ✅ Definindo dono do card
  Object.assign(leaderImg.dataset, {
    type: iaLeader.type,
    idCard: iaLeader.idCard,
    regN: iaLeader.regN,
    name: iaLeader.name,
    stage: iaLeader.stage || 1,
    bloqEvo: iaLeader.stage || 1,
    hpInicial: iaLeader.hp || 0,
    chakraInicial: iaLeader.chakra || 0,
    hp: iaLeader.hp || 0,
    chakra: iaLeader.chakra || 0,
    taijutsu: iaLeader.taijutsu || 0,
    genjutsu: iaLeader.genjutsu || 0,
    ninjutsu: iaLeader.ninjutsu || 0,
    defense: iaLeader.defense || 0,
    speed: iaLeader.speed || 0,
    katon: iaLeader.katon || 0,
    fuuton: iaLeader.fuuton || 0,
    raiton: iaLeader.raiton || 0,
    doton: iaLeader.doton || 0,
    suiton: iaLeader.suiton || 0,
    katonOriginal: iaLeader.katon || 0,
    fuutonOriginal: iaLeader.fuuton || 0,
    raitonOriginal: iaLeader.raiton || 0,
    dotonOriginal: iaLeader.doton || 0,
    suitonOriginal: iaLeader.suiton || 0,
    supSkill: iaLeader.supSkill || null,
    costSupSkill: iaLeader.costSupSkill || 0,
    chanceSkill: iaLeader.chanceSkill || 0,
    bloqEvo: 0,
    jutsus: JSON.stringify(iaLeader.jutsus || []),
  });

  adicionarAoCampo(leaderImg, "IA");
  iaLeaderSlot.innerHTML = ""; // Limpa o slot
  iaLeaderSlot.appendChild(leaderImg);
  iaLeaderSlot.classList.add("occupied");
  atualizarAtributosLiderIA(leaderImg);

  // Remove o líder da mão
  iaMao = iaMao.filter((card) => card.idCard !== iaLeader.idCard);

  // Alocar suportes nos slots vazios
  iaSupportSlots.forEach((slot) => {
    if (iaNinjasEstagio1.length > 0 && !slot.querySelector("img")) {
      const supportCard = iaNinjasEstagio1.shift();

      const supportImg = document.createElement("img");
      supportImg.src = supportCard.photo;
      supportImg.alt = supportCard.name;
      supportImg.id = supportCard.idCard;
      supportImg.draggable = false;
      supportImg.dataset.jogador = "IA"; // ✅ Definindo dono do card
      Object.assign(supportImg.dataset, {
        type: supportCard.type,
        idCard: supportCard.idCard,
        regN: supportCard.regN,
        name: supportCard.name,
        stage: supportCard.stage || 1,
        bloqEvo: supportCard.stage || 1,
        hpInicial: supportCard.hp || 0,
        chakraInicial: supportCard.chakra || 0,
        hp: supportCard.hp || 0,
        chakra: supportCard.chakra || 0,
        taijutsu: supportCard.taijutsu || 0,
        genjutsu: supportCard.genjutsu || 0,
        ninjutsu: supportCard.ninjutsu || 0,
        defense: supportCard.defense || 0,
        speed: supportCard.speed || 0,
        katon: supportCard.katon || 0,
        fuuton: supportCard.fuuton || 0,
        raiton: supportCard.raiton || 0,
        doton: supportCard.doton || 0,
        suiton: supportCard.suiton || 0,
        katonOriginal: supportCard.katon || 0,
        fuutonOriginal: supportCard.fuuton || 0,
        raitonOriginal: supportCard.raiton || 0,
        dotonOriginal: supportCard.doton || 0,
        suitonOriginal: supportCard.suiton || 0,
        supSkill: supportCard.supSkill || null,
        costSupSkill: supportCard.costSupSkill || 0,
        chanceSkill: supportCard.chanceSkill || 0,
        bloqEvo: 0,
        jutsus: JSON.stringify(supportCard.jutsus || []),
      });

      adicionarAoCampo(supportImg, "IA");
      slot.innerHTML = ""; // Limpa o slot
      slot.appendChild(supportImg);
      slot.classList.add("occupied");

      // Remove o suporte da mão
      iaMao = iaMao.filter((card) => card.idCard !== supportCard.idCard);
    }
  });

  console.log("A IA concluiu sua formação!");
  estadoAtual = "compra";
  atualizarBotoes();
  turnoDeCompraIA(); // Avança para o próximo estágio
}

function calcularSomaAtributosCard(card) {
  return (
    (card.hp || 0) +
    (card.chakra || 0) +
    (card.taijutsu || 0) +
    (card.genjutsu || 0) +
    (card.ninjutsu || 0) +
    (card.defense || 0) +
    (card.speed || 0)
  );
}

//-------
function acaoPreparacaoIA() {
  console.log("🔍 Iniciando ações de preparação da IA...");

  if (!Array.isArray(iaMao) || iaMao.length === 0) {
    console.warn("⚠️ A IA não possui cards na mão.");
    encerrarPreparacaoIA();
    return;
  }

  const cartasIA = Array.from(
    document.querySelectorAll("#maoIA img.hand-card-ia")
  );

  if (cartasIA.length === 0) {
    console.warn("⚠️ Nenhum card válido encontrado dentro da mão da IA.");
    encerrarPreparacaoIA();
    return;
  }

  console.log(
    `🃏 Cartas na mão da IA (${cartasIA.length}):`,
    cartasIA.map((card) => ({
      id: card.id,
      type: card.dataset.type,
      name: card.dataset.name || "N/A",
    }))
  );

  const cartasNinja = cartasIA.filter((card) => card.dataset.type === "Ninja");
  const cartasTool = cartasIA.filter((card) => card.dataset.type === "Tool");
  const cartasChakra = cartasIA.filter(
    (card) => card.dataset.type === "Chakra"
  );

  const slotsIA = document.querySelectorAll("#ia-formation-field .field-slot");
  let liderIA = document.querySelector("#ia-leader-slot img");
  const suportesIA = Array.from(
    document.querySelectorAll("#ia-supports .field-slot img")
  );
  let iaChakraUsado = false;

  // 🔹 Processa Ninjas
  cartasNinja.forEach((card) => {
    const stage = parseInt(card.dataset.stage, 10);
    console.log(card.id, stage);
    const slotLider = document.getElementById("ia-leader-slot");

    if (stage === 1) {
      if (!liderIA) {
        console.log(`📌 IA movendo Ninja (${card.id}) para slot de líder`);
        adicionarAoCampo(card, "IA");
        slotLider.innerHTML = "";
        slotLider.appendChild(card);
        resetarEstilosCard(card);
        removerCardDaMao(card, "IA");
        liderIA = card;
      } else {
        const slotVazio = Array.from(slotsIA).find(
          (slot) => !slot.querySelector("img")
        );
        if (slotVazio) {
          console.log(
            `📌 IA movendo Ninja (${card.id}) para slot de suporte ${slotVazio.id}`
          );
          adicionarAoCampo(card, "IA");
          slotVazio.innerHTML = "";
          slotVazio.appendChild(card);
          resetarEstilosCard(card);
          removerCardDaMao(card, "IA");
        }
      }
    }
  });

  // 🔹 Aplica Tool
  cartasTool.forEach((card) => {
    const slotNinjaSemTool = Array.from(slotsIA).find((slot) => {
      const ninja = slot.querySelector("img");
      return (
        ninja &&
        (!ninja.dataset.toolUsado || ninja.dataset.toolUsado === "false")
      );
    });

    if (slotNinjaSemTool) {
      const ninjaNoSlot = slotNinjaSemTool.querySelector("img");
      console.log(`🛠️ IA aplicando Tool ${card.id} no ninja ${ninjaNoSlot.id}`);
      aplicarEfeito(card, ninjaNoSlot, card.dataset.effect, 100, "IA");
      removerCardDaMao(card, "IA");
      adicionarAoDescarte(card);
      ninjaNoSlot.dataset.toolUsado = "true";
    }
  });

  if (!iaChakraUsado) {
    console.log("🔎 Verificando se há necessidade de Chakra...");

    // Verifica se há cartas Chakra na mão
    if (cartasChakra.length === 0) {
      console.warn("⚠️ IA não tem Chakra na mão.");
      encerrarPreparacaoIA();
      return;
    }

    // Array de ninjas (líder + até 3 suportes)
    const ninjasIA = [
      document.querySelector("#ia-leader-slot img"),
      ...Array.from(
        document.querySelectorAll("#ia-supports .field-slot img")
      ).slice(0, 3),
    ].filter(Boolean);

    // Função para calcular requisitos máximos dos jutsus
    const calcularRequisitosMaximos = (jutsus) => {
      const requisitos = {
        katon: 0,
        fuuton: 0,
        raiton: 0,
        doton: 0,
        suiton: 0,
        totalNature: 0,
      };
      jutsus.forEach((jutsu) => {
        const chakraReq = jutsu.chakraReq || {};
        requisitos.katon = Math.max(requisitos.katon, chakraReq.katon || 0);
        requisitos.fuuton = Math.max(requisitos.fuuton, chakraReq.fuuton || 0);
        requisitos.raiton = Math.max(requisitos.raiton, chakraReq.raiton || 0);
        requisitos.doton = Math.max(requisitos.doton, chakraReq.doton || 0);
        requisitos.suiton = Math.max(requisitos.suiton, chakraReq.suiton || 0);
        requisitos.totalNature = Math.max(
          requisitos.totalNature,
          chakraReq.totalNature || 0
        );
      });
      return requisitos;
    };

    // Função para verificar se ninja precisa de chakra
    const verificarNecessidadeChakra = (ninja) => {
      const jutsus = JSON.parse(ninja.dataset.jutsus || "[]");
      const requisitos = calcularRequisitosMaximos(jutsus);

      const chakraAtual = {
        katon: parseInt(ninja.dataset.katon || 0),
        fuuton: parseInt(ninja.dataset.fuuton || 0),
        raiton: parseInt(ninja.dataset.raiton || 0),
        doton: parseInt(ninja.dataset.doton || 0),
        suiton: parseInt(ninja.dataset.suiton || 0),
        totalNature: parseInt(ninja.dataset.totalNature || 0),
      };

      console.log(
        `📌 Requisitos máximos de ${ninja.dataset.name}:`,
        requisitos
      );
      console.log(`🧐 Chakra atual de ${ninja.dataset.name}:`, chakraAtual);

      // Verifica elementos específicos faltando
      const faltasEspecificas = {};
      ["katon", "fuuton", "raiton", "doton", "suiton"].forEach((el) => {
        if (chakraAtual[el] < requisitos[el]) {
          faltasEspecificas[el] = requisitos[el] - chakraAtual[el];
        }
      });

      // Verifica totalNature faltando
      const faltaTotalNature = requisitos.totalNature - chakraAtual.totalNature;

      return { faltasEspecificas, faltaTotalNature, requisitos, chakraAtual };
    };

    // Processa os ninjas
    const ninjaPrecisando = ninjasIA.some((ninja) => {
      console.log(`🔍 Verificando requisitos para ${ninja.dataset.name}...`);

      const { faltasEspecificas, faltaTotalNature, requisitos, chakraAtual } =
        verificarNecessidadeChakra(ninja);

      // Se não falta nada, continua para o próximo ninja
      if (
        Object.keys(faltasEspecificas).length === 0 &&
        faltaTotalNature <= 0
      ) {
        console.log(
          `✅ ${ninja.dataset.name} já possui todos os requisitos necessários`
        );
        return false;
      }

      // Primeiro tenta encontrar chakra específico para elementos faltando
      if (Object.keys(faltasEspecificas).length > 0) {
        const elementoFaltando = Object.keys(faltasEspecificas)[0];
        const cardChakraEspecifico = cartasChakra.find((card) =>
          card.dataset.natureChakra.toLowerCase().includes(elementoFaltando)
        );

        if (cardChakraEspecifico) {
          console.log(
            `⚡ Aplicando ${cardChakraEspecifico.dataset.natureChakra} a ${ninja.dataset.name}`
          );
          aplicarEnergia(ninja, cardChakraEspecifico);
          removerCardDaMao(cardChakraEspecifico, "IA");
          adicionarAoDescarte(cardChakraEspecifico);
          iaChakraUsado = true;
          return true;
        }
      }

      // Se falta apenas totalNature ou não encontrou chakra específico
      if (faltaTotalNature > 0) {
        const cardChakraQualquer = cartasChakra[0]; // Pega qualquer carta chakra disponível
        console.log(
          `⚡ Aplicando ${cardChakraQualquer.dataset.natureChakra} a ${ninja.dataset.name} para totalNature`
        );
        aplicarEnergia(ninja, cardChakraQualquer);
        removerCardDaMao(cardChakraQualquer, "IA");
        adicionarAoDescarte(cardChakraQualquer);
        iaChakraUsado = true;
        return true;
      }

      return false;
    });

    // Se nenhum ninja precisar de chakra
    if (!ninjaPrecisando) {
      console.log(
        "✅ Nenhum ninja da IA precisa de Chakra no momento. Mantendo cartas na mão."
      );
    }
  }

  console.log("✅ Preparação da IA concluída.");
  encerrarPreparacaoIA();
}

function escolherCartaIA(fonte, type, effect, quantidade, mao) {
  console.log(
    `IA escolhendo ${quantidade} carta(s) do type ${type} para o effect ${effect}...`
  );
  if (!Array.isArray(mao)) {
    console.error(`Erro: mao não é um array. Valor atual:`, mao);
    mao = []; // Garante que mao seja um array válido
  }

  let cartasFiltradas = fonte.filter((card) => card.type === type);

  // Buscar ninjas no campo e na mão da IA
  const ninjasCampoIA = Array.from(
    document.querySelectorAll("#ia-supports .field-slot img")
  );
  const ninjasMaoIA = mao.filter((card) => card.type === "Ninja");

  // Criar listas de registros por estágio
  const registros = {
    estagio1Campo: ninjasCampoIA
      .filter((n) => n.dataset.stage == 1)
      .map((n) => n.dataset.regN),
    estagio2Campo: ninjasCampoIA
      .filter((n) => n.dataset.stage == 2)
      .map((n) => n.dataset.regN),
    estagio1Mao: ninjasMaoIA.filter((n) => n.stage == 1).map((n) => n.regN),
    estagio2Mao: ninjasMaoIA.filter((n) => n.stage == 2).map((n) => n.regN),
    estagio3Mao: ninjasMaoIA.filter((n) => n.stage == 3).map((n) => n.regN),
  };

  // Função auxiliar para priorizar cartas conforme os critérios
  function priorizarCartas(card) {
    switch (effect) {
      case "kuchiyoseN1-1":
      case "kuchiyoseN1-2":
        return registros.estagio2Mao.includes(card.regN) ? 1 : 0;

      case "kuchiyoseN2-1":
      case "kuchiyoseN2-2":
        return registros.estagio2Campo.includes(card.regN)
          ? 2
          : registros.estagio1Campo.includes(card.regN)
          ? 1
          : 0;

      case "edoTensei-H":
        return card.stage == 3 && registros.estagio2Campo.includes(card.regN)
          ? 6
          : card.stage == 1 && registros.estagio2Mao.includes(card.regN)
          ? 5
          : card.stage == 2 && registros.estagio1Campo.includes(card.regN)
          ? 4
          : card.stage == 2 && registros.estagio1Mao.includes(card.regN)
          ? 3
          : card.stage == 3 && registros.estagio2Mao.includes(card.regN)
          ? 2
          : 1; // Se nenhum critério anterior for atendido, prioriza stage 1 com maior soma de atributos.

      default:
        return 0;
    }
  }

  switch (effect) {
    case "kuchiyoseN1-1":
    case "kuchiyoseN1-2":
      cartasFiltradas = cartasFiltradas.filter((card) => card.stage === 1);
      break;

    case "kuchiyoseN2-1":
    case "kuchiyoseN2-2":
      cartasFiltradas = cartasFiltradas.filter((card) => card.stage >= 2);
      break;

    case "kaifuu-BH1":
    case "kaifuu-BH2":
      cartasFiltradas = cartasFiltradas.filter((card) => card.type === "Tool");
      break;

    case "kaifuu-DH1":
    case "kaifuu-DH2":
      cartasFiltradas = cartasFiltradas.filter((card) => card.type === "Tool");
      break;

    case "chakra-BH1":
    case "chakra-BH2":
      cartasFiltradas = cartasFiltradas.filter(
        (card) => card.type === "Chakra"
      );
      break;

    case "chakra-DH2":
    case "chakra-DH4":
      cartasFiltradas = cartasFiltradas.filter(
        (card) => card.type === "Chakra"
      );
      break;

    case "edoTensei-H":
      cartasFiltradas = cartasFiltradas.filter((card) => card.type === "Ninja");
      break;

    default:
      console.warn(`Efeito desconhecido: ${effect}. Nenhuma ação foi tomada.`);
      return;
  }

  // Ordenar cartas conforme prioridade e critério de soma de atributos
  cartasFiltradas.sort((a, b) => {
    return (
      priorizarCartas(b) - priorizarCartas(a) ||
      calcularSomaAtributosCard(b) - calcularSomaAtributosCard(a)
    );
  });

  console.log("Cartas filtradas após priorização:", cartasFiltradas);

  if (cartasFiltradas.length === 0) {
    console.warn("IA não encontrou cartas compatíveis.");
    return;
  }

  for (let i = 0; i < quantidade && cartasFiltradas.length > 0; i++) {
    const cartaEscolhida = cartasFiltradas.shift();
    mao.push(cartaEscolhida);
    console.log(`IA adicionou ${cartaEscolhida.idCard} à mão.`);
  }
  renderizarMaoIA(mao);
}

function encerrarPreparacaoIA() {
  console.log("Ações de preparação da IA concluídas.");
  renderizarMaoIA(iaMao);
  alert("Ações de preparação da IA concluídas.");
  iaChakraUsado = false;
  encerrarTurno();
}

function escolherAcoesIA() {
  console.log("⚔️ IA escolhendo ações...");

  const liderIA = document.querySelector("#ia-leader-slot img");
  const dropdownOfensivaIA = document.getElementById("ia-offensive-action");
  const dropdownDefensivaIA = document.getElementById("ia-defensive-action");
  const liderJ1 = document.querySelector("#player-leader-slot img");
  const ofensivaJ1 = document.getElementById("j1-offensive-action").value;
  const defensivaJ1 = document.getElementById("j1-defensive-action").value;

  console.log(
    "👤 Líder Atual IA:",
    liderIA ? liderIA.dataset.name : "❌ Não encontrado"
  );
  console.log(
    "🎯 Líder Atual Jogador:",
    liderJ1 ? liderJ1.dataset.name : "❌ Não encontrado"
  );

  if (!liderIA || !liderJ1) {
    console.warn("⚠️ Um dos líderes não está presente no slot.");
    return;
  }

  const opcaoOfIA = [
    {
      value: "taijutsu",
      text: "Ataque Simples",
      power: parseInt(liderIA.dataset.taijutsu, 10) || 0,
    },
  ];
  const opcaoDfIA = [
    {
      value: "defense",
      text: "Proteger-se",
      power: parseInt(liderIA.dataset.defense, 10) || 0,
    },
    { value: "speed", text: "Desviar", power: 0 },
  ];

  // Obter jutsus e atributos do líder IA
  const jutsus = JSON.parse(liderIA.dataset.jutsus || "[]");
  const chakraAtual = parseInt(liderIA.dataset.chakra, 10) || 0;
  const chakraElementos = {
    katon: parseInt(liderIA.dataset.katon, 10) || 0,
    fuuton: parseInt(liderIA.dataset.fuuton, 10) || 0,
    raiton: parseInt(liderIA.dataset.raiton, 10) || 0,
    doton: parseInt(liderIA.dataset.doton, 10) || 0,
    suiton: parseInt(liderIA.dataset.suiton, 10) || 0,
  };
  const totalNature =
    chakraElementos.katon +
    chakraElementos.fuuton +
    chakraElementos.raiton +
    chakraElementos.doton +
    chakraElementos.suiton;

  console.log("🧪 Chakra atual:", chakraAtual);
  console.log("🌿 Chakra elemental:", chakraElementos);
  console.log("🔵 TotalNature:", totalNature);

  // Verificar e classificar jutsus
  jutsus.forEach((jutsu) => {
    const { nameJutsu, typeJutsu, chakraCost, chakraReq, usage, powerJutsu } =
      jutsu;
    let possuiRequisitos = true;

    console.log(`📝 Verificando jutsu: ${nameJutsu}`);
    console.log(
      `   ⚡ Tipo: ${typeJutsu}, 🔥 Custo: ${chakraCost}, 🎯 Uso: ${usage}, 💥 Poder: ${powerJutsu}`
    );

    if (chakraAtual < chakraCost) {
      console.log(
        `   ❌ Jutsu ${nameJutsu} indisponível: chakra insuficiente.`
      );
      return;
    }

    for (const [elemento, quantidade] of Object.entries(chakraReq)) {
      if (
        elemento !== "totalNature" &&
        quantidade > chakraElementos[elemento]
      ) {
        possuiRequisitos = false;
        console.log(
          `   ❌ Jutsu ${nameJutsu} indisponível: falta ${
            quantidade - chakraElementos[elemento]
          } de ${elemento}.`
        );
        break;
      }
    }

    if (possuiRequisitos && (chakraReq.totalNature || 0) > totalNature) {
      possuiRequisitos = false;
      console.log(
        `   ❌ Jutsu ${nameJutsu} indisponível: falta ${
          (chakraReq.totalNature || 0) - totalNature
        } totalNature.`
      );
    }

    if (possuiRequisitos) {
      console.log(`   ✅ Jutsu ${nameJutsu} está disponível.`);
      if (usage.toLowerCase() === "of") {
        opcaoOfIA.push({
          value: nameJutsu,
          text: `${nameJutsu} (${typeJutsu})`,
          power: powerJutsu,
        });
      } else if (["df", "ev"].includes(usage.toLowerCase())) {
        opcaoDfIA.push({
          value: nameJutsu,
          text: `${nameJutsu} (${typeJutsu})`,
          power: powerJutsu,
        });
      }
    }
  });

  // Escolher ação ofensiva
  const melhorOfensivaIA = opcaoOfIA.reduce(
    (melhorOpcao, opcao) => {
      let poderAtq = opcao.power;
      const jutsuEncontrado = jutsus.find(
        (jutsu) => jutsu.nameJutsu === opcao.value
      );
      const typeJutsu = jutsuEncontrado
        ? jutsuEncontrado.typeJutsu.toLowerCase()
        : null;

      if (
        typeJutsu === "taijutsu" ||
        typeJutsu === "shurikenjutsu" ||
        typeJutsu === "kenjutsu"
      ) {
        poderAtq += parseInt(liderIA.dataset.taijutsu, 10) || 0;
      } else if (typeJutsu === "genjutsu") {
        poderAtq += parseInt(liderIA.dataset.genjutsu, 10) || 0;
      } else if (typeJutsu === "ninjutsu") {
        poderAtq += parseInt(liderIA.dataset.ninjutsu, 10) || 0;
      }

      console.log(
        `🎯 Opção ofensiva: ${opcao.text}, Poder de Ataque: ${poderAtq}`
      );
      return poderAtq > melhorOpcao.poderAtq
        ? { ...opcao, poderAtq }
        : melhorOpcao;
    },
    { poderAtq: 0 }
  );

  dropdownOfensivaIA.value = melhorOfensivaIA.value;
  console.log(
    `🔥 Ação ofensiva escolhida pela IA: ${melhorOfensivaIA.text} (Poder: ${melhorOfensivaIA.poderAtq})`
  );

  // Escolher ação defensiva
  const melhorDefensivaIA = opcaoDfIA.reduce(
    (melhorOpcao, opcao) => {
      let poderDef = opcao.power;
      console.log(
        `🛡️ Opção defensiva: ${opcao.text}, Poder de Defesa: ${poderDef}`
      );
      return poderDef > melhorOpcao.poderDef
        ? { ...opcao, poderDef }
        : melhorOpcao;
    },
    { poderDef: 0 }
  );

  dropdownDefensivaIA.value = melhorDefensivaIA.value;
  console.log(
    `🛡️ Ação defensiva escolhida pela IA: ${melhorDefensivaIA.text} (Poder: ${melhorDefensivaIA.poderDef})`
  );

  // Identificar jutsus ou ações básicas
  const acaoOfensivaIA = identificarAcao(liderIA, melhorOfensivaIA.value);
  const acaoDefensivaIA = identificarAcao(liderIA, melhorDefensivaIA.value);
  const acaoOfensivaJ1 = identificarAcao(liderJ1, ofensivaJ1);
  const acaoDefensivaJ1 = identificarAcao(liderJ1, defensivaJ1);

  // Calcular o dano
  defineOrdem(
    liderJ1,
    liderIA,
    acaoOfensivaJ1,
    acaoDefensivaJ1,
    acaoOfensivaIA,
    acaoDefensivaIA
  );
}

function identificarAcao(lider, acaoSelecionada) {
  if (!lider || !acaoSelecionada) {
    console.error("❌ Líder ou ação selecionada está indefinida.");
    return null;
  }

  const acoesBasicas = ["taijutsu", "defense", "speed"];
  if (acoesBasicas.includes(acaoSelecionada)) {
    return {
      type: "basica",
      name: acaoSelecionada,
      valor: lider.dataset[acaoSelecionada] || 0,
    };
  }

  // 🔹 Remover qualquer texto adicional entre parênteses
  const nomeJutsuLimpado = acaoSelecionada.replace(/\s*\(.*?\)\s*/g, "").trim();

  const jutsus = JSON.parse(lider.dataset.jutsus || "[]");
  const jutsuSelecionado = jutsus.find(
    (jutsu) => jutsu.nameJutsu === nomeJutsuLimpado
  );

  if (jutsuSelecionado) {
    return { type: "jutsu", ...jutsuSelecionado };
  }

  console.warn(
    `⚠️ Ação selecionada (${acaoSelecionada}) não encontrada no dataset de ${lider.dataset.name}.`
  );
  return null;
}

function escolherNovoLiderIA() {
  console.log("Escolhendo novo líder para a IA...");

  const iaLeaderSlot = document.getElementById("ia-leader-slot");
  const iaSupportSlots = [
    document.getElementById("supIAa"),
    document.getElementById("supIAb"),
    document.getElementById("supIAc"),
  ];

  // Filtrar ninjas nos slots de suporte
  const supportNinjas = iaSupportSlots
    .filter((slot) => slot.classList.contains("occupied"))
    .map((slot) => slot.querySelector("img"));

  if (supportNinjas.length > 0) {
    // Calcula a soma dos atributos de cada ninja no suporte
    const ninjaComMaiorSoma = supportNinjas.reduce(
      (melhorNinja, ninjaAtual) => {
        const somaAtual = calcularSomaAtributos(ninjaAtual);
        const somaMelhor = calcularSomaAtributos(melhorNinja);
        return somaAtual > somaMelhor ? ninjaAtual : melhorNinja;
      }
    );

    // Move o ninja com maior soma de atributos para o slot de líder
    const slotAnterior = ninjaComMaiorSoma.parentElement;
    slotAnterior.innerHTML = "";
    slotAnterior.classList.remove("occupied");

    iaLeaderSlot.innerHTML = ""; // Limpa o slot de líder
    iaLeaderSlot.appendChild(ninjaComMaiorSoma);
    iaLeaderSlot.classList.add("occupied");
    ninjaComMaiorSoma.draggable = false; // Desativa arrastar o novo líder
    atualizarAtributosLiderIA(ninjaComMaiorSoma);

    console.log(`Novo líder ${ninjaComMaiorSoma.id} escolhido para a IA.`);

    estadoAtual = "premio";
    encerrarTurno();
  } else {
    console.log(
      "IA não possui mais ninjas no suporte para escolher como novo líder."
    );
    estadoAtual = "premio";
    encerrarTurno();
  }
}

function calcularSomaAtributos(ninja) {
  const hp = parseInt(ninja.dataset.hp, 10) || 0;
  const chakra = parseInt(ninja.dataset.chakra, 10) || 0;
  const taijutsu = parseInt(ninja.dataset.taijutsu, 10) || 0;
  const genjutsu = parseInt(ninja.dataset.genjutsu, 10) || 0;
  const ninjutsu = parseInt(ninja.dataset.ninjutsu, 10) || 0;
  const defense = parseInt(ninja.dataset.defense, 10) || 0;
  const speed = parseInt(ninja.dataset.speed, 10) || 0;

  return hp + chakra + taijutsu + genjutsu + ninjutsu + defense + speed;
}

function adicionarNinjaBaralhoIA() {
  console.log("IA ativando habilidade NinjaBaralho...");
  const maoIA = iaMao;

  if (!iaBaralho || !iaBaralho.cards || iaBaralho.cards.length === 0) {
    console.warn("O baralho da IA está vazio ou não carregado.");
    alert("A IA não possui mais ninjas no baralho para adicionar.");
    return;
  }

  // Obter os ninjas no campo da IA
  const ninjasCampoIA = Array.from(
    document.querySelectorAll("#ia-formation-field .field-slot img")
  ).filter((card) => card.dataset.type === "Ninja");

  console.log("Ninjas no campo da IA:", ninjasCampoIA);

  // Priorizar ninjas do baralho conforme as regras
  let ninjaSelecionado = null;

  // Regra 1: Um ninja estágio 3 com o mesmo regN de um estágio 2 no campo da IA
  ninjaSelecionado = iaBaralho.cards.find(
    (card) =>
      card.type === "Ninja" &&
      card.stage === 3 &&
      ninjasCampoIA.some(
        (ninjaCampo) =>
          ninjaCampo.dataset.regN === card.regN && ninjaCampo.dataset.stage == 2
      )
  );

  if (ninjaSelecionado) {
    console.log(`Ninja estágio 3 selecionado: ${ninjaSelecionado.name}`);
  }

  // Regra 2: Um ninja estágio 2 com o mesmo regN de um estágio 1 no campo da IA
  if (!ninjaSelecionado) {
    ninjaSelecionado = iaBaralho.cards.find(
      (card) =>
        card.type === "Ninja" &&
        card.stage === 2 &&
        ninjasCampoIA.some(
          (ninjaCampo) =>
            ninjaCampo.dataset.regN === card.regN &&
            ninjaCampo.dataset.stage == 1
        )
    );

    if (ninjaSelecionado) {
      console.log(`Ninja estágio 2 selecionado: ${ninjaSelecionado.name}`);
    }
  }

  // Regra 3: O ninja estágio 1 com a maior soma de atributos
  if (!ninjaSelecionado) {
    ninjaSelecionado = iaBaralho.cards
      .filter((card) => card.type === "Ninja" && card.stage === 1)
      .reduce(
        (melhor, atual) =>
          calcularSomaAtributos(atual) > calcularSomaAtributos(melhor)
            ? atual
            : melhor,
        {
          hp: 0,
          chakra: 0,
          taijutsu: 0,
          genjutsu: 0,
          ninjutsu: 0,
          defense: 0,
          speed: 0,
        }
      );

    if (ninjaSelecionado) {
      console.log(`Ninja estágio 1 selecionado: ${ninjaSelecionado.name}`);
    }
  }

  if (!ninjaSelecionado) {
    console.warn(
      "A IA não conseguiu selecionar nenhum ninja para adicionar à mão."
    );
    alert("A IA não possui um ninja válido para adicionar à mão.");
    return;
  }

  // Adicionar o ninja à mão da IA usando comprarCard
  console.log(`Adicionando o ninja ${ninjaSelecionado.name} à mão da IA.`);

  const ninjaAdicionado = comprarCard(
    iaBaralho.cards.filter((card) => card.idCard === ninjaSelecionado.idCard), // Cria um baralho temporário com apenas o ninja selecionado
    maoIA,
    "ia-deck-slot" // Atualiza o slot do deck da IA
  );

  if (ninjaAdicionado) {
    console.log(`Ninja "${ninjaAdicionado.name}" foi adicionado à mão da IA.`);
    alert(`A IA adicionou o ninja "${ninjaAdicionado.name}" à sua mão.`);
  } else {
    console.warn("Falha ao adicionar o ninja à mão da IA.");
  }
}
async function escolherHabilidadesSuporteIA() {
  console.log("🔍 Iniciando habilidades da IA...");
  const suportesIA = Array.from(
    document.querySelectorAll("#ia-supports .field-slot img")
  );
  const habilidadesIA = [];
  let tentativas = 0;

  if (suportesIA.length === 0) {
    console.log("❌ A IA não possui ninjas no suporte para usar habilidades.");
    suporteIAExecutado = true; // Marca como processado
    return;
  }

  // Filtrar suportes que possuem habilidades utilizáveis
  const suportesValidos = suportesIA.filter((ninja) => {
    const usosRestantes = parseInt(ninja.dataset.costSupSkill, 10) || 0;
    return usosRestantes > 0 && ninja.dataset.habUsada !== "true";
  });

  if (suportesValidos.length === 0) {
    console.warn(
      "⚠️ Todos os suportes da IA já usaram suas habilidades ou não têm mais usos restantes."
    );
    suporteIAExecutado = true; // Marca como processado
    return;
  }

  console.log(
    `✅ IA encontrou ${suportesValidos.length} suporte(s) com habilidades disponíveis.`
  );

  // Escolher até 2 suportes aleatórios, evitando loop infinito
  while (habilidadesIA.length < 2 && tentativas < 5) {
    const suporteEscolhido =
      suportesValidos[Math.floor(Math.random() * suportesValidos.length)];
    if (!habilidadesIA.includes(suporteEscolhido)) {
      habilidadesIA.push(suporteEscolhido);
    }
    tentativas++;
  }

  if (habilidadesIA.length === 0) {
    console.log(
      "⚠️ A IA possui ninjas no suporte, mas nenhum com habilidade de suporte disponível para usar."
    );
    suporteIAExecutado = true; // Marca como processado
    return;
  }

  // Ordenar os ninjas pela speed para maior impacto estratégico
  habilidadesIA.sort(
    (a, b) => parseInt(b.dataset.speed, 10) - parseInt(a.dataset.speed, 10)
  );

  for (const ninja of habilidadesIA) {
    const habilidade = ninja.dataset.supSkill || "Habilidade desconhecida";
    let usosRestantes = parseInt(ninja.dataset.costSupSkill, 10) || 0;
    let chanceBase = parseInt(ninja.dataset.chanceSkill, 10);

    // ✅ Validação de chanceBase para evitar NaN
    if (isNaN(chanceBase) || chanceBase <= 0) {
      console.warn(
        `⚠️ ${ninja.dataset.name} não tem um valor válido de chanceSkill. Definindo para 100%.`
      );
      chanceBase = 100;
    }

    console.log(
      `⚡ IA quer usar "${habilidade}" do ninja "${ninja.dataset.name}" (Usos restantes: ${usosRestantes})`
    );

    // 🔹 Habilidades que selecionam cartas no deck ou descarte (não precisam de alvo)
    const habilidadesSemAlvo = [
      "kaifuu-BH1",
      "kaifuu-BH2",
      "kaifuu-DH1",
      "kaifuu-DH2",
      "chakra-BH1",
      "chakra-BH2",
      "chakra-DH2",
      "chakra-DH4",
      "edoTensei-H",
      "buy3",
      "trocarH-5",
      "trocar2H-5",
    ];

    if (habilidadesSemAlvo.includes(habilidade)) {
      console.log(
        `📜 Habilidade "${habilidade}" não precisa de alvo. Aplicando efeito diretamente.`
      );
      await aplicarEfeito(ninja, null, habilidade, chanceBase, "IA");
    } else {
      // 🎯 Definir alvo direto para habilidades de dano direto
      const habilidadesDanoDireto = ["attack10", "attack15", "attack20"];
      if (habilidadesDanoDireto.includes(habilidade)) {
        console.log(
          `🔥 Aplicando dano direto ao líder do jogador com ${habilidade}`
        );
        const alvoDireto = document.querySelector("#player-leader-slot img");
        aplicarDanoDireto(
          alvoDireto,
          parseInt(habilidade.replace("attack", ""), 10)
        );
      } else {
        // 📌 Para outras habilidades, escolher alvo normalmente
        const alvo = escolherAlvoIA(habilidade);
        if (alvo) {
          console.log(
            `🎯 Alvo escolhido pela IA: ${
              alvo === "todos" ? "Todos os aliados" : alvo.dataset.name
            }`
          );
          await aplicarEfeito(
            ninja,
            alvo === "todos" ? null : alvo,
            habilidade,
            chanceBase,
            "IA"
          );
        } else {
          console.warn(
            `❌ Nenhum alvo disponível para ${habilidade}. Habilidade não foi ativada.`
          );
          continue;
        }
      }
    }

    // Marcar habilidade como usada neste turno
    ninja.dataset.habUsada = "true";

    // Reduzir contador de usos restantes
    usosRestantes -= 1;
    ninja.dataset.costSupSkill = usosRestantes;
    console.log(
      `🔻 Usos restantes da habilidade de ${ninja.dataset.name}: ${usosRestantes}`
    );

    if (usosRestantes === 0) {
      console.log(
        `🚫 ${ninja.dataset.name} não pode mais usar sua habilidade!`
      );
    }
  }
  suporteIAExecutado = true; // Marca como processado
}
function escolherAlvoIA(habilidade) {
  const habilidadesContraOponente = [
    "confusion",
    "copy",
    "lowerChk10",
    "lowerChk15",
    "lowerChk20",
    "lowerChk25",
    "lowerChk30",
    "lowerDef10",
    "lowerDef15",
    "lowerDefSpd15",
    "lowerDefSpd20",
    "lowerSpd",
    "paralyze",
    "poising",
    "sealChk",
    "zerarChk",
  ];

  const habilidadesEmAliado = [
    "healing20",
    "healing30",
    "healing40",
    "healing50",
    "healing70",
    "healingAll30",
    "healingAll50",
    "increaseChk10",
    "increaseChk15",
    "increaseChk20",
    "increaseDef10",
    "increaseDef15",
    "increaseDef20",
    "increaseDef25",
    "increaseDef30",
    "increaseSpd10",
  ];

  let alvosPossiveis = [];

  if (habilidadesContraOponente.includes(habilidade)) {
    // Chamamos a lógica que já ajustamos anteriormente para ataques ao oponente.
    return escolherAlvoOponenteIA(habilidade);
  }

  if (habilidadesEmAliado.includes(habilidade)) {
    // Obtém os aliados (líder da IA + suportes)
    const liderIA = document.querySelector("#ia-leader-slot img");
    const suportesIA = Array.from(
      document.querySelectorAll("#ia-supports .field-slot img")
    );

    alvosPossiveis = [liderIA, ...suportesIA].filter((ninja) => ninja);

    if (
      [
        "healing20",
        "healing30",
        "healing40",
        "healing50",
        "healing70",
      ].includes(habilidade)
    ) {
      return alvosPossiveis.length > 0
        ? alvosPossiveis.reduce((maisMachucado, atual) => {
            const danoAtual =
              parseInt(atual.dataset.hpInicial, 10) -
              parseInt(atual.dataset.hp, 10);
            const danoMaior =
              parseInt(maisMachucado.dataset.hpInicial, 10) -
              parseInt(maisMachucado.dataset.hp, 10);
            return danoAtual > danoMaior ? atual : maisMachucado;
          })
        : null;
    }

    if (["healingAll30", "healingAll50"].includes(habilidade)) {
      // Cura todos os aliados, então não precisa escolher um único alvo.
      return "todos";
    }

    if (
      ["increaseChk10", "increaseChk15", "increaseChk20"].includes(habilidade)
    ) {
      return alvosPossiveis.length > 0
        ? alvosPossiveis.reduce((menosChakra, atual) =>
            parseInt(atual.dataset.chakra, 10) <
            parseInt(menosChakra.dataset.chakra, 10)
              ? atual
              : menosChakra
          )
        : null;
    }

    if (
      [
        "increaseDef10",
        "increaseDef15",
        "increaseDef20",
        "increaseDef25",
        "increaseDef30",
      ].includes(habilidade)
    ) {
      return alvosPossiveis.length > 0
        ? alvosPossiveis.reduce((menosDefesa, atual) =>
            parseInt(atual.dataset.defense, 10) <
            parseInt(menosDefesa.dataset.defense, 10)
              ? atual
              : menosDefesa
          )
        : null;
    }

    if (habilidade === "increaseSpd10") {
      return alvosPossiveis.length > 0
        ? alvosPossiveis.reduce((menosSpeed, atual) =>
            parseInt(atual.dataset.speed, 10) <
            parseInt(menosSpeed.dataset.speed, 10)
              ? atual
              : menosSpeed
          )
        : null;
    }

    return null;
  }

  console.warn(`Habilidade desconhecida: ${habilidade}. Nenhum alvo definido.`);
  return null;
}
function escolherAlvoOponenteIA(habilidade) {
  console.log(`🔍 IA tentando encontrar alvo para habilidade ${habilidade}...`);

  const liderJ1 = document.querySelector("#player-leader-slot img");
  const suportesJ1 = Array.from(
    document.querySelectorAll("#player-supports .field-slot img")
  );
  let alvosPossiveis = [liderJ1, ...suportesJ1].filter((ninja) => ninja);

  if (alvosPossiveis.length === 0) {
    console.warn("❌ Nenhum alvo disponível para ataque da IA.");
    return null;
  }

  let alvoEscolhido = null;

  switch (habilidade) {
    case "confusion":
      if (liderJ1 && liderJ1.dataset.confusion !== "true") {
        alvoEscolhido = liderJ1;
      } else if (suportesJ1.length > 0) {
        alvoEscolhido =
          suportesJ1[Math.floor(Math.random() * suportesJ1.length)];
      }
      break;

    case "copy":
      alvoEscolhido =
        alvosPossiveis[Math.floor(Math.random() * alvosPossiveis.length)];
      break;

    case "lowerChk10":
    case "lowerChk15":
    case "lowerChk20":
    case "lowerChk25":
    case "lowerChk30":
      alvoEscolhido = alvosPossiveis.reduce(
        (maisChakra, atual) =>
          parseInt(atual.dataset.chakra || 0, 10) >
          parseInt(maisChakra.dataset.chakra || 0, 10)
            ? atual
            : maisChakra,
        alvosPossiveis[0]
      );
      break;

    case "lowerDef10":
    case "lowerDef15":
    case "lowerDefSpd15":
    case "lowerDefSpd20":
      alvoEscolhido = alvosPossiveis.reduce(
        (maisDefesa, atual) =>
          parseInt(atual.dataset.defense || 0, 10) >
          parseInt(maisDefesa.dataset.defense || 0, 10)
            ? atual
            : maisDefesa,
        alvosPossiveis[0]
      );
      break;

    case "lowerSpd":
      alvoEscolhido = alvosPossiveis.reduce(
        (maisSpeed, atual) =>
          parseInt(atual.dataset.speed || 0, 10) >
          parseInt(maisSpeed.dataset.speed || 0, 10)
            ? atual
            : maisSpeed,
        alvosPossiveis[0]
      );
      break;

    case "sealChk":
    case "zerarChk":
      alvoEscolhido =
        liderJ1 && parseInt(liderJ1.dataset.chakra || 0, 10) > 20
          ? liderJ1
          : suportesJ1.find(
              (ninja) => parseInt(ninja.dataset.chakra || 0, 10) > 20
            ) || null;
      break;

    case "paralyze":
    case "poising":
      alvoEscolhido =
        alvosPossiveis[Math.floor(Math.random() * alvosPossiveis.length)];
      break;

    default:
      console.warn(`⚠️ Habilidade desconhecida: ${habilidade}.`);
      break;
  }

  if (alvoEscolhido) {
    console.log(`🎯 IA escolheu ${alvoEscolhido.dataset.name} como alvo.`);
  } else {
    console.warn("⚠️ Nenhum alvo foi escolhido pela IA.");
  }

  return alvoEscolhido;
}
