function decidirOrdemHabilidadesSuporte() {
  const suporteJ1 = Array.from(
    document.querySelectorAll("#player-supports .field-slot img")
  );
  const suporteIA = Array.from(
    document.querySelectorAll("#ia-supports .field-slot img")
  );
  suporteIAExecutado = false; // Reseta o controle para a nova fase
  console.log("suporte IA ja usado?", suporteIAExecutado);
  const calcularMediaVelocidade = (suportes) => {
    if (suportes.length === 0) return 0;
    const somaVelocidade = suportes.reduce(
      (soma, ninja) => soma + (parseInt(ninja.dataset.speed, 10) || 0),
      0
    );
    return somaVelocidade / suportes.length;
  };

  const mediaVelocidadeJ1 = calcularMediaVelocidade(suporteJ1);
  const mediaVelocidadeIA = calcularMediaVelocidade(suporteIA);

  console.log(`Média de speed do J1: ${mediaVelocidadeJ1}`);
  console.log(`Média de speed da IA: ${mediaVelocidadeIA}`);

  if (mediaVelocidadeJ1 > mediaVelocidadeIA) {
    alert("O jogador vai usar as habilidades de suporte primeiro.");
    configurarBotaoHabilidade();
  } else if (mediaVelocidadeIA > mediaVelocidadeJ1) {
    alert("A IA vai usar as habilidades de suporte primeiro.");
    escolherHabilidadesSuporteIA();
    configurarBotaoHabilidade();
  } else {
    alert(
      "Empate de speed. O jogador usará as habilidades de suporte primeiro."
    );
    configurarBotaoHabilidade();
  }
}
async function ativarHabilidadeSuporte(ninja) {
  if (!ninja) return;

  console.log(
    `⚡ Ativando habilidade de ${ninja.dataset.name}: ${ninja.dataset.supSkill}`
  );

  // 🔒 Evita ativação múltipla acidental
  if (ninja.dataset.habUsada === "true") {
    console.log("Este suporte já usou sua habilidade neste turno.");
    return;
  }

  if (ninja.dataset.paralyze === "true") {
    console.log("Este ninja está Paralisado e não pode ativar sua habilidade.");
    return;
  }

  let usosRestantes = parseInt(ninja.dataset.costSupSkill, 10);
  if (usosRestantes <= 0) {
    // 🔹 Se os usos forem 0 ou negativos, impedir ativação
    alert(
      `${ninja.dataset.name} já esgotou o número de usos de sua habilidade.`
    );
    console.warn(
      `⚠️ Habilidade de ${ninja.dataset.name} não pode ser usada, pois os usos restantes são ${usosRestantes}.`
    );
    return;
  }

  const habilidade = ninja.dataset.supSkill;
  const chance = parseInt(ninja.dataset.chanceSkill, 10);

  // Lista de habilidades que exigem um alvo
  const habilidadesComAlvo = [
    "poising",
    "paralyze",
    "healing70",
    "increaseChk10",
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
    "sealChk",
    "zerarChk",
    "increaseChk15",
    "increaseChk20",
    "increaseDef10",
    "increaseDef15",
    "increaseDef20",
    "increaseDef25",
    "increaseDef30",
    "increaseSpd10",
    "healing20",
    "healing30",
    "healing40",
    "healing50",
  ];

  const habilidadesEmTodos = ["healingAll30", "healingAll50"];

  if (habilidadesComAlvo.includes(habilidade)) {
    abrirModalEscolhaAlvo(ninja);
  } else if (habilidadesEmTodos.includes(habilidade)) {
    aplicarEfeito(ninja, "todos", habilidade, chance, "J1");
  } else {
    aplicarEfeito(ninja, null, habilidade, chance, "J1");
  }

  // ⏳ Pequeno delay para evitar duplo clique acidental
  setTimeout(() => {
    console.log(`🔹 Usos da habilidade antes da redução: ${usosRestantes}`);
    usosRestantes -= 1;
    ninja.dataset.costSupSkill = usosRestantes;
    console.log(`🔹 Usos restantes da habilidade: ${usosRestantes}`);

    if (usosRestantes === 0) {
      alert(`🚫${ninja.dataset.name} não pode mais usar sua habilidade!`);
    }

    ninja.dataset.habUsada = "true";
  }, 50);
}

async function aplicarEfeito(origem, alvo, efeito, chance, jogador) {
  console.log(
    `Tentando aplicar efeito: ${efeito} (Chance: ${chance}%) de ${
      origem?.dataset?.idCard || "Desconhecido"
    } para ${alvo?.dataset?.name || alvo?.dataset?.idCard}`
  );

  const isJ1 = jogador === "J1";
  let deck = isJ1 ? jogadorBaralho.cards : iaBaralho.cards;
  let mao = isJ1 ? jogadorMao : iaMao;
  let deckSlotId = isJ1 ? "player-deck-slot" : "ia-deck-slot";
  let descarte = isJ1 ? arrayDescartePlayer : arrayDescarteIA;
  /*      ? document.querySelectorAll("#player-discard-slot img") 
        : document.querySelectorAll("#ia-discard-slot img"); */

  // 🔹 Agora capturamos o elemento real do DOM, e não um seletor CSS
  let alvoDireto = isJ1
    ? document.querySelector("#ia-leader-slot img")
    : document.querySelector("#player-leader-slot img");

  if (!alvoDireto) {
    console.warn(
      `❌ Erro: O líder do adversário não foi encontrado para aplicar ${efeito}.`
    );
    //return;
  }

  // Corrige array inválido
  if (!Array.isArray(mao)) {
    console.error("Erro: mao não é um array válido. Criando um novo array...");
    if (isJ1) {
      jogadorMao = [];
    } else {
      iaMao = [];
    }
    mao = isJ1 ? jogadorMao : iaMao;
  }

  const resultadoSorteio = Math.floor(Math.random() * 101);
  console.log(
    `🎲 Sorteio realizado: ${resultadoSorteio.toFixed(
      2
    )}% (Limite necessária: ${chance}%)`
  );

  if (chance < 100 && resultadoSorteio > chance) {
    console.warn(`❌ Efeito ${efeito} falhou!`);
    return;
  }
  console.log(`✅ Efeito ${efeito} aplicado com sucesso!`);

  switch (efeito) {
    case "aumentaDef20":
      modificarAtributo(alvo, "defense", 20);
      break;
    case "aumentaTai20":
      modificarAtributo(alvo, "taijutsu", 20);
      break;
    case "aumentaNin20":
      modificarAtributo(alvo, "ninjutsu", 20);
      break;
    case "aumentaGen20":
      modificarAtributo(alvo, "genjutsu", 20);
      break;
    case "aumentaChk20":
      modificarAtributo(alvo, "chakra", 20);
      break;
    case "aumentaSpd20":
      modificarAtributo(alvo, "speed", 20);
      break;
    case "plusSupSkill":
      modificarAtributo(alvo, "costSupSkill", 2);
      break;

    // Escolha de cartas (Baralho ou Descarte)
    case "kuchiyoseN1-1":
    case "kuchiyoseN1-2":
    case "kuchiyoseN2-1":
    case "kuchiyoseN2-2":
    case "kuchiyoseN3": {
      const qtd =
        efeito.includes("N1-2") ||
        efeito.includes("N2-2") ||
        efeito.includes("BH2")
          ? 2
          : 1;
      if (isJ1) {
        const cartasEscolhidas = await escolherCardPorCarrossel(
          "Ninja",
          (card) => card.stage >= (efeito.includes("N2") ? 2 : 1),
          qtd,
          deck,
          mao
        );
        if (!cartasEscolhidas) {
          console.warn(`⚠️ Nenhuma carta foi escolhida para ${efeito}.`);
          return;
        }
      } else {
        escolherCartaIA(deck, "Ninja", efeito, qtd, mao);
      }
      break;
    }
    case "kaifuu-BH1": //deu certo
    case "kaifuu-BH2": {
      const qtd = efeito.includes("BH2") ? 2 : 1;
      if (isJ1) {
        const cartasEscolhidas = await escolherCardPorCarrossel(
          "Tool",
          (card) => card.type === "Tool",
          qtd,
          deck,
          mao
        );
        if (!cartasEscolhidas) return;
      } else {
        escolherCartaIA(deck, "Tool", efeito, qtd, mao);
      }
      break;
    }

    // Escolha de cartas (Baralho ou Descarte)
    case "chakra-BH1":
    case "chakra-BH2": {
      const qtd = efeito.includes("BH2") ? 2 : 1;
      if (isJ1) {
        const cartasEscolhidas = await escolherCardPorCarrossel(
          "Chakra",
          (card) => card.type === "Chakra",
          qtd,
          deck,
          mao
        );
        if (!cartasEscolhidas) return;
      } else {
        escolherCartaIA(deck, "Chakra", efeito, qtd, mao);
      }
      break;
    }

    case "kaifuu-DH1":
    case "kaifuu-DH2": {
      const qtd = efeito.includes("DH2") ? 2 : 1;
      if (isJ1) {
        const cartasEscolhidas = await escolherCardPorCarrossel(
          "Tool",
          (card) => card.type === "Tool",
          qtd,
          descarte,
          mao
        );
        if (!cartasEscolhidas) return;
      } else {
        escolherCartaIA(descarte, "Tool", efeito, qtd, mao);
      }
      break;
    }

    case "chakra-DH2":
    case "chakra-DH4": {
      const qtd = efeito.includes("DH4") ? 4 : 2;
      if (isJ1) {
        const cartasEscolhidas = await escolherCardPorCarrossel(
          "Chakra",
          (card) => card.type === "Chakra",
          qtd,
          descarte,
          mao
        );
        if (!cartasEscolhidas) return;
      } else {
        escolherCartaIA(descarte, "Chakra", efeito, qtd, mao);
      }
      break;
    }

    case "edoTensei-H": {
      if (isJ1) {
        const cartasEscolhidas = await escolherCardPorCarrossel(
          "Ninja",
          (card) => card.type === "Ninja",
          1,
          descarte,
          mao
        );
        if (!cartasEscolhidas) return;
      } else {
        escolherCartaIA(descarte, "Ninja", efeito, 1, mao);
      }
      break;
    }
    case "buy3":
      for (let i = 0; i < 3; i++) {
        comprarCard(deck, mao, deckSlotId);
      }
      await Promise.resolve();
      isJ1 ? renderizarMao(mao) : renderizarMaoIA(mao);
      break;

    case "trocarH-5":
      trocarMaoPor5Cards(jogador, deck, mao, deckSlotId);
      break;

    case "trocar2H-5":
      trocarMaoPor5Cards(
        "J1",
        jogadorBaralho.cards,
        Array.isArray(jogadorMao) ? jogadorMao : [],
        "player-deck-slot"
      );
      trocarMaoPor5Cards(
        "IA",
        iaBaralho.cards,
        Array.isArray(iaMao) ? iaMao : [],
        "ia-deck-slot"
      );
      break;

    // Aplicação direta de efeitos
    case "poising":
    case "paralyze":
      aplicarEfeitoStatus(origem, alvo, efeito);
      break;

    case "attack10":
      aplicarDanoDireto(alvoDireto, 10);
      break;
    case "attack15":
      aplicarDanoDireto(alvoDireto, 15);
      break;
    case "attack20":
      aplicarDanoDireto(alvoDireto, 20);
      break;
    case "healing70":
      curarAlvo(alvo, 70);
      break;
    case "increaseChk10":
      modificarAtributo(alvo, "chakra", 10);
      break;
    case "increaseDef10":
      modificarAtributo(alvo, "defense", 10);
      break;
    case "increaseDef15":
      modificarAtributo(alvo, "defense", 15);
      break;
    case "increaseDef20":
      modificarAtributo(alvo, "defense", 20);
      break;
    case "lowerChk25":
      modificarAtributo(alvo, "chakra", -25);
      break;
    case "lowerDef10":
      modificarAtributo(alvo, "defense", -10);
      break;
    case "lowerDef15":
      modificarAtributo(alvo, "defense", -15);
      break;
    case "lowerDefSpd15":
      modificarAtributo(alvo, "defense", -15);
      modificarAtributo(alvo, "speed", -15);
      break;
    case "lowerSpd":
      reduzirVelocidadeTodos(origem);
      break;
    case "copy":
      copiarJutsu(origem, alvo);
      break;
    case "confusion":
      aplicarConfusao(alvo);
      break;
    case "bonusTai":
      aumentarDanoSeTaijutsu(origem);
      break;
    case "deductionGen":
      anularSeNaoForGenjutsu(origem);
      break;
    case "deductionKen":
      anularSeNaoForKenjutsu(origem);
      break;
    case "dodge10":
      aumentarEvasiva(alvo, 10);
      break;
    case "dodge15":
      aumentarEvasiva(alvo, 15);
      break;
    case "dodge20":
      aumentarEvasiva(alvo, 20);
      break;
    case "dodge30":
      aumentarEvasiva(alvo, 30);
      break;
    case "juuken":
      zerarChakraSeJuuken(alvo);
      break;
    case "kai":
      anularSeNaoForGenjutsu(origem);
      break;
    case "lowerChk15":
      modificarAtributo(alvo, "chakra", -15);
      break;
    case "lowerChk20":
      modificarAtributo(alvo, "chakra", -20);
      break;
    case "paralyzeAll":
      aplicarParalyzeTodos(alvo);
      break;
    case "poisingAll":
      aplicarPoisingTodos(alvo);
      break;
    case "regenerate50":
      regenerarDanoRecebido(alvo, 50);
      break;
    case "self-destruction":
      autoDestruir(origem);
      break;
    case "spd10tai20":
      modificarAtributo(alvo, "speed", 10);
      modificarAtributo(alvo, "taijutsu", 20);
      break;
    case "switchOp":
      if (jogador === "J1") {
        // Jogador escolhe um suporte da IA para ser o novo líder
        const suportesIA = Array.from(
          document.querySelectorAll("#ia-supports .field-slot img")
        );
        if (suportesIA.length === 0) {
          console.warn("⚠️ A IA não tem suportes disponíveis para trocar.");
          return;
        }

        // Permitir que o J1 escolha manualmente
        escolherSuporteManual(suportesIA, (novoLider) => {
          console.log(
            `🔄 Jogador usou switchOp! Novo líder da IA: ${novoLider.dataset.name}`
          );
          mudarLiderIA(novoLider);
        });
      } else {
        // IA escolhe automaticamente o suporte do J1 com menor soma de atributos
        const suportesJ1 = Array.from(
          document.querySelectorAll("#player-supports .field-slot img")
        );
        if (suportesJ1.length === 0) {
          console.warn(
            "⚠️ O jogador não tem suportes disponíveis para trocar."
          );
          return;
        }

        const suporteMenorAtributo = suportesJ1.reduce((menor, suporte) => {
          const somaAtributos = [
            "hp",
            "chakra",
            "taijutsu",
            "genjutsu",
            "ninjutsu",
            "defense",
            "speed",
          ].reduce(
            (total, stat) => total + (parseInt(suporte.dataset[stat], 10) || 0),
            0
          );

          return !menor || somaAtributos < menor.soma
            ? { suporte, soma: somaAtributos }
            : menor;
        }, null)?.suporte;

        if (suporteMenorAtributo) {
          console.log(
            `🔄 IA usou switchOp! Novo líder do jogador: ${suporteMenorAtributo.dataset.name}`
          );
          mudarLiderJ1(suporteMenorAtributo);
        }
      }
      break;
    default:
      console.warn(`Efeito desconhecido: ${efeito}. Nenhuma ação foi tomada.`);
  }
}
function abrirModalEscolhaAlvo(ninja) {
  modalAlvoAberto = true;
  const modal = document.getElementById("modal-escolher-alvo");
  const containerOpcoes = document.getElementById("opcoes-alvo");
  const cancelarBotao = document.getElementById("cancelar-selecao");

  containerOpcoes.innerHTML = ""; // Limpa opções anteriores

  // Listar todos os ninjas do campo (J1 e IA)
  const alvos = document.querySelectorAll(
    "#player-leader-slot img, #ia-leader-slot img, #player-supports .field-slot img, #ia-supports .field-slot img"
  );

  if (alvos.length === 0) {
    console.warn("Nenhum alvo disponível para seleção.");
    fecharModalEscolhaAlvo();
    return;
  }

  alvos.forEach((alvo) => {
    const opcao = document.createElement("img");
    opcao.src = alvo.src;
    opcao.alt = alvo.dataset.name;
    opcao.classList.add("opcao-alvo");

    // Define o tamanho fixo do card
    opcao.style.width = "118px";
    opcao.style.height = "167.5px";
    opcao.style.borderRadius = "8px";
    opcao.style.transition = "transform 0.2s, border-color 0.2s";

    // Efeito de destaque ao passar o mouse
    opcao.addEventListener("mouseenter", () => {
      opcao.style.transform = "scale(1.1)";
      opcao.style.border = "2px solid yellow";
    });

    opcao.addEventListener("mouseleave", () => {
      opcao.style.transform = "scale(1)";
      opcao.style.border = "2px solid transparent";
    });

    // Seleção do alvo
    opcao.addEventListener("click", () => {
      console.log(`✅ Alvo escolhido: ${alvo.dataset.name}`);

      // Obtém a chance de sucesso da habilidade
      let chanceBase = parseInt(ninja.dataset.chanceSkill, 10);
      if (isNaN(chanceBase) || chanceBase <= 0) {
        console.warn(
          `⚠️ ${ninja.dataset.name} não tem um valor válido de chanceSkill. Definindo para 100%.`
        );
        chanceBase = 100;
      }

      // Aplica o efeito chamando a função correta
      aplicarEfeito(ninja, alvo, ninja.dataset.supSkill, chanceBase, "J1");
      fecharModalEscolhaAlvo();
    });

    containerOpcoes.appendChild(opcao);
  });

  // Garante que o evento do botão de cancelar seja registrado corretamente
  cancelarBotao.removeEventListener("click", fecharModalEscolhaAlvo);
  cancelarBotao.addEventListener("click", fecharModalEscolhaAlvo);

  modal.style.display = "block";
}

function fecharModalEscolhaAlvo() {
  modalAlvoAberto = false;
  document.getElementById("modal-escolher-alvo").style.display = "none";
}
function selecionarAlvoCampo(habilidade) {
  return new Promise((resolve) => {
    const alvos = document.querySelectorAll(".field-slot img");

    alvos.forEach((alvo) => {
      alvo.classList.add("alvo-selecionavel"); // Adiciona estilo visual ao alvo
      alvo.addEventListener("click", function handleClick() {
        alvos.forEach((a) => a.classList.remove("alvo-selecionavel"));
        alvo.removeEventListener("click", handleClick);
        console.log(`Alvo escolhido para ${habilidade}: ${alvo.id}`);
        resolve(alvo); // Retorna o alvo escolhido
      });
    });
  });
}
function aplicarEfeitoStatus(ninjaSuporte, ninjaAlvo, efeito) {
  console.log(`Aplicando ${efeito} em ${ninjaAlvo.dataset.name}`);

  if (efeito === "poising") {
    ninjaAlvo.dataset.poising = "true";
  } else if (efeito === "paralyze") {
    ninjaAlvo.dataset.paralyze = "true";
    ninjaAlvo.dataset.speedOriginal = ninjaAlvo.dataset.speed || 0;
    ninjaAlvo.dataset.speed = 0;
  }

  if (ninjaAlvo.closest("#player-leader-slot")) {
    atualizarAtributosLider(ninjaAlvo);
  } else if (ninjaAlvo.closest("#ia-leader-slot")) {
    atualizarAtributosLiderIA(ninjaAlvo);
  }
}
function calcularProbabilidade(ninjaSuporte, ninjaAlvo) {
  const chanceBase = parseInt(ninjaSuporte.dataset.chance, 10);
  const diferencaVelocidade =
    parseInt(ninjaSuporte.dataset.speed, 10) -
    parseInt(ninjaAlvo.dataset.speed, 10);

  let chance = chanceBase + diferencaVelocidade;
  chance = Math.min(90, Math.max(20, chance));

  console.log(
    `Calcular Probabilidade - Base: ${chanceBase}%, Diferença Velocidade: ${diferencaVelocidade}, Resultado Final: ${chance}%`
  );
  return chance;
}
function abrirModalEscolhaBaralho(type, filtro, quantidade, deck, mao) {
  const modal = document.getElementById("baralhoModal");
  const modalBody = document.getElementById("baralhoModalBody");
  const modalConfirmButton = document.getElementById("baralhoModalConfirm");

  modalBody.innerHTML = "";

  const cartasFiltradas = deck.filter(filtro);
  if (cartasFiltradas.length === 0) {
    alert(`Não há cartas do type "${type}" disponíveis.`);
    return;
  }

  cartasFiltradas.forEach((card) => {
    const cardElement = document.createElement("img");
    cardElement.src = card.photo;
    cardElement.alt = card.name;
    cardElement.classList.add("modal-card");
    cardElement.dataset.idCard = card.idCard;

    cardElement.addEventListener("click", () => {
      if (
        document.querySelectorAll(".modal-card.selected").length < quantidade
      ) {
        cardElement.classList.toggle("selected");
      }
    });

    modalBody.appendChild(cardElement);
  });

  modal.style.display = "block";

  modalConfirmButton.onclick = () => {
    const selectedCards = [
      ...modalBody.querySelectorAll(".modal-card.selected"),
    ];

    if (selectedCards.length !== quantidade) {
      alert(`Por favor, selecione exatamente ${quantidade} card(s).`);
      return;
    }

    selectedCards.forEach((selectedCard) => {
      const cardId = selectedCard.dataset.idCard;
      const cardSelecionado = deck.find((card) => card.idCard === cardId);

      if (cardSelecionado) {
        mao.push(cardSelecionado);
        deck.splice(deck.indexOf(cardSelecionado), 1);
      }
    });

    embaralharBaralho(deck);
    renderizarMao(mao);

    modal.style.display = "none";
  };
}
function abrirModalEscolhaDescarte(type, filtro, quantidade, descarte, mao) {
  const modal = document.getElementById("descarteModal");
  const modalBody = document.getElementById("descarteModalBody");
  const modalConfirmButton = document.getElementById("descarteModalConfirm");

  modalBody.innerHTML = "";

  const cartasFiltradas = descarte.filter(filtro);
  if (cartasFiltradas.length === 0) {
    alert(`Não há cartas do type "${type}" no descarte.`);
    return;
  }

  cartasFiltradas.forEach((card) => {
    const cardElement = document.createElement("img");
    cardElement.src = card.photo;
    cardElement.alt = card.name;
    cardElement.classList.add("modal-card");
    cardElement.dataset.idCard = card.idCard;

    cardElement.addEventListener("click", () => {
      if (
        document.querySelectorAll(".modal-card.selected").length < quantidade
      ) {
        cardElement.classList.toggle("selected");
      }
    });

    modalBody.appendChild(cardElement);
  });

  modal.style.display = "block";

  modalConfirmButton.onclick = () => {
    const selectedCards = [
      ...modalBody.querySelectorAll(".modal-card.selected"),
    ];

    if (selectedCards.length !== quantidade) {
      alert(`Por favor, selecione exatamente ${quantidade} card(s).`);
      return;
    }

    selectedCards.forEach((selectedCard) => {
      const cardId = selectedCard.dataset.idCard;
      const cardSelecionado = descarte.find((card) => card.idCard === cardId);

      if (cardSelecionado) {
        mao.push(cardSelecionado);
        descarte.splice(descarte.indexOf(cardSelecionado), 1);
      }
    });

    renderizarMao("J1");

    modal.style.display = "none";
  };
}
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carousel-container");
  if (carousel) {
    carousel.style.display = "none"; // Oculta o carrossel na inicialização
  }
});
async function escolherCardPorCarrossel(type, filtro, quantidade, deck, mao) {
  console.log(
    `🔍 Abrindo carrossel para escolher ${quantidade} carta(s) do tipo ${type}...`
  );

  const carouselContainer = document.getElementById("carousel-container");
  if (!carouselContainer) {
    console.error("❌ Erro: O carrossel não foi encontrado no DOM.");
    return null;
  }

  // Filtra cartas válidas
  const cartasFiltradas = deck.filter(filtro); /*.filter(card => card.id)*/
  if (cartasFiltradas.length === 0) {
    console.warn(
      `⚠️ Não há cartas do tipo "${type}" disponíveis com imagem válida.`
    );
    return null;
  }

  let indexAtual = 0;
  let cartasEscolhidas = [];

  function atualizarCarrossel() {
    //console.log("🗂️ Atualizando carrossel...");

    const carrosselContainer = document.getElementById("carrossel-container");
    if (!carrosselContainer) {
      console.error("❌ Erro: Carrossel não encontrado.");
      return;
    }

    carrosselContainer.innerHTML = ""; // Limpa antes de adicionar novas cartas

    if (cartasFiltradas.length === 0) {
      console.warn("⚠️ Nenhuma carta disponível para exibir no carrossel.");
      return;
    }

    const card = cartasFiltradas[indexAtual];

    const cardElement = document.createElement("img");
    cardElement.src = card.photo;
    cardElement.alt = card.name || "Carta sem nome";
    cardElement.dataset.id = card.id || card.idCard;
    cardElement.dataset.type = card.type;
    carrosselContainer.appendChild(cardElement);

    //console.log(`📌 Exibindo carta ${indexAtual + 1}/${cartasFiltradas.length}: ${card.name}`);
  }

  atualizarCarrossel();

  // **Verifica se os botões existem antes de definir os eventos**
  const prevCardBtn = document.getElementById("prev-card");
  const nextCardBtn = document.getElementById("next-card");
  const confirmCardBtn = document.getElementById("confirm-card");
  const cancelCardBtn = document.getElementById("cancel-card");

  if (!prevCardBtn || !nextCardBtn || !confirmCardBtn || !cancelCardBtn) {
    console.error(
      "❌ Um ou mais botões do carrossel não foram encontrados no DOM."
    );
    return null;
  }

  prevCardBtn.onclick = () => {
    indexAtual =
      (indexAtual - 1 + cartasFiltradas.length) % cartasFiltradas.length;
    atualizarCarrossel();
  };

  nextCardBtn.onclick = () => {
    indexAtual = (indexAtual + 1) % cartasFiltradas.length;
    atualizarCarrossel();
  };

  return new Promise((resolve) => {
    confirmCardBtn.onclick = () => {
      try {
        const cartaSelecionada = cartasFiltradas[indexAtual];

        if (cartaSelecionada && !cartasEscolhidas.includes(cartaSelecionada)) {
          cartasEscolhidas.push(cartaSelecionada);
          deck.splice(deck.indexOf(cartaSelecionada), 1);
          console.log(`✔ Carta escolhida: ${cartaSelecionada.name}`);
        }

        if (cartasEscolhidas.length >= quantidade) {
          cartasEscolhidas.forEach((card) => mao.push(card));
          cartasEscolhidas.forEach((card) => jogadorMao.push(card));
          renderizarMao(jogadorMao);

          carouselContainer.style.display = "none";
          resolve(cartasEscolhidas);
        } else {
          console.log(
            `Ainda precisa escolher ${
              quantidade - cartasEscolhidas.length
            } carta(s).`
          );
        }
      } catch (error) {
        console.error("❌ Erro ao confirmar carta:", error);
        resolve(null);
      }
    };

    cancelCardBtn.onclick = () => {
      console.log("🚫 Escolha cancelada pelo jogador.");
      carouselContainer.style.display = "none";
      resolve(null);
    };

    carouselContainer.style.display = "block";
  });
}

function removerDoDescarte(idCard) {
  descarteJ1 = descarteJ1.filter((card) => card.idCard !== idCard);
}
function modificarAtributo(ninja, atributo, valor) {
  if (!ninja.dataset[atributo]) {
    console.warn(
      `Atributo ${atributo} não encontrado para o ninja ${ninja.dataset.name}.`
    );
    return;
  }

  const valorAtual = parseInt(ninja.dataset[atributo], 10) || 0;
  ninja.dataset[atributo] = valorAtual + valor;

  console.log(
    `Atributo ${atributo} do ninja ${ninja.dataset.name} aumentado em ${valor}. Novo valor: ${ninja.dataset[atributo]}`
  );

  // Se o ninja afetado for o líder, atualizar os atributos do líder
  if (ninja.parentElement.id === "player-leader-slot") {
    atualizarAtributosLider(ninja);
  } else if (ninja.parentElement.id === "ia-leader-slot") {
    atualizarAtributosLiderIA(ninja);
  }
}
//auxiliares
function aplicarDanoDireto(alvo, dano) {
  if (!alvo || !alvo.dataset.hp) {
    console.warn("Alvo inválido para dano direto.");
    return;
  }

  const hpAtual = parseInt(alvo.dataset.hp, 10) || 0;
  alvo.dataset.hp = Math.max(0, hpAtual - dano); // Garante que o HP não fique negativo
  console.log(
    `${alvo.dataset.name} recebeu ${dano} de dano direto! HP restante: ${alvo.dataset.hp}`
  );

  if (alvo.dataset.hp <= 0) {
    console.log(`${alvo.dataset.name} foi derrotado!`);
    adicionarAoDescarte(alvo); // Remove o ninja derrotado do campo
  }
}
function curarAlvo(alvo, quantidade) {
  if (!alvo || !alvo.dataset.hp || !alvo.dataset.hpInicial) {
    console.warn("Alvo inválido para cura.");
    return;
  }

  const hpAtual = parseInt(alvo.dataset.hp, 10) || 0;
  const hpMax = parseInt(alvo.dataset.hpInicial, 10) || 0;
  alvo.dataset.hp = Math.min(hpMax, hpAtual + quantidade); // Garante que o HP não passe do máximo
  console.log(
    `${alvo.dataset.name} foi curado em ${quantidade} HP! HP atual: ${alvo.dataset.hp}`
  );
}
function copiarJutsu(origem, alvo) {
  if (!origem || !alvo || !alvo.dataset.jutsus) {
    console.warn("Origem ou alvo inválidos para copiar Jutsu.");
    return;
  }

  let jutsusAlvo = JSON.parse(alvo.dataset.jutsus);
  if (jutsusAlvo.length === 0) {
    console.warn(`${alvo.dataset.name} não possui jutsus para serem copiados.`);
    return;
  }

  // Recupera os jutsus atuais do atacante e adiciona os novos
  let jutsusOrigem = JSON.parse(origem.dataset.jutsus || "[]");
  jutsusAlvo.forEach((jutsu) => {
    // Evita duplicatas
    if (
      !jutsusOrigem.some(
        (existingJutsu) => existingJutsu.nameJutsu === jutsu.nameJutsu
      )
    ) {
      jutsusOrigem.push(jutsu);
      console.log(
        `${origem.dataset.name} copiou o Jutsu "${jutsu.nameJutsu}" de ${alvo.dataset.name}`
      );
    } else {
      console.log(
        `${origem.dataset.name} já possui o Jutsu "${jutsu.nameJutsu}", não será copiado.`
      );
    }
  });

  // Atualiza os jutsus do atacante
  origem.dataset.jutsus = JSON.stringify(jutsusOrigem);
}
function aplicarConfusao(alvo) {
  if (!alvo) {
    console.warn("Alvo inválido para Confusão.");
    return;
  }
  console.log(
    `${alvo.dataset.name} está confuso e atacará um aliado ou a si mesmo no próximo turno!`
  );
  alvo.dataset.confusion = "true";
}
function aumentarEvasiva(alvo, quantidade) {
  if (!alvo || !alvo.dataset.velocidade) {
    console.warn("Alvo inválido para aumentar evasiva.");
    return;
  }

  const evasivaMaxima = 85; // Valor máximo permitido para evasiva
  let velocidadeAtual = parseInt(alvo.dataset.velocidade, 10) || 0;
  let novaVelocidade = Math.min(evasivaMaxima, velocidadeAtual + quantidade);

  alvo.dataset.velocidade = novaVelocidade;
  console.log(
    `${alvo.dataset.name} aumentou sua evasiva em ${quantidade}. Nova velocidade: ${novaVelocidade}`
  );
}
function trocarMaoPor5Cards(jogador, deck, mao, deckSlotId) {
  console.log(
    `Trocando mão por 5 cards. Cartas na mão antes: ${mao?.length || 0}`
  );

  // Garante que mao seja um array
  if (!Array.isArray(mao)) {
    console.error("Erro: mao não é um array válido. Redefinindo...");
    mao = [];
  }

  // Identifica se é o J1 ou a IA
  const isJ1 = jogador === "J1";

  // Retorna todas as cartas da mão para o deck
  deck.push(...mao);
  mao.length = 0; // Esvazia a mão

  // Embaralha o deck
  deck.sort(() => Math.random() - 0.5);

  // Compra 5 novas cartas
  for (let i = 0; i < 5; i++) {
    comprarCard(deck, mao, deckSlotId);
  }

  console.log(`Nova mão do jogador: ${mao.length} cartas`);

  // Atualiza a interface conforme o jogador
  isJ1 ? renderizarMao(mao) : renderizarMaoIA(mao);
}
function reduzirVelocidadeTodos(origem) {
  if (!origem || !origem.dataset.jogador) {
    console.error(
      "❌ Erro: Ninja de origem inválido ou sem identificação de jogador."
    );
    return;
  }

  const jogador = origem.dataset.jogador; // "J1" ou "IA"
  const alvos =
    jogador === "J1"
      ? document.querySelectorAll(
          "#ia-leader-slot img, #ia-supports .field-slot img"
        )
      : document.querySelectorAll(
          "#player-leader-slot img, #player-supports .field-slot img"
        );

  console.log(
    `🔻 ${
      origem.dataset.name
    } está reduzindo a velocidade de todos os ninjas do oponente (${
      jogador === "J1" ? "IA" : "J1"
    })!`
  );

  alvos.forEach((ninja) => {
    if (ninja.dataset.speed) {
      let speedAtual = parseInt(ninja.dataset.speed, 10) || 0;
      let reducao = 10; // Valor fixo da redução (ajustável)

      ninja.dataset.speed = Math.max(speedAtual - reducao, 0); // Garante que a velocidade não fique negativa
      console.log(
        `⚡ ${ninja.dataset.name} teve a velocidade reduzida para ${ninja.dataset.speed}`
      );
    }
  });

  // Atualiza a interface do líder, caso seja afetado
  const liderOponente =
    jogador === "J1"
      ? document.querySelector("#ia-leader-slot img")
      : document.querySelector("#player-leader-slot img");

  if (liderOponente) {
    jogador === "J1"
      ? atualizarAtributosLiderIA(liderOponente)
      : atualizarAtributosLider(liderOponente);
  }
}
function escolherSuporteManual(suportesDisponiveis, callback) {
  console.log("🎯 Escolha um suporte da IA para ser o novo líder.");

  suportesDisponiveis.forEach((suporte) => {
    suporte.classList.add("selecionavel");

    suporte.addEventListener("click", function selecionarSuporte() {
      console.log(`✅ Suporte escolhido: ${suporte.dataset.name}`);

      // Remove os eventos e o destaque
      suportesDisponiveis.forEach((s) => {
        s.classList.remove("selecionavel");
        s.removeEventListener("click", selecionarSuporte);
      });

      // Executa a callback passando o suporte escolhido
      callback(suporte);
    });
  });
}

// 🔄 Troca o líder da IA por um suporte
function mudarLiderIA(novoLider) {
  const slotLiderIA = document.getElementById("ia-leader-slot");
  const slotOrigem = novoLider.closest(".field-slot");

  if (!novoLider || !slotLiderIA || !slotOrigem) {
    console.error("❌ Erro ao tentar mudar o líder da IA.");
    return;
  }

  const liderAtual = slotLiderIA.querySelector("img");

  if (!liderAtual) {
    // Caso não haja líder atual, apenas move o novo líder para o slot de líder
    slotLiderIA.innerHTML = "";
    slotLiderIA.appendChild(novoLider);
    console.log(`🔄 ${novoLider.dataset.name} agora é o líder da IA.`);
  } else {
    // Usa a função trocarCards para realizar a troca corretamente
    trocarCards(liderAtual, novoLider, slotLiderIA, slotOrigem);
  }
}

// 🔄 Troca o líder do J1 por um suporte
function mudarLiderJ1(novoLider) {
  const slotLiderJ1 = document.getElementById("player-leader-slot");
  const slotOrigem = novoLider.closest(".field-slot");

  if (!novoLider || !slotLiderJ1 || !slotOrigem) {
    console.error("❌ Erro ao tentar mudar o líder do J1.");
    return;
  }

  const liderAtual = slotLiderJ1.querySelector("img");

  if (!liderAtual) {
    // Caso não haja líder atual, apenas move o novo líder para o slot de líder
    slotLiderJ1.innerHTML = "";
    slotLiderJ1.appendChild(novoLider);
    console.log(`🔄 ${novoLider.dataset.name} agora é o líder do J1.`);
  } else {
    // Usa a função trocarCards para realizar a troca corretamente
    trocarCards(liderAtual, novoLider, slotLiderJ1, slotOrigem);
  }
}

//chakra
function aplicarEnergia(cardDestino, cardOrigem) {
  const effect = cardOrigem.dataset.effect;
  if (!effect) {
    console.log(`O card ${cardOrigem.id} não possui effect definido.`);
    return;
  }

  console.log(
    `Aplicando effect de ${cardOrigem.id} no ninja ${cardDestino.id}`
  );

  // Divide os Efeitos e remove strings vazias
  const effects = effect
    .split(";")
    .map((e) => e.trim())
    .filter((e) => e);

  console.log("Efeitos identificados:", effects);

  let effectAplicado = false; // Controle para saber se algum effect foi aplicado

  effects.forEach((effectStr) => {
    const [atributo, valor] = effectStr.split(":").map((e) => e.trim());

    if (!atributo || !valor) {
      console.log(`Efeito inválido ignorado: ${effectStr}`);
      return;
    }

    // Incrementa ou decrementa o valor no dataset do ninja
    if (cardDestino.dataset[atributo] !== undefined) {
      const valorAtual = parseInt(cardDestino.dataset[atributo], 10) || 0;
      cardDestino.dataset[atributo] = valorAtual + parseInt(valor, 10);

      console.log(
        `Atributo ${atributo} de ${valorAtual} atualizado para: ${cardDestino.dataset[atributo]}`
      );
      effectAplicado = true;
    } else {
      console.log(`Atributo ${atributo} não encontrado no card de destino.`);
    }
  });

  // Atualiza atributos do líder se o effect foi aplicado e o destino for o líder
  if (effectAplicado && cardDestino.parentElement.id === "player-leader-slot") {
    //console.log("Atualizando atributos do líder do jogador...");
    atualizarAtributosLider(cardDestino);
  } else if (
    effectAplicado &&
    cardDestino.parentElement.id === "ia-leader-slot"
  ) {
    console.log("Atualizando atributos do líder da IA...");
    atualizarAtributosLiderIA(cardDestino);
  }
}
