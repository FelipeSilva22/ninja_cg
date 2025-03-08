function defineOrdem(
  liderJ1,
  liderIA,
  acaoOfensivaJ1,
  acaoDefensivaJ1,
  acaoOfensivaIA,
  acaoDefensivaIA
) {
  console.log("Iniciando cálculo de dano...");
  console.log("Líder J1:", liderJ1.dataset.name);
  console.log("Líder IA:", liderIA.dataset.name);

  // Determina o primeiro a atacar com base na speed
  const speedJ1 = parseInt(liderJ1.dataset.speed) || 0;
  const speedIA = parseInt(liderIA.dataset.speed) || 0;

  let primeiroAtacante,
    primeiroDefensor,
    acaoOfensivaAtacante,
    acaoDefensivaDefensor;
  let segundoAtacante,
    segundoDefensor,
    acaoOfensivaSegundo,
    acaoDefensivaSegundo;

  if (speedJ1 >= speedIA) {
    // J1 ataca primeiro
    primeiroAtacante = liderJ1;
    primeiroDefensor = liderIA;
    acaoOfensivaAtacante = acaoOfensivaJ1;
    acaoDefensivaDefensor = acaoDefensivaIA;

    segundoAtacante = liderIA;
    segundoDefensor = liderJ1;
    acaoOfensivaSegundo = acaoOfensivaIA;
    acaoDefensivaSegundo = acaoDefensivaJ1;
  } else {
    // IA ataca primeiro
    primeiroAtacante = liderIA;
    primeiroDefensor = liderJ1;
    acaoOfensivaAtacante = acaoOfensivaIA;
    acaoDefensivaDefensor = acaoDefensivaJ1;

    segundoAtacante = liderJ1;
    segundoDefensor = liderIA;
    acaoOfensivaSegundo = acaoOfensivaJ1;
    acaoDefensivaSegundo = acaoDefensivaIA;
  }

  console.log(`Primeiro Atacante: ${primeiroAtacante.dataset.name}`);

  // Processa o primeiro ataque
  processarAcoes(
    primeiroAtacante,
    primeiroDefensor,
    acaoOfensivaAtacante,
    acaoDefensivaDefensor
  );

  // Verificar o HP do primeiro defensor após o ataque
  const hpPrimeiroDefensor = parseInt(primeiroDefensor.dataset.hp) || 0;
  if (hpPrimeiroDefensor <= 0) {
    console.log(`💀 ${primeiroDefensor.dataset.name} foi derrotado!`);

    // ✅ Remove o Ninja do array de campo
    removerDoCampo(primeiroDefensor);

    // ✅ Move o Ninja para o descarte
    adicionarAoDescarte(primeiroDefensor);

    // ✅ Remove visualmente do slot
    //primeiroDefensor.parentElement.innerHTML = '';

    if (primeiroDefensor === liderIA) {
      zerarAtributosLider("#ia-leader-slot");
      resgatePremioJ1();
    } else {
      zerarAtributosLider("#player-leader-slot");
      resgatePremioIA();
    }
    return; // Finaliza o cálculo, já que o defensor foi derrotado
  }

  console.log(`Agora ${segundoAtacante.dataset.name} está atacando.`);

  // Processa o segundo ataque (invertendo os papéis)
  processarAcoes(
    segundoAtacante,
    segundoDefensor,
    acaoOfensivaSegundo,
    acaoDefensivaSegundo
  );

  // Verificar o HP do segundo defensor após o ataque
  const hpSegundoDefensor = parseInt(segundoDefensor.dataset.hp) || 0;
  if (hpSegundoDefensor <= 0) {
    console.log(`${segundoDefensor.dataset.name} foi derrotado!`);
    removerDoCampo(segundoDefensor);
    adicionarAoDescarte(segundoDefensor); // Move o defensor para o descarte
    //segundoDefensor.parentElement.innerHTML = ''; // Remove do slot de líder
    if (segundoDefensor === liderIA) {
      zerarAtributosLider("#ia-leader-slot");
      resgatePremioJ1();
    } else {
      zerarAtributosLider("#player-leader-slot");
      resgatePremioIA();
    }
  } else {
    estadoAtual = "premio";
    encerrarTurno();
  }
}

function processarAcoes(atacante, defensor, acaoOfensiva, acaoDefensiva) {
  const speedAtacante = parseInt(atacante.dataset.speed) || 0;
  let speedDefensor = parseInt(defensor.dataset.speed) || 0;

  // Verificar se o atacante está marcado com Paralyze
  if (atacante.dataset.paralyze === "true") {
    console.warn(`${atacante.dataset.name} está paralisado!`);
    acaoOfensiva = {
      type: "paralyze",
      value: "paralyze",
      text: `Paralyze (Sem ataque)`,
    };
    acaoDefensiva = {
      type: "opcaoBasica",
      value: "defense",
      text: `Proteger-se (${atacante.dataset.defense || 0})`,
    };
  }

  // Verificar se o atacante está confuso (só se não estiver paralisado)
  let ehAutoAtaque = false; // Flag para indicar se é ataque a si mesmo
  if (
    atacante.dataset.confusion === "true" &&
    acaoOfensiva.value !== "paralyze"
  ) {
    console.log(`${atacante.dataset.name} está confuso!`);
    const resultadoConfusao = Math.random() * 100;

    if (resultadoConfusao < 50) {
      console.log(
        `${atacante.dataset.name} conseguiu atacar o oponente normalmente!`
      );
      // Prossegue com o ataque normal ao defensor original
    } else {
      console.log(
        `${atacante.dataset.name} está confuso e atacará a si mesmo ou um aliado!`
      );

      // Determina o campo do atacante (J1 ou IA)
      const campoDoAtacante = atacante.closest("#player-area")
        ? "#formation-field"
        : "#ia-formation-field";

      // Obtém todos os personagens no campo do atacante
      const personagensNoCampo = document.querySelectorAll(
        `${campoDoAtacante} img`
      );
      const aliados = Array.from(personagensNoCampo);

      if (aliados.length > 0) {
        // Escolhe um alvo aleatoriamente entre os personagens no campo (inclui o líder)
        const alvoAleatorio =
          aliados[Math.floor(Math.random() * aliados.length)];
        console.log(
          `${atacante.dataset.name} atacou ${alvoAleatorio.dataset.name}!`
        );
        defensor = alvoAleatorio; // Redefine o defensor para o alvo escolhido
        if (defensor === atacante) {
          ehAutoAtaque = true; // Marca como auto-ataque
        }
      } else {
        console.log(
          `${atacante.dataset.name} não encontrou aliados e atacou a si mesmo!`
        );
        defensor = atacante; // Ataca a si mesmo
        ehAutoAtaque = true; // Marca como auto-ataque
      }

      // Remove o efeito de confusão após o ataque (opcional)
      delete atacante.dataset.confusion;
      console.log(`Confusão removida de ${atacante.dataset.name}.`);
    }
  }

  // Função auxiliar para consumir chakra
  function consumirChakra(ninja, chakraCost, typeAcao) {
    const chakraAtual = parseInt(ninja.dataset.chakra) || 0;
    if (chakraAtual >= chakraCost) {
      ninja.dataset.chakra = chakraAtual - chakraCost;
      console.log(
        `${ninja.dataset.name} usou ${chakraCost} de chakra. Chakra restante: ${ninja.dataset.chakra}`
      );
      return true;
    } else {
      console.warn(
        `${ninja.dataset.name} não tem chakra suficiente! Seu chakra foi zerado.`
      );
      ninja.dataset.chakra = 0;
      if (typeAcao === "ofensiva") {
        console.warn(
          `Ação ofensiva de ${ninja.dataset.name} alterada para ataque simples.`
        );
        acaoOfensiva = {
          type: "opcaoBasica",
          value: "taijutsu",
          text: `Ataque Simples (${ninja.dataset.taijutsu || 0})`,
        };
      } else if (typeAcao === "defensiva") {
        console.warn(
          `Ação defensiva de ${ninja.dataset.name} alterada para proteger-se.`
        );
        acaoDefensiva = {
          type: "opcaoBasica",
          value: "defense",
          text: `Proteger-se (${ninja.dataset.defense || 0})`,
        };
      }
      return false;
    }
  }

  // Consumir chakra para as ações
  if (acaoOfensiva.type === "jutsu")
    consumirChakra(atacante, acaoOfensiva.chakraCost || 0, "ofensiva");
  if (acaoDefensiva.type === "jutsu")
    consumirChakra(defensor, acaoDefensiva.chakraCost || 0, "defensiva");

  // Verificar se a ação defensiva é uma evasiva (exceto em caso de auto-ataque)
  let tentativaEvasiva = false;

  if (!ehAutoAtaque) {
    // Só processa evasiva se não for auto-ataque
    if (acaoDefensiva.type === "jutsu" && acaoDefensiva.usage === "ev") {
      speedDefensor += acaoDefensiva.powerJutsu || 0;
      console.log(
        `${defensor.dataset.name} tentou usar jutsu evasivo. Velocidade ajustada: ${speedDefensor}`
      );
      tentativaEvasiva = true;
    } else if (acaoDefensiva.value === "speed") {
      console.log(
        `${defensor.dataset.name} tentou usar ação básica de evasiva.`
      );
      tentativaEvasiva = true;
    }

    if (tentativaEvasiva) {
      const diferencaVelocidade = speedDefensor - speedAtacante;
      let chanceDesvio;

      // Determinar a chance de desvio com base na diferença de velocidade
      if (diferencaVelocidade <= 14) {
        chanceDesvio = 15;
      } else if (diferencaVelocidade >= 15 && diferencaVelocidade <= 24) {
        chanceDesvio = 25;
      } else if (diferencaVelocidade >= 25 && diferencaVelocidade <= 41) {
        chanceDesvio = 33;
      } else if (diferencaVelocidade >= 42 && diferencaVelocidade <= 57) {
        chanceDesvio = 50;
      } else if (diferencaVelocidade >= 58 && diferencaVelocidade <= 75) {
        chanceDesvio = 66;
      } else if (diferencaVelocidade >= 76 && diferencaVelocidade <= 100) {
        chanceDesvio = 85;
      } else {
        chanceDesvio = 100;
      }

      // Realiza o sorteio do desvio
      const sorteio = Math.floor(Math.random() * 101);

      // Log detalhado do cálculo
      console.log(`🎯 Tentativa de evasiva por ${defensor.dataset.name}`);
      console.log(`📊 Diferença de Velocidade: ${diferencaVelocidade}`);
      console.log(`🎲 Chance de desvio determinada: ${chanceDesvio}%`);
      console.log(`🔄 Sorteio: ${sorteio.toFixed(2)}%`);

      if (sorteio < chanceDesvio) {
        console.log(`✅ ${defensor.dataset.name} conseguiu desviar!`);

        // Atualizar os atributos do atacante e do defensor
        if (atacante.closest("#player-area")) {
          atualizarAtributosLider(atacante);
        } else if (atacante.closest("#ia-area")) {
          atualizarAtributosLiderIA(atacante);
        }

        if (defensor.closest("#player-area")) {
          atualizarAtributosLider(defensor);
        } else if (defensor.closest("#ia-area")) {
          atualizarAtributosLiderIA(defensor);
        }

        return; // Dano é zerado pois o desvio ocorreu
      } else {
        console.log(`❌ ${defensor.dataset.name} falhou em desviar.`);
      }
    }
  } else {
    console.log(
      `${atacante.dataset.name} atacou a si mesmo, sem chance de evasiva.`
    );
  }

  // Calcular dano, ignorar dano se o atacante está paralisado
  if (acaoOfensiva.value !== "paralyze") {
    calcularDano(atacante, defensor, acaoOfensiva, acaoDefensiva);
  } else {
    console.log(`${atacante.dataset.name} não pode atacar devido à Paralyze.`);
  }
}

// 📌 Tabela de vantagens e desvantagens dos elementos
const vantagensElementais = {
  katon: "fuuton",
  fuuton: "raiton",
  raiton: "doton",
  doton: "suiton",
  suiton: "katon",
  yin: "yang",
  yang: "yin",
};

// 🔹 Função auxiliar para determinar vantagem/desvantagem
function calcularVantagemDesvantagem(
  naturezaAtaque,
  naturezaDefesa,
  powerJutsu
) {
  if (vantagensElementais[naturezaAtaque] === naturezaDefesa) {
    console.log(`🔥 Vantagem Elemental! Aumento de 50% no poder do Jutsu.`);
    return Math.floor(powerJutsu * 1.5);
  } else if (vantagensElementais[naturezaDefesa] === naturezaAtaque) {
    console.log(`❄️ Desvantagem Elemental! Redução de 50% no poder do Jutsu.`);
    return Math.floor(powerJutsu * 0.5);
  }
  return powerJutsu;
}

// 🔥 Função de Cálculo de Dano Ajustada 🔥
function calcularDano(atacante, defensor, acaoOfensiva, acaoDefensiva) {
  let poderAtaque = 0;
  let poderDefesa = 0;

  // Determinar poder de ataque com base no tipo de jutsu
  if (acaoOfensiva.type === "jutsu") {
    if (acaoOfensiva.typeJutsu === "Genjutsu") {
      poderAtaque =
        (parseInt(atacante.dataset.genjutsu) || 0) +
        (acaoOfensiva.powerJutsu || 0);
    } else if (
      acaoOfensiva.typeJutsu === "Taijutsu" ||
      acaoOfensiva.typeJutsu === "Shurikenjutsu" ||
      acaoOfensiva.typeJutsu === "Kenjutsu"
    ) {
      poderAtaque =
        (parseInt(atacante.dataset.taijutsu) || 0) +
        (acaoOfensiva.powerJutsu || 0);
    } else if (acaoOfensiva.typeJutsu === "Ninjutsu") {
      // 🌀 Aplicação da regra de vantagem/desvantagem elemental
      const naturezaAtaque = acaoOfensiva.natureJutsu || "nenhum";
      const naturezaDefesa = acaoDefensiva.natureJutsu || "nenhum";

      let powerModificado = calcularVantagemDesvantagem(
        naturezaAtaque,
        naturezaDefesa,
        acaoOfensiva.powerJutsu || 0
      );
      poderAtaque =
        (parseInt(atacante.dataset.ninjutsu) || 0) + powerModificado;
    }
  } else if (acaoOfensiva.name === "taijutsu") {
    poderAtaque = parseInt(atacante.dataset.taijutsu) || 0; // Ataque básico
  }

  // Determinar poder de defesa
  if (acaoDefensiva.type === "jutsu") {
    if (acaoDefensiva.typeJutsu === "Genjutsu") {
      poderDefesa =
        (parseInt(defensor.dataset.genjutsu) || 0) +
        (acaoDefensiva.powerJutsu || 0);
    } else if (
      acaoDefensiva.typeJutsu === "Taijutsu" ||
      acaoDefensiva.typeJutsu === "Shurikenjutsu" ||
      acaoDefensiva.typeJutsu === "Kenjutsu" ||
      acaoDefensiva.typeJutsu === "Ninjutsu"
    ) {
      poderDefesa =
        (parseInt(defensor.dataset.defense) || 0) +
        (acaoDefensiva.powerJutsu || 0);
    } else if (acaoDefensiva.typeJutsu === "Evasiva") {
      poderDefesa = Math.floor((parseInt(defensor.dataset.defense) || 0) / 2);
      console.log(
        `${defensor.dataset.name} usou evasiva. Defesa reduzida para ${poderDefesa}.`
      );
    }
  } else if (
    acaoDefensiva.name === "speed" ||
    acaoDefensiva.name === "speedIA"
  ) {
    poderDefesa = Math.floor((parseInt(defensor.dataset.defense) || 0) / 2);
    console.log(
      `${defensor.dataset.name} usou evasiva. Defesa reduzida para ${poderDefesa}.`
    );
  } else {
    poderDefesa = parseInt(defensor.dataset.defense) || 0;
  }

  // 🩸 Calcular dano final
  let dano = poderAtaque - poderDefesa;
  if (dano <= 5) dano = 5;

  // Aplicar dano ao defensor
  const hpAtual = parseInt(defensor.dataset.hp) || 0;
  const novoHp = Math.max(hpAtual - dano, 0);
  defensor.dataset.hp = novoHp;

  console.log(
    `${atacante.dataset.name} usou ${poderAtaque} de ataque contra ${poderDefesa} de defesa.`
  );
  console.log(
    `💥 ${atacante.dataset.name} causou ${dano} de dano a ${defensor.dataset.name}.`
  );
  console.log(`❤️ ${defensor.dataset.name} agora tem ${novoHp} de HP.`);

  // 🔄 Atualizar os atributos do atacante e do defensor
  if (atacante.closest("#player-area")) {
    atualizarAtributosLider(atacante);
  } else if (atacante.closest("#ia-area")) {
    atualizarAtributosLiderIA(atacante);
  }

  if (defensor.closest("#player-area")) {
    atualizarAtributosLider(defensor);
  } else if (defensor.closest("#ia-area")) {
    atualizarAtributosLiderIA(defensor);
  }
}
