// Variáveis do jogo
let fazendeiro;
let cenario = 'fazenda';
let colheitas = [];
let carrinho = [];
let caminhao;
let tempo = 0;
let pontuacao = 0;
let gameState = 'playing'; // playing, delivering, win

function setup() {
  createCanvas(800, 500);
  
  // Inicializa o fazendeiro
  fazendeiro = {
    x: 100,
    y: height - 100,
    largura: 40,
    altura: 80,
    velocidade: 5,
    carregando: false
  };
  
  // Inicializa o caminhão
  caminhao = {
    x: 700,
    y: height - 120,
    largura: 120,
    altura: 80,
    capacidade: 10,
    carregado: 0
  };
  
  // Cria colheitas na fazenda
  criarColheitas();
}

function draw() {
  background(220);
  desenharCenario();
  
  if (gameState === 'playing') {
    jogando();
  } else if (gameState === 'delivering') {
    entregando();
  } else if (gameState === 'win') {
    telaVitoria();
  }
  
  // Mostra informações
  fill(0);
  textSize(20);
  text(`Colheitas: ${carrinho.length}`, 20, 30);
  text(`Entregues: ${pontuacao}`, 20, 60);
  text(`Tempo: ${Math.floor(tempo/60)}s`, 20, 90);
  
  tempo++;
}

function desenharCenario() {
  if (cenario === 'fazenda') {
    background(144, 238, 144); // Verde fazenda
    // Desenha plantações (base)
    for (let i = 0; i < 5; i++) {
      fill(34, 139, 34);
      rect(150 + i * 120, height - 80, 80, 40);
    }
    
    // Desenha caminhão
    fill(70);
    rect(caminhao.x, caminhao.y, caminhao.largura, caminhao.altura);
    fill(100);
    rect(caminhao.x + 30, caminhao.y - 30, 60, 30);
    
  } else if (cenario === 'centro') {
    background(220); // Cinza centro de distribuição
    // Desenha armazém
    fill(150);
    rect(100, height - 200, 200, 150);
    fill(100);
    rect(120, height - 180, 160, 30);
    
    // Desenha caminhão
    fill(70);
    rect(caminhao.x, caminhao.y, caminhao.largura, caminhao.altura);
    fill(100);
    rect(caminhao.x + 30, caminhao.y - 30, 60, 30);
  }
  
  // Desenha fazendeiro
  fill(255, 215, 0); // Chapéu amarelo
  rect(fazendeiro.x + 10, fazendeiro.y - 10, 20, 10);
  fill(139, 69, 19); // Roupa marrom
  rect(fazendeiro.x, fazendeiro.y, fazendeiro.largura, fazendeiro.altura);
  
  // Desenha colheitas
  fill(255, 165, 0); // Laranja (colheitas)
  for (let colheita of colheitas) {
    ellipse(colheita.x, colheita.y, colheita.tamanho, colheita.tamanho);
  }
  
  // Desenha colheitas no carrinho
  for (let i = 0; i < carrinho.length; i++) {
    ellipse(fazendeiro.x + (i % 3) * 10, fazendeiro.y - 20 - Math.floor(i / 3) * 10, 15, 15);
  }
  
  // Desenha colheitas no caminhão
  for (let i = 0; i < caminhao.carregado; i++) {
    ellipse(caminhao.x + 20 + (i % 5) * 15, caminhao.y - 15 - Math.floor(i / 5) * 15, 10, 10);
  }
}

function jogando() {
  // Movimento do fazendeiro
  if (keyIsDown(LEFT_ARROW)) {
    fazendeiro.x -= fazendeiro.velocidade;
    if (fazendeiro.x < 0) fazendeiro.x = 0;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    fazendeiro.x += fazendeiro.velocidade;
    if (fazendeiro.x > width - fazendeiro.largura) {
      fazendeiro.x = width - fazendeiro.largura;
    }
  }
  
  // Verifica se está no caminhão
  if (colisaoRetangulo(
    fazendeiro.x, fazendeiro.y, fazendeiro.largura, fazendeiro.altura,
    caminhao.x, caminhao.y, caminhao.largura, caminhao.altura
  ) && carrinho.length > 0) {
    gameState = 'delivering';
  }
  
  // Verifica vitória
  if (pontuacao >= 20) {
    gameState = 'win';
  }
}

function keyPressed() {
  // Coleta colheita com F
  if ((key === 'f' || key === 'F') && gameState === 'playing' && cenario === 'fazenda' && carrinho.length < 6) {
    for (let i = colheitas.length - 1; i >= 0; i--) {
      let colheita = colheitas[i];
      // Verifica colisão com área de coleta (parte superior do fazendeiro)
      if (colisaoCircRetangulo(
        colheita.x, colheita.y, colheita.tamanho/2,
        fazendeiro.x - 10, fazendeiro.y - 30, fazendeiro.largura + 20, 30
      )) {
        colheitas.splice(i, 1);
        carrinho.push(colheita);
        break;
      }
    }
    
    // Muda para o centro de distribuição quando tem colheitas
    if (carrinho.length > 0 && cenario === 'fazenda') {
      cenario = 'centro';
      fazendeiro.x = 100;
    }
  }
  
  // Reinicia o jogo
  if (key === 'r' || key === 'R') {
    resetGame();
  }
}

function criarColheitas() {
  colheitas = [];
  for (let i = 0; i < 10; i++) {
    colheitas.push({
      x: random(150, width - 200),
      y: height - 120,
      tamanho: 30
    });
  }
}

function resetGame() {
  gameState = 'playing';
  cenario = 'fazenda';
  pontuacao = 0;
  tempo = 0;
  carrinho = [];
  caminhao.carregado = 0;
  fazendeiro.x = 100;
  criarColheitas();
}

function entregando() {
  // Animação de entrega
  if (carrinho.length > 0) {
    // Move uma colheita do carrinho para o caminhão
    caminhao.carregado++;
    carrinho.pop();
    
    // Se o caminhão está cheio, descarrega
    if (caminhao.carregado >= caminhao.capacidade) {
      pontuacao += caminhao.carregado;
      caminhao.carregado = 0;
    }
  } else {
    // Volta para a fazenda
    gameState = 'playing';
    cenario = 'fazenda';
    criarColheitas();
  }
}

function telaVitoria() {
  background(200, 255, 200);
  fill(0);
  textSize(32);
  text("Parabéns!", width/2 - 80, height/2 - 50);
  textSize(24);
  text("Você entregou todas as colheitas!", width/2 - 180, height/2);
  text(`Tempo total: ${Math.floor(tempo/60)} segundos`, width/2 - 150, height/2 + 40);
  text("Pressione R para reiniciar", width/2 - 120, height/2 + 80);
}

// Funções auxiliares de colisão
function colisaoRetangulo(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function colisaoCircRetangulo(cx, cy, raio, rx, ry, rw, rh) {
  let testX = cx;
  let testY = cy;
  
  if (cx < rx) testX = rx;
  else if (cx > rx + rw) testX = rx + rw;
  if (cy < ry) testY = ry;
  else if (cy > ry + rh) testY = ry + rh;
  
  let distX = cx - testX;
  let distY = cy - testY;
  let distancia = sqrt(distX * distX + distY * distY);
  
  return distancia <= raio;
}