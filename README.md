# NEXUS ROBOTICS

Site demonstrativo da **NEXUS ROBOTICS**, uma marca fictícia de robótica humanoide. A página apresenta uma experiência visual interativa com modelos 3D, animações durante a rolagem e um configurador de robô.

## Funcionalidades

- Experiência 3D renderizada com [Three.js](https://threejs.org/).
- Modelos GLB para as versões One, Pro e Industrial.
- Animações e transições controladas por [GSAP](https://gsap.com/).
- Navegação por seções: robô, humanoides, configurador e inteligência.
- Configurador com seleção de modelo, componente, zoom e rotação por arraste.
- Animação adaptada para dispositivos móveis e preferência por movimento reduzido.
- Fallback informativo quando WebGL não está disponível.

## Tecnologias

- HTML5, CSS3 e JavaScript puro.
- Three.js e GLTFLoader carregados por CDN.
- GSAP e ScrollTrigger carregados por CDN.
- Arquivos 3D no formato `.glb`.

Não há processo de build. É necessário ter o Node.js instalado e acesso à internet para carregar as bibliotecas e fontes externas.

## Estrutura do projeto

```text
.
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos, layout e responsividade
├── js/
│   ├── app.js              # Interações, navegação e animações
│   └── model3d.js          # Cena Three.js e carregamento dos modelos
└── model-3d/
    ├── robot_character.glb # Modelo base / Nexus One
    ├── security_robot.glb  # Nexus Pro
    └── robot.glb           # Nexus Industrial
```

## Como executar pelo terminal

> Use um servidor local. O carregamento dos arquivos `.glb` pode falhar quando a página é aberta diretamente com `file://`.

Com o Node.js instalado, execute na raiz do projeto:

```bash
npx serve .
```

Abra o endereço exibido pelo comando, normalmente `http://localhost:3000`.

## Tutorial rápido

1. Clone ou baixe este repositório.
2. Abra o terminal na pasta do projeto:

   ```bash
   cd caminho/para/robo-site
   ```

3. Inicie um servidor local usando uma das opções acima.
4. Acesse o endereço local no navegador.
5. Role a página para acompanhar a montagem e desmontagem do robô.
6. Na seção **Nossos Humanoides**, navegue entre os modelos.
7. Em **Monte o seu**, escolha um modelo, selecione um componente, ajuste o zoom e arraste o robô para girá-lo.
8. Na seção **Inteligência em movimento**, alterne entre perceber, planejar e agir.

## Solução de problemas

- **Modelo 3D não aparece:** confirme que o projeto foi aberto por `http://localhost`, e não diretamente pelo arquivo HTML.
- **Bibliotecas não carregam:** verifique a conexão com a internet, pois Three.js, GSAP e as fontes são obtidos por CDN.
- **Tela sem 3D:** use um navegador atualizado com WebGL habilitado. O conteúdo textual continua disponível sem WebGL.
- **Alterações não aparecem:** faça uma atualização forçada (`Ctrl+F5`) para ignorar arquivos em cache.

## Créditos e licença

Os modelos 3D são creditados na própria página para AssetFactory, 3DWorkbench e Diamonddogkz. A NEXUS ROBOTICS é uma marca fictícia.
