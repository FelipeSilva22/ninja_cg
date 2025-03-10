/*Inicio DragandDrop*/
function initializeDragAndDrop() {
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    initializeTouchEvents();
  } else {
    dragAndDrop();
  }
}
function dragAndDrop() {
  // Seleciona os cards na mão do jogador
  const cards = document.querySelectorAll(".hand-card, .field-card");

  // Seleciona os slots válidos com base no estado atual
  const slots = document.querySelectorAll(".field-slot");

  // Configura eventos de drag nos cards
  cards.forEach((card) => {
    const type = card.dataset.type;
    const stage = parseInt(card.dataset.stage, 10);

    // Impede que os cards da IA sejam arrastados
    if (card.closest("#ia-area")) {
      card.setAttribute("draggable", "false");
      card.removeEventListener("dragstart", dragStartHandler);
      return;
    }

    // Configuração para o estado "novoLider"
    if (estadoAtual === "novoLider") {
      const slotOrigem = card.parentElement;

      // Permite arrastar apenas cards no suporte do J1
      if (slotOrigem && slotOrigem.id.startsWith("supJ1")) {
        card.setAttribute("draggable", "true");
        card.addEventListener("dragstart", dragStartHandler);
      } else {
        card.setAttribute("draggable", "false");
        card.removeEventListener("dragstart", dragStartHandler);
      }
    }
    // Configuração para os estados "formacao" ou "preparacao"
    else if (estadoAtual === "formacao" && (type !== "Ninja" || stage !== 1)) {
      card.setAttribute("draggable", "false");
      card.removeEventListener("dragstart", dragStartHandler);
    } else {
      card.setAttribute("draggable", "true");
      card.addEventListener("dragstart", dragStartHandler);
    }
  });

  // Configura eventos de drag nos slots
  slots.forEach((slot) => {
    const isLeaderSlot = slot.id === "player-leader-slot";

    // Bloqueia slots da IA
    if (slot.closest("#ia-area")) {
      slot.removeEventListener("dragover", dragOverHandler);
      slot.removeEventListener("drop", handleDrop);
      return;
    }

    // Configuração para o estado "premio"
    if (estadoAtual === "novoLider") {
      if (isLeaderSlot) {
        slot.addEventListener("dragover", dragOverHandler);
        slot.addEventListener("drop", handleDrop);
      } else {
        slot.removeEventListener("dragover", dragOverHandler);
        slot.removeEventListener("drop", handleDrop);
      }
    }
    // Configuração para os estados "formacao" ou "preparacao"
    else {
      slot.addEventListener("dragover", dragOverHandler);
      slot.addEventListener("drop", handleDrop);
    }
  });
}
function dragStartHandler(e) {
  const cardId = e.target.id; // ID do card sendo arrastado

  e.dataTransfer.setData("cardId", cardId);
  //console.log(`Card arrastado: ${cardId}`);
}
function dragOverHandler(e) {
  e.preventDefault(); // Permite o drop
}
function handleDrop(e) {
  e.preventDefault();

  const cardId = e.dataTransfer.getData("cardId"); // ID do card arrastado
  const card = document.getElementById(cardId); // Elemento do card arrastado
  const slotDestino = e.currentTarget; // Slot de destino
  const slotOrigem = card.parentElement; // Slot de origem do card
  const cardDestino = slotDestino.querySelector("img"); // Card já no slot de destino, se houver

  //console.log(`Tentando soltar o card: ${cardId} no slot: ${slotDestino.id}`);

  // Chama o processamento com as variáveis
  processarDrop(card, slotOrigem, cardDestino, slotDestino);
}
function initializeTouchEvents() {
  const cards = document.querySelectorAll(".hand-card, .field-card");
  const slots = document.querySelectorAll(".field-slot");
  let cardBeingDragged = null;

  // Configurar eventos touchstart, touchmove e touchend
  cards.forEach((card) => {
    card.addEventListener("touchstart", (e) => {
      cardBeingDragged = card;
      card.classList.add("dragging");
      // Salva a posição inicial
      const touch = e.touches[0];
      card.style.position = "absolute";
      card.style.left = `${touch.clientX - card.offsetWidth / 2}px`;
      card.style.top = `${touch.clientY - card.offsetHeight / 2}px`;
    });

    card.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (cardBeingDragged) {
        const touch = e.touches[0];
        cardBeingDragged.style.left = `${
          touch.clientX - cardBeingDragged.offsetWidth / 2
        }px`;
        cardBeingDragged.style.top = `${
          touch.clientY - cardBeingDragged.offsetHeight / 2
        }px`;
      }
    });

    card.addEventListener("touchend", (e) => {
      if (cardBeingDragged) {
        const touch = e.changedTouches[0];
        cardBeingDragged.classList.remove("dragging");
        cardBeingDragged.style.position = "initial";

        const targetSlot = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        );

        // Verifica se o alvo é um slot válido
        if (targetSlot && targetSlot.classList.contains("field-slot")) {
          processarDrop(
            cardBeingDragged,
            cardBeingDragged.parentElement,
            targetSlot.querySelector("img"),
            targetSlot
          );
        }

        cardBeingDragged = null;
      }
    });
  });

  console.log("Touch drag and drop initialized.");
}
function processarDrop(cardOrigem, slotOrigem, cardDestino, slotDestino) {
  console.log(
    `Processando drop: cardOrigem=${cardOrigem.id}, slotOrigem=${
      slotOrigem.id
    }, cardDestino=${cardDestino?.id || "null"}, slotDestino=${slotDestino.id}`
  );
  // Validação: Slot de origem é igual ao slot de destino
  if (slotOrigem === slotDestino) {
    console.log("O card foi solto no mesmo slot de origem. Ação ignorada.");
    return;
  }
  // Validação do estadoAtual
  if (estadoAtual === "formacao") {
    // Caso 1: Soltar em slot ocupado a partir da mão
    if (slotOrigem.id === "maoJ1" && cardDestino) {
      alert("Você só pode soltar um Ninja Estágio 1 em um slot vazio!");
      return;
    }
    // Caso 2: Soltar de mão em slot vazio
    if (slotOrigem.id === "maoJ1" && !cardDestino) {
      //console.log(`Movendo card da mão para slot vazio: ${cardOrigem.id} -> ${slotDestino.id}`);
      moverCard(cardOrigem, slotDestino);
      removerCardDaMao(cardOrigem, "J1");
      adicionarAoCampo(cardOrigem, "J1");
      return;
    }
    // Caso 3: Soltar de campo em slot vazio
    if (slotOrigem.id !== "maoJ1" && !cardDestino) {
      console.log(
        `Movendo card no campo: ${cardOrigem.id} -> ${slotDestino.id}`
      );
      moverCard(cardOrigem, slotDestino, slotOrigem);
      return;
    }
    // Caso 4: Soltar de campo em slot ocupado
    if (slotOrigem.id !== "maoJ1" && cardDestino) {
      console.log(`Trocando cards: ${cardOrigem.id} <-> ${cardDestino.id}`);
      trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
      return;
    }
    console.log("Ação inválida para a fase de formação.");
  } else if (estadoAtual === "preparacao") {
    const type = cardOrigem.dataset.type;
    const cardStage = parseInt(cardOrigem.dataset.stage, 10); // Estágio do Ninja
    //console.log(`Chakra já usado antes do If? ${chakraUsado}`);
    if (type === "Chakra" && cardDestino) {
      if (chakraUsado) {
        alert("Você já usou um Chakra neste turno.");
        return;
      }

      aplicarEnergia(cardDestino, cardOrigem);

      // ✅ Remove o Chakra da mão e adiciona ao descarte corretamente
      removerCardDaMao(cardOrigem, "J1"); // Remover do array da mão
      adicionarAoDescarte(cardOrigem); // Adicionar ao array de descarte

      // ✅ Move o card visualmente no DOM
      document.getElementById("player-discard-slot").appendChild(cardOrigem);

      // Marca que o chakra foi usado neste turno
      chakraUsado = true;
    } else if (type === "Tool" && cardDestino) {
      if (cardDestino.dataset.toolUsado === "true") {
        alert("Este ninja já recebeu um Tool neste turno.");
        return;
      }

      aplicarEfeito(
        cardOrigem,
        cardDestino,
        cardOrigem.dataset.effect,
        100,
        "J1"
      );

      // ✅ Remove o Tool da mão e adiciona ao descarte corretamente
      removerCardDaMao(cardOrigem, "J1");
      adicionarAoDescarte(cardOrigem);

      // ✅ Move o card visualmente no DOM
      document.getElementById("player-discard-slot").appendChild(cardOrigem);

      // Marca que o Tool foi usado no ninja neste turno
      cardDestino.dataset.toolUsado = "true";
    } else if (type === "Ninja") {
      // Lógica para Ninja Estágio 1
      if (cardStage === 1) {
        // Caso 1: Mão para slot ocupado
        if (slotOrigem.id === "maoJ1" && cardDestino) {
          alert("Você só pode soltar um Ninja Estágio 1 em um slot vazio!");
          return;
        }
        // Caso 2: Mão para slot vazio
        if (slotOrigem.id === "maoJ1" && !cardDestino) {
          //console.log(`Movendo Ninja Estágio 1 (${cardOrigem.id}) da mão para slot vazio (${slotDestino.id})`);
          moverCard(cardOrigem, slotDestino);
          removerCardDaMao(cardOrigem, "J1");
          adicionarAoCampo(cardOrigem, "J1");
          return;
        }
        // Caso 3: Suporte para outro slot vazio
        if (
          slotOrigem.id.startsWith("supJ1") &&
          !cardDestino &&
          slotDestino.id !== "player-leader-slot"
        ) {
          console.log(
            `Movendo Ninja (${cardOrigem.id}) do suporte (${slotOrigem.id}) para slot vazio (${slotDestino.id})`
          );
          moverCard(cardOrigem, slotDestino, slotOrigem);
          return;
        }
        // Caso 4: Suporte para líder (slot vazio)
        if (
          slotOrigem.id.startsWith("supJ1") &&
          !cardDestino &&
          slotDestino.id === "player-leader-slot"
        ) {
          const confirmar = confirm(
            "Mover este ninja para o slot de líder custará 20 de chakra. Deseja continuar?"
          );
          if (confirmar) {
            const chakraAtual = parseInt(cardOrigem.dataset.chakra, 10);
            if (chakraAtual >= 20) {
              cardOrigem.dataset.chakra = chakraAtual - 20;
              console.log(`Reduzindo 20 de chakra do ninja (${cardOrigem.id})`);
              moverCard(cardOrigem, slotDestino, slotOrigem);
            } else {
              alert("O ninja não possui chakra suficiente para esta troca.");
            }
          }
          return;
        }
        // Caso 5: Suporte para outro slot ocupado (não líder)
        if (
          slotOrigem.id.startsWith("supJ1") &&
          cardDestino &&
          slotDestino.id !== "player-leader-slot"
        ) {
          console.log(
            `Trocando ninjas entre suporte (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`
          );
          trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
          return;
        }
        // Caso 6: Suporte para líder (slot ocupado)
        if (
          slotOrigem.id.startsWith("supJ1") &&
          cardDestino &&
          slotDestino.id === "player-leader-slot"
        ) {
          const confirmar = confirm(
            "Trocar este ninja com o líder custará 20 de chakra de cada ninja. Deseja continuar?"
          );
          if (confirmar) {
            const chakraOrigem = parseInt(cardOrigem.dataset.chakra, 10);
            const chakraDestino = parseInt(cardDestino.dataset.chakra, 10);
            if (chakraOrigem >= 20 && chakraDestino >= 20) {
              cardOrigem.dataset.chakra = chakraOrigem - 20;
              cardDestino.dataset.chakra = chakraDestino - 20;
              console.log(
                `Reduzindo 20 de chakra de ${cardOrigem.id} e ${cardDestino.id}`
              );
              trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
            } else {
              alert(
                "Um ou ambos os ninjas não possuem chakra suficiente para esta troca."
              );
            }
          }
          return;
        }
        // Caso 7: Líder para outro slot vazio
        if (slotOrigem.id === "player-leader-slot" && !cardDestino) {
          alert(
            "O líder só pode ser trocado por outro ninja. Esta ação é inválida."
          );
          return;
        }
        // Caso 8: Líder para outro slot ocupado
        if (slotOrigem.id === "player-leader-slot" && cardDestino) {
          const confirmar = confirm(
            "Trocar o líder custará 20 de chakra de cada ninja. Deseja continuar?"
          );
          if (confirmar) {
            const chakraOrigem = parseInt(cardOrigem.dataset.chakra, 10);
            const chakraDestino = parseInt(cardDestino.dataset.chakra, 10);
            if (chakraOrigem >= 20 && chakraDestino >= 20) {
              cardOrigem.dataset.chakra = chakraOrigem - 20;
              cardDestino.dataset.chakra = chakraDestino - 20;
              console.log(
                `Reduzindo 20 de chakra de ${cardOrigem.id} e ${cardDestino.id}`
              );
              trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
            } else {
              alert(
                "Um ou ambos os ninjas não possuem chakra suficiente para esta troca."
              );
            }
          }
          return;
        }
      }
      // Lógica para Ninja Estágio 2 ou 3
      if (cardStage === 2 || cardStage === 3) {
        // Validação para evolução do Ninja
        if (slotOrigem.id === "maoJ1") {
          if (!cardDestino || cardDestino.dataset.type !== "Ninja") {
            alert(
              "Esse ninja só pode evoluir um Ninja no campo, não pode invocar em slot vazio"
            );
            return;
          }
          console.log(`Iniciando validação de evolução para ${cardOrigem.id}`);
          validarEvolucao(cardOrigem, cardDestino, slotOrigem, slotDestino);
          return;
        }
        // Movimentação ou troca no campo
        if (
          slotOrigem.id.startsWith("supJ1") ||
          slotOrigem.id === "player-leader-slot"
        ) {
          // Slot vazio
          if (!cardDestino) {
            if (slotDestino.id === "player-leader-slot") {
              const confirmar = confirm(
                "Mover este ninja para o slot de líder custará 20 de chakra. Deseja continuar?"
              );
              if (confirmar) {
                const chakraAtual = parseInt(cardOrigem.dataset.chakra, 10);
                if (chakraAtual >= 20) {
                  cardOrigem.dataset.chakra = chakraAtual - 20;
                  console.log(
                    `Reduzindo 20 de chakra do ninja (${cardOrigem.id})`
                  );
                  moverCard(cardOrigem, slotDestino, slotOrigem);
                } else {
                  alert(
                    "O ninja não possui chakra suficiente para esta troca."
                  );
                }
              }
            } else {
              console.log(
                `Movendo Ninja (${cardOrigem.id}) para slot vazio (${slotDestino.id})`
              );
              moverCard(cardOrigem, slotDestino, slotOrigem);
            }
            return;
          }
          // Slot ocupado
          if (cardDestino) {
            if (slotDestino.id === "player-leader-slot") {
              const confirmar = confirm(
                "Trocar este ninja com o líder custará 20 de chakra de cada ninja. Deseja continuar?"
              );
              if (confirmar) {
                const chakraOrigem = parseInt(cardOrigem.dataset.chakra, 10);
                const chakraDestino = parseInt(cardDestino.dataset.chakra, 10);
                if (chakraOrigem >= 20 && chakraDestino >= 20) {
                  cardOrigem.dataset.chakra = chakraOrigem - 20;
                  cardDestino.dataset.chakra = chakraDestino - 20;
                  console.log(
                    `Reduzindo 20 de chakra de ${cardOrigem.id} e ${cardDestino.id}`
                  );
                  trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
                } else {
                  alert(
                    "Um ou ambos os ninjas não possuem chakra suficiente para esta troca."
                  );
                }
              }
            } else {
              console.log(
                `Trocando ninjas entre ${cardOrigem.id} e ${cardDestino.id} nos slots ${slotOrigem.id} e ${slotDestino.id}`
              );
              trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
            }
            return;
          }
        }
      }
    }
  } else if (estadoAtual === "novoLider") {
    if (
      !slotOrigem.id.startsWith("supJ1") ||
      slotDestino.id !== "player-leader-slot"
    ) {
      alert("Você só pode mover ninjas de suporte para o slot de líder!");
      return;
    }
    // Caso 1: Suporte para outro slot vazio
    if (
      slotOrigem.id.startsWith("supJ1") &&
      !cardDestino &&
      slotDestino.id !== "player-leader-slot"
    ) {
      console.log(
        `Movendo Ninja (${cardOrigem.id}) do (${slotOrigem.id}) para slot vazio (${slotDestino.id})`
      );
      moverCard(cardOrigem, slotDestino, slotOrigem);
      return;
    }
    // Caso 2: Suporte para líder (slot vazio)
    if (
      slotOrigem.id.startsWith("supJ1") &&
      !cardDestino &&
      slotDestino.id === "player-leader-slot"
    ) {
      console.log(
        `Movendo Ninja (${cardOrigem.id}) do (${slotOrigem.id}) para slot vazio (${slotDestino.id})`
      );
      moverCard(cardOrigem, slotDestino, slotOrigem);
    }
    // Caso 3: Suporte para outro slot ocupado (não líder)
    if (
      slotOrigem.id.startsWith("supJ1") &&
      cardDestino &&
      slotDestino.id !== "player-leader-slot"
    ) {
      console.log(
        `Trocando ninjas entre (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`
      );
      trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
      return;
    }
    // Caso 4: Suporte para líder (slot ocupado)
    if (
      slotOrigem.id.startsWith("supJ1") &&
      cardDestino &&
      slotDestino.id === "player-leader-slot"
    ) {
      console.log(
        `Trocando ninjas entre (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`
      );
      trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
    }
    // Caso 5: Líder para outro slot vazio
    if (slotOrigem.id === "player-leader-slot" && !cardDestino) {
      alert(
        "O líder só pode ser trocado por outro ninja. Esta ação é inválida."
      );
      return;
    }
    // Caso 6: Líder para outro slot ocupado
    if (slotOrigem.id === "player-leader-slot" && cardDestino) {
      console.log(
        `Trocando ninjas entre (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`
      );
      trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
    }
  }
}
function moverCard(card, slotDestino, slotOrigem = null) {
  //console.log("Entrando na função moverCard");
  if (slotOrigem) {
    slotOrigem.removeAttribute("data-ocupado"); // Marca o slot de origem como desocupado
    console.log(`Slot ${slotOrigem.id} desocupado.`);
  }

  slotDestino.appendChild(card); // Move o card para o slot de destino
  slotDestino.setAttribute("data-ocupado", "true"); // Marca o slot de destino como ocupado
  //console.log(`Card ${card.id} movido para slot ${slotDestino.id}`);
  resetarEstilosCard(card);
  // Atualizar atributos do líder, se necessário
  atualizarLiderSeNecessario(slotOrigem, slotDestino);
}
function trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino) {
  console.log(`Iniciando troca: ${cardOrigem.id} <-> ${cardDestino.id}`);

  // Remove os cards dos slots atuais
  slotOrigem.removeChild(cardOrigem);
  slotDestino.removeChild(cardDestino);

  // Move os cards para os slots opostos
  slotOrigem.appendChild(cardDestino);
  slotDestino.appendChild(cardOrigem);

  // Atualiza os atributos de ocupação
  slotOrigem.setAttribute("data-ocupado", "true");
  slotDestino.setAttribute("data-ocupado", "true");

  console.log(
    `Troca concluída: ${cardOrigem.id} no ${slotDestino.id}, ${cardDestino.id} no ${slotOrigem.id}`
  );
  // Atualizar atributos do líder, se necessário
  atualizarLiderSeNecessario(slotOrigem, slotDestino);
}
function removerCardDaMao(card, jogador) {
  if (!card || !card.id) {
    console.warn("⚠️ Tentativa de remover um card inválido.");
    return;
  }

  console.log(`🔍 Removendo o card: ${card.id} da mão de ${jogador}`);

  if (jogador === "J1") {
    jogadorMao = jogadorMao.filter((c) => c.idCard !== card.id);
    const maoJ1 = document.getElementById("maoJ1");
    if (maoJ1.contains(card)) maoJ1.removeChild(card);
    renderizarMao(jogadorMao);
  } else if (jogador === "IA") {
    iaMao = iaMao.filter((c) => c.idCard !== card.id);
    const maoIA = document.getElementById("maoIA");
    if (maoIA.contains(card)) maoIA.removeChild(card);
    renderizarMaoIA(iaMao);
  }
}
function adicionarAoDescarte(card) {
  const isIA = card.dataset.jogador === "IA";

  // 🔹 Remove classes extras para manter consistência
  card.classList.remove("field-card", "hand-card", "hand-card-ia");
  card.draggable = false;

  // 🔹 Garante que a carta tenha um ID e atributos essenciais antes de adicioná-la ao descarte
  const cardObj = {
    idCard: card.id,
    type: card.dataset.type,
    name: card.dataset.name || "",
    photo: card.src,
    effect: card.dataset.effect || "",
    natureChakra: card.dataset.natureChakra || "",
    stage: card.stage || 1,
  };

  if (isIA) {
    console.log(`🗑️ Adicionando card (${cardObj.id}) ao descarte da IA.`);
    document.querySelector("#ia-discard-slot").appendChild(card);
    arrayDescarteIA.push(cardObj);
  } else {
    console.log(`🗑️ Adicionando card (${card.id}) ao descarte do Jogador.`);
    document.querySelector("#player-discard-slot").appendChild(card);
    arrayDescartePlayer.push(cardObj);
  }
}
function adicionarAoCampo(card, jogador) {
  if (!card || !card.id) {
    console.warn("⚠️ Tentativa de adicionar um card inválido ao campo.");
    return;
  }

  console.log(`🏟️ Adicionando Ninja ${card.id} ao campo de ${jogador}`);

  const cardObj = {
    idCard: card.id,
    type: card.type,
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
  };

  if (jogador === "J1") {
    jogadorField.push(cardObj);
  } else if (jogador === "IA") {
    iaField.push(cardObj);
  }
}
function removerDoCampo(card) {
  if (!card || !card.id) {
    console.warn("⚠️ Tentativa de remover um card inválido do campo.");
    return;
  }

  console.log(`🚨 Removendo ${card.id} do campo.`);

  if (card.closest("#player-area")) {
    jogadorField = jogadorField.filter((c) => c.idCard !== card.id);
  } else if (card.closest("#ia-area")) {
    iaField = iaField.filter((c) => c.idCard !== card.id);
  }
}
function validarEvolucao(cardOrigem, cardDestino, slotOrigem, slotDestino) {
  console.log(`Validando evolução ${cardDestino.id} com ${cardOrigem.id}`);
  const regNOrigem = cardOrigem.dataset.regN;
  const regNDestino = cardDestino.dataset.regN;
  const stageOrigem = parseInt(cardOrigem.dataset.stage, 10);
  const stageDestino = parseInt(cardDestino.dataset.stage, 10);
  const bloqueioEvo = parseInt(cardDestino.dataset.bloqEvo, 10);

  if (
    regNOrigem === regNDestino &&
    stageDestino === stageOrigem - 1 &&
    bloqueioEvo >= stageOrigem
  ) {
    console.log(`Evoluindo ninja (${cardDestino.id}) com ${cardOrigem.id}`);
    evoluirNinja(cardDestino, cardOrigem);
  } else {
    console.log(
      `Bloqueio (${bloqueioEvo}), reg. origem (${regNOrigem}) e reg. destino (${regNDestino})`
    );
    alert(
      "Evolução inválida: Verifique o estágio, regN ou bloqueio de evolução."
    );
    return;
  }
}
function evoluirNinja(ninjaAntigo, ninjaNovo) {
  console.log(
    `🔼 Evoluindo Ninja: ${ninjaAntigo.dataset.name} → ${ninjaNovo.dataset.name}`
  );

  // 🔹 Pegando os valores ATUAIS de chakra antes da evolução
  const chakraAtual = {
    katon: parseInt(ninjaAntigo.dataset.katon, 10) || 0,
    fuuton: parseInt(ninjaAntigo.dataset.fuuton, 10) || 0,
    raiton: parseInt(ninjaAntigo.dataset.raiton, 10) || 0,
    doton: parseInt(ninjaAntigo.dataset.doton, 10) || 0,
    suiton: parseInt(ninjaAntigo.dataset.suiton, 10) || 0,
  };

  // 🔹 Pegando os valores ORIGINAIS do ESTÁGIO ANTERIOR
  const antigosValoresOriginais = {
    katon: parseInt(ninjaAntigo.dataset.katonOriginal, 10) || 0,
    fuuton: parseInt(ninjaAntigo.dataset.fuutonOriginal, 10) || 0,
    raiton: parseInt(ninjaAntigo.dataset.raitonOriginal, 10) || 0,
    doton: parseInt(ninjaAntigo.dataset.dotonOriginal, 10) || 0,
    suiton: parseInt(ninjaAntigo.dataset.suitonOriginal, 10) || 0,
  };

  // 🔹 Pegando os valores ORIGINAIS do NOVO estágio
  const novosValoresOriginais = {
    katon: parseInt(ninjaNovo.dataset.katonOriginal, 10) || 0,
    fuuton: parseInt(ninjaNovo.dataset.fuutonOriginal, 10) || 0,
    raiton: parseInt(ninjaNovo.dataset.raitonOriginal, 10) || 0,
    doton: parseInt(ninjaNovo.dataset.dotonOriginal, 10) || 0,
    suiton: parseInt(ninjaNovo.dataset.suitonOriginal, 10) || 0,
  };

  // 🔹 Calcula o chakra EXTRA que foi adicionado ao ninja antes da evolução
  const chakraExtra = {
    katon: Math.max(0, chakraAtual.katon - antigosValoresOriginais.katon),
    fuuton: Math.max(0, chakraAtual.fuuton - antigosValoresOriginais.fuuton),
    raiton: Math.max(0, chakraAtual.raiton - antigosValoresOriginais.raiton),
    doton: Math.max(0, chakraAtual.doton - antigosValoresOriginais.doton),
    suiton: Math.max(0, chakraAtual.suiton - antigosValoresOriginais.suiton),
  };

  // 🔹 Atualiza os valores do novo ninja
  ninjaNovo.dataset.katon = novosValoresOriginais.katon + chakraExtra.katon;
  ninjaNovo.dataset.fuuton = novosValoresOriginais.fuuton + chakraExtra.fuuton;
  ninjaNovo.dataset.raiton = novosValoresOriginais.raiton + chakraExtra.raiton;
  ninjaNovo.dataset.doton = novosValoresOriginais.doton + chakraExtra.doton;
  ninjaNovo.dataset.suiton = novosValoresOriginais.suiton + chakraExtra.suiton;

  // 🔹 Substituir os valores ORIGINAIS pelos do novo estágio
  ninjaNovo.dataset.katonOriginal = novosValoresOriginais.katon;
  ninjaNovo.dataset.fuutonOriginal = novosValoresOriginais.fuuton;
  ninjaNovo.dataset.raitonOriginal = novosValoresOriginais.raiton;
  ninjaNovo.dataset.dotonOriginal = novosValoresOriginais.doton;
  ninjaNovo.dataset.suitonOriginal = novosValoresOriginais.suiton;

  // 🔹 Calcula o dano sofrido e chakra gasto para manter a consistência da evolução
  const hpInicial = parseInt(ninjaAntigo.dataset.hpInicial, 10) || 0;
  const hpAtual = parseInt(ninjaAntigo.dataset.hp, 10) || 0;
  const danoSofrido = hpInicial - hpAtual;

  const chakraInicial = parseInt(ninjaAntigo.dataset.chakraInicial, 10) || 0;
  const chakraAtualValor = parseInt(ninjaAntigo.dataset.chakra, 10) || 0;
  const chakraGasto = chakraInicial - chakraAtualValor;

  // Define o bloqueio de evolução baseado no estágio do card evoluído
  ninjaNovo.dataset.bloqEvo = ninjaNovo.dataset.stage;

  // Atualiza os valores do ninja evoluído mantendo dano e chakra gasto
  ninjaNovo.dataset.hp =
    (parseInt(ninjaNovo.dataset.hpInicial, 10) || 0) - danoSofrido;
  ninjaNovo.dataset.chakra =
    (parseInt(ninjaNovo.dataset.chakraInicial, 10) || 0) - chakraGasto;

  console.log(`✅ Evolução concluída: ${ninjaNovo.dataset.name} agora tem:`, {
    katon: ninjaNovo.dataset.katon,
    fuuton: ninjaNovo.dataset.fuuton,
    raiton: ninjaNovo.dataset.raiton,
    doton: ninjaNovo.dataset.doton,
    suiton: ninjaNovo.dataset.suiton,
    hp: ninjaNovo.dataset.hp,
    chakra: ninjaNovo.dataset.chakra,
  });

  // Confere se o slot de destino ainda é válido
  const slotDestino = ninjaAntigo.parentElement;
  if (!slotDestino) {
    console.error("❌ Slot de destino não encontrado. Evolução abortada.");
    return;
  }

  if (ninjaNovo.dataset.jogador === "J1") {
    removerCardDaMao(ninjaNovo, "J1");
    adicionarAoCampo(ninjaNovo, "J1");
  } else {
    removerCardDaMao(ninjaNovo, "IA");
    adicionarAoCampo(ninjaNovo, "IA");
  }
  // Aloca o ninja evoluído no mesmo slot antes de remover o estágio anterior
  slotDestino.appendChild(ninjaNovo);
  console.log(`📌 Ninja ${ninjaNovo.id} alocado no slot ${slotDestino.id}`);
  resetarEstilosCard(ninjaNovo);

  // Remove o ninja antigo para a pilha de descarte
  removerDoCampo(ninjaAntigo);
  adicionarAoDescarte(ninjaAntigo);
  console.log(`🗑️ Ninja ${ninjaAntigo.id} adicionado ao descarte.`);

  // Atualizar atributos se for o líder
  if (slotDestino.id === "player-leader-slot") {
    atualizarAtributosLider(ninjaNovo);
  } else if (slotDestino.id === "ia-leader-slot") {
    atualizarAtributosLiderIA(ninjaNovo);
  }
}
/*Fim DragandDrop*/
