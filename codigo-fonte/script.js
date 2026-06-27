const pontosPadrao = [
  {
    id: 1,
    nome: "Farmácia Central",
    categoria: "Remédios",
    endereco: "Rua Paraná, 1000",
    bairro: "Centro",
    latitude: -24.9555,
    longitude: -53.4552,
    descricao: "Coleta de medicamentos vencidos em horário comercial."
  },
  {
    id: 2,
    nome: "EcoPonto Eletrônicos",
    categoria: "Eletrônicos",
    endereco: "Avenida Brasil, 2500",
    bairro: "São Cristóvão",
    latitude: -24.9468,
    longitude: -53.4309,
    descricao: "Recebe pequenos eletrônicos e acessórios."
  },
  {
    id: 3,
    nome: "Mercado Bairro Verde",
    categoria: "Óleo",
    endereco: "Rua Jacarezinho, 550",
    bairro: "Neva",
    latitude: -24.9708,
    longitude: -53.4591,
    descricao: "Ponto de entrega de óleo de cozinha usado."
  }
];

const STORAGE_KEY = "ecoponto_pontos";

let mapa;
let marcadores = [];

const form = document.getElementById("pontoForm");
const listaPontos = document.getElementById("listaPontos");
const busca = document.getElementById("busca");
const cancelarEdicao = document.getElementById("cancelarEdicao");
const tituloFormulario = document.getElementById("tituloFormulario");

function carregarPontos() {
  const dadosSalvos = localStorage.getItem(STORAGE_KEY);

  if (!dadosSalvos) {
    salvarPontos(pontosPadrao);
    return pontosPadrao;
  }

  return JSON.parse(dadosSalvos);
}

function salvarPontos(pontos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pontos));
}

function inicializarMapa() {
  mapa = L.map("mapa").setView([-24.9555, -53.4552], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);
}

function atualizarMarcadores(pontos) {
  marcadores.forEach((marcador) => mapa.removeLayer(marcador));
  marcadores = [];

  pontos.forEach((ponto) => {
    const marcador = L.marker([ponto.latitude, ponto.longitude])
      .addTo(mapa)
      .bindPopup(`
        <strong>${ponto.nome}</strong><br>
        ${ponto.categoria}<br>
        ${ponto.endereco} - ${ponto.bairro}
      `);

    marcadores.push(marcador);
  });
}

function renderizarPontos() {
  const termo = busca.value.toLowerCase();
  const pontos = carregarPontos();

  const filtrados = pontos.filter((ponto) => {
    return (
      ponto.nome.toLowerCase().includes(termo) ||
      ponto.categoria.toLowerCase().includes(termo) ||
      ponto.bairro.toLowerCase().includes(termo)
    );
  });

  listaPontos.innerHTML = "";

  if (filtrados.length === 0) {
    listaPontos.innerHTML = '<div class="vazio">Nenhum ponto encontrado.</div>';
    atualizarMarcadores([]);
    return;
  }

  filtrados.forEach((ponto) => {
    const card = document.createElement("div");
    card.className = "card-ponto";

    card.innerHTML = `
      <div>
        <span class="categoria">${ponto.categoria}</span>
        <h3>${ponto.nome}</h3>
        <p class="info"><strong>Endereço:</strong> ${ponto.endereco}</p>
        <p class="info"><strong>Bairro:</strong> ${ponto.bairro}</p>
        <p class="info"><strong>Observação:</strong> ${ponto.descricao || "Sem observação"}</p>
      </div>

      <div class="acoes-card">
        <button class="botao secundario" onclick="editarPonto(${ponto.id})">Editar</button>
        <button class="botao perigo" onclick="excluirPonto(${ponto.id})">Excluir</button>
      </div>
    `;

    listaPontos.appendChild(card);
  });

  atualizarMarcadores(filtrados);
}

function limparFormulario() {
  form.reset();
  document.getElementById("pontoId").value = "";
  tituloFormulario.textContent = "Cadastrar novo ponto";
  cancelarEdicao.classList.add("escondido");
}

function obterDadosFormulario() {
  const latitudeInformada = document.getElementById("latitude").value;
  const longitudeInformada = document.getElementById("longitude").value;

  return {
    nome: document.getElementById("nome").value.trim(),
    categoria: document.getElementById("categoria").value,
    endereco: document.getElementById("endereco").value.trim(),
    bairro: document.getElementById("bairro").value.trim(),
    latitude: latitudeInformada ? Number(latitudeInformada) : -24.9555,
    longitude: longitudeInformada ? Number(longitudeInformada) : -53.4552,
    descricao: document.getElementById("descricao").value.trim()
  };
}

function salvarPonto(evento) {
  evento.preventDefault();

  const pontos = carregarPontos();
  const idEmEdicao = document.getElementById("pontoId").value;
  const dados = obterDadosFormulario();

  if (idEmEdicao) {
    const pontosAtualizados = pontos.map((ponto) => {
      if (ponto.id === Number(idEmEdicao)) {
        return { id: ponto.id, ...dados };
      }

      return ponto;
    });

    salvarPontos(pontosAtualizados);
    alert("Ponto atualizado com sucesso!");
  } else {
    const novoPonto = {
      id: Date.now(),
      ...dados
    };

    pontos.push(novoPonto);
    salvarPontos(pontos);
    alert("Ponto cadastrado com sucesso!");
  }

  limparFormulario();
  renderizarPontos();
}

function editarPonto(id) {
  const pontos = carregarPontos();
  const ponto = pontos.find((item) => item.id === id);

  if (!ponto) {
    alert("Ponto não encontrado.");
    return;
  }

  document.getElementById("pontoId").value = ponto.id;
  document.getElementById("nome").value = ponto.nome;
  document.getElementById("categoria").value = ponto.categoria;
  document.getElementById("endereco").value = ponto.endereco;
  document.getElementById("bairro").value = ponto.bairro;
  document.getElementById("latitude").value = ponto.latitude;
  document.getElementById("longitude").value = ponto.longitude;
  document.getElementById("descricao").value = ponto.descricao;

  tituloFormulario.textContent = "Editar ponto de coleta";
  cancelarEdicao.classList.remove("escondido");

  document.getElementById("formulario").scrollIntoView({ behavior: "smooth" });
}

function excluirPonto(id) {
  const confirmar = confirm("Deseja realmente excluir este ponto de coleta?");

  if (!confirmar) {
    return;
  }

  const pontos = carregarPontos();
  const pontosAtualizados = pontos.filter((ponto) => ponto.id !== id);

  salvarPontos(pontosAtualizados);
  renderizarPontos();
  alert("Ponto excluído com sucesso!");
}

form.addEventListener("submit", salvarPonto);
busca.addEventListener("input", renderizarPontos);
cancelarEdicao.addEventListener("click", limparFormulario);

inicializarMapa();
renderizarPontos();
